const card = require('./card');
const cons = require('./majongConstants');
const _ = require('underscore');

class Library {
    /**
     * 开局创建牌山
     **/
    constructor() {
        this.cards = [];
    }

    init() {
        this.cntFromBack = 0;

        this.cards = [];

        for (let i = 0; i < cons.typeValid().length; i++) {
            if (cons.typeValid()[i]) {
                for (let j = cons.cardStart()[i]; j <= cons.cardEnd()[i]; j++) {
                    for (let k = 0; k < cons.cardRepeat(); k++) {
                        this.cards.push(new card(cons.cardIndex()[i], j, k));
                    }
                }
            }
        }
    }

    wash() {
        this.cards = _.shuffle(this.cards);
    }

    pickOneCard(suit, point) {
        let index = _.findIndex(this.cards, o => o.suit == suit && o.point == point);
        if (index != -1) {
            return this.cards.splice(index, 1)[0];
        }

        return undefined;
    }

    pickCards(...cards) {
        let newCards = [];
        _.each(cards, c => {
            let index = _.findIndex(this.cards, o => o.getValue() == c.getValue());
            if (index != -1) {
                let oo = this.cards.splice(index, 1)[0];
                newCards.push(oo);
            }
        });

        return newCards;
    }

    pickCardsByCH(...chs) {
        let newCards = [];
        _.each(chs, ch => {
            let index = _.findIndex(this.cards, o => o.getCH() == ch);
            if (index != -1) {
                let oo = this.cards.splice(index, 1)[0];
                newCards.push(oo);
            }
        });

        return newCards;
    }

    deal(count) {
        return this.cards.splice(0, count);
    }

    prepare(cards1, cards2) {
        cards1 = this.pickCardsByCH(...cards1);
        cards2 = this.pickCardsByCH(...cards2);

        this.cards.unshift(...cards1);
        this.cards.push(...cards2);
    }

    drawFront() {
        return this.cards.shift();
    }

    drawBack() {
        if (this.cards.length > 0) {
            this.cntFromBack++;
        }

        return this.cards.pop();
    }

    getCount() {
        return this.cards.length;
    }
}

module.exports = Library;