const Card = require('../poker/card');
const cons = require('../../../common/constants');
const ddzcons = require('../common/constants');
const Super = require('../../../room/seat');
const _ = require('underscore');
const utils = require('../poker/utils');
const utilsys = require('../../../utils/index');

/**
 * @api {json} room.seats.seat seat数据结构
 * @apiGroup dz
 * @params {json} user 玩家
 * @params {[Card]} cards 手牌数组 - null表示未参与牌局
 */

class Seat extends Super {

    constructor(room, index) {
        super(room, index);
        this.logger = this.room.getComp('logger');
    }

    clear() {
        super.clear();
        this.reset();
    }

    reset() {
        super.reset();
        this.ming = false;
        this.speaked = null;
        this.grabbed = null;
        this.doubled = false;
        this.auto = false;
        this.cards = null;
        this.playTimes = 0;
        this.bombTimes = 0;
    }

    nextPlaying() {
        return _.find(this.nexts(), s => s.isPlaying());
    }

    prevPlaying() {
        return _.find(this.prevs(), s => s.isPlaying());
    }

    isBlack() {
        if (this.isEmpty()) {
            return false;
        }
        return this.user.getAttr('state') == cons.UserState.BLACK_DDZ();
    }

    /**
     * 发牌
     */
    deal(cards) {
        this.cards = cards;
        this.sendAction(cons.RoomAction.PLAYER_DEAL(), _.map(cards, (c) => c.toJson()));
    }

    mingPai() {
        let stateMgr = this.room.getComp('state');
        this.ming = true;
        this.sendChannelAction(ddzcons.RoomAction.PLAYER_MING(), { cards: _.map(this.cards, (c) => c.toJson()) });
        stateMgr.setMultiple();
    }

    /**
     * 发底牌
     */
    dealBottom(cards) {
        let multiple = this.room.getComp('state').getBotMulti();
        let type = this.room.getComp('state').getBotType();
        let baseScore = this.room.getComp('state').getSpeakScore();
        this.cards.push(...cards);
        this.sendChannelAction(ddzcons.RoomAction.PLAYER_DEAL_BOTTOM(), { cards: _.map(cards, (c) => c.toJson()), baseScore, multiple, type });
        utils.sortCard(this.cards);
    }

    bindUser(user) {
        this.user = user;
        this.playUserId = this.user.getId();
        this.playScore = this.user.getScore();
        this.logger.debug('房间人数', this.room.getComp('seat').getSittingSeats().length);
        if (this.room.getComp('seat').isFull()) {
            let seats = this.room.getComp('seat').getSittingSeats();
            for (let i = 0; i < seats.length; i++) {
                seats[i].getUser().sendAction(cons.RoomAction.PLAYER_ENTER_ROOM(), this.room.toJson(this));
                this.logger.debug('人满了');
            }
        }
        this.room.emit(cons.RoomEvent.SEAT_ADD_PLAYER(), this, user);
    }

    unbindUser(reason, cb) {
        if (this.isEmpty()) {
            utilsys.cbOK(cb);
            return null;
        }

        let user = this.user;
        user.leaveRoom(null, cb);
        this.user = null;
        this.clear();
        this.room.emit(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this, user);
        // !this.room.playing && user.sendAction(cons.RoomAction.PLAYER_ENTER_VIRTUAL(), this.room.toJson_virtual(this));
        return user;
    }


    /**
     * 叫分
     * @param {number} score 叫分 （抢地主模式 0-不叫 3-叫地主 ）|（抢分模式 1-叫1分 2-叫2分 3-叫3分）
     */
    speak(score) {
        this.speaked = score;
        this.sendChannelAction(ddzcons.RoomAction.PLAYER_SPEAK(), { score });
        this.logger.info('玩家叫分', this.getIndex(), this.getUserId(), this.speaked);
    }

    /**
     * 玩家是否叫过分
     */
    isSpeaked() {
        return !_.isNull(this.speaked);
    }

    /**
     * 叫分结果
     */
    getSpeaked() {
        return this.speaked || 0;
    }

    /**
     * 抢地主
     * @param {number} grab 0-不抢 1-抢
     */
    grab(grab) {
        this.grabbed = grab;
        this.speaked = ddzcons.SPEAK.YES();
        this.sendChannelAction(ddzcons.RoomAction.PLAYER_GRAB(), { grab });

        let stateMgr = this.room.getComp('state');
        grab && stateMgr.setMultiple();

        this.logger.info('玩家抢地主', this.getIndex(), this.getUserId(), this.grabbed, stateMgr.getMultiple());
    }

    /**
     * 是否做过抢地主操作
     */
    isGrabbed() {
        return !_.isNull(this.grabbed);
    }

    /**
     * 抢地主的结果
     */
    getGrabbed() {
        return this.grabbed || 0;
    }

    /**
     * 是否做过抢地主操作
     */
    isBankered() {
        //speaked 的值如果是 null，说明没有操作过，就算是0也算操作过行为
        return !_.isNull(this.speaked);
    }

    double(double) {
        this.doubled = double;
        this.sendChannelAction(ddzcons.RoomAction.PLAYER_GRAB(), { double });

        let stateMgr = this.room.getComp('state');
        stateMgr.setMultiple();

        this.logger.info('玩家加倍', this.getIndex(), this.getUserId(), this.doubled, stateMgr.getMultiple());
    }

    isDoubled() {
        return !_.isNull(this.doubled);
    }

    getDoubled() {
        return this.doubled || false;
    }

    /**
     * 是否可以出牌
     */
    canPlay(cards) {
        if (cards.length == 0 || cards.length > this.cards.length) {
            this.logger.warn('玩家出牌数量不正确', this.getUserId(), cards.length, this.cards.length);
            return false;
        }

        if (!utils.contains(this.cards, cards)) {
            this.logger.warn('玩家出牌不符合自己的手牌', cards, this.cards);
            return false;
        }

        return true;
    }

    /**
     * 是否可以过牌
     */
    canPass() {
        let lastCards = this.room.getComp('state').getLastCards();

        //先判断是否有人出牌 
        if (!lastCards) return false;

        //如果有人出牌 判断是否是自己出的牌 是就不能pass
        if (lastCards.seat == this.getIndex()) {
            return false;
        }

        return true;
    }

    /**
     * 出牌
     */
    play(outcards, formation) {
        this.cards = utils.removeCards(this.cards, outcards);
        this.sendChannelAction(ddzcons.RoomAction.PLAYER_ACTION(), { type: ddzcons.PlayerAction.PLAY(), cards: outcards, formation, count: _.size(this.cards) });
        utils.sortCard(this.cards);

        if (formation == ddzcons.Formation.BOMB() || formation == ddzcons.Formation.ROCKET()) {
            this.setBombTimes();
        }
        this.setPlayTimes();
    }

    /**
     * 自动出牌
     */
    autoPlay() {
        let stateManager = this.room.getComp('state');
        let banker = stateManager.getBanker();
        let lastCard = stateManager.getLastCards();

        if (!this.cards || _.size(this.cards) == 0) {
            return;
        }

        if (!lastCard) {
            //已从大到小排序 取数组中最小的一个打出去
            let cards = [];
            cards.push(this.cards[_.size(this.cards) - 1]);
            let formation = ddzcons.Formation.ONE();
            let outCardResult = utils.searchOutCard(this.cards, this.cards.length, '', 0);
            if (outCardResult.cbCardCount > 0) {
                cards = outCardResult.cbResultCard;
                this.logger.debug('真人出牌信息', utils.printCards(cards));
                formation = utils.getCardType(cards, cards.length);
            }
            // let stateManager = this.room.getComp('state');

            this.cards = utils.removeCards(this.cards, cards);
            this.logger.debug('房间', this.room.getAttr('id'), '座位', this.getIndex(), '玩家', this.user.getAttr('id'), '真人托管主动牌', utils.printCards(cards), '剩余手牌', utils.printCards(this.cards));
            this.sendChannelAction(ddzcons.RoomAction.PLAYER_ACTION(), { type: ddzcons.PlayerAction.PLAY(), cards, formation, count: _.size(this.cards) });
            if (formation == ddzcons.Formation.BOMB() || formation == ddzcons.Formation.ROCKET()) {
                stateManager.setMultiple();
            }
            stateManager.setLastCards({ cards, formation, seat: this.getIndex() });
            stateManager.RobotRecordcard(this.getIndex(), cards);
            stateManager.clearPass();
            utils.sortCard(this.cards);
            return;
        }

        //被动
        if (this.needPlay(lastCard, banker) || utils.compareCard(lastCard.cards, this.getCards())) {
            let outCardResult = utils.searchOutCard(this.cards, this.cards.length, lastCard.cards, lastCard.cards.length);
            if (outCardResult.cbCardCount > 0) {
                let formation = utils.getCardType(outCardResult.cbResultCard, outCardResult.cbResultCard.length);
                let cards = outCardResult.cbResultCard;
                this.logger.debug('房间', this.room.getAttr('id'), '座位', this.getIndex(), '玩家', this.user.getAttr('id'), '真人托管被动', utils.printCards(cards), '剩余手牌', utils.printCards(this.cards));
                this.cards = utils.removeCards(this.cards, cards);
                this.sendChannelAction(ddzcons.RoomAction.PLAYER_ACTION(), { type: ddzcons.PlayerAction.PLAY(), cards, formation, count: _.size(this.cards) });
                if (formation == ddzcons.Formation.BOMB() || formation == ddzcons.Formation.ROCKET()) {
                    stateManager.setMultiple();
                }
                stateManager.setLastCards({ cards, formation, seat: this.getIndex() });
                utils.sortCard(this.cards);
            } else {
                this.pass();
            }
        } else {
            this.pass();
        }
    }

    needPlay(lastCardData, banker) {
        if (this.getIndex() == banker || lastCardData.seat == banker) {
            return true;
        }

        let outCardResult = utils.searchOutCard(this.cards, this.cards.length, lastCardData.cards, lastCardData.cards.length);

        if (outCardResult.cbCardCount <= 0) {
            return false;
        }
        let myCardLength = this.cards.length;
        let cbTurnOutType = lastCardData.formation;
        let outCardData = utils.sortCard(lastCardData.cards);
        let outCardCount = lastCardData.cards.length;
        let cbLogicValue = utils.getObjectCardLogicValue(outCardData[0]);
        let outCardLogicValue = utils.getObjectCardLogicValue(outCardResult.cbResultCard[0]);

        //出牌分析
        switch (cbTurnOutType) {
            case ddzcons.Formation.ONE():					//单牌类型
            case ddzcons.Formation.PAIR():					//对牌类型
            case ddzcons.Formation.TRIPLE():					//三条类型
                {
                    //获取数值
                    if (outCardCount <= 1 && outCardLogicValue < 14) {
                        if (cbLogicValue <= 13 || myCardLength == outCardCount) {
                            return true;
                        }
                    }

                    //寻找对牌
                    if (outCardCount <= 2 && outCardLogicValue < 14) {
                        if (cbLogicValue < 13 || myCardLength == outCardCount) {
                            return true;
                        }
                    }

                    //寻找三牌
                    if (outCardCount <= 3 && outCardLogicValue < 14) {
                        if (cbLogicValue < 10 || myCardLength == outCardCount) {
                            return true;
                        }
                    }
                    break;
                }
            case ddzcons.Formation.TRIPLE_1():	//三带一单
            case ddzcons.Formation.TRIPLE_2():	//三带一对
                {
                    //分析扑克
                    var AnalyseResult = utils.analyseCardData(outCardData, outCardCount);
                    let cbLogicValue = utils.getObjectCardLogicValue(AnalyseResult.cbThreeCardData[0]);
                    let outCardLogicValue = utils.getObjectCardLogicValue(outCardResult.cbResultCard[outCardResult.cbResultCard.length - 1]);

                    if ((cbLogicValue < 8 && outCardLogicValue < 10) || myCardLength == outCardCount) {
                        return true;
                    }
                }
        }

        return false;
    }

    /**
     * 不出
     */
    pass() {
        //let cards = { cards: null, index: this.getIndex() };
        let stateManager = this.room.getComp('state');
        stateManager.RobotRecordcard(this.getIndex(), null);
        stateManager.addTurn(this.getIndex());
        this.sendChannelAction(ddzcons.RoomAction.PLAYER_ACTION(), { type: ddzcons.PlayerAction.PASS() });
        let isRobot = this.isRobot() ? '机器人' : '玩家';
        this.logger.debug('房间', this.room.getAttr('id'), '座位', this.getIndex(), isRobot, this.user.getAttr('id'), '过牌', '剩余手牌', utils.printCards(this.cards));
    }

    getCards() {
        return this.cards;
    }

    isPlaying() {
        return super.isPlaying() && (!!this.cards) && (_.size(this.cards) > 0);
    }

    setAuto(auto) {
        this.auto = auto;
        this.sendChannelAction(cons.RoomAction.PLAYER_ROBOT(), { type: ddzcons.PlayerAction.ROBOT(), seat: this.getIndex(), robot: auto });
    }

    getAuto() {
        return this.auto;
    }

    // copyCardsWith0(cards) {
    //     let tempCards = [];
    //     for (let i = 0; i < cards.length; i++) {
    //         tempCards[i] = 0;
    //     }
    //     return tempCards;
    // }

    setPlayTimes() {
        this.playTimes++;
    }

    getPlayTimes() {
        return this.playTimes;
    }

    setBombTimes() {
        this.bombTimes++;
    }

    getBombTimes() {
        return this.bombTimes;
    }

    toJson(seat) {
        let json = super.toJson();
        json.auto = this.auto;
        json.speaked = this.speaked;
        json.grabbed = this.grabbed;
        json.doubled = this.doubled;
        json.cards = this.toJson_Hand(seat);
        json.mingPai = this.ming;
        // if (seat == this) {
        //     json.cards = this.cards ? Card.toJson(this.cards) : null;
        // } else {
        //     json.cards = this.cards ? this.copyCardsWith0(this.cards) : null;
        // }
        return json;
    }

    isMing() {
        return this.ming;
    }

    toJson_Hand(seat = null) {
        if (!this.cards) {
            return null;
        }

        return _.map(this.cards, c => {
            return (seat == this || this.ming) ? c.toJson() : Card.fake();
        });
    }

    deepCopy(cards) {
        if (!cards || cards.length == 0) return null;
        let deepCards = [];
        for (let i = 0; i < cards.length; i++) {
            deepCards.push(cards[i]);
        }
        return deepCards;
    }
}


module.exports = Seat;