const cons = require('../../../common/constants');
const Super = require('../../../poker/card');
const utils = require('./utils');
const _ = require('underscore');


class Card extends Super {
    static fack() {
        let card = new Card(cons.Poker.CardSuit.JOKER(), cons.Poker.CardPoint.MAIN_JOKER(), 0);
        card.enableExtra(cons.Poker.CardExtra.FAKE());
        return card;
    }

    static toJson(cards) {
        if(!cards) {
            return null;
        }

        if(_.isArray(cards)) {
            return _.map(cards, (c) => c.toJson());
        }

        return cards.toJson();
    }

    static toCount(cards) {
        if(!cards) {
            return null;
        }

        if(_.isArray(cards)) {
            return cards.length;
        }

        return 1;
    }

    constructor(suit, point, index, extras) {
        super(suit, point, index, extras);

        this.value = utils.toValue(this.point);
    }

    getValue() {
        return this.value;
    }

    getOrder() {
        return this.getValue();
    }
}


module.exports = Card;