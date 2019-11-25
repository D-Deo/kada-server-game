const Card = require('../poker/card');
const ddzcons = require('../common/constants');
const cons = require('../../../common/constants');
const _ = require('underscore');

class Library {
    constructor() {
        this.cards = null;
        this.seatCards = [];

        this.wash();
    }

    wash() {
        this.cards = [];

        let SUB_JOKER_p = cons.Poker.CardPoint.SUB_JOKER();     //小王点数14
        let SUB_JOKER_S = cons.Poker.CardSuit.JOKER();          //小王花色5
        let MAIN_JOKER_p = cons.Poker.CardPoint.MAIN_JOKER();   //大王点数15
        let MAIN_JOKER_S = cons.Poker.CardSuit.JOKER();         //大王花色5
        this.cards.push(new Card(SUB_JOKER_S, SUB_JOKER_p, SUB_JOKER_p * 10 + SUB_JOKER_S));
        this.cards.push(new Card(MAIN_JOKER_S, MAIN_JOKER_p, MAIN_JOKER_p * 10 + MAIN_JOKER_S));

        _.times(cons.Poker.CardPoint.KING(), (p) => {
            _.times(cons.Poker.CardSuit.SPADE(), (s) => {
                this.cards.push(new Card(s + 1, p + 1, (p + 1) * 10 + (s + 1)));
            });
        });

        for (let i = 0; i < 10; i++) {
            this.cards = _.shuffle(this.cards);
        }

        this.bottomCards = this.deal(ddzcons.BOTTOM_CARD_SIZE());
    }

    washBlackList() {
        this.cards = [];
        for (let i = 3; i < cons.Poker.CardPoint.JACK(); i++) {
            for (let j = cons.Poker.CardSuit.DIAMOND(); j <= cons.Poker.CardSuit.SPADE(); j++) {
                this.cards.push(new Card(j, i, (i + 1) * 10 + j));
            }
        }
        for (let j = cons.Poker.CardSuit.DIAMOND(); j <= cons.Poker.CardSuit.CLUB(); j++) {
            this.cards.push(new Card(j, cons.Poker.CardPoint.JACK(), (cons.Poker.CardPoint.JACK()) * 10 + j));
        }
        this.cards = _.shuffle(this.cards);
        for (let j = cons.Poker.CardSuit.HEART(); j <= cons.Poker.CardSuit.SPADE(); j++) {
            this.cards.push(new Card(j, cons.Poker.CardPoint.JACK(), (cons.Poker.CardPoint.JACK()) * 10 + j));
        }
        for (let j = cons.Poker.CardSuit.DIAMOND(); j <= cons.Poker.CardSuit.SPADE(); j++) {
            this.cards.push(new Card(j, cons.Poker.CardPoint.QUEEN(), (cons.Poker.CardPoint.QUEEN()) * 10 + j));
            this.cards.push(new Card(j, cons.Poker.CardPoint.KING(), (cons.Poker.CardPoint.KING()) * 10 + j));
            this.cards.push(new Card(j, cons.Poker.CardPoint.ACE(), (cons.Poker.CardPoint.ACE()) * 10 + j));
        }
        for (let j = cons.Poker.CardSuit.DIAMOND(); j <= cons.Poker.CardSuit.HEART(); j++) {
            this.cards.push(new Card(j, cons.Poker.CardPoint.TWO(), (cons.Poker.CardPoint.TWO()) * 10 + j));
        }
        let SUB_JOKER_p = cons.Poker.CardPoint.SUB_JOKER();     //小王点数14
        let SUB_JOKER_S = cons.Poker.CardSuit.JOKER();          //小王花色5
        let MAIN_JOKER_p = cons.Poker.CardPoint.MAIN_JOKER();   //大王点数15
        let MAIN_JOKER_S = cons.Poker.CardSuit.JOKER();         //大王花色5
        this.cards.unshift(new Card(SUB_JOKER_S, SUB_JOKER_p, SUB_JOKER_p * 10 + SUB_JOKER_S));
        this.cards.unshift(new Card(MAIN_JOKER_S, MAIN_JOKER_p, MAIN_JOKER_p * 10 + MAIN_JOKER_S));
        this.cards.unshift(new Card(cons.Poker.CardSuit.SPADE(), cons.Poker.CardPoint.TWO(), (cons.Poker.CardPoint.TWO()) * 10 + cons.Poker.CardSuit.SPADE()));
        this.bottomCards = this.deal(ddzcons.BOTTOM_CARD_SIZE());
    }

    deal(count) {
        return this.cards.splice(0, count);
    }

    getBottomCards() {
        return this.bottomCards;
    }

    setBottomCards(cards) {
        this.bottomCards = cards;
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