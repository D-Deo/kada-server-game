// const constants = require('../common/constants');
const constants = require('../../../common/constants')
const Super = require('../../../poker/card');


class Card extends Super {
    constructor(suit, point, index, extras) {
        super(suit, point, index, extras);
    }

    isGreaterThan(card) {
        if (this.point != card.getPoint()) {
            return this.point > card.getPoint();
        }

        return this.suit > card.getSuit();
    }

    // getNiuPoint() {
    //     if (this.point >= constants.Poker.CardPoint.JACK()) {
    //         return constants.Poker.CardPoint.TEN();
    //     }

    //     return this.point;
    // }

    getValue() {
        if (this.point >= constants.Poker.CardPoint.JACK()) {
            return constants.Poker.CardPoint.TEN();
        }

        return this.point;
    }

    getPoint() {
        return this.point;
    }
}

module.exports = Card;