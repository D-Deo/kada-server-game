const _ = require('underscore');

class Utils {
    static printCards(cards) {
        let rs = '';
        _.each(cards, (c) => {
            let s = c.getCH();
            rs += rs.length > 0 ? ',' + s : s;
        });
        return '<' + rs + '>';
    }
    static printCard(card) {
        let rs = '';

        let s = card.getCH();
        rs += rs.length > 0 ? ',' + s : s;

        return '<' + rs + '>';
    }
    static sortCards(cards) {
        cards.sort((a, b) => a.getValue() - b.getValue());
        return cards;
    }
    /**
     * 玩家手牌是否包含目标牌
     */
    static contains(mycards, cards) {
        return _.every(cards, card1 => {
            return _.some(mycards, card2 => {
                return card2.getValue() == card1.getValue();
            });
        });
    }
    // 相同的牌，用于碰、杠等
    static isEqual(...cards) {
        let card = cards[0];

        if (card.isFlower()) {
            return false;
        }

        for (let i = 1; i < cards.length; i++) {
            if (cards[i] == undefined) {
                cards[i] = cards[i];
            }

            if (card.suit != cards[i].suit || card.point != cards[i].point) {
                return false;
            }
        }

        return true;
    }

    // 组成一套副牌
    static isStraight(...cards) {
        Utils.sortCards(cards);

        if (cards[0].isWind()) {
            return false;
        }

        for (let i = 1; i < cards.length; i++) {
            if (cards[i].suit != cards[0].suit || i != cards[i].point - cards[0].point) {
                return false;
            }
        }

        return true;
    }

    //整合牌
    static unionCards(jiang, seqArray, triArray) {
        let cards = [...jiang];
        for (let i = 0; i < seqArray.length; i++) {
            cards.push(...seqArray[i].cards);
        }
        for (let i = 0; i < triArray.length; i++) {
            cards.push(...triArray[i].cards);
        }
        return cards;
    }

    // 相同步长
    static getStep(...cards) {
        if (cards.length < 2 || cards[0].isWind() || !Utils.sameSuit(...cards)) {
            return -1;
        }

        let step = cards[1].point - cards[0].point;
        for (let i = 2; i < cards.length; i++) {
            if (cards[i].point - cards[i - 1].point != step) {
                return -1;
            }
        }

        return step;
    }

    static sameSuit(...cards) {
        if (cards.length == 0) {
            return false;
        }

        let index = _.findIndex(cards, c => c.suit != cards[0].suit);
        if (index != -1) {
            // 不是同一花色
            return false;
        }

        return true;
    }

    static getPairCount(cards) {
        let r = _.countBy(cards, v => v.suit * 10 + v.point);
        let sum = 0;
        for (let x in r) {
            if (r[x] == 3) {
                sum += 2;
            }
            else if (r[x] % 2 == 0) {
                sum += r[x];
            }
        }

        return sum / 2;
    }

    static getFirstSingleCard(cards) {
        let r = _.countBy(cards, v => v.suit * 10 + v.point);
        for (let x in r) {
            if (r[x] % 2 == 1) {
                return _.find(cards, v => (v.suit * 10 + v.point) == x);
            }
        }

        return undefined;
    }

    static removeCards(handCards, cards) {
        _.each(cards, c1 => {
            let index = _.findIndex(handCards, (c2) => {
                return c1.getValue() == c2.getValue();
            });

            if (index != -1) {
                handCards.splice(index, 1);
            }
        });

        return true;
    }

    //
    /**
     * 从源牌组中移除目标牌组并返回一个新的数组，操作不会影响源数组
     * @param {array} source 
     * @param {array} cards 
     * @return {array} 移除后的牌组
     */
    static removeCardsbyPoint(source, cards) {
        for (let i = 0; i < cards.length; i++) {
            for (let j = 0; j < source.length; j++) {
                if (cards[i].point == source[j].point) {
                    source.splice(j, 1);
                    break;
                }
            }
        }
        return source;
    };
}

module.exports = Utils;