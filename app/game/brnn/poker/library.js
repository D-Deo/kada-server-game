const Card = require('./card');
const cons = require('../../../common/constants');
const Formatter = require('./formatter');
const _ = require('underscore');
const logger = require('pomelo-logger').getLogger('game-dz', __filename);
const brnncons = require('../common/constants');;

class Library {
    constructor() {
        this.cards = [];
        this.wash();
    }

    draw(count) {
        return this.cards.splice(0, count);
    }

    haveEnoughCard(count) {
        return _.size(this.cards) >= count;
    }

    toJson() {
        return _.size(this.cards);
    }

    wash() {
        this.cards = [];
        _.times(cons.Poker.CardPoint.KING(), (p) => {
            _.times(cons.Poker.CardSuit.SPADE(), (s) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });
        this.cards = _.shuffle(this.cards);
    }

    /**
     * 开牌
     */
    open(openCards) {
        // BANKER 庄家 PLAYER 闲家
        // let bc = this.draw(5);
        let formatters = [];

        let bfmt = new Formatter(openCards[0]).resolve();
        let bfCardBiggest = _.sortBy(openCards[0], c => -c.getPoint()).slice(0, 1);

        formatters.push(bfmt);
        // let bfmt = Formatter.create(bc);

        let pc_array = {};
        let pfmt_array = {};
        let BiggestCard = [];
        let r_array = {};
        let s = 0;
        for (let i = 0; i < 4; i++) {
            // pc_array[i] = this.draw(5);
            // pc_array[i] = openCards[i + 1];
            pfmt_array[i] = new Formatter(openCards[i + 1]).resolve();
            BiggestCard[i] = _.sortBy(openCards[i + 1], c => -c.getPoint()).slice(0, 1);

            formatters.push(pfmt_array[i]);
            // pfmt_array[i] = Formatter.create(pc_array[i]);

            if (pfmt_array[i].isGreaterThan(bfmt)
                || (pfmt_array[i].type == bfmt.type && (BiggestCard[i][0].point > bfCardBiggest[0].point ||
                    (BiggestCard[i][0].point == bfCardBiggest[0].point && BiggestCard[i][0].suit > bfCardBiggest[0].suit)))) {
                s |= 1 << i;
                // 闲赢倍率
                r_array[i] = pfmt_array[i].getTimes();
            } else {
                // 庄赢倍率
                r_array[i] = -bfmt.getTimes();
            }
        }

        let ret = {
            bfmt,
            pfmt_array,
            r_array,
            formatters
        };

        // this.opens.push(ret);
        return { result: ret, road: s };
    }
}

module.exports = Library;