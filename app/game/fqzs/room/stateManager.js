const cons = require('../../../common/constants');
const fqzscons = require('../common/constants');
const Super = require('../../../room/stateManager');
const utils = require('../../../utils');
const IdleState = require('./state/idle');
const BettingState = require('./state/betting');
const OpeningState = require('./state/opening');
const ResultState = require('./state/result');
const ChipManager = require('./chipManager');
const _ = require('underscore');

/**
 * @api {json} room.state 房间状态数据结构
 * @type fqzs
 * @param {number} type 状态类型 - 空闲时间(idle - 1) 下注时间(betting - 2) 开奖时间(opening - 3) 结算时间(result - 4)
 */

class StateManager extends Super {
    constructor(room) {
        super(room);
    }

    /**
     * 最新的开奖信息
     */
    get lastRoad() {
        if (this._roadList[0] === undefined) {
            return -1;
        }
        return this._roadList[0];
    }

    /**
     * 庄家列表
     */
    get bankList() {
        return this.bankerList;
    }

    init() {
        super.init();

        this.bankerList = [];
        this._roadList = [];
        this.chipMgr = new ChipManager(8);
        this.cacheChipMgr = new ChipManager(8);
        // this.round = 0;
        this.jackpot = _.random(500000, 5000000);       // 彩金值，（游戏开始后一直累加，任何中奖会扣除）
        this.maxWinner = null;
        this.maxMoneyPlayers = [];

        // 预设假数据
        for (let i = 0; i < 10; i++) {
            this._roadList.unshift(_.random(fqzscons.RoomOpenConfigs.length - 1));
        }

        this.reset();
        this.resetMaxMoneyPlayers();
        this.clearBanker();
        this.changeState(fqzscons.RoomState.IDLE());
    }

    action(seat, action, next) {
        switch (action.name) {
            case cons.RoomAction.ROOM_UP_BANKER():
                this.upBanker(seat, action, next);
                break;
            case cons.RoomAction.ROOM_DOWN_BANKER():
                this.downBanker(seat, action, next);
                break;
            case cons.RoomAction.ROOM_BANKER_LIST():
                this.getBankerList(seat, action, next);
                break;
            default:
                super.action(seat, action, next);
                break;
        }
    }

    changeState(type) {
        if (this.state) {
            this.state.exit();
            this.state = null;
        }

        this.state = this.createState(type);
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_CHANGE_STATE(), this.toJson());
        this.state && this.state.enter();
    }

    createState(type) {
        if (type === fqzscons.RoomState.IDLE()) {
            return new IdleState(this.room);
        } else if (type === fqzscons.RoomState.BETTING()) {
            return new BettingState(this.room);
        } else if (type === fqzscons.RoomState.OPENING()) {
            return new OpeningState(this.room);
        } else if (type === fqzscons.RoomState.RESULT()) {
            return new ResultState(this.room);
        }
        return null;
    }

    clear() {
        super.clear();

        if (!this.state) {
            return;
        }
        this.state.exit();
        this.state = null;
    }

    canBet(area, count) {
        // return (this.maxScore - this.chipMgr.all()) >= count;
        if (!this.getBanker()) return false;

        let max = Math.floor(this.getBanker().getScore() / fqzscons.RoomAreaMulti[area]);
        let crt = this.chipMgr.all(area);

        return (max - crt) >= count;
    }

    addBetCount(area, count) {
        this.chipMgr.add(area, count);
        this.cacheChipMgr.add(area, count);

        this.jackpot += count;
    }

    minusBetCount(chips) {
        this.chipMgr.minus(chips);
        this.cacheChipMgr.minus(chips);

        for (let area in chips) {
            let chip = chips[area];
            if (!chip) continue;
            for (let num in chip) {
                if (chip[num] > 0) {
                    this.jackpot -= chip[num];
                }
            }
        }
        if (this.jackpot < 0) this.jackpot = 0;
    }

    getBetChips() {
        return this.chipMgr.getBetChips();
    }

    /**
     * 广播当前下注情况到所有客户端
     */
    sendBetChips() {
        if (this.cacheChipMgr.all() <= 0) {
            return;
        }
        let chips = this.cacheChipMgr.toJson();
        this.cacheChipMgr.reset();
        this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_STATE_BET(), { chips, jackpot: this.jackpot });
    }

    /**
     * 开奖
     */
    open() {
        let jackpotMgr = this.room.getComp('jackpot');
        let result = jackpotMgr.balance();

        this._roadList.unshift(result.road);
        if (this._roadList.length > fqzscons.ROOM_ROAD_LIMIT()) {
            this._roadList.pop();
        }

        this.changeState(fqzscons.RoomState.OPENING());
    }

    setJackpot(jackpot) {
        this.jackpot += jackpot;
        if (this.jackpot <= 0) {
            this.jackpot = 0;
        }
        if (this.jackpot >= 999999999) {
            this.jackpot = 999999999
        }
    }

    getJackpot() {
        return this.jackpot;
    }

    upBanker(seat, action, next) {
        if (seat.getUser().getScore() < this.room.getAttr('bankerLimit')) {
            this.room.getComp('logger').warn(seat.getIndex(), seat.getUserId(), '上庄金币不足', seat.getUser().getScore(), this.room.getAttr('bankerLimit'));
            return utils.next(next, cons.ResultCode.USER_NOT_ENOUGH_GOLD());
        }

        let index = _.findIndex(this.bankerList, (userId) => { return userId == seat.getUserId(); });
        if (index >= 0) {
            this.room.getComp('logger').warn(seat.getIndex(), seat.getUserId(), '已在上庄列表中', index);
            return utils.next(next, cons.ResultCode.USER_UP_BANKER());
        }

        this.bankerList.push(seat.getUserId());
        utils.nextOK(next);
    }

    downBanker(seat, action, next) {
        if (this.bankerId === seat.getUserId()) {
            this.nextChangeBanker = true;
        }
        this.bankerList = _.without(this.bankerList, seat.getUserId());
        utils.nextOK(next);
    }

    clearBanker() {
        this.bankerId = 0;
        this.bankerCount = 0;
    }

    /**
     * 获取庄家列表
     * @param {number} action.idx  // 第几页
     * @param {number} action.len  // 长度
     */
    getBankerList(seat, action, next) {
        if (!seat && !action && !next) {
            return this.bankerList;
        }

        let idx = action.idx;
        let len = action.len;

        if (!utils.isNumber(idx, 1)
            || !utils.isNumber(len, 1)) {
            utils.nextError(next);
            return;
        }

        let start = (idx - 1) * len;
        let list = this.bankerList.slice((idx - 1) * len, start + len);
        list = _.map(list, (userId, index) => {
            let user = this.room.getComp('seat').getUser(userId);
            return { order: index + 1, userId: userId, score: user ? user.getScore() : 0 }
        });

        seat.sendAction(cons.RoomAction.ROOM_BANKER_LIST(), { order: this.getBankerState(seat.getUserId()), list: list, total: this.bankerList.length });
        utils.nextOK(next);
    }

    checkBanker() {
        if (!this.bankerId) return false;

        if (this.nextChangeBanker) {
            this.room.getComp('logger').warn(this.bankerId, '需要换庄');
            this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_DOWN_BANKER(), { userId: this.bankerId });
            return false;
        }

        let banker = this.room.getComp('seat').getUser(this.bankerId);

        if (!banker) {
            this.room.getComp('logger').warn(this.bankerId, '当前庄家已离线，自动换庄');
            this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_DOWN_BANKER(), { userId: this.bankerId });
            return false;
        }

        let bankerScore = banker.getScore();
        let bankerLimit = this.room.getAttr('bankerLimit');

        if (bankerScore < bankerLimit) {
            this.room.getComp('logger').warn(this.bankerId, '上庄金币不足', bankerScore, bankerLimit);
            this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_DOWN_BANKER(), { userId: this.bankerId });
            return false;
        }

        return true;
    }

    resetBanker() {
        if (!this.bankerId) {
            this.changeBanker();
            return;
        }

        let banker = this.room.getComp('seat').getUser(this.bankerId);

        if (!this.checkBanker(banker)) {
            this.changeBanker();
            return;
        }

        this.maxScore = banker.getScore();
        this.bankerCount++;
        if (this.bankerCount >= this.room.getAttr('bankerCount')) {
            this.nextChangeBanker = true;
        }
    }

    changeBanker() {
        this.clearBanker();

        let bankerLimit = this.room.getAttr('bankerLimit');

        this.bankerList = _.filter(this.bankerList, userId => {
            let user = this.room.getComp('seat').getUser(userId);
            if (!user) {
                return false;
            }
            return user.getScore() >= bankerLimit;
        });

        if (this.bankerList.length == 0) {
            return;
        }

        let bankerId = this.bankerList.shift();
        let banker = this.room.getComp('seat').getUser(bankerId);
        this.maxScore = banker.getScore();
        this.bankerId = bankerId;
        this.bankerCount = 1;
    }

    getBanker() {
        if (this.bankerId === null) {
            return null;
        }
        return this.room.getComp('seat').getUser(this.bankerId);
    }

    getBankerId() {
        return this.bankerId;
    }

    /**
     * 获取玩家的上庄状态
     * @param {number} userId
     * @return {number} -2 庄家 -1 等待下庄 0 没有上庄 >=1 等待上庄的序列号
     */
    getBankerState(userId) {
        let index = _.findIndex(this.bankerList, (uid) => {
            return uid == userId;
        });

        if (index >= 0) {
            return index + 1;
        }

        if (this.bankerId == userId) {
            return this.nextChangeBanker ? -1 : -2;
        }

        return 0;
    }

    setMaxWinner(userId) {
        this.maxWinner = this.room.getComp('seat').getSeatByUserId(userId);
    }

    getMaxWinner() {
        return this.maxWinner;
    }

    getMaxWinnerUserId() {
        return this.maxWinner.getUserId();
    }

    getMaxMoneyPlayers() {
        return this.maxMoneyPlayers;
    }

    resetMaxMoneyPlayers() {
        this.maxMoneyPlayers = this.room.getComp('seat').getSeatsSortByMoney();
    }

    onRoundBegin() {
        super.onRoundBegin();
        // this.round++;

        this.resetBanker();
        this.resetMaxMoneyPlayers();

        if (!this.maxWinner) {
            this.maxWinner = _.first(this.maxMoneyPlayers) || null;
        }

        this.changeState(fqzscons.RoomState.BETTING());
    }

    onRoundEnd() {
        super.onRoundEnd();

        if (!this.checkBanker()) {
            this.clearBanker();
        }

        // this.reset();
        this.room.getComp('state').changeState(fqzscons.RoomState.IDLE());
    }

    reset() {
        super.reset();

        this.nextChangeBanker = false;
        this.maxScore = 0;
        this.chipMgr.reset();
        this.cacheChipMgr.reset();
    }

    toJson() {
        let json = this.state ? this.state.toJson() : {};
        // json.banker = this.bankerId;                                //当前庄家ID
        // json.bankerCount = this.bankerCount;                        //当前庄家回合数
        // json.maxScore = this.maxScore;                              //当前最大可下注金额
        json.jackpot = this.jackpot;                                //当前彩金值
        json.crtScore = this.chipMgr.all();                         //当前下注总额
        json.roadList = this._roadList.slice(0, 20);                //桌面上的小路单（最近20局）
        json.betChips = this.chipMgr.toJson();                      //当前下注筹码情况
        json.betOptions = this.room.getAttr('betOptions') || [];    //当前下注筹码范围
        json.maxWinner = this.getMaxWinner() ? this.getMaxWinner().toJson() : null;     //获取赢钱最多的玩家（幸运星）
        json.maxMoneyPlayers = _.map(this.getMaxMoneyPlayers(), (s) => {                //获取拥有钱最多的几个玩家
            return s.toJson();
        }).slice(0, 3);
        return json;
    }

    toChances() {
        let opens = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        _.each(this._roadList, (road) => {
            let area = this.toOpenAreas(road);
            opens[area] += 1;

            // 2老鹰，4孔雀，5鸽子，8燕子  ==  飞禽
            if (area == 2 || area == 4 || area == 5 || area == 8) {
                opens[10] += 1;
            }

            // 3狮子，6熊猫，7猴子，9兔子  ==  走兽
            if (area == 3 || area == 6 || area == 7 || area == 9) {
                opens[11] += 1;
            }

            // -1 通赔
            if (area == -1) {
                for (let i = 0; i < opens.length; i++) {
                    opens[i] += 1;
                }
            }
        });
        return _.map(opens, (o) => {
            return Math.floor(o / this._roadList.length * 100);
        });
    }

    update(dt) {
        this.state && this.state.update(dt);
    }
}


module.exports = StateManager;