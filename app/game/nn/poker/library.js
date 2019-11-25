const Card = require('./card');
const nncons = require('../common/constants');
const cons = require('../../../common/constants');
const logger = require('pomelo-logger').getLogger('game-nn', __filename);
const _ = require('underscore');
const Formatter = require('./formatter');


class Library {
    constructor() {
        this.cards = {};
        this.seatCards = [];

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
        this.cards = _.shuffle(this.cards);
        this.cards = _.shuffle(this.cards);

        this.seatCards = [];
        _.times(nncons.ROOM_CAPACITY(), (n) => {
            let cards = this.draw(nncons.PLAYER_CARD_SIZE());
            this.seatCards.push(cards);
        });

        this.seatCards.sort((a, b) => {
            let af = Formatter.create(a);
            let bf = Formatter.create(b);
            return af.isGreaterThan(bf) ? -1 : 1;
        });

        this.MaxCards = this.seatCards[this.seatCards.length - 1];
        logger.debug('洗牌结果', this.seatCards);
    }

    getMaxTime(room) {
        let formation = Formatter.create(this.MaxCards);
        return formation.getTimes(room.getAttr("timesMode"));
    }

    getCard(index) {
        return this.cards[index];
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