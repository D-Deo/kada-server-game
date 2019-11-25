const ermjcons = require('../common/constants');
const mjcons = require('../majong/majongConstants');
const card = require('../majong/card');
const utils = require('../majong/utils');
const formatter = require('../majong/formatter');
const logger = require('log4js').getLogger('game-ermj');

class Panel {
    constructor(seat) {
        this.seat = seat;
        this.reset();
    }

    reset() {
        this.type = 0;
        this.canDraw = false; // 摸牌
        this.canPlay = false; // 出牌
        this.canChi = false; // 吃
        this.canPon = false; // 碰
        this.canKan = false; // 杠
        this.canTin = false; // 听
        this.canRon = false; // 胡
    }

    refresh(type) {
        this.reset();
        this.type = type;
        this.refreshDraw();
        this.refreshPlay();
        this.refreshChi();
        this.refreshPon();
        this.refreshKan();
        this.refreshTin();
        this.refreshRon();
    }

    onKan() {
        // 抢杠，只有胡
        this.reset();
        this.type = 2;
        this.refreshRon();
    }

    refreshDraw() {
        this.canDraw = this.seat.canDoByLastAction(ermjcons.RoomAction.DRAW());
    }

    refreshPlay() {
        this.canPlay = this.seat.canDoByLastAction(ermjcons.RoomAction.PLAY());
    }

    refreshChi() {
        this.chi = [];
        this.canChi = this.seat.canDoByLastAction(ermjcons.RoomAction.CHI());
        if (!this.canChi) {
            return;
        }

        let lastPlayed = this.seat.room.getComp('state').lastPlayed;
        if (lastPlayed == null || lastPlayed.suit == mjcons.CardSuit.WIND()) {
            this.canChi = false;
            return;
        }

        if (lastPlayed.point >= 3) {
            // 可以判断 -1 -2
            let first = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point - 2);
            if (first.length != 0) {
                let second = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point - 1);
                if (second.length != 0) {
                    this.chi.push([first[0].getValue(), second[0].getValue()]);
                }
            }
        }

        if (lastPlayed.point >= 2 && lastPlayed.point <= 8) {
            // 可以判断 -1 +1
            let first = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point - 1);
            if (first.length != 0) {
                let second = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point + 1);
                if (second.length != 0) {
                    this.chi.push([first[0].getValue(), second[0].getValue()]);
                }
            }
        }

        if (lastPlayed.point <= 7) {
            // 可以判断 +1 +2
            let first = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point + 1);
            if (first.length != 0) {
                let second = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point + 2);
                if (second.length != 0) {
                    this.chi.push([first[0].getValue(), second[0].getValue()]);
                }
            }
        }

        if (this.chi.length == 0) {
            this.canChi = false;
        }
    }

    refreshPon() {
        this.pon = [];
        this.canPon = this.seat.canDoByLastAction(ermjcons.RoomAction.PON());
        if (!this.canPon) {
            return;
        }

        let lastPlayed = this.seat.room.getComp('state').lastPlayed;
        if (lastPlayed == undefined) {
            this.canPon = false;
            return;
        }

        let first = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point);
        if (first.length < 2) {
            this.canPon = false;
        }
    }

    refreshKan() {
        this.kan = [];
        this.canKan = this.seat.canDoByLastAction(ermjcons.RoomAction.KAN());
        if (!this.canKan) {
            return;
        }

        if (this.seat.lastAction == ermjcons.RoomAction.PLAY()) {
            // 可以明杠
            let lastPlayed = this.seat.room.getComp('state').lastPlayed;
            let first = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point);
            if (first.length == 3) {
                this.kan.push(lastPlayed.getValue());
            }
        }
        else {
            // 可以暗杠、加杠
            let card = this.seat.handCards[0];
            let count = 1;
            for (let i = 1; i < this.seat.handCards.length; i++) {
                if (utils.isEqual(card, this.seat.handCards[i])) {
                    count++;
                    if (count == 4) {
                        this.kan.push(card.getValue());
                    }
                }
                else {
                    card = this.seat.handCards[i];
                    count = 1;
                }
            }

            for (let i = 0; i < this.seat.triArray.length; i++) {
                if (this.seat.triArray[i].type == mjcons.barType.TRI()) {
                    let c = this.seat.triArray[i].getFirst();
                    let cards = this.seat.getHandCardsLikeCard(c.suit, c.point);
                    if (cards.length > 0) {
                        this.kan.push(cards[0].getValue());
                    }
                }
            }
        }

        if (this.kan.length == 0) {
            this.canKan = false;
        }
    }

    refreshTin() {
        this.tin = [];
        this.canTin = this.seat.canDoByLastAction(ermjcons.RoomAction.TIN());
        if (!this.canTin) {
            return;
        }

        let fmt = new formatter(this.seat.room, ...this.seat.handCards);
        this.tin = fmt.getTin();

        if (this.tin.length == 0) {
            this.canTin = false;
        }
    }

    refreshRon() {
        this.canRon = this.seat.canDoByLastAction(ermjcons.RoomAction.RON());
        if (!this.canRon) {
            return;
        }

        let fmt = new formatter(this.seat.room, ...this.seat.handCards);

        if (this.seat.getIndex() == 0) {
            logger.debug('我的手牌', utils.printCards(this.seat.handCards), '手牌长度:', this.seat.handCards.length);
        }

        if (this.seat.lastAction == ermjcons.RoomAction.PLAY()) {
            // 别人点炮
            fmt.pushCards(this.seat.room.getComp('state').lastPlayed);
        }

        this.canRon = fmt.checkRon();
    }

    toJson() {
        let json = {};
        json.type = this.type;
        json.canDraw = this.canDraw;
        json.canPlay = this.canPlay;
        json.canChi = this.canChi;
        if (json.canChi) {
            json.chi = this.chi;
        }
        json.canPon = this.canPon;
        json.canKan = this.canKan;
        if (json.canKan) {
            json.kan = this.kan;
        }
        json.canTin = this.canTin;
        if (json.canTin) {
            json.tin = this.tin;
        }
        json.canRon = this.canRon;
        return json;
    }

    toJson_false() {
        let json = {};
        json.type = this.type;
        json.canDraw = false;
        json.canPlay = this.canPlay;
        json.canChi = false;
        if (json.canChi) {
            json.chi = false;
        }
        json.canPon = false;
        json.canKan = false;
        if (json.canKan) {
            json.kan = false;
        }
        json.canTin = false;
        if (json.canTin) {
            json.tin = false;
        }
        json.canRon = false;
        return json;
    }
}

module.exports = Panel;