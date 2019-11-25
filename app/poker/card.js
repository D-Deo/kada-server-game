const constants = require('../common/constants');
const utils = require('../utils');
const _ = require('underscore');


class Card {
    static subJoker(index = 0) {
        return new Card(constants.Poker.CardSuit.JOKER(), constants.Poker.CardPoint.SUB_JOKER(), index);
    }

    static mainJoker(index = 0) {
        return new Card(constants.Poker.CardSuit.JOKER(), constants.Poker.CardPoint.MAIN_JOKER(), index);
    }

    static toJson(cards) {
        if (!cards) {
            return null;
        }

        if (utils.isArray(cards)) {
            return _.map(cards, (c) => c.toJson());
        }

        return cards.toJson();
    }

    constructor(suit, point, index, extras) {
        this.suit = suit;
        this.point = point;
        this.index = index;
        this.extras = extras || {};
    }

    clone() {
        return new Card(this.suit, this.point, this.index, _.clone(this.extras));
    }

    getSuit() {
        return this.suit;
    }

    getPoint() {
        return this.point;
    }

    getIndex() {
        return this.index;
    }

    getValue() {
        return this.point;
    }

    getOrder() {
        return this.point * 10000 + this.suit * 100 + this.index;
    }

    enableExtra(key) {
        this.extras[key] = true;
    }

    disableExtra(key) {
        this.extras[key] = false;
    }

    getExtra(key) {
        return this.extras[key];
    }

    setExtra(key, value) {
        this.extras[key] = value;
    }

    haveExtra(key) {
        return _.has(this.extras, key);
    }

    isExtra(key) {
        return !!this.extras[key];
    }

    is(suit, point, index) {
        return (this.suit === suit) && (this.point === point) && (this.index === index);
    }

    isJoker() {
        return this.suit === constants.Poker.CardSuit.JOKER();
    }

    isSameWith(card, point) {
        let s = point ? card : card.getSuit();
        let p = point || card.getPoint();
        return (this.suit === s) && (this.point === p);
    }

    toJson() {
        return _.pick(this, ['suit', 'point', 'index', 'extras']);
    }
}


module.exports = Card;