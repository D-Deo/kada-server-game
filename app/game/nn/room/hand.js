const constants = require('../../../common/constants');
const Formatter = require('../poker/formatter');
const _ = require('underscore');


class Hand {
    constructor(room, seat) {
        this.room = room;
        this.seat = seat;
        this.cards = [];
        this.formation = null;
        this.library = null;

        this.init();
    }

    addCards(cards) {
        this.cards = cards;
        //this.seat.sendAction(constants.RoomAction.PLAYER_ADD_CARDS(), _.map(cards, (c) => c.toJson()));
        // this.room.getComp('viewer').sendAction(constants.RoomAction.PLAYER_SHOW_CARDS(), {seat: this.seat.getIndex(), cards: _.size(cards)});
    }
    addLastCards(card) {
        this.cards[4] = card[0];
    }
    sendCards() {
        this.seat.sendAction(constants.RoomAction.PLAYER_ADD_CARDS(), _.map(this.cards, (c) => c.toJson()));
    }

    sendLastCard() {
        if (this.room.getAttr('standard')) {
            this.seat.sendAction(constants.RoomAction.PLAYER_ADD_CARDS(), _.map(this.cards, (c) => c.toJson()));
        }
        else {
            let card = this.cards.slice(4, 5);
            this.seat.sendAction(constants.RoomAction.PLAYER_ADD_CARDS(), _.map(card, (c) => c.toJson()));
        }
    }
    clearFormation() {
        this.formation = null;
    }
    format() {
        if (this.formation) {
            return this.formation;
        }

        let formatter = new Formatter(this.cards);
        formatter.resolve();
        this.formation = formatter.getDefaultFormation();
        return this.formation;
    }

    getFormation() {
        return this.formation;
    }

    getLibrary() {
        return this.library;
    }

    firstDeal() {
        this.addCards(_.first(this.library, 4));
    }

    secondDeal() {
        if (this.room.getAttr('standard')) {
            this.addCards(this.library);
        }
        else {
            this.addLastCards(_.last(this.library, 1));
        }
    }

    changeLast(index) {
        let stateMgr = this.room.getComp('state');
        this.cards[4] = stateMgr.getLibrary().getCard(index);
    }
    init() {
        let stateMgr = this.room.getComp('state');
        let jackpotMgr = this.room.getComp('jackpot');
        if (!jackpotMgr.getEnabled()) {
            this.library = stateMgr.getLibrary().getCardsRandom();
            return;
        }

        let jackpot = jackpotMgr.getJackpot();
        let r = _.random(100);
        if ((r <= jackpotMgr.getKillRate() && jackpot < jackpotMgr.getMinJackpot())
            || (jackpot < this.room.getAttr('capacity') * this.room.getAttr('baseScore') * stateMgr.getLibrary().getMaxTime(this.room) * 3)) {
            if (!this.seat.isRobot()) {
                this.library = stateMgr.getLibrary().getCardsBad();
            } else {
                this.library = stateMgr.getLibrary().getCardsGood();
            }
            return;
        }

        if (r <= jackpotMgr.getWinRate() && jackpot > jackpotMgr.getMaxJackpot()) {
            if (!this.seat.isRobot()) {
                this.library = stateMgr.getLibrary().getCardsGood();
            } else {
                this.library = stateMgr.getLibrary().getCardsBad();
            }
            return;
        }

        this.library = stateMgr.getLibrary().getCardsRandom();

        // this.library = this.room.getComp('state').getLibrary().getCardsByIndex(this.seat.getIndex());
        // this.library = this.room.getComp('state').getLibrary().draw(5);
    }

    toJson(seat) {
        let json = {};
        json.cards = (seat === this.seat) ? _.map(this.cards, (c) => c.toJson()) : _.size(this.cards);
        json.formation = this.formation ? this.formation.toJson() : null;
        return json;
    }
}


module.exports = Hand;