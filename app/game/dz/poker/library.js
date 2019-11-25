const Card = require('../poker/card');
const dzcons = require('../common/constants');
const constants = require('../../../common/constants');
const logger = require('pomelo-logger').getLogger('game-dz', __filename);
const _ = require('underscore');
const Formatter = require('./formatter');

class Library {
    constructor() {
        this.cards = {};
        this.publicCards = [];
        this.seatCards = [];

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
        this.publicCards = this.deal(dzcons.PUBLIC_CARD_SIZE());

        this.seatCards = [];
        _.times(dzcons.ROOM_CAPACITY(), (n) => {
            let cards = this.deal(dzcons.PLAYER_CARD_SIZE());
            this.seatCards.push(cards);
        });

        this.seatCards.sort((a, b) => {
            let af = Formatter.format(this.publicCards.concat(a));
            let bf = Formatter.format(this.publicCards.concat(b));
            return af.compare(bf) * -1;
        });

        logger.debug('洗牌结果\n', this.publicCards, '\n', this.seatCards);
    }

    deal(count) {
        return this.cards.splice(0, count);
    }

    dealPublicCards(from, count) {
        return this.publicCards.slice(from, from + count);
    }

    getpublicCards() {
        return this.publicCards;
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

    getCardsByIndex(index) {
        return this.seatCards[index];
    }
}


module.exports = Library;