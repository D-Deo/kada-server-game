const Card = require('./card');
const Hand = require('../room/hand.js');
const p9cons = require('../common/constants');
const cons = require('../../../common/constants');
const logger = require('pomelo-logger').getLogger('game-p9', __filename);
const _ = require('underscore');
const Formatter = require('./formatter');

class Library {
    constructor() {
        this.cards = [];
        this.seatHands = [];

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

        for (let i = 0; i < 2; i++) {
            this.cards.push(Card.create(p9cons.Poker.TIAN.point()));
            this.cards.push(Card.create(p9cons.Poker.DI.point()));
            this.cards.push(Card.create(p9cons.Poker.REN.point()));
            this.cards.push(Card.create(p9cons.Poker.HE.point()));
            this.cards.push(Card.create(p9cons.Poker.MEI.point()));
            this.cards.push(Card.create(p9cons.Poker.CHANG.point()));
            this.cards.push(Card.create(p9cons.Poker.BANDENG.point()));
            this.cards.push(Card.create(p9cons.Poker.FUTOU.point()));
            this.cards.push(Card.create(p9cons.Poker.HONGTOU.point()));
            this.cards.push(Card.create(p9cons.Poker.GAOJIAO.point()));
            this.cards.push(Card.create(p9cons.Poker.TONGCHUI.point()));
        }

        this.cards.push(Card.create(p9cons.Poker.HONG9.point()));
        this.cards.push(Card.create(p9cons.Poker.HEI9.point()));
        this.cards.push(Card.create(p9cons.Poker.PING8.point()));
        this.cards.push(Card.create(p9cons.Poker.XIE8.point()));
        this.cards.push(Card.create(p9cons.Poker.HONG7.point()));
        this.cards.push(Card.create(p9cons.Poker.HEI7.point()));
        this.cards.push(Card.create(p9cons.Poker.HONG5.point()));
        this.cards.push(Card.create(p9cons.Poker.HEI5.point()));
        this.cards.push(Card.create(p9cons.Poker.DAHOU.point()));
        this.cards.push(Card.create(p9cons.Poker.XIAOHOU.point()));

        this.cards = _.shuffle(this.cards);

        this.seatHands = [];
        _.times(p9cons.ROOM_CAPACITY(), (n) => {
            let cards = this.draw(p9cons.PLAYER_CARD_SIZE());
            this.seatHands.push(new Hand(cards));
        });

        this.seatHands.sort((a, b) => {
            return -a.bestFormatter.formation2.compare(b.bestFormatter.formation2);
        });

        _.each(this.seatHands, o =>
            logger.debug('洗牌结果', o.cards));
    }

    getCardsRandom() {
        let r = _.random(0, this.seatHands.length - 1);
        return this.seatHands.splice(r, 1)[0].cards;
    }

    getCardsGood() {
        return this.seatHands.shift().cards;
    }

    getCardsBad() {
        return this.seatHands.pop().cards;
    }

    getCardsByIndex(index) {
        return this.seatHands.splice(index, 1)[0].cards;
    }
}

module.exports = Library;