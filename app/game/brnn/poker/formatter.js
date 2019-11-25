const constants = require('../common/constants');
const Formation = require('./formation');
const _ = require('underscore');

class Formatter {
    static create(cards) {
        let formatter = new Formatter(cards);
        return formatter.resolve();
    }

    static __print(cards) {
        return Formatter.create(cards).__print();
    }

    constructor(cards) {
        this.cards = cards;
        this.niuPoint = _.reduce(cards, (niuPoint, card) => {
            return niuPoint + card.getValue();
        }, 0);
    }

    resolve() {
        if (_.size(this.cards) !== constants.OPEN_CARDS_COUNT()) {
            return;
        }

        if (this.niuPoint <= 10) {
            return new Formation(constants.Poker.Formation.FIVE_SMALL(), this.cards);
        }

        let minPoint = _.reduce(this.cards,
            (r, card) => {
                return _.min([card.getPoint(), r])
            }, 13);

        for (let i1 = 0; i1 < this.cards.length; ++i1) {
            for (let i2 = i1 + 1; i2 < this.cards.length; ++i2) {
                if (((this.niuPoint - this.cards[i1].getValue() - this.cards[i2].getValue()) % 10) == 0) {
                    // 剩余3个位可以组成10的倍数
                    if ((this.niuPoint % 10) == 0) {
                        // 牛牛
                        if (minPoint > 10) {
                            // 五花牛    
                            return new Formation(constants.Poker.Formation.FIVE_BIG(), this.cards);
                        }

                        // 金牛
                        return new Formation(constants.Poker.Formation.NIUNIU(), this.cards);
                    }

                    return new Formation(this.niuPoint % 10, this.cards);

                    // return new Formation(constants.Poker.Formation.NIU(), this.niuPoint % 10, this.cards);
                }
            }
        }

        return new Formation(constants.Poker.Formation.NONE(), this.cards);
    }

}

module.exports = Formatter;