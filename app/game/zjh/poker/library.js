const Card = require('../poker/card');
const constants = require('../../../common/constants');
const zjhcons = require('../common/constants');;
const logger = require('pomelo-logger').getLogger('game-zjh', __filename);
const _ = require('underscore');
const Formatter = require('./formatter');


class Library {
    constructor() {
        // this.publicCards = [];
        this.cards = null;
        this.seatCards = {};
        this.wash();
    }

    wash() {
        this.cards = [];
        _.times(constants.Poker.CardSuit.SPADE(), (s) => {
            _.times(constants.Poker.CardPoint.KING(), (p) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });
        this.cards = _.shuffle(this.cards);
        // this.publicCards = this.deal(5);

        this.seatCards = [];
        _.times(zjhcons.ROOM_CAPACITY(), (n) => {
            let cards = this.deal(zjhcons.PLAYER_CARD_SIZE());
            this.seatCards.push(cards);
        });

        this.seatCards.sort((a, b) => {
            let af = Formatter.format(a);
            let bf = Formatter.format(b);
            return af.compare(bf) * -1;
        });

        logger.debug('洗牌结果', this.publicCards, this.seatCards);
    }

    deal(count) {
        return this.cards.splice(0, count);
    }

    getCardsRandom() {
        let r = _.random(0, this.seatCards.length - 1);
        return this.seatCards.splice(r, 1)[0];
    }

    getCardsGood() {
        return this.seatCards.shift();
    }

    getCardsBad() {
        return this.seatCards.pop();
    }

    // dealPublicCards(from, count) {
    //     return this.publicCards.slice(from, from + count);
    // }

    // getpublicCards() {
    //     return this.publicCards;
    // }
}


module.exports = Library;