const Super = require('../../../poker/card');


class Card extends Super {
    constructor(suit, point, index, extras) {
        super(suit, point, index, extras);
    }

    isGreaterThan(card) {
        if(this.point > card.getPoint()) {
            return true;
        }

        if(this.point < card.getPoint()) {
            return false;
        }

        return this.suit < card.getSuit();
    }
}


module.exports = Card;