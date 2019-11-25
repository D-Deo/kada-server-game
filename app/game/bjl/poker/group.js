const logger = require('pomelo-logger').getLogger('game-bjl', __filename);
const cons = require('../../../common/constants');
const bjlcons = require('../common/constants');
const Card = require('./card');
const _ = require('underscore');

class Group {
    static create(cards, threeKing) {
        return new Group(cards, threeKing);
    }

    /**
     * 比较两组牌的大小
     * @static
     * @param {[Group]} groups [0]闲 [1]庄
     * @return -1:闲 0:和 1:庄
     */
    static compare(pg, bg) {
        let pp = pg.getPoint();
        let bp = bg.getPoint();
        let r = (pp > bp) ? -1 : (pp == bp ? 0 : 1);
        logger.debug('比牌结果', r >= 0 ? r > 0 ? '庄' : '和' : '闲');
        return r;
    }

    /**
     * 比较两组是否是同点和
     * @static
     * @param {Group} pg 
     * @param {Group} bg 
     * @return {boolean} 
     */
    static compareSamePoint(pg, bg) {
        if (pg.getCards().length !== bg.getCards().length) {
            return false;
        }

        let pc = _.sortBy(pg.getCards(), (c) => c.getPoint());
        let bc = _.sortBy(bg.getCards(), (c) => c.getPoint());

        let same = true;
        for (let i = 0; i < pc.length; i++) {
            if (pc[i].getPoint() != bc[i].getPoint()) {
                same = false;
                break;
            }
        }

        return same;
    }

    constructor(cards, threeKing = false) {
        this.cards = cards;

        this.threeKing = threeKing;
        let sum = 0;
        _.each(this.cards, (c) => {
            sum += c.getValue();
            // if (c.getPoint() >= cons.Poker.CardPoint.JACK()) {
            //     sum += 0;
            // } else {
            //     sum += c.getPoint();
            // }
        });
        this.point = sum % 10;

        logger.debug(this.__print());
    }

    /**
     * 获取牌组点数
     */
    getPoint() {
        return this.point;
    }

    /**
     * 获取牌组
     */
    getCards() {
        return this.cards;
    }

    /**
     * 是否天王
     */
    isKing() {
        return (this.cards.length == 2 || this.threeKing) && this.point >= bjlcons.CardType.KING();
    }

    /**
     * 是否对子
     */
    isPair() {
        if (this.cards.length < 2) {
            return false;
        }
        return this.cards[0].getPoint() == this.cards[1].getPoint();
    }

    toJson() {
        return Card.toJson(this.cards);
    }

    /**
     * 打印一组牌组信息
     */
    __print() {
        let rs = '';
        _.each(this.cards, (c) => {
            let s = '';
            switch (c.getSuit()) {
                case cons.Poker.CardSuit.DIAMOND():
                    s += '方片';
                    break;
                case cons.Poker.CardSuit.CLUB():
                    s += '草花';
                    break;
                case cons.Poker.CardSuit.HEART():
                    s += '红桃';
                    break;
                case cons.Poker.CardSuit.SPADE():
                    s += '黑桃';
                    break;
            }
            switch (c.getPoint()) {
                case cons.Poker.CardPoint.ACE():
                    s += 'A';
                    break;
                case cons.Poker.CardPoint.JACK():
                    s += 'J';
                    break;
                case cons.Poker.CardPoint.QUEEN():
                    s += 'Q';
                    break;
                case cons.Poker.CardPoint.KING():
                    s += 'K';
                    break;
                default:
                    s += '' + c.getPoint();
                    break;
            }
            rs += rs.length > 0 ? ',' + s : s;
        });
        return '<' + rs + '>' + ' 点数：' + this.getPoint() + ' 天王：' + this.isKing() + ' 对子：' + this.isPair();
    }
}


module.exports = Group;