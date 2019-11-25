const Card = require('../poker/card');
const cons = require('../../../common/constants');
const zjhcons = require('../common/constants');
const Library = require('../poker/library');
const Super = require('../../../room/stateManager');
const WaitState = require('./state/wait');
const DealState = require('./state/deal');
const PlayState = require('./state/play');
const ResultState = require('./state/result');
const BidTurn = require('./turn/bid');
const CompareTurn = require('./turn/compare');
const Formatter = require('../poker/formatter');
const Formation = require('../poker/formation');
// const DealTurn = require('./turn/deal');
const utils = require('../../../utils');
const _ = require('underscore');

/**
 * @api {json} room.state 房间状态数据结构
 * @apiGroup zjh
 * @params {number} type 状态类型 - 等待开始(wait - 1) 发牌下锅底(deal - 2) 游戏(play - 3) 结算(result - 4)
 * @params {number} banker 庄家
 */

class StateManager extends Super {
    constructor(room) {
        super(room);
        this.logger = this.room.getComp('logger');
    }

    createState(type) {
        if (type === zjhcons.RoomState.WAIT()) {
            return new WaitState(this.room);
        } else if (type === zjhcons.RoomState.DEAL()) {
            return new DealState(this.room);
        } else if (type === zjhcons.RoomState.PLAY()) {
            return new PlayState(this.room);
        } else if (type === zjhcons.RoomState.RESULT()) {
            return new ResultState(this.room);
        }
        return null;
    }

    createTurn(type, ...params) {
        if (type === zjhcons.Turn.BID()) {
            BidTurn.create(this.room, ...params);
        } else if (type === zjhcons.Turn.COMPARE()) {
            CompareTurn.create(this.room, ...params);
        }
    }

    action(seat, action, next) {
        this.logger.info('玩家消息', this.room.getAttr('area'), this.room.getAttr('id'), seat.getIndex(), seat.getUserId(), action);

        if (action.name !== cons.RoomAction.PLAYER_ACTION()) {
            super.action(seat, action, next);
            return;
        }

        switch (action.type) {
            case zjhcons.PlayerAction.LOOK():
                if (!seat.look()) {
                    utils.nextError(next);
                    return;
                }

                if (this.room.getAttr('lookTurn')) {
                    let turn = this.room.getComp('turn').getRunning();
                    if (!turn) {
                        return;
                    }
                    if (seat.getIndex() == turn.getIndex()) { // 看牌玩家是当前行动回合的玩家，所以需要结束回合
                        seat.setCrtLook();
                        turn.end(next);
                    }
                }
                break;
            case zjhcons.PlayerAction.SHOW_HAND():
                if (!seat.showhand(0, true)) {
                    utils.nextError(next);
                    return;
                }
            default:
                utils.nextError(next);
                return;
        }

        utils.nextOK(next);
        return;
    }

    /**
     * 是否可以加注
     * @param {number} count 加注额度，这里不计算翻倍问题 
     * @return {boolean}
     */
    canBidAdd(count) {
        if (count <= this.bidCount) {
            this.logger.warn('加注金额不能低于当前投注额', count, this.bidCount);
            return false;
        }
        return true;
    }

    /**
     * 下一个轮次
     * @author Deo
     * @returns {number} -1 进入下个轮次 || >=0 轮次已达上限，强制比牌次数
     */
    nextRound() {
        this.logger.info('轮次结束', this.room.getAttr('area'), this.room.getAttr('id'), this.round);

        this.round++;
        let roundMax = this.room.getAttr('roundMax');
        if (this.round <= roundMax) {
            this.logger.info('轮次开始', this.room.getAttr('area'), this.room.getAttr('id'), this.round);
            return -1;
        }
        this.round = roundMax;

        this.logger.info('轮次上限', this.room.getAttr('area'), this.room.getAttr('id'), this.round);
        return this.compare();
    }

    /**
     * 系统强制比牌
     * @author Deo
     * @param {number} 发起比牌的玩家座位 null表示默认庄家
     * @return {number} 比牌次数
     */
    compare(index) {
        this.logger.debug('强制比牌');

        let winners = [];

        let bankerSeat = this.getBankerSeat();

        let attackSeat = null;
        if (index) {
            attackSeat = this.room.getComp('seat').getSeat(index);
        } else {
            attackSeat = bankerSeat.next(true);
        }
        while (!attackSeat.isPlaying()) {
            attackSeat = attackSeat.next(true);
        }
        let winnerSeat = attackSeat;
        let defandSeat = attackSeat.next(true);

        do {
            if (!defandSeat.isPlaying()) {
                defandSeat = defandSeat.next(true);
                continue;
            }

            attackSeat = winnerSeat;

            let formations = [Formatter.format(attackSeat.getHand()), Formatter.format(defandSeat.getHand())];
            let winIndex = Formation.max(formations);

            let compares = [];
            if (winIndex == 0) {
                compares.unshift(attackSeat.getIndex());
                compares.push(defandSeat.getIndex());
                defandSeat.lose = true;
            } else {
                compares.unshift(defandSeat.getIndex());
                compares.push(attackSeat.getIndex());
                attackSeat.lose = true;
                winnerSeat = defandSeat;
            }
            winners.push(compares);

            attackSeat.addCompare(defandSeat.getIndex());
            defandSeat.addCompare(attackSeat.getIndex());

            defandSeat = defandSeat.next(true);
        } while (defandSeat.getIndex() != attackSeat.getIndex());

        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_OPEN(), winners);

        this.logger.info('强制比牌', this.room.getAttr('area'), this.room.getAttr('id'), winners);
        return winners.length;
    }

    getRound() {
        return this.round;
    }

    getBanker() {
        return this.banker;
    }

    getBankerSeat() {
        return this.room.getComp('seat').getSeat(this.banker);
    }

    resetBanker() {
        let seat = this.getBankerSeat();
        let banker = seat.next(true);
        this.banker = banker.getIndex();
    }

    setBid(bidCount, type, isLooking = false) {
        let multi = 1;
        multi = type == zjhcons.Bid.COMPARE() ? multi * 2 : multi;
        multi = isLooking ? multi * 2 : multi;
        this.bidCount = bidCount / multi;
        this.bidTotal += bidCount;
        this.logger.debug('下注额', bidCount, '当前总额', this.bidTotal);
    }

    getBid() {
        return this.bidCount;
    }

    getBidSeat() {
        let seats = this.room.getComp('seat').getPlayingSeats();
        let bid = _.max(seats, s => s.getBidTotal());
        return bid;
    }

    getRobotBid() {
        let seats = this.room.getComp('seat').getPlayedSeats();
        let bid = 0;
        _.each(seats, (s) => {
            if (s.isRobot()) {
                bid += s.getBidTotal();
            }
        });
        return bid;
    }

    getLibrary() {
        return this.library;
    }

    isShowHand() {
        return this.showHand;
    }

    isBidding() {
        let bid = this.getBid();
        let biddings = this.room.getComp('seat').getBiddingSeats();
        return _.some(biddings, s => s.getBidTotal() < bid);
    }

    isPlaying() {
        let playings = this.room.getComp('seat').getPlayingSeats();
        return playings.length > 1;
    }

    bidReset() {
        _.each(this.room.getComp('seat').getSeats(), s => s.bidReset());
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.PLAYER_RESET(), {});
    }

    getBidTotal() {
        this.logger.debug('总价值额', this.bidTotal);
        return this.bidTotal;
    }

    init() {
        super.init();

        this.round = 1;
        this.banker = 0;
        this.library = new Library();
        this.showHand = false;

        this.bidCount = this.room.getAttr('baseScore') || 0;
        this.bidTotal = 0;

        this.changeState(zjhcons.RoomState.WAIT());
    }

    onRoundBegin() {
        super.onRoundBegin();

        this.resetBanker();
        this.changeState(zjhcons.RoomState.DEAL());
    }

    onRoundResult() {
        this.showHand = true;
    }

    reset() {
        super.reset();

        this.library = new Library();
        this.showHand = false;

        this.round = 1;
        this.bidCount = this.room.getAttr('baseScore') || 0;
        this.bidTotal = 0;
        this.changeState(zjhcons.RoomState.WAIT());
    }

    toJson() {
        let json = super.toJson();
        json.banker = this.banker;
        json.round = this.round;
        json.showHand = this.showHand;
        json.bidCount = this.bidCount;
        json.bidTotal = this.bidTotal;
        json.betOptions = this.room.getAttr('betOptions') || [];
        return json;
    }
}


module.exports = StateManager;