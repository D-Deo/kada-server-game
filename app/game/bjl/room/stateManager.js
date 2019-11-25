const cons = require('../../../common/constants');
const bjlcons = require('../common/constants');
const Library = require('../poker/library');
const Super = require('../../../room/stateManager');
const utils = require('../../../utils');
const IdleState = require('./state/idle');
const BettingState = require('./state/betting');
const OpeningState = require('./state/opening');
const ResultState = require('./state/result');
const ChipManager = require('./chipManager');
// const logger = require('pomelo-this.logger').getLogger('game-bjl', __filename);
const _ = require('underscore');

/**
 * @api {json} room.state 房间状态数据结构
 * @type bjl
 * @param {number} type 状态类型 - 空间时间(idle - 1) 下注时间(betting - 2) 开奖时间(opening - 3) 结算时间(result - 4)
 * @param {number} maxScore 台面最大下注金币
 * @param {number} crtScore 当前台面下注总额
 * @param {number} bankerId 庄家ID
 * @param {number} bankerCount 连庄局数
 * @param {boolean} nextChangeBanker 下局换庄
 * @param {[number]} bankerList 庄家列表
 * @param {[number]} roadList 路单（180局，倒序排序）
 * @param {[Chip]} betChips 下注筹码情况 [0(闲), 1(庄), 2(闲天王), 3(庄天王), 4(闲对子), 5(庄对子), 6(和), 7(同点和)]
 * @param {[Group]} openCards 当前开奖牌组 [0(闲牌), 1(庄牌)]
 * @param {[Group]} openAreas 当前开奖区域 [0(闲), 1(庄), 2(闲天王), 3(庄天王), 4(闲对子), 5(庄对子), 6(和), 7(同点和)]
 * @param {number} leftLibrary 剩余牌数
 * @param {number} round 当前局数
 * @param {[number]} betTypes 下注类型
 */

class StateManager extends Super {
    constructor(room) {
        super(room);
    }

    init() {
        super.init();

        this.logger = this.room.getComp('logger');

        let mode = {};
        mode.threeKing = this.room.getAttr('threeKing');

        this.library = new Library(mode);
        this.bankerList = [];
        this.roadList = [];
        this.chipMgr = new ChipManager(8);
        this.cacheChipMgr = new ChipManager(8);
        this.round = 0;

        this.maxWinner = null;
        this.maxMoneyPlayers = [];

        for (let i = 0; i < 20; i++) {
            let open = this.library.open();
            this.roadList.unshift(open.road);
        }

        for (let i = 20; i < _.random(32) + 20; i++) {
            let open = this.library.open();
            this.roadList.unshift(open.road);
        }

        this.round = this.roadList.length;

        this.reset();
        this.resetMaxMoneyPlayers();
        this.clearBanker();
        this.changeState(bjlcons.RoomState.IDLE());
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
            case cons.RoomAction.ROOM_ROAD_LIST():
                this.getRoadListForClient(seat, action, next);
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
        if (type === bjlcons.RoomState.IDLE()) {
            return new IdleState(this.room);
        } else if (type === bjlcons.RoomState.BETTING()) {
            return new BettingState(this.room);
        } else if (type === bjlcons.RoomState.OPENING()) {
            return new OpeningState(this.room);
        } else if (type === bjlcons.RoomState.RESULT()) {
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
        return (this.maxScore - this.chipMgr.all()) >= count;
    }

    addBetCount(area, count) {
        this.chipMgr.add(area, count);
        this.cacheChipMgr.add(area, count);
    }

    minusBetCount(chips) {
        this.chipMgr.minus(chips);
        this.cacheChipMgr.minus(chips);
    }

    addBetCountByChips(chipMgr) {
        this.chipMgr.addByChips(chipMgr);
        _.each(chipMgr.chips, (chip, area) => {
            _.each(chip, (num, count) => {
                while (--num < 0) {
                    this.cacheChipMgr.add(area, count);
                }
            });
        });
    }

    getBetChips() {
        return this.chipMgr.getBetChips();
    }

    sendBetChips() {
        if (this.cacheChipMgr.all() <= 0) {
            return;
        }
        let chips = this.cacheChipMgr.toJson();
        this.cacheChipMgr.reset();
        this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_STATE_BET(), { chips: chips });
    }

    getLibrary() {
        return this.library;
    }

    washLibrary(need) {
        if (need == true) {
            this.library.wash();
            return;
        }

        let needs = bjlcons.CARD_CAPACITY();
        if (this.library.haveEnoughCard(needs)) {
            return;
        }
        this.library.wash();
    }

    upBanker(seat, action, next) {
        if (seat.getUserId() == this.bankerId) {
            this.logger.warn(seat.getIndex(), seat.getUserId(), '已经是庄家', this.bankerId);
            return utils.next(next, cons.ResultCode.USER_BE_BANKER());
        }

        if (seat.getUser().getScore() < this.room.getAttr('bankerLimit')) {
            this.logger.warn(seat.getIndex(), seat.getUserId(), '上庄金币不足', seat.getUser().getScore(), this.room.getAttr('bankerLimit'));
            return utils.next(next, cons.ResultCode.USER_NOT_ENOUGH_GOLD());
        }

        let index = _.findIndex(this.bankerList, (userId) => { return userId == seat.getUserId(); });
        if (index >= 0) {
            this.logger.warn(seat.getIndex(), seat.getUserId(), '已在上庄列表中', index);
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
            return { order: index + 1, userId: userId, score: user.getScore() }
        });

        seat.sendAction(cons.RoomAction.ROOM_BANKER_LIST(), { order: this.getBankerState(seat.getUserId()), list: list, total: this.bankerList.length });
        utils.nextOK(next);
    }

    checkBanker() {
        if (!this.bankerId) return false;

        if (this.nextChangeBanker) {
            this.logger.warn(this.bankerId, '需要换庄');
            this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_DOWN_BANKER(), { userId: this.bankerId });
            return false;
        }

        let banker = this.room.getComp('seat').getUser(this.bankerId);

        if (!banker) {
            this.logger.warn(this.bankerId, '当前庄家已离线，自动换庄');
            this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_DOWN_BANKER(), { userId: this.bankerId });
            return false;
        }

        let bankerScore = banker.getScore();
        let bankerLimit = this.room.getAttr('bankerLimit');

        if (bankerScore < bankerLimit) {
            this.logger.warn(this.bankerId, '上庄金币不足', bankerScore, bankerLimit);
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

        this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_UP_BANKER(), { userId: this.bankerId, score: banker.getScore() });
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

    getOpenCards() {
        return this.openCards;
    }

    // getOpenAreas() {
    //     return this.openAreas;
    // }

    getRoadList() {
        return this.roadList;
    }

    getRoadListForClient(seat, action, next) {
        seat.sendAction(cons.RoomAction.ROOM_ROAD_LIST(), { list: this.roadList });
        utils.nextOK(next);
    }

    setMaxWinner(userId) {
        this.maxWinner = this.room.getComp('seat').getSeatByUserId(userId);
    }

    getMaxWinner() {
        return this.maxWinner;
    }

    getMaxWinnerUserId() {
        return this.getMaxWinner() ? this.getMaxWinner().getUserId() : null;
    }

    getMaxMoneyPlayers() {
        return _.map(this.maxMoneyPlayers, (s) => {                //获取拥有钱最多的几个玩家
            return s.toJson();
        }).slice(0, 3);
    }

    resetMaxMoneyPlayers() {
        this.maxMoneyPlayers = this.room.getComp('seat').getSeatsSortByMoney();
    }

    onRoundBegin() {
        super.onRoundBegin();

        this.round++;
        this.resetBanker();
        this.resetMaxMoneyPlayers();

        if (!this.maxWinner) {
            this.maxWinner = _.first(this.maxMoneyPlayers) || null;
        }

        this.changeState(bjlcons.RoomState.BETTING());
    }

    onRoundEnd() {
        super.onRoundEnd();

        if (!this.checkBanker()) {
            this.clearBanker();
        }

        // this.reset();
        this.changeState(bjlcons.RoomState.IDLE());
    }

    open() {
        let result = this.room.getComp('jackpot').balance();

        this.resetOpen();
        this.openCards.push(...result.cards);
        this.roadList.unshift(result.road);

        this.logger.info('当前结果：', result.road.toString(2));

        this.changeState(bjlcons.RoomState.OPENING());
    }

    reset() {
        super.reset();

        this.nextChangeBanker = false;
        this.maxScore = 0;
        this.chipMgr.reset();
        this.cacheChipMgr.reset();

        if (this.round >= bjlcons.ROOM_ROAD_LIMIT()) {
            this.roadList = [];
            this.round = 0;
        }

        this.resetOpen();
        this.washLibrary(this.round >= bjlcons.ROOM_ROAD_LIMIT());
    }

    resetOpen() {
        this.openCards = [];
        // this.openAreas = [false, false, false, false, false, false, false, false];
    }

    toJson() {
        let json = this.state ? this.state.toJson() : {};
        json.banker = this.bankerId;
        json.bankerCount = this.bankerCount;
        json.maxScore = this.maxScore;
        json.crtScore = this.chipMgr.all();
        json.roadList = this.roadList.slice(0, 10);       //桌面上的小路单（最近10局）
        json.betChips = this.chipMgr.toJson();
        json.openCards = this.openCards;
        // json.openAreas = this.openAreas;
        json.leftLibrary = this.library.toJson();
        json.round = this.round;
        json.betOptions = this.room.getAttr('betOptions') || [];
        json.maxWinner = this.getMaxWinner() ? this.getMaxWinner().toJson() : null;     //获取赢钱最多的玩家（幸运星）
        json.maxMoneyPlayers = this.getMaxMoneyPlayers();
        return json;
    }

    update(dt) {
        this.state && this.state.update(dt);
    }
}


module.exports = StateManager;