const cons = require('../../../common/constants');
const dzCons = require('../common/constants');
const utils = require('./utils');
const _ = require('underscore');


/**
 * 德州手牌的类型判断
 * Suit 同花
 * Sequence 连牌
 * Pair 对子
 * High 高位牌（包含A,K）
 */
class FormatterHand {
    static format(cards) {
        let formatter = new FormatterHand(cards);
        return formatter.format();
    }

    constructor(cards) {
        this.cards = _.sortBy(cards, (c) => {
            c.getValue();
        });
        this.formationType = {};
    }

    format() {
        let suitGroup = {};
        let valueGroup = {};

        _.each(this.cards, (c) => {
            suitGroup[c.getSuit()] = suitGroup[c.getSuit()] || [];
            suitGroup[c.getSuit()].push(c);

            valueGroup[c.getValue()] = valueGroup[c.getValue()] || [];
            valueGroup[c.getValue()].push(c);

            let r = this.high(c);
            if (r != null) {
                this.formationType[r] = true;
            }
        });

        let r = this.suit(suitGroup);
        if (r != null) {
            this.formationType[r] = true;
        }
        r = this.sequence(valueGroup);
        if (r != null) {
            this.formationType[r] = true;
        }
        r = this.pair(valueGroup);
        if (r != null) {
            this.formationType[r] = true;
        }

        return this;
    }

    bomb(group)
    {
        let pairs = _.filter(group, g => g.length == 3);
        let pair = _.max(pairs, p => _.first(p).getValue());
        if (pair === -Infinity) {
            return null;
        }

        return dzCons.Formation.BOMB();
    }
    suit(group) {
        if (_.isEmpty(group)) {
            return null;
        }

        let max = _.max(group, g => g.length);
        if (max.length < 2) {
            return null;
        }

        return dzCons.Formation.SUIT();
    }

    sequence(group) {
        let cards = _.map(group, g => _.first(g));
        cards = _.sortBy(cards, c => c.getValue());

        let seq = utils.toSequence_Value(cards) || utils.toSequence_Point(cards);
        if (!seq) {
            return null;
        }

        return dzCons.Formation.SEQUENCE();
    }

    pair(group) {
        let pairs = _.filter(group, g => g.length == 2);
        let pair = _.max(pairs, p => _.first(p).getValue());
        if (pair === -Infinity) {
            return null;
        }

        return dzCons.Formation.PAIR();
    }

    high(card) {
        if (card.getPoint() >= cons.Poker.CardPoint.KING() || card.getPoint() == cons.Poker.CardPoint.ACE()) {
            return dzCons.Formation.HIGH();
        }
        return null;
    }

    isBomb()
    {
        return this.formationType[dzCons.Formation.BOMB()]; 
    }
    isSuit() {
        return this.formationType[dzCons.Formation.SUIT()];
    }

    isSequence() {
        return this.formationType[dzCons.Formation.SEQUENCE()];
    }

    isPair() {
        return this.formationType[dzCons.Formation.PAIR()];
    }

    isHigh() {
        return this.formationType[dzCons.Formation.HIGH()];
    }

    __print() {
        let s = '';
        s += this.isSuit() ? (s.length > 0 ? ',' : '') + '同花' : '';
        s += this.isSequence() ? (s.length > 0 ? ',' : '') + '顺子' : '';
        s += this.isPair() ? (s.length > 0 ? ',' : '') + '对子' : '';
        s += this.isHigh() ? (s.length > 0 ? ',' : '') + '高位' : '';
        s = s == '' ? '垃圾' : s;
        return s;
    }
}


module.exports = FormatterHand;

//
// const Card = require('./card');
//
// let cards = [
//     new Card(1, 1, 0),
//     new Card(1, 13, 0),
//     new Card(1, 12, 0),
//     new Card(2, 12, 1),
//     new Card(1, 5, 0),
//     new Card(2, 5, 0),
//     new Card(3, 6, 0)
// ];
//
// let formation = Formatter.format(cards);
// console.log(Formatter.format(cards).toJson());
