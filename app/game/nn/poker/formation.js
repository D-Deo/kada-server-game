const constants = require('../common/constants');
const i18n = require('../../../i18n');
const _ = require('underscore');


class Formation {
    constructor(type, value, cards) {
        this.type = type;
        this.value = value;
        this.cards = cards;
    }

    getCompareCard() {
        return _.max(this.cards, (c) => c.getPoint() * 100 + 10 - c.getSuit());
    }

    getTimes(mode) {
        if(mode === constants.TimesMode.MEMBER()) {
            return this.getNormalTimes();
        }

        if(mode === constants.TimesMode.CRAZY()) {
            return this.getCrazyTimes();
        }

        if(mode === constants.TimesMode.CLASSIC2()) {
            return this.getClassic2Times();
        }

        return 1;
    }

    getNormalTimes() {
        if(this.type === constants.Poker.Formation.NONE()) {
            return 1;
        }

        if(this.type === constants.Poker.Formation.NIU()) {
            return this.value <= 6 ? 1 : 2;
        }

        if(this.type === constants.Poker.Formation.NIUNIU()) {
            return 3;
        }

        return 5;
    }

    getCrazyTimes() {
        switch(this.type) {
            case constants.Poker.Formation.NONE():
                return 1;

            case constants.Poker.Formation.NIU():
                return this.value;

            case constants.Poker.Formation.NIUNIU():
                return 10;

            case constants.Poker.Formation.SEQUENCE():
                return 11;

            case constants.Poker.Formation.SUIT():
                return 12;

            case constants.Poker.Formation.TRIPLE_PAIR():
            case constants.Poker.Formation.FIVE_SMALL():
                return 13;

            case constants.Poker.Formation.FIVE_BIG():
            case constants.Poker.Formation.BOMB():
                return 14;

            case constants.Poker.Formation.SUIT_SEQUENCE():
                return 15;

            default:
                return 0;
        }
    }

    getClassic2Times() {
        if(this.type === constants.Poker.Formation.NONE()) {
            return 1;
        }

        if(this.type === constants.Poker.Formation.NIU()) {
            if(this.value <= 6) {
                return 1;
            }

            if(this.value <= 8) {
                return 2;
            }

            return 3;
        }

        if(this.type === constants.Poker.Formation.NIUNIU()) {
            return 4;
        }

        return 5;
    }

    getType() {
        return this.type;
    }

    getValue() {
        return this.value;
    }

    getName() {
        return i18n.__('NN_Formation_' + this.getType());
    }

    is(type, value) {
        return this.type === type && this.value === value;
    }

    isGreaterThan(formation) {
        if(this.type > formation.type) {
            return true;
        }

        if(this.type < formation.type) {
            return false;
        }

        if(this.value > formation.value) {
            return true;
        }

        if(this.value < formation.value) {
            return false;
        }

        return this.getCompareCard().isGreaterThan(formation.getCompareCard());
    }

    toJson() {
        let json = {};
        json.type = this.type;
        json.value = this.value;
        json.cards = _.map(this.cards, (c) => c.toJson());
        return json;
    }
}


module.exports = Formation;
