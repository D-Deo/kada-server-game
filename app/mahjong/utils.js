const cons = require('../common/constants');
const _ = require('underscore');


let utils = module.exports = {};


utils.getTakeCards = (pair) => {
    let first = _.first(pair);
    let last = _.last(pair);
    let cards = [];

    if(last.point - first.point === 1) {
        if(utils.isSequencablePoint(first.point - 1)) {
            cards.push({suit: first.suit, point: first.point - 1});
        }

        if(utils.isSequencablePoint(last.point + 1)) {
            cards.push({suit: first.suit, point: last.point + 1});
        }
    } else {
        cards.push({suit: first.suit, point: first.point + 1});
    }
    return cards;
};


utils.getTakePairs = (suit, point) => {
    if(!utils.isSequencableSuit(suit)) {
        return [];
    }

    let pairs = [
        [{suit: suit, point: point - 2}, {suit: suit, point: point - 1}],
        [{suit: suit, point: point - 1}, {suit: suit, point: point + 1}],
        [{suit: suit, point: point + 1}, {suit: suit, point: point + 2}]
    ];
    return _.filter(pairs, (pair) => {
        return _.every(pair, (c) => utils.isSequencablePoint(c.point));
    });
};


utils.isFlowerableCard = (c) => {
    return  (c.suit === cons.Mahjong.CardSuit.CXQD()) ||
            (c.suit === cons.Mahjong.CardSuit.MLZJ());
};


utils.isSameSuit = (cards) => {
    let suit = _.first(cards).suit;
    return _.every(cards, (c) => c.suit === suit);
};


utils.isSequencableSuit = (suit) => {
    return  (suit >= cons.Mahjong.CardSuit.WAN()) &&
            (suit <= cons.Mahjong.CardSuit.TONG());
};


utils.isSequencablePoint = (point) => {
    return  (point >= cons.Mahjong.CardPoint.MIN()) &&
            (point <= cons.Mahjong.CardPoint.MAX());
};


utils.isTakePair = (pair, card) => {
    let cards = _.sortBy(_.flatten([pair, card]), (c) => c.point);
    if(!utils.isSameSuit(cards)) {
        return false;
    }

    return  ((cards[0].point + 1) === cards[1].point) &&
            ((cards[1].point + 1) === cards[2].point);
};