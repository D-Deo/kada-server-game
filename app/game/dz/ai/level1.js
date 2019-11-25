const dzcons = require('../common/constants');
const Formatter = require('../poker/formatter');
const FormatterHand = require('../poker/formatterHand');
const Formation = require('../poker/formation');
const logger = require('pomelo-logger').getLogger('game-dz-robot', __filename);
const utils = require('../poker/utils');
const _ = require('underscore');


// level1 的思路就是，新手玩家只会单纯的去判断自己的牌型是否合适，机器人的优势是可以知道最终牌型
class Level1 {
    constructor() {
        this.init();
    }

    init() {
        this.room = null;                       // 当前房间信息
        this.index = null;                      // 当前座位
        this.publicCards = null;                // 当局公牌
        this.seat = null;                       // 自己座位
        this.formatterHand = null;              // 自己手牌的牌型结果
        this.formation = null;                  // 自己最终的牌型结果
        this.losers = null;                     // 比自己小的真实玩家
        this.winners = null;                    // 比自己大的真实玩家
        this.isInit = false;                    // 是否已经初始化

        this.rdm = 0;                           // 行为意识值（弃牌 < [0-49] < 50 跟注 < [51-100] < 加注）

        logger.info('[AI]', '初始化AI');
    }

    tell() {
        // 公牌
        if (!this.publicCards) {
            this.publicCards = this.room.getComp('state').getLibrary().getpublicCards();
            logger.info('[AI]', '公牌', this.index, utils.printCards(this.publicCards));
        }

        // 自己座位
        if (!this.seat) {
            this.seat = this.room.getComp('seat').getSeat(this.index);
        }

        // 初始化手牌数据
        if (!this.formatterHand) {
            let myHand = this.seat.getHand();
            logger.info('[AI]', '自己的手牌', this.index, utils.printCards(myHand));

            this.formatterHand = FormatterHand.format(myHand);
            logger.info('[AI]', '自己的手牌牌型', this.index, this.formatterHand.__print());
        }

        // 初始化最终牌型数据
        if (!this.formation) {
            let myCards = this.publicCards.concat(this.seat.getHand());
            this.formation = Formatter.format(myCards);
            logger.info('[AI]', '自己的最终牌型', this.index, this.formation.__print());
        }

        // 计算输赢玩家比例
        this.losers = [];
        this.winners = [];
        this.trueWin = [];
        let seats = this.room.getComp('seat').getPlayingSeats();
        for (let seat of seats) {
            let otherIndex = seat.getIndex();

            if (otherIndex != this.index /** && !seat.isRobot()**/) {
                let hand = seat.getHand();
                logger.info('[AI]', '别人的手牌', otherIndex, utils.printCards(hand));
                let cards = this.publicCards.concat(hand);
                let formation = Formatter.format(cards);
                logger.info('[AI]', '别人的最终牌型', otherIndex, formation.__print());

                let i = Formation.max([this.formation, formation]);
                if (i == 0) {
                    this.losers.push({ seat: seat, formation: formation });
                } else {
                    this.winners.push({ seat: seat, formation: formation });
                    if (!seat.isRobot()) {
                        this.trueWin.push({ seat: seat, formation: formation });
                    }
                }
            }
        }
        logger.info('[AI]', '别人能赢自己的人数', this.winners.length);
    }

    pos() {

    }

    bid(room, index) {
        logger.info('[AI1]', index, '开始思考...');
        let jackpotMgr = room.getComp('jackpot');
        let jackpot = jackpotMgr.getJackpot();
        let minJack = jackpotMgr.getMinJackpot();
        let robotBid = room.getComp('state').getRobotBid();
        this.room = room;
        this.index = index;

        this.tell();
        this.pos();

        let currentPublicCards = this.room.getComp('state').getPublicCards();

        if (currentPublicCards.length == 0) {           // 第一轮下注，翻牌前 Pre-flop  
            this.preflop();
        } else if (currentPublicCards.length == 3) {    // 第二轮下注，翻牌圈 Flop  
            this.flop();
        } else if (currentPublicCards.length == 4) {    // 第三轮下注，转牌圈 Trun  
            this.trun();
        } else {                                        // 第四轮下注，河牌圈 River  
            this.river();
        }

        let result = this.think();
        if (this.trueWin.length > 0 && result.type != dzcons.Bid.FOLD() && ((jackpot <= minJack + this.baseScore * 5 && jackpot >= minJack)) && jackpotMgr.getEnabled()) {
            if (result.type == dzcons.Bid.ALLIN()) {
                if (jackpot - robotBid - this.seat.getUser().getScore() < minJack) {
                    return { type: dzcons.Bid.FOLD() }
                }
            }
            if (result.type == dzcons.Bid.ADD()) {
                if (jackpot - robotBid - result.count < minJack) {
                    return { type: dzcons.Bid.FOLD() }
                }
            }
            else if (result.type == dzcons.Bid.FOLLOW()) {
                if (jackpot - robotBid - this.seat.getBidCount_Follow() < minJack) {
                    return { type: dzcons.Bid.FOLD() }
                }

            }
        }
        return result;
    }

    preflop() {
        logger.info('[AI]', this.index, this.rdm, '第一轮下注，翻牌前 Pre-flop');

        if (this.seat.getBidCount() > this.room.getAttr('baseScore') * 2) {
            if (this.winners.length == 0) {
                this.rdm = 50;
                logger.info('[AI]', this.index, this.rdm, '没有真实玩家能赢自己');
            } else {
                if (this.winners.length >= this.losers.length) {
                    this.rdm = 0;
                    logger.info('[AI]', this.index, this.rdm, '一半以上玩家都赢自己');
                } else {
                    this.rdm = 40;
                    logger.info('[AI]', this.index, this.rdm, '一半以下玩家都赢自己');
                }
            }

            if (this.formatterHand.isPair()) this.rdm += 40;
            if (this.formatterHand.isSuit()) this.rdm += 40;
            if (this.formatterHand.isHigh()) this.rdm += 10;
            if (this.formatterHand.isSequence()) this.rdm += 10;
        } else {
            this.rdm = 0;

            if (this.formatterHand.isPair()) this.rdm += 50;
            if (this.formatterHand.isSuit()) this.rdm += 50;
            if (this.formatterHand.isHigh()) this.rdm += 30;
            if (this.formatterHand.isSequence()) this.rdm += 20;

            if (this.rdm < 50) {
                if (this.winners.length == 0) {         // 没有真实玩家能赢自己
                    this.rdm = 50;
                    logger.info('[AI]', this.index, this.rdm, '没有真实玩家能赢自己');
                } else {
                    if (this.winners.length >= this.losers.length) {    // 一半以上玩家都赢自己
                        // this.rdm = 49;
                        logger.info('[AI]', this.index, this.rdm, '一半以上玩家都赢自己');
                    } else {
                        this.rdm = 50;
                        logger.info('[AI]', this.index, this.rdm, '一半以下玩家都赢自己');
                    }
                }
            }
        }

        if (this.rdm >= 80) this.rdm = 80;
        logger.info('[AI]', this.index, this.rdm, '手牌策略判断结束');
    }

    flop() {
        logger.info('[AI]', this.index, this.rdm, '翻牌圈下注', 3);
        if (this.winners.length == 0) {         // 没有真实玩家能赢自己
            this.rdm = 50;
            logger.info('[AI]', this.index, this.rdm, '没有真实玩家');

            if (this.formatterHand.isPair()) this.rdm += 5;
            if (this.formatterHand.isSuit()) this.rdm += 20;
            if (this.formatterHand.isHigh()) this.rdm += 5;
            if (this.formatterHand.isSequence()) this.rdm += 10;

            if (this.formation.getType() >= dzcons.Formation.SEQUENCE()) this.rdm += 10;
            if (this.formation.getType() == dzcons.Formation.TRIPLE()) this.rdm += 5;
            // if (this.formation.getType() >= dzcons.Formation.TWO_PAIR()) this.rdm += 0;
        } else {
            if (this.formation.getType() >= dzcons.Formation.SEQUENCE()) this.rdm -= 5;
            if (this.formation.getType() == dzcons.Formation.TRIPLE()) this.rdm -= 10;
            if (this.formation.getType() <= dzcons.Formation.TWO_PAIR()) this.rdm -= 15;

            logger.info('[AI]', this.index, this.rdm, '有玩家能赢自己');
        }

        if (this.rdm >= 80) this.rdm = 80;

        logger.info('[AI]', this.index, this.rdm, '中间牌型计算分值');
    }

    trun() {
        logger.info('[AI]', this.index, this.rdm, '转牌圈下注', 4);
        this.flop();
    }

    river() {
        logger.info('[AI]', this.index, this.rdm, '河牌圈下注');

        if (this.winners.length == 0) {         // 没有真实玩家能赢自己
            this.rdm = 50;
            logger.info('[AI]', this.index, this.rdm, '没有真实玩家');

            if (this.formation.getType() >= dzcons.Formation.SEQUENCE()) this.rdm += 30;
            if (this.formation.getType() == dzcons.Formation.TRIPLE()) this.rdm += 20;
            if (this.formation.getType() == dzcons.Formation.TWO_PAIR()) this.rdm += 10;
        } else {
            if (this.winners.length >= this.losers.length) {    // 一半以上玩家都赢自己
                this.rdm = 0;
                logger.info('[AI]', this.index, this.rdm, '一半以上赢自己');
            } else {
                if (this.formation.getType() >= dzcons.Formation.SEQUENCE()) this.rdm -= 10;
                if (this.formation.getType() == dzcons.Formation.TRIPLE()) this.rdm -= 20;
                if (this.formation.getType() <= dzcons.Formation.TWO_PAIR()) this.rdm -= 30;
                logger.info('[AI]', this.index, this.rdm, '一半以下赢自己');
            }
        }

        if (this.rdm >= 80) this.rdm = 80;

        // 同花顺和炸弹直接 Allin
        if (this.formation.getType() >= dzcons.Formation.SUIT()) this.rdm += 100;

        logger.info('[AI]', this.index, this.rdm, '最终牌型计算分值');
    }

    think() {
        logger.info('[AI]', '当前行为意识值', this.rdm);
        let rand = _.random(50);
        logger.info('[AI]', '当前随机判定值', rand);


        if (this.rdm >= 50) {
            if (this.rdm - 50 > rand) {
                return this.add();
            }

            if (this.seat.canBidFollow()) {
                logger.info('[AI]', this.index, '能跟注');
                return { type: dzcons.Bid.FOLLOW() };
            }

            if (this.seat.canBidPass()) {
                logger.info('[AI]', this.index, '能让牌');
                return { type: dzcons.Bid.PASS() };
            }

            logger.info('[AI]', this.index, '不能跟注，不能让牌，只能全下');
            return { type: dzcons.Bid.ALLIN() };
        } else {
            if (this.rdm > rand) {
                if (this.seat.canBidFollow()) {
                    logger.info('[AI]', this.index, '能跟注');
                    return { type: dzcons.Bid.FOLLOW() };
                }
            }

            if (this.seat.canBidPass()) {
                logger.info('[AI]', this.index, '不能跟注，只能让牌');
                return { type: dzcons.Bid.PASS() };
            }

            logger.info('[AI]', this.index, '不能跟注，不能让牌，只能弃牌');
            return { type: dzcons.Bid.FOLD() };
        }
    }

    add() {
        let p1 = (this.rdm - 100) / 100;
        if (p1 <= 0) p1 = 0;
        let p2 = 0;
        if (this.formation.getType() >= dzcons.Formation.PAIR()) {
            p2 = (this.formation.getType() - dzcons.Formation.PAIR()) / dzcons.Formation.TRIPLE_PAIR();
        }
        logger.info('[AI]', this.index, '当前概率', p1, p2);
        let coin = Math.floor((this.seat.getUser().getScore() - this.seat.getBidCount_AddMin()) * Math.floor(p1 * p2)) + this.seat.getBidCount_AddMin();
        if (this.seat.canBidAdd(coin)) {
            logger.info('[AI]', this.index, '能加注', coin);
            return { type: dzcons.Bid.ADD(), count: coin };
        }
        logger.info('[AI]', this.index, '不能加注，只能Allin', coin);
        return { type: dzcons.Bid.ALLIN() };
    }
}

module.exports = Level1;
