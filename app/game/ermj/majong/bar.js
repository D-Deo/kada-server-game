
const cons = require('./majongConstants');
const _ = require('underscore');
class Bar {
    // SEQ 顺子
    // TRI 刻子
    // QUAD 暗杠
    // QUADS 明杠
    constructor(id, type, cards) {
        this.id = id;
        this.type = type; // constants.barType
        this.cards = cards;
        this.first = _.min(cards, v => v.getValue());
        if (this.type == cons.barType.SEQ) {
            this.first = _.min(cards, c => c.getValue());
        }
    }

    changeToMingQuad(card) {
        if (this.type == cons.barType.TRI()) {
            if (card.suit == this.cards[0].suit
                && card.point == this.cards[0].point) {
                this.cards.push(card);
                this.type = cons.barType.MINGQUAD();
                return true;
            }
        }

        return false;
    }

    toJson(real = true) {
        let json = {};
        json.id = this.id;
        json.type = this.type;

        if (json.type == cons.barType.QUAD()) {
            json.cards = _.map(this.cards, c => c.toJson(real));
        }
        else {
            json.cards = _.map(this.cards, c => c.toJson());
        }

        return json;
    }

    getFirst() {
        return this.first;
    }

    getValue() {
        return this.first.suit * 10 + this.point;
    }
}

module.exports = Bar;