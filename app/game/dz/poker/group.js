const Card = require('./card');
const _ = require('underscore');


class Group {
    static create(cards) {
        return new Group(cards);
    }

    static fromSingle(card) {
        return Group.create([card]);
    }

    static fromSingles(cards) {
        return _.map(cards, c => Group.fromSingle(c));
    }

    constructor(cards) {
        this.cards = cards;
    }

    getSuit() {
        return _.first(this.cards).getSuit();
    }

    getPoint() {
        return _.first(this.cards).getPoint();
    }

    getValue() {
        return _.first(this.cards).getValue();
    }

    getOrder() {
        return this.cards.length * 100 + _.first(this.cards).getOrder();
    }

    toJson() {
        return Card.toJson(this.cards);
    }
}


module.exports = Group;