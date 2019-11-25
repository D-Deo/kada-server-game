const cons = require('../../../common/constants');
const ermjcons = require('../common/constants');
const mjcons = require('../majong/majongConstants');
const Super = require('../../../room/seat');
const _ = require('underscore');
const utils = require('../majong/utils');
const model = require('../../../db/model');
const mj = require('../majong/library');
const panel = require('./panel');
const Bar = require('../majong/bar');
const formatter = require('../majong/formatter');
const card = require('../majong/card');

/**
 * @api {json} room.seats.seat seat数据结构
 * @apiGroup bjl
 * @param {json} user 玩家
 * @param {[Chip]} betChips 下注情况
 * @param {number} bankerState 当庄状态：-2 正在当庄 -1 等待下庄 0 没有上庄 >=1 正在等待上庄（当前位置）
 */
class Seat extends Super {

    constructor(room, index) {
        super(room, index);

        this.logger = this.room.getComp('logger');
        this.panel = new panel(this);
        this.reset();

    }

    // bindUser(user) {
    //     super.bindUser(user);
    //     this.reset();
    // }

    // unbindUser(reason, cb) {
    //     this.reset();
    //     super.unbindUser(reason, cb);
    // }

    clear() {
        super.clear();
        //       this.reset();
    }

    reset() {
        super.reset();

        this.auto = false;
        this.handCards = [];
        this.outCards = [];
        this.outCardsCount = 0;
        this.flowerCards = [];
        this.seqArray = []; // 顺子
        this.triArray = []; // 刻子
        this.lastAction = ermjcons.RoomAction.PLAY(); // 最后的动作, 默认出牌
        this.lastDraw = undefined; // 最后摸的牌
        this.barId = -1; // 副ID
        this.tinFlag = 0; // 0 未听 1 听牌 2 天听
        this.ron = []; // 胡牌
    }

    onRoundBegin() {
        super.onRoundBegin();
        this.reset();
    }

    // isPlaying() {
    //     return false;
    // }

    getAuto() {
        return this.auto;
    }

    changeAuto() {
        this.auto = !this.auto;
        this.room.getComp('channel').sendAction(cons.RoomAction.PLAYER_ROBOT(),
            { seat: this.index, auto: this.auto });
    }

    getTinFlag() {
        return this.tinFlag;
    }

    getPanel() {
        return this.panel;
    }

    unhostUser(session) {
        super.unhostUser(session);
        let seat = this.room.getComp('state').getCurrentSeat();
        if (seat.index != this.index) {
            return;
        }
        this.sendAction(ermjcons.RoomAction.PLAYER_PANEL(), this.panel.toJson());
    }
    /**
    * 发牌
    */
    deal(cards) {
        this.handCards.push(...cards);
    }

    sendDeal() {
        _.each(this.room.getComp('seat').getSittingSeats(), s =>
            s.sendAction(cons.RoomAction.PLAYER_DEAL(),
                {
                    seat: this.index,
                    cards: _.map(this.handCards, (c) => c.toJson(s == this))
                }));
    }



    /**
     * 玩家摸牌
     * @param seat 玩家
     * @param isFront 是否从头摸
     * @return 摸到的是不是花
     **/
    drawFront() {
        let c = this.room.getComp('state').getLibrary().drawFront();
        this.lastDraw = c;
        this.handCards.push(c);
        utils.sortCards(this.handCards); // 算碰吃杠，需要排序
        return c;
    }

    drawBack() {
        let c = this.room.getComp('state').getLibrary().drawBack();
        this.lastDraw = c;
        this.handCards.push(c);
        utils.sortCards(this.handCards); // 算碰吃杠，需要排序
        return c;
    }

    sortHandCards() {
        utils.sortCards(this.handCards);
        this.setLastDraw();
    }

    setLastDraw() {
        this.lastDraw = this.handCards[this.handCards.length - 1];
    }

    /**
     * 给某个玩家补花
     **/

    splitFlower() {
        let cards = _.partition(this.handCards, c => c.isFlower());
        this.handCards = cards[1];
        if (cards[0].length > 0) {
            this.flowerCards.push(...cards[0]);
        }
        return cards[0];
    }

    removeCards(...cards) {
        _.each(cards, c1 => {
            let index = _.findIndex(this.handCards, (c2) => {
                return c1.getValue() == c2.getValue();
            });

            if (index != -1) {
                this.handCards.splice(index, 1);
            }
        });

        return true;
    }

    getPonCards(v) {
        let cards = [];

        _.each(this.handCards, (c) => {
            if (c.getValue() == v) {
                cards.push(c);
            }
        });


        return cards;
    }

    getHandCards(...arr) {
        let cards = [];
        _.each(arr, v => {
            let c = _.find(this.handCards, (c) => {
                return c.getValue() == v;
            });

            if (c == undefined) {
                return [];
            }

            cards.push(c);
        });

        return cards;
    }

    getHandCardsLike(v) {
        let c = card.createCard(v);
        return this.getHandCardsLikeCard(c.suit, c.point);
    }

    getHandCardsLikeCard(suit, point) {
        return _.filter(this.handCards, c => c.suit == suit && c.point == point);
    }

    getOutCount() {
        return this.outCardsCount; // this.outCards.length;
    }

    addSeqBar(cards) {
        let bar = new Bar(++this.barId, mjcons.barType.SEQ(), cards);
        this.seqArray.push(bar);
        return bar;
    }

    addTriBar(cards) {
        let bar = new Bar(++this.barId, mjcons.barType.TRI(), cards);
        this.triArray.push(bar);
        return bar;
    }

    addQuadBar(cards, ming) {
        let bar = {};
        if (ming) {
            bar = new Bar(++this.barId, mjcons.barType.MINGQUAD(), cards);
        }
        else {
            bar = new Bar(++this.barId, mjcons.barType.QUAD(), cards);
        }
        this.triArray.push(bar);
        return bar;
    }

    canDoByLastAction(action) {
        if (action == ermjcons.RoomAction.PASS() || action == cons.RoomAction.PLAYER_ROBOT()) {
            return true;
        }

        switch (action) {
            case ermjcons.RoomAction.PLAY():
                if (this.lastAction == ermjcons.RoomAction.PLAY()) {
                    return false;
                }

                return true;

            case ermjcons.RoomAction.DRAW():
                if (this.lastAction != ermjcons.RoomAction.PLAY()) {
                    return false;
                }

                return true;

            case ermjcons.RoomAction.CHI():
                if (this.lastAction != ermjcons.RoomAction.PLAY()) {
                    return false;
                }

                if (this.tinFlag != 0) {
                    return false;
                }

                return true;
            case ermjcons.RoomAction.PON():
                if (this.lastAction != ermjcons.RoomAction.PLAY()) {
                    return false;
                }

                if (this.tinFlag != 0) {
                    return false;
                }

                return true;
            case ermjcons.RoomAction.KAN():
                if (this.lastAction != ermjcons.RoomAction.PLAY()
                    && this.lastAction != ermjcons.RoomAction.DRAW()
                    && this.lastAction != ermjcons.RoomAction.KAN()) {
                    return false;
                }

                if (this.tinFlag != 0) {
                    return false;
                }

                return true;
            case ermjcons.RoomAction.TIN():
                if (this.lastAction == ermjcons.RoomAction.PLAY()) {
                    return false;
                }

                if (this.tinFlag != 0) {
                    return false;
                }

                return true;
            case ermjcons.RoomAction.RON():
                if (this.lastAction != ermjcons.RoomAction.PLAY()
                    && this.lastAction != ermjcons.RoomAction.DRAW()
                    && this.lastAction != ermjcons.RoomAction.KAN()) {
                    return false;
                }

                return true;
        }
    }

    doDraw() {
        // 进入摸牌状态
        this.lastAction = ermjcons.RoomAction.DRAW();

        if (this.getTinFlag() != 0) {
            this.room.getComp('jackpot').balance(this, true);
        }

        this.room.getComp('state').changeState(ermjcons.RoomState.DRAW());

        return true;
    }

    // 出牌
    // v -1 : 自动摸打
    doPlay(v, tin) {
        let card = undefined;
        if (v == -1) {
            card = this.lastDraw;
            this.logger.info('座位:', this.index, '摸牌:', utils.printCard(this.lastDraw), "出牌", utils.printCard(this.lastDraw));
        }
        else {
            let cards = this.getHandCards(v);
            if (cards.length != 1) {
                return false;
            }

            card = cards[0];
            this.logger.info('座位:', this.index, '摸牌:', utils.printCard(this.lastDraw), '出牌数据:', utils.printCards(cards));
        }

        if (this.tinFlag != 0) {
            if (this.lastDraw.getValue() != card.getValue()) {
                return false;
            }
        }

        this.removeCards(card);
        this.outCards.push(card);
        this.room.getComp('state').addOutCards(card);
        this.outCardsCount++;

        if (tin && this.tinFlag == 0) {
            let fmt = new formatter(this.room, ...this.handCards);
            fmt.checkTin(this.ron);

            if (this.ron.length > 0) {
                this.tinFlag = 1;
                if (this.handCards.length == mjcons.cardsPerPlayer() && this.getOutCount() == 1) {
                    if (this.index == this.room.getComp('state').getBanker()) {
                        // 天听
                        this.tinFlag = 2;
                    }
                    else {
                        let banker = this.room.getComp('seat').getSeat(this.room.getComp('state').getBanker());
                        if (banker.handCards.length == mjcons.cardsPerPlayer()) {
                            // 天听
                            this.tinFlag = 2;
                        }
                    }
                }
            }
        }

        this.room.getComp('state').lastPlayed = card;
        this.room.getComp('state').nextPlayer();

        this.room.getComp('channel').sendAction(ermjcons.RoomAction.PLAY(),
            {
                seat: this.index,
                card: card.getValue(),
                tin: this.tinFlag
            });

        this.lastAction = ermjcons.RoomAction.PLAY();
        this.room.getComp('state').changeState(ermjcons.RoomState.SOUND());

        return true;
    }

    getCards() {
        return getHandCards;
    }

    // 吃
    doChi(...vs) {
        let cards = this.getHandCards(...vs);
        if (cards.length != 2) {
            return false;
        }

        cards.push(this.room.getComp('state').lastPlayed);
        if (!utils.isStraight(cards[0], cards[1], cards[2])) {
            return false;
        }

        this.removeCards(cards[0], cards[1]);
        this.next().outCards.pop();

        this.setLastDraw();

        let bar = this.addSeqBar(cards);
        this.room.getComp('channel').sendAction(ermjcons.RoomAction.CHI(),
            {
                seat: this.index,
                bar: bar.toJson()
            });

        // 第一轮，或者出牌之后才能吃牌
        this.lastAction = ermjcons.RoomAction.CHI();
        this.room.getComp('state').changeState(ermjcons.RoomState.PLAY());

        return true;
    }

    // 碰
    doPon() {
        let lastPlayed = this.room.getComp('state').lastPlayed;
        if (lastPlayed == undefined) {
            return false;
        }

        let cards = this.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point);
        if (cards.length < 2) {
            return false;
        }

        this.removeCards(cards[0], cards[1]);
        this.next().outCards.pop();
        this.setLastDraw();

        let bar = this.addTriBar([this.room.getComp('state').lastPlayed, cards[0], cards[1]]);
        this.room.getComp('channel').sendAction(ermjcons.RoomAction.PON(),
            {
                seat: this.index,
                bar: bar.toJson()
            });

        // 第一轮，或者出牌之后才能碰牌
        this.lastAction = ermjcons.RoomAction.PON();
        this.room.getComp('state').changeState(ermjcons.RoomState.PLAY());

        return true;
    }

    // 杠
    doKan(v) {
        let success = false;

        if (this.lastAction == '' || this.lastAction == ermjcons.RoomAction.PLAY()) {
            // 明杠
            if (utils.isEqual(this.room.getComp('state').lastPlayed, card.createCard(v))) {
                let cards = this.getHandCardsLike(v);
                if (cards.length == 3) {
                    cards.push(this.room.getComp('state').lastPlayed);
                    this.removeCards(cards[0], cards[1], cards[2]);
                    this.next().outCards.pop();
                    let bar = this.addQuadBar(cards, true);
                    this.room.getComp('channel').sendAction(ermjcons.RoomAction.KAN(),
                        {
                            seat: this.index,
                            bar: bar.toJson()
                        });

                    success = true;
                }
            }
        }
        else {
            let cards = this.getHandCardsLike(v);
            if (cards.length == 1) {
                let bar = _.find(this.triArray, (bar) => bar.type == mjcons.barType.TRI() &&
                    utils.isEqual(bar.getFirst(), cards[0]));
                if (bar != undefined) {
                    // 加杠
                    this.removeCards(cards[0]);
                    bar.changeToMingQuad(cards[0]);
                    this.room.getComp('channel').sendAction(ermjcons.RoomAction.KAN(),
                        {
                            seat: this.index,
                            bar: bar.toJson()
                        });

                    this.room.getComp('state').lastPlayed = cards[0];

                    this.lastAction = ermjcons.RoomAction.KAN();

                    this.room.getComp('state').nextPlayer();
                    this.room.getComp('state').changeState(ermjcons.RoomState.KAN());

                    return true;
                }
            }
            else if (cards.length == 4) {
                // 暗杠
                let bar = this.addQuadBar(cards, false);
                this.removeCards(cards[0], cards[1], cards[2], cards[3]);
                _.forEach(this.room.getComp('seat').getSittingSeats(), s =>
                    s.sendAction(ermjcons.RoomAction.KAN(),
                        {
                            seat: this.index,
                            bar: bar.toJson(s == this)
                        }));

                success = true;
            }
        }

        if (!success) {
            return false;
        }

        // 第一轮、出牌、或者摸牌、或者杠牌之后才能杠牌
        this.lastAction = ermjcons.RoomAction.KAN();

        if (this.getTinFlag() != 0) {
            this.room.getComp('jackpot').balance(this, false);
        }

        this.room.getComp('state').changeState(ermjcons.RoomState.DRAW());

        return true;
    }

    // 胡
    // 出牌 - 别人点炮
    // 摸牌 - 自摸
    // 杠牌 - 杠后开花
    doRon(ruleName = "") {
        let fmt = new formatter(this.room, ...this.handCards);

        let tin = [];
        tin.type = "";

        if (this.lastAction == ermjcons.RoomAction.PLAY()) {
            fmt.isShot = true;
            fmt.ronCard = this.room.getComp('state').lastPlayed;
            // 获取单吊、坎张、边张
            fmt.checkTin(tin);
            fmt.pushCards(fmt.ronCard);
        }
        else {
            fmt.isShot = false;
            fmt.ronCard = this.lastDraw;
            fmt.removeCard(fmt.ronCard);
            // 获取单吊、坎张、边张
            fmt.checkTin(tin);
            fmt.pushCards(fmt.ronCard);
        }

        // 检查是否胡牌
        if (!fmt.checkRon()) {
            return false;
        }

        if (this.lastAction != ermjcons.RoomAction.PLAY()) {
            // 将胡牌从手牌移除，结算时牌堆分组用
            this.removeCards(fmt.ronCard);
        }
        else {
            // 从出过的牌移除，算绝张用
            this.next().outCards.pop();
        }

        this.lastAction = ermjcons.RoomAction.RON();

        let ron = fmt.calculate(this.seqArray, this.triArray);
        if (ruleName != "") {
            ron.addRuleByName(ruleName);
        }

        if (this.tinFlag == 1) {
            ron.addRuleByName("报听");
        }
        else if (this.tinFlag == 2) {
            ron.addRuleByName("天听");
        }

        if (this.flowerCards.length > 0) {
            ron.addRuleByName("花牌", this.flowerCards.length);
        }

        let uniqTin = _.uniq(_.map(tin, c => Math.floor(c.getValue() / 10) * 10));
        if (uniqTin.length == 1 && tin.type != "") {
            // 单胡
            ron.addRuleByName(tin.type);
        }

        let cards = [];
        _.each(this.room.getComp('seat').getSittingSeats(), s => {
            _.each(s.triArray, v => {
                cards.push(...v.cards);
            });

            _.each(s.seqArray, v => {
                cards.push(...v.cards);
            });

            cards.push(...s.outCards);
        });
        cards.push(fmt.ronCard);

        // cards = _.uniq(cards, c => c.getValue());

        let cnt = _.reduce(cards, (count, c) => {
            if (utils.isEqual(c, fmt.ronCard)) {
                return count + 1;
            }

            return count;
        }, 0);

        if (cnt == 4) {
            ron.addRuleByName("胡绝张");
        }
        this.panel.reset();
        this.room.getComp('state').doRon(this.index, ron);

        return true;
    }

    // 
    toJson(seat) {
        let json = super.toJson();
        json.flower = _.map(this.flowerCards, c => c.toJson());
        json.seqArray = _.map(this.seqArray, c => c.toJson());
        json.triArray = _.map(this.triArray, c => c.toJson(seat == this));
        json.majong = _.map(this.handCards, c => c.toJson(seat == this));
        json.played = _.map(this.outCards, c => c.toJson());
        if (this.lastDraw != undefined) {
            json.lastDraw = this.lastDraw.toJson(seat == this);
        }

        json.auto = this.auto;
        json.tinFlag = this.tinFlag;

        if (seat == this) {
            json.panel = this.panel.toJson();
        }

        return json;
    }
}

module.exports = Seat;