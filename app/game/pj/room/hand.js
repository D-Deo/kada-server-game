const constants = require('../../../common/constants');
const Formatter = require('../poker/formatter');
const _ = require('underscore');


class Hand {
    constructor(cards, seat = null, jackpot = 0) {
        this.formatter = undefined;
        if (cards.length > 0) {
            this.cards = cards;
        }
        else {
            this.seat = seat;
            this.cards = this.getLibraryCards(jackpot);
        }

        this.validFormatters = [];
        this.validFormatters.push(new Formatter(this.cards[0], this.cards[1], this.cards[2], this.cards[3]));
        this.validFormatters.push(new Formatter(this.cards[0], this.cards[2], this.cards[1], this.cards[3]));
        this.validFormatters.push(new Formatter(this.cards[0], this.cards[3], this.cards[1], this.cards[2]));

        this.bestFormatter = _.max(this.validFormatters, fmt => fmt.getBestType());
    }

    getFormatter() {
        return this.formatter;
    }

    getValidFormatter() {
        return this.validFormatters;
    }

    deal() {
        this.seat.sendAction(constants.RoomAction.PLAYER_ADD_CARDS(), this.toJson(true));
    }

    getLibraryCards(jackpot) {
        let stateMgr = this.seat.room.getComp('state');
        let jackpotMgr = this.seat.room.getComp('jackpot');

        if (!jackpotMgr.getEnabled()) {
            return stateMgr.getLibrary().getCardsRandom();
        }

        if (jackpot <= jackpotMgr.getMinJackpot()) {
            return seat.isRobot() ? stateMgr.getLibrary().getCardsGood() : stateMgr.getLibrary().getCardsBad();
        }

        let r = _.random(100);

        if (r <= jackpotMgr.getProb() && jackpot >= jackpotMgr.getMaxJackpot()) {
            return seat.isRobot() ? stateMgr.getLibrary().getCardsBad() : stateMgr.getLibrary().getCardsGood();
        }

        return stateMgr.getLibrary().getCardsRandom();
    }

    arrange(cards) {
        for (let i = 0; i < cards.length; i++) {
            let index = _.findIndex(this.cards, c => c.getPoint() == cards[i]);
            if (index != -1) {
                let o = this.cards.splice(index, 1)[0];
                this.cards.push(o);
            }
        }

        this.formatter = Formatter.create(...this.cards);
    }

    toJson(show) {
        let json = {};

        json.cards = _.map(this.cards, (c) => c.toJson(show));
        if (show) {
            json.formatters = [];
            if (this.formatter == undefined) {
                json.formatters = _.map(this.validFormatters, fmt => {
                    return fmt.toJson();
                });

                json.best = this.bestFormatter.toJson();
            }
            else {
                json.formatters.push(this.formatter.toJson());
            }
        }

        return json;
    }
}

module.exports = Hand;