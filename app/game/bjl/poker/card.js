const Super = require('../../../poker/card');

class Card extends Super {
    constructor(suit, point, index, extras) {
        super(suit, point, index, extras);
    }

    getValue() {
        return this.point >= 10 ? 0 : this.point;
    }
}


module.exports = Card;