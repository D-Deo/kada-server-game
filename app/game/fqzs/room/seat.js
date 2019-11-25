const cons = require('../../../common/constants');
const fqzscons = require('../common/constants');
const Super = require('../../../room/seat');
const ChipManager = require('./chipManager');
const _ = require('underscore');


/**
 * @api {json} room.seats.seat seat数据结构
 * @type fqzs
 * @param {json} user 玩家
 * @param {[Chip]} betChips 下注情况
 * @param {number} bankerState 当庄状态：-2 正在当庄 -1 等待下庄 0 没有上庄 >=1 正在等待上庄（当前位置）
 */

class Seat extends Super {
    constructor(room, index) {
        super(room, index);
    }

    clear() {
        super.clear();

        this.reset();
    }

    reset() {
        super.reset();
        this.resetChipMgr();
    }

    resetChipMgr() {
        this.chipMgr = new ChipManager(fqzscons.RoomAreaMulti.length);
    }

    /**
     * 是否有足够金币下注
     * @param {number} count 下注金额 
     * @return {boolean}
     */
    canBet(count) {
        return count > 0 && this.user.getScore() >= count;
    }

    /**
     * 下注
     * @param {number} area 下注区域 
     * @param {number} count 下注金额
     */
    bet(area, count) {
        this.chipMgr.add(area, count);
        (count > 0) && this.user.changeScore(-count, 1);

        let stateMgr = this.room.getComp('state');
        let maxMoneyPlayers = stateMgr.getMaxMoneyPlayers();
        this.sendAction(cons.RoomAction.PLAYER_BID(), { area, count });

        if (this.getIndex() == stateMgr.getMaxWinnerUserId()) {
            this.sendChannelAction(cons.RoomAction.PLAYER_BID(), { area, count });
            return;
        }

        for (let seat of maxMoneyPlayers) {
            if (!seat.user) continue;
            if (seat.user.id == this.getIndex()) {
                this.sendChannelAction(cons.RoomAction.PLAYER_BID(), { area, count });
                break;
            }
        }
    }

    getSeatRecodBet() {
        return this.chipList;
    }

    /**
     * 撤销下注
     */
    cancelBet() {
        let stateManager = this.room.getComp('state');
        stateManager.minusBetCount(this.chipMgr.toJson());

        this.user.changeScore(this.chipMgr.all(), 1);

        let chipInfo = this.chipMgr.toJson();
        let deskChipInfo = stateManager.chipMgr.toJson();
        this.sendAction(cons.RoomAction.PLAYER_BID_CANCEL(), { chipInfo: chipInfo, deskChips: deskChipInfo });

        this.resetChipMgr();
    }

    /**
     * 获取下注情况
     */
    getBetChips() {
        return this.chipMgr.getBetChips();
    }

    /**
     * 获取当前下注额
     * @param {number} area 下注区域 全部 null 
     * @return {number}
     */
    getBetCount(area) {
        return this.chipMgr.all();
    }

    isPlaying() {
        return this.getBetCount() > 0 || (this.room.getComp('state').getBankerState(this.getUserId()) < 0);
    }

    toJson(seat) {
        let json = super.toJson();
        json.betChips = this.chipMgr.toJson();
        json.bankerState = this.room.getComp('state').getBankerState(this.getUserId());
        return json;
    }
}


module.exports = Seat;