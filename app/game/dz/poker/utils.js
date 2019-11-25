const cons = require('../../../common/constants');
const dzcons = require('../common/constants');
const numberUtil = require('../../../utils/number');
const _ = require('underscore');


let utils = module.exports = {};

/**
 *  constants.Formation = {};
    constants.Formation.NONE = _.constant(1);
    constants.Formation.HIGH = _.constant(2);
    constants.Formation.PAIR = _.constant(3);
    constants.Formation.TWO_PAIR = _.constant(4);
    constants.Formation.TRIPLE = _.constant(5);
    constants.Formation.SEQUENCE = _.constant(6);
    constants.Formation.SUIT = _.constant(7);
    constants.Formation.TRIPLE_PAIR = _.constant(8);
    constants.Formation.BOMB = _.constant(9);
    constants.Formation.SUIT_SEQUENCE = _.constant(10);
    constants.Formation.SUIT_SEQUENCE_ACE = _.constant(11);
 */
utils.printType = (type) => {
    let s = '';
    switch (type) {
        case 1: s = '杂牌'; break;
        case 2: s = '高牌'; break;
        case 3: s = '对子'; break;
        case 4: s = '两队'; break;
        case 5: s = '三条'; break;
        case 6: s = '顺子'; break;
        case 7: s = '同花'; break;
        case 8: s = '葫芦'; break;
        case 9: s = '四条'; break;
        case 10: s = '同花顺'; break;
        case 11: s = '皇家同花顺'; break;
        default:
            break;
    }
    return s;
}

utils.toJackpots = (seats) => {
    if (_.isEmpty(seats)) {
        return null;
    }

    let allins = _.filter(seats, s => s.type === dzcons.Bid.ALLIN());
    allins = _.sortBy(allins, s => s.count);

    let splits = _.map(allins, a => a.count);
    splits = _.flatten([0, splits, _.max(seats, s => s.count).count]);
    splits = _.uniq(splits);

    let jackpots = [];
    for (let i = 0; i < splits.length - 1; ++i) {
        let min = splits[i];
        let max = splits[i + 1];

        let r = {};
        r.bid = max;
        r.count = _.reduce(seats, (m, s) => m + _.min([_.max([0, s.count - min]), max]), 0);
        jackpots.push(r);
    }
    return jackpots;
};


utils.toSequence_Point = (cards) => {
    let points = _.map(cards, c => c.getPoint());
    let seq = numberUtil.toSequence(points);
    if (!seq) {
        return null;
    }

    return _.map(seq, p => {
        return _.find(cards, c => c.getPoint() === p);
    });
};


utils.toSequence_Value = (cards) => {
    let points = _.map(cards, c => c.getValue());
    let seq = numberUtil.toSequence(points);
    if (!seq) {
        return null;
    }

    return _.map(seq, p => {
        return _.find(cards, c => c.getValue() === p);
    });
};


utils.toPoint = (value) => {
    if (value === (cons.Poker.CardPoint.KING() + 1)) {
        return cons.Poker.CardPoint.ACE();
    }
    return value;
};


utils.toValue = (point) => {
    if (point === cons.Poker.CardPoint.ACE()) {
        return cons.Poker.CardPoint.KING() + 1;
    }
    return point;
};


/**
 * 打印一组扑克牌的信息
 * @param {array} cards Card的数组
 */
utils.printCards = (cards) => {
    let rs = '';
    _.each(cards, (c) => {
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
    return '<' + rs + '>';
};
