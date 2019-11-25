const _ = require('underscore');
const cons = require('../../../common/constants');
const Super = require('../../../poker/card');

class Card extends Super {

    // suit : 花色
    // index : 牌值
    constructor(suit, point, index) {
        super(suit, point, index);

        switch (suit) {
            case cons.Poker.CardSuit.DIAMOND():
                this.name = '方块' + cons.Poker.CardFace[point - 1];
                break;
            case cons.Poker.CardSuit.CLUB():
                this.name = '梅花' + cons.Poker.CardFace[point - 1];
                break;
            case cons.Poker.CardSuit.HEART():
                this.name = '红桃' + cons.Poker.CardFace[point - 1];
                break;
            case cons.Poker.CardSuit.SPADE():
                this.name = '黑桃' + cons.Poker.CardFace[point - 1];
                break;
            case cons.Poker.CardSuit.JOKER():
                this.name = cons.Poker.CardFace[point - 1];
                break;
        }
    }

    getValue() {
        return this.suit * 100 + this.point * 10; // + this.index;
    }

    getOrder() {
        if (this.getPoint() == cons.Poker.CardPoint.ACE()) {
            return cons.Poker.CardPoint.KING() * 100 + this.suit * 10 + this.index;
        }

        return (this.point - 1) * 100 + this.suit * 10 + this.index;
    }

    compare(card, omitColor = true) {
        if (!card) return 0;   //TODO：这里需要注意，为啥可能存在空

        if (this.getSuit() == cons.Poker.CardSuit.JOKER && card.getSuit() == cons.Poker.CardSuit.JOKER) {
            // 都是王
            return 0;
        }

        if (this.getPoint() != card.getPoint()) {
            // A最大
            if (this.getPoint() == cons.Poker.CardPoint.ACE()) {
                return 1;
            }
            else if (card.getPoint() == cons.Poker.CardPoint.ACE()) {
                return -1;
            }

            // 王最大
            return this.getPoint() - card.getPoint();
        }

        // 不比较颜色
        if (omitColor) {
            return 0;
        }

        return this.getSuit() - card.getSuit();
    }

    toJson() {
        let json = super.toJson();
        json.value = this.getValue();
        return json;
    }
}

module.exports = Card;