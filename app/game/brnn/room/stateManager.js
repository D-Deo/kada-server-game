const cons = require('../../../common/constants');
const brnncons = require('../common/constants');
const Library = require('../poker/library');
const Super = require('../../../room/stateManager');
const utils = require('../../../utils');
const IdleState = require('./state/idle');
const SendCardState = require('./state/sendcard');
const BettingState = require('./state/betting');
const OpeningState = require('./state/opening');
const ResultState = require('./state/result');
const ChipManager = require('./chipManager');
const _ = require('underscore');
const redis = require('../../../../app/redis');
/**
 * @api {json} room.state 房间状态数据结构
 * @type brnn
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
        this.logger = this.room.getComp('logger');
    }

    init() {
        super.init();
        this.library = new Library();
        this.roadList = [];
        this.maxMoneyPlayers = [];
        this.maxWinner = null;

        for (let i = 0; i < 20; i++) {
            this.roadList.push(_.random(0, 15));
        }

        for (let i = 20; i < _.random(5, 20) + 20; i++) {
            this.roadList.push(_.random(0, 15));
        }

        this.bankerList = [];

        this.chipMgr = new ChipManager(4);
        this.cacheChipMgr = new ChipManager(4);
        this.road = 0;
        // this.rescard = {};
        // this.resCards = null;
        this.reset();
        this.resetMaxMoneyPlayers();
        this.clearBanker();
        this.changeState(brnncons.RoomState.IDLE());
    }

    action(seat, action, next) {
        switch (action.name) {
            case cons.RoomAction.ROOM_UP_BANKER():
                // this.upBanker(seat, action, next);
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
        if (type === brnncons.RoomState.IDLE()) {
            return new IdleState(this.room);
        } else if (type === brnncons.RoomState.SENDCARD()) {
            return new SendCardState(this.room);
        } else if (type === brnncons.RoomState.BETTING()) {
            return new BettingState(this.room);
        } else if (type === brnncons.RoomState.OPENING()) {
            return new OpeningState(this.room);
        } else if (type === brnncons.RoomState.RESULT()) {
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

    pushRoadToList(road) {
        this.roadList.unshift(road);
    }

    // 保证庄家
    canBetBanker(area, score, count) {
        return score > (this.chipMgr.all() + count) * 5;
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

        let needs = brnncons.CARD_CAPACITY();
        if (this.library.haveEnoughCard(needs)) {
            return;
        }
        this.library.wash();
    }

    getMaxMoneyPlayers() {
        return _.map(this.maxMoneyPlayers, (s) => {                //获取拥有钱最多的几个玩家
            return s.toJson();
        }).slice(0, 3);
    }

    setMaxWinner(userId) {
        this.maxWinner = this.room.getComp('seat').getSeatByUserId(userId);
    }

    getMaxWinner() {
        return this.maxWinner;
    }

    getMaxWinnerUserId() {
        return this.maxWinner ? this.maxWinner.getUserId() : null;
    }

    resetMaxMoneyPlayers() {
        this.maxMoneyPlayers = this.room.getComp('seat').getSeatsSortByMoney();
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
            return { order: index + 1, userId: userId }
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
            return uid === userId;
        });

        if (index >= 0) {
            return index + 1;
        }

        if (this.bankerId === userId) {
            return this.nextChangeBanker ? -1 : -2;
        }

        return 0;
    }

    getOpenResult() {
        return this.openResult;
    }

    getOpenCards() {
        switch (this.state.getType()) {
            case brnncons.RoomState.IDLE():
                return null;
            case brnncons.RoomState.SENDCARD():
            case brnncons.RoomState.BETTING():
                if (this.room.getAttr('standard')) {
                    return null;
                }
                let cards = this.getThreeCards();
                return cards;
            default:
                return this.openResult.formatters; // this.openCards; // _.map(this.openCards, (fmt) => {
            //                    return fmt.toJson();
            //});
            // return this.openCards;
        }
    }

    setOpenCard(cards) {
        this.openCards = cards;
    }

    getAllCard() {
        return this.openCards;
    }

    getThreeCards() {
        return _.map(this.openCards, (cards) => {
            return cards.slice(0, 3);
        });
    }

    getRoadList() {
        return this.roadList;
    }

    getRoadListForClient(seat, action, next) {
        seat.sendAction(cons.RoomAction.ROOM_ROAD_LIST(), { list: this.roadList });
        utils.nextOK(next);
    }

    onRoundBegin() {
        super.onRoundBegin();

        //奖池控制
        this.openCards = [];

        for (let i = 0; i < brnncons.ROOM_OPEN_COUNT(); i++) {
            let cards = this.getLibrary().draw(5); // this.getLibrary().getCards();
            this.openCards.push(cards);
        }

        this.resetBanker();
        this.resetMaxMoneyPlayers();
        if (!this.maxWinner) {
            this.maxWinner = _.first(this.maxMoneyPlayers) || null;
        }

        if (this.room.getAttr('standard')) {
            this.changeState(brnncons.RoomState.BETTING());
        }
        else {
            this.changeState(brnncons.RoomState.SENDCARD());
        }

    }


    onRoundEnd() {
        super.onRoundEnd();

        if (!this.checkBanker()) {
            this.clearBanker();
        }

        // this.reset();
        this.room.getComp('state').changeState(brnncons.RoomState.IDLE());
    }

    /**
     * 开奖
     */
    open() {

        let openResult = this.getLibrary().open(this.openCards);
        this.openResult = openResult.result;
        this.roadList.unshift(openResult.road);
    }

    reset() {
        super.reset();

        this.nextChangeBanker = false;
        this.maxScore = 0;
        this.chipMgr.reset();
        this.cacheChipMgr.reset();
        this.openCards = [];
        this.library.wash();
    }

    toJson() {
        let json = this.state ? this.state.toJson() : {};
        json.banker = this.bankerId;
        json.bankerCount = this.bankerCount;
        json.maxScore = this.maxScore;
        json.crtScore = this.chipMgr.all();
        json.roadList = this.roadList.slice(0, 10);       //桌面上的小路单（最近10局）
        json.betChips = this.chipMgr.toJson();
        json.betOptions = this.room.getAttr('betOptions') || [];
        json.openCards = this.getOpenCards();
        json.standard = this.room.getAttr('standard');
        json.baseMulti = this.room.getAttr('baseMulti');
        json.maxWinner = this.getMaxWinner() ? this.getMaxWinner().toJson() : null;     //获取赢钱最多的玩家（幸运星）
        json.maxMoneyPlayers = this.getMaxMoneyPlayers();
        return json;
    }
}


module.exports = StateManager;