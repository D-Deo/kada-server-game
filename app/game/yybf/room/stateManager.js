const cons = require('../../../common/constants');
const yybfcons = require('../common/constants');
const Super = require('../../../room/stateManager');
const utils = require('../../../utils');
const IdleState = require('./state/idle');
const BettingState = require('./state/betting');
const OpeningState = require('./state/opening');
const ResultState = require('./state/result');
const _ = require('underscore');
const dao = require('../../../dao/user');


/**
 * @api {json} room.state 房间状态数据结构
 * @type yybf
 * @param {number} type 状态类型 - 空间时间(idle - 1) 下注时间(betting - 2) 开奖时间(opening - 3) 结算时间(result - 4)
 * @param {number} maxScore 台面最大下注金币
 * @param {number} crtScore 当前台面下注总额
 * @param {[number]} bankerList 庄家列表
 * @param {[number]} roadList 路单（倒序排序）
 * @param {number} betChips 下注筹码情况
 * @param {[number]} betTypes 下注类型
 * @param {[number]} chances 开奖区域的概率
 * @param {[number]} pondRecord 奖池记录
 * @param {[number]} selfRecord 我的记录
 */

class StateManager extends Super {
    constructor(room) {
        super(room);
        this.logger = this.room.getComp('logger');
    }

    /**
     * @returns
     * {
     *      betChips: 400,
     *      head: '8',
     *      id: 10000,
     *      nick: ''
     * }
     */
    get lastRoad() {
        if (this._roadList[0] === undefined) {
            return null;
        }
        return this._roadList[0];
    }

    init() {
        super.init();
        this._roadList = [];
        dao.list((rows) => {
            rows = _.shuffle(rows);
            _.some(rows, (r) => {
                if (r.type !== cons.User.ROBOT()) {
                    return;
                }

                let open = _.pick(r, 'id', 'nick', 'head');
                open.betChips = _.random(0, 100);
                open.crtScore = _.random(100, 12345);
                this._roadList.unshift(open);
                if (this._roadList.length == 6) {
                    return true;
                }
            });
        });


        this.betChips = 0;
        this.crtScore = 0;

        this.reset();
        this.changeState(yybfcons.RoomState.IDLE());
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
        if (type === yybfcons.RoomState.IDLE()) {
            return new IdleState(this.room);
        } else if (type === yybfcons.RoomState.BETTING()) {
            return new BettingState(this.room);
        } else if (type === yybfcons.RoomState.OPENING()) {
            return new OpeningState(this.room);
        } else if (type === yybfcons.RoomState.RESULT()) {
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

    canBet(count) {
        // return (this.maxScore - this.chipMgr.all()) >= count;
        // if (!this.getBanker()) return false;

        // let max = Math.floor(this.getBanker().getScore() / yybfcons.RoomAreaMulti[area]);
        // let crt = this.chipMgr.all(area);

        // return (max - crt) >= count;
    }

    getcrtScore() {
        return this.crtScore;
    }
    addBetCount(count) {
        if (!this.crtScore) {
            this.crtScore = 0;
        }
        this.crtScore += count;
        // this.betChips += count;
    }

    getBetChips() {
        return this.chipMgr.getBetChips();
    }

    sendBetChips() {
        if (this.crtScore <= 0) {
            return;
        }
        let chips = this.crtScore;
        this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_STATE_BET(), { chips: chips });
    }

    open() {
        let jackpotMgr = this.room.getComp('jackpot');
        let result = jackpotMgr.balance();
        result = this.getLottery(result);
        if (result) {
            let open = _.pick(result.user.attrs, 'id', 'nick', 'head');
            open.betChips = result.betChips;
            open.crtScore = this.getcrtScore();
            this._roadList.unshift(open);
        }
        if (_.size(this._roadList) > 100) {
            this._roadList.pop();
        }
        result = result ? result.index : 0;
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_DEAL(), { result: result });
    }

    getLottery(result) {
        if (!result || result.length <= 0) {
            return null;
        }
        let score = _.reduce(result, (memo, seat) => {
            return memo + seat.getBetChips();
        }, 0);
        let rate = [];
        _.each(result, (r, i) => {
            rate.push(_.reduce(result.slice(0, i + 1), (memo, seat) => {
                return memo + seat.getBetChips();
            }, 0));
        })
        let r = _.random(1, score);
        let index = _.sortedIndex(rate, r);

        if (!result[index]) return null; //容错代码

        this.logger.info('赔付', score, '随机', r, '权重', rate, '结果', index, '中奖', result[index].getIndex());
        return result[index];
    }

    onRoundBegin() {
        super.onRoundBegin();
        this.changeState(yybfcons.RoomState.BETTING());
    }

    onRoundEnd() {
        super.onRoundEnd();
        // this.reset();
        this.room.getComp('seat').reset();
        this.room.getComp('state').changeState(yybfcons.RoomState.IDLE());
    }

    reset() {
        super.reset();
        this.maxScore = 0;
        this.betChips = 0;
        this.crtScore = 0;
    }

    toJson() {
        let json = this.state ? this.state.toJson() : {};
        json.maxScore = this.maxScore;
        json.betChips = this.betChips || 0;
        json.crtScore = this.crtScore || 0;
        json.roadList = this._roadList.slice(0, 6);
        json.betOptions = this.room.getAttr('betOptions') || [];
        return json;
    }

    update(dt) {
        this.state && this.state.update(dt);
    }
}


module.exports = StateManager;