const constants = require('../common/constants');
const i18n = require('../../../i18n');
const _ = require('underscore');
const cons = require('../../../common/constants.js');


class Formation {
    constructor(type, cards) {
        this.type = type;
        // this.value = value;
        this.cards = cards;
        this.maxCardValue = _.max(this.cards, (c) => c.getPoint() * 100 + 10 - c.getSuit());
    }

    getTimes() {
        return constants.Poker.Multi[this.type];
        // if (this.type <= constants.Poker.Formation.NIU_6()) {
        //     return constants.Poker.Multi()[];
        // }
        // else if (this.type <= constants.Poker.Formation.NIU_9()) {
        //     return 2;
        // }
        // else if (this.type == constants.Poker.Formation.NIUNIU()) {
        //     return 3;
        // }
        // else if (this.type == constants.Poker.Formation.FIVE_SMALL()) {
        //     return 4;
        // }
        // else if (this.type == constants.Poker.Formation.FIVE_BIG()) {
        //     return 5;
        // }

        // return 1;
    }

    getType() {
        return this.type;
    }

    getValue() {
        return this.value;
    }

    getName() {
        return i18n.__('BRNN_Formation_' + this.getType());
    }

    getCards() {
        return _.map(this.cards, (c) => c.toJson());
    }

    is(type) {
        return this.type === type;
    }

    // is(type, value) {
    //     return this.type === type && this.value === value;
    // }

    isGreaterThan(formation) {
        if (this.type != formation.type) {
            return this.type > formation.type;
        }

        // if (this.value != formation.value) {
        //     return this.value > formation.value;
        // }

        return this.maxCardValue > formation.maxCardValue;
    }

    toJson() {
        let json = {};
        json.type = this.type;
        // json.value = this.value;
        json.cards = _.map(this.cards, (c) => c.toJson());
        return json;
    }

    /**
     * 打印一组牌组信息
     */
    __print() {
        let rs = '';
        _.each(this.cards, (c) => {
            let s = '';
            switch (c.getSuit()) {
                case cons.Poker.CardSuit.DIAMOND():
                    s += '方片';
                    break;
                case cons.Poker.CardSuit.CLUB():
                    s += '草花';
                    break;
                case cons.Poker.CardSuit.HEART():
                    s += '红桃';
                    break;
                case cons.Poker.CardSuit.SPADE():
                    s += '黑桃';
                    break;
            }
            switch (c.getPoint()) {
                case cons.Poker.CardPoint.ACE():
                    s += 'A';
                    break;
                case cons.Poker.CardPoint.JACK():
                    s += 'J';
                    break;
                case cons.Poker.CardPoint.QUEEN():
                    s += 'Q';
                    break;
                case cons.Poker.CardPoint.KING():
                    s += 'K';
                    break;
                default:
                    s += '' + c.getPoint();
                    break;
            }
            rs += rs.length > 0 ? ',' + s : s;
        });
        return '<' + rs + '>' + ' 牌型：' + this.type;
    }
}


module.exports = Formation;
