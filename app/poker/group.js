const _ = require('underscore');


class Group {
    static create(cards) {
        return new Group(cards);
    }

    constructor(cards) {
        this.cards = cards;
    }

    getCards() {
        return this.cards;
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

    getLength() {
        return this.cards.length;
    }

    toJson() {
        return _.map(this.cards, c => c.toJson());
    }
}


module.exports = Group;