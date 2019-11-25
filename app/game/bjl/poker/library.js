const Card = require('./card');
const Group = require('./group');
const logger = require('pomelo-logger').getLogger('game-bjl', __filename);
const cons = require('../../../common/constants');
const bjlcons = require('../common/constants');
const _ = require('underscore');

class Library {
    constructor(mode) {
        this.cards = {};
        this.opens = [];
        this.threeKing = mode.threeKing;
        this.wash();
    }

    draw(count) {
        return this.cards.splice(0, count);
    }

    haveEnoughCard(count) {
        return _.size(this.cards) >= count;
    }

    toJson() {
        let count = _.reduce(this.opens, (count, open) => {
            return count + _.size(open.cards[0].getCards()) + _.size(open.cards[1].getCards());
        }, 0);
        return _.size(this.cards) + count;
    }

    /**
     * 洗牌：百家乐需要8组牌
     */
    wash() {
        this.opens = [];
        this.cards = [];

        _.times(cons.Poker.CardPoint.KING(), (p) => {
            _.times(cons.Poker.CardSuit.SPADE(), (s) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });
        this.cards = _.shuffle(this.cards);
        _.times(cons.Poker.CardPoint.KING(), (p) => {
            _.times(cons.Poker.CardSuit.SPADE(), (s) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });
        this.cards = _.shuffle(this.cards);
        _.times(cons.Poker.CardPoint.KING(), (p) => {
            _.times(cons.Poker.CardSuit.SPADE(), (s) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });
        this.cards = _.shuffle(this.cards);
        _.times(cons.Poker.CardPoint.KING(), (p) => {
            _.times(cons.Poker.CardSuit.SPADE(), (s) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });
        this.cards = _.shuffle(this.cards);
        _.times(cons.Poker.CardPoint.KING(), (p) => {
            _.times(cons.Poker.CardSuit.SPADE(), (s) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });
        this.cards = _.shuffle(this.cards);
        _.times(cons.Poker.CardPoint.KING(), (p) => {
            _.times(cons.Poker.CardSuit.SPADE(), (s) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });
        this.cards = _.shuffle(this.cards);
        _.times(cons.Poker.CardPoint.KING(), (p) => {
            _.times(cons.Poker.CardSuit.SPADE(), (s) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });
        this.cards = _.shuffle(this.cards);
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
    open() {
        logger.debug('开牌', this.opens.length);

        if (this.opens.length) {
            logger.debug('牌库已有库存，先获取现有的牌型，当前还剩余', this.opens.length);
            return this.opens.pop();
        }

        let pc = this.draw(2);
        let bc = this.draw(2);

        let pg = Group.create(pc, this.threeKing);
        let bg = Group.create(bc, this.threeKing);

        let thirdCard = null;

        if (pg.getPoint() < 6 && !pg.isKing() && !bg.isKing()) {
            logger.debug('闲家博牌');
            let cards = this.draw(1);
            thirdCard = cards[0];
            pc = pc.concat(cards);
            pg = Group.create(pc, this.threeKing);
        }

        let needThirdCard = false;
        if (!pg.isKing()) {
            if (bg.getPoint() <= 2) {
                logger.debug('庄家博牌，庄家2点以下');
                needThirdCard = true;
            } else {
                if (thirdCard) {
                    if (bg.getPoint() == 3 && thirdCard.getValue() != 8) {
                        logger.debug('庄家博牌，庄家3点，闲家博牌不是8点');
                        needThirdCard = true;
                    } else if (bg.getPoint() == 4 && (thirdCard.getValue() >= 2 && thirdCard.getValue() <= 7)) {
                        logger.debug('庄家博牌，庄家4点，闲家博牌2-7点');
                        needThirdCard = true;
                    } else if (bg.getPoint() == 5 && (thirdCard.getValue() >= 4 && thirdCard.getValue() <= 7)) {
                        logger.debug('庄家博牌，庄家5点，闲家博牌4-7点');
                        needThirdCard = true;
                    } else if (bg.getPoint() == 6 && (thirdCard.getValue() == 6 || thirdCard.getValue() == 7)) {
                        logger.debug('庄家博牌，庄家6点，闲家博牌6-7点');
                        needThirdCard = true;
                    }
                } else if (bg.getPoint() < 6) {
                    logger.debug('庄家博牌，庄家6点以下，且闲家没有博牌');
                    needThirdCard = true;
                }
            }
        }

        if (needThirdCard) {
            logger.debug('庄家博牌');
            bc = bc.concat(this.draw(1));
            bg = Group.create(bc, this.threeKing);
        }

        // if (Group.compare(pg, bg) < 0 && bg.getPoint() < 6 && !pg.isKing() && !bg.isKing()) {
        //     logger.debug('庄家博牌');
        //     bc = bc.concat(this.draw(1));
        //     bg = Group.create(bc);
        // }

        let s = 0;
        let r = Group.compare(pg, bg);
        if (r < 0) {
            s |= 1 << 7;        // 闲赢
            if (pg.isKing()) {
                s |= 1 << 5;    // 闲天王赢
            }
        } else if (r > 0) {
            s |= 1 << 6;        // 庄赢
            if (bg.isKing()) {
                s |= 1 << 4;    // 庄天王赢
            }
        } else {
            s |= 1 << 1;        // 和
            if (Group.compareSamePoint(pg, bg) === true) {
                s |= 1;         // 同点和
            }
        }

        if (pg.isPair()) {
            s |= 1 << 3;        // 闲对子
        }

        if (bg.isPair()) {
            s |= 1 << 2;        // 庄对子
        }

        let ret = { cards: [pg, bg], road: s, wanted: 0, weight: 0, score: 0 };
        return ret;
    }

    addOpen(...opens) {
        this.opens.push(...opens);
        this.opens = _.shuffle(this.opens);
    }

    getBestOpen() {
        if (!this.opens.length) {
            return this.open();
        }
        this.opens = _.sortBy(this.opens, (open) => {
            // 根据期望，权重，分数决定一个最优算法
            open.ret = open.weight * 10000000 + open.score + open.wanted / 10000;
            return open.ret;
        });

        logger.debug('最优排序结果', _.map(this.opens, open => {
            return { ret: open.ret, weight: open.weight, score: open.score, wanted: open.wanted };
        }));

        return this.opens.pop();
    }
}


module.exports = Library;