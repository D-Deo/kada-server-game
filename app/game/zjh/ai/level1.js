const zjhcons = require('../common/constants');
const Formatter = require('../poker/formatter');
const Formation = require('../poker/formation');
const logger = require('pomelo-logger').getLogger('game-zjh-robot', __filename);
const utils = require('../poker/utils');
const _ = require('underscore');
const cons = require('../../../common/constants');

// level1 的思路就是，新手玩家只会单纯的去判断自己的牌型是否合适，机器人的优势是可以知道最终牌型
class Level1 {

    constructor() {
        this.init();
    }

    init() {
        this.room = null;                       // 当前房间信息
        this.index = null;                      // 当前座位
        this.seat = null;                       // 自己座位
        this.formation = null;                  // 自己最终的牌型结果
        this.losers = null;                     // 比自己小的真实玩家
        this.winners = null;                    // 比自己大的真实玩家
        this.isInit = false;                    // 是否已经初始化

        this.rdm = 0;                           // 行为意识值（弃牌 < [0-49] < 50 跟注 < [51-100] < 加注）
        this.compareCount = 0;                  // 比牌次数

        logger.info('[AI]', '初始化AI');
    }

    bid(room, index) {
        logger.info('[AI1]', index, '开始思考...');

        this.room = room;
        this.betOptions = this.room.getAttr('betOptions');
        this.baseScore = this.room.getAttr('baseScore');
        this.index = index;
        let jackpotMgr = room.getComp('jackpot');
        let jackpot = jackpotMgr.getJackpot();
        let minJack = jackpotMgr.getMinJackpot();
        let robotBid = room.getComp('state').getRobotBid();
        this.tell();

        let stateMgr = this.room.getComp('state');
        if (stateMgr.getRound() == 1) {             // 第一轮,未看牌情况
            this.firstRound();
        } else {                                    // 其他轮次，可以看牌，可以比牌
            this.otherRound();
        }
        let result = this.compare() || this.think();
        if (stateMgr.getRound() > 1 && this.trueWin.length > 0 && result.type != zjhcons.Bid.FOLD() && jackpot > minJack && jackpotMgr.getEnabled()) {
            if (result.type == zjhcons.Bid.ADD()) {
                if (jackpot - robotBid - result.count < minJack) {
                    return { type: zjhcons.Bid.FOLD() }
                }
            }
            else if (result.type == zjhcons.Bid.COMPARE()) {
                if (jackpot - robotBid - this.seat.getBidCount_Follow() * 2 < minJack) {
                    return { type: zjhcons.Bid.FOLD() }
                }
            }
            else if (result.type == zjhcons.Bid.ALLIN()) {
                if (jackpot - robotBid - this.seat.getUser().getScore() < minJack) {
                    return { type: zjhcons.Bid.FOLD() }
                }
            }
            else if (jackpot - robotBid - this.seat.getBidCount_Follow() < minJack) {
                return { type: zjhcons.Bid.FOLD() }
            }
        }
        return result;
    }

    //检查牌型，计算胜负情况
    tell() {
        // 自己座位
        if (!this.seat) {
            this.seat = this.room.getComp('seat').getSeat(this.index);
        }

        // 初始化最终牌型数据
        if (!this.formation) {
            let myCards = this.seat.getHand();
            //获取牌型
            this.formation = Formatter.format(myCards);
            logger.info('[AI]', '自己的最终牌型', this.index, this.formation.__print(), '自己的手牌', utils.printCards(myCards));
        }

        // 计算输赢玩家比例
        this.losers = [];
        this.winners = [];
        this.trueWin = [];
        let seats = this.room.getComp('seat').getPlayingSeats();
        for (let seat of seats) {
            let otherIndex = seat.getIndex();

            if (otherIndex != this.index /** && !seat.isRobot()**/) {
                let cards = seat.getHand();
                logger.info('[AI]', '别人的手牌', otherIndex, utils.printCards(cards));
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

    // 计算当前手牌的期望值
    calculateCardsRdm() {
        let rdm = 0;

        if (this.formation.getType() == zjhcons.Formation.HIGH()) rdm += 0;
        if (this.formation.getType() == zjhcons.Formation.PAIR()) rdm += 10;
        if (this.formation.getType() == zjhcons.Formation.SEQUENCE()) rdm += 20;
        if (this.formation.getType() == zjhcons.Formation.SUIT()) rdm += 30;
        if (this.formation.getType() == zjhcons.Formation.SUIT_SEQUENCE()) rdm += 40;
        if (this.formation.getType() == zjhcons.Formation.BOMB()) rdm += 50;

        if (!this.seat.isLooked()) {
            rdm = rdm / 2;
        }

        this.rdm += rdm;

        logger.info('[AI]', this.index, this.rdm, '计算当前手牌期望值');
    }

    // 计算当前下注值的期望值
    calculateBidRdm() {
        let rdm = 0;
        let curBid = this.room.getComp('state').getBid();
        let betOptions = this.room.getAttr('betOptions');
        for (let i in betOptions) {
            let opt = betOptions[i];
            if (curBid == opt) {
                if (this.winners.length == 0) {
                    break;
                }
                rdm = i * -10;
            }
        }

        let selfBid = this.seat.getBidTotal() / this.room.getAttr('baseScore');
        if (this.winners.length == 0) {
            rdm += selfBid * 5;
        } else {
            rdm -= selfBid * 5;
        }

        if (!this.seat.isLooked()) {
            rdm = rdm * 2;
        }
        this.rdm += rdm;

        logger.info('[AI]', this.index, this.rdm, '计算当前注额期望值');
    }

    firstRound() {
        logger.info('[AI]', this.index, this.rdm, '第一轮下注，盲注轮，不能看牌，不能比牌');

        this.rdm = 50;

        // 第一轮看注额，看不到牌
        let curBid = this.room.getComp('state').getBid();
        if (curBid == this.room.getAttr('baseScore')) {
            return;
        }

        // 无人加注时看，手中牌型
        this.calculateCardsRdm();
        // 计算当前下注额的期望值
        this.calculateBidRdm();

        logger.info('[AI]', this.index, this.rdm, '第一轮下注结束，盲注轮，不能看牌，不能比牌');
    }

    otherRound() {
        logger.info('[AI]', this.index, this.rdm, '其他轮下注，可以看牌，可以比牌');

        this.rdm = 50 + this.compareCount * 25;

        // 计算手牌期望值
        this.calculateCardsRdm();
        // 计算当前下注额的期望值
        this.calculateBidRdm();

        let addSeat = this.room.getComp('state').getBidSeat();
        if (addSeat && addSeat.isLooked()) {    // 有玩家加注，且已经看牌
            let cards = addSeat.getHand();
            let formation = Formatter.format(cards);
            let i = Formation.max([this.formation, formation]);
            if (i == 0) {                       // 能赢
                if (!this.seat.isLooked()) {    // 没看牌
                    this.rdm -= 20;
                } else {
                    this.rdm += 20;
                }
            } else {

            }
        }

        logger.info('[AI]', this.index, this.rdm, '其他轮下注结束，可以看牌，可以比牌');
    }

    /**
     * 比牌
     */
    compare() {
        logger.info('[AI]', this.index, this.rdm, '当前判断是否想比牌');

        let stateManager = this.room.getComp('state');
        if (stateManager.getRound() < 3) {
            return;
        }

        let rdm = 50;

        if (this.rdm >= 30 && this.rdm <= 80) {
            let selfBid = this.seat.getBidTotal() / this.room.getAttr('baseScore');
            rdm += selfBid * 5;
        }

        logger.info('[AI]', this.index, '当前自己押注额影响的比牌期望', rdm);

        rdm -= this.winners.length * 20;

        logger.info('[AI]', this.index, '当前能赢自己的玩家影响的比牌期望', rdm);

        if (this.formation.getType() <= zjhcons.Formation.PAIR()) {
            rdm += 10;
        } else {
            rdm -= this.formation.getType() * 15;
        }

        logger.info('[AI]', this.index, '当前牌型影响的比牌期望', rdm);

        rdm -= stateManager.getRound() * 10;

        logger.info('[AI]', this.index, '当前轮次影响的比牌期望', rdm);

        let compares = [];
        let seats = this.room.getComp('seat').getPlayingSeats();
        _.each(seats, (seat) => {
            if (seat.getIndex() == this.seat.getIndex()) return;

            let cards = seat.getHand();
            let formation = Formatter.format(cards);
            let i = Formation.max([this.formation, formation]);
            if (i == 0) {                       // 能赢
                rdm += 15;
            } else {
                rdm -= 15;
            }

            let r = _.random(10, 50);
            if (rdm >= r) {
                compares.push({ r, index: seat.getIndex() });
            }
            logger.info('[AI]', this.index, '当前现场影响的比牌期望', rdm, r, i);
        });

        if (compares.length == 0 && !this.seat.IsMaxWinCount()) {
            return;
        }

        this.compareCount += 1;
        if (compares.length == 0) {
            _.each(seats, (seat) => {
                if (seat.getIndex() == this.seat.getIndex()) return;
                let r = _.random(10, 50);
                compares.push({ r, index: seat.getIndex() });
            });
        }
        let best = _.max(compares, (c) => c.r);
        logger.info('[AI]', this.index, this.rdm, '当前想比牌', best);
        return { type: zjhcons.Bid.COMPARE(), index: best.index };
    }

    think() {
        logger.info('[AI]', '当前行为意识值', this.rdm);

        let rand = _.random(100);
        logger.info('[AI]', '当前随机判定值', rand);

        if (this.rdm >= 50) {
            let r = _.random(50);
            if (this.rdm - 50 > r) {
                logger.info('[AI]', this.index, '想加注', r);
                return this.add();
            }

            if (this.seat.canBidFollow()) {
                logger.info('[AI]', this.index, '不想加注，能跟注');
                return { type: zjhcons.Bid.FOLLOW() };
            }

            logger.info('[AI]', this.index, '不想加注，不能跟注，只能孤注一掷');
            return { type: zjhcons.Bid.ALLIN() };
        }

        if (rand <= this.rdm) {
            if (this.seat.canBidFollow()) {
                logger.info('[AI]', this.index, '想跟注');
                return { type: zjhcons.Bid.FOLLOW() };
            }

            logger.info('[AI]', this.index, '想跟注，不能跟注，只能孤注一掷');
            return { type: zjhcons.Bid.ALLIN() };
        }

        if (this.seat.canLook()) {
            if (!this.seat.isLooked()) {
                logger.info('[AI]', this.index, '不想加注，不想跟注，但是可以看牌');
                return { type: zjhcons.Bid.LOOK() };
            }
        }

        logger.info('[AI]', this.index, '不想加注，不想跟注，不能看牌，只能弃牌');
        return { type: zjhcons.Bid.FOLD() };
    }

    add() {
        let betOptions = this.room.getAttr('betOptions');
        let bet = 0;
        if (this.rdm >= 100) {
            bet = betOptions[betOptions.length - 1];
        } else {
            bet = betOptions[Math.floor((this.rdm - 50) / (50 / betOptions.length))];
        }
        let statBid = this.seat.getBidCount();
        if (bet <= statBid) {
            bet = statBid;
        }
        if (!this.room.getComp('state').canBidAdd(bet)) {
            if (this.seat.canBidFollow()) {
                logger.info('[AI]', this.index, '不能加注，只能跟牌', bet);
                return { type: zjhcons.Bid.FOLLOW() };
            }

            logger.info('[AI]', this.index, '不能加注，不能跟牌，只能孤注一掷', bet);
            return { type: zjhcons.Bid.ALLIN() };
        }

        if (this.seat.canBidAdd(bet)) {
            logger.info('[AI]', this.index, '能加注', bet);
            return { type: zjhcons.Bid.ADD(), count: bet };
        }

        if (this.seat.canBidFollow()) {
            logger.info('[AI]', this.index, '不能加注，只能跟牌', bet);
            return { type: zjhcons.Bid.FOLLOW() };
        }

        logger.info('[AI]', this.index, '不能加注，不能跟牌，只能孤注一掷', bet);
        return { type: zjhcons.Bid.ALLIN() };
    }
}

module.exports = Level1;