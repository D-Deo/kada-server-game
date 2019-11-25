const cons = require('../../../common/constants');
const brnncons = require('../common/constants');
const Super = require('../../../room/seat');
const ChipManager = require('./chipManager');
const _ = require('underscore');

/**
 * @api {json} room.seats.seat seat数据结构
 * @apiGroup brnn
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
        this.chipMgr = new ChipManager(4);
    }

    /**
     * 是否有足够金币下注 -- 百变牛牛最大倍率5，也就是至少还要剩4倍
     * @param {number} count 下注金额 
     * @return {boolean}
     */
    canBet(count) {
        let multi = this.room.getAttr('baseMulti');
        let maxMulti = brnncons.Poker.Multi[brnncons.Poker.Multi.length - 1];
        return count > 0 && (this.user.getScore() - count) >= (this.chipMgr.all() + count) * (maxMulti * multi - 1);
    }

    /**
     * 下注
     * @param {number} area 下注区域 
     * @param {number} count 下注金额
     */
    bet(area, count) {
        this.chipMgr.add(area, count);
        (count > 0) && this.user.changeScore(-count, 1);
        this.sendAction(cons.RoomAction.PLAYER_BID(), { area, count });

        let stateMgr = this.room.getComp('state');
        let maxMoneyPlayers = stateMgr.getMaxMoneyPlayers();
        

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


    /**
    * 撤销下注
    * 
    * 
    */
    cancelBet() {

        let stateManager = this.room.getComp('state');

        let chipInfo = this.chipMgr.toJson();

        let chipAll = this.chipMgr.all();

        stateManager.minusBetCount(this.chipMgr.toJson());

        this.user.changeScore(chipAll, 1);

        let deskChipInfo = stateManager.chipMgr.toJson();

        this.sendAction(cons.RoomAction.PLAYER_BID_CANCEL(), { chipInfo: chipInfo, deskChips: deskChipInfo });

        this.resetChipMgr();


    }

    betByChips(chipMgr) {
        this.chipMgr.addByChips(chipMgr);
        let count = chipMgr.all();
        (count > 0) && this.user.changeScore(-count, 1);
        this.sendAction(cons.RoomAction.PLAYER_BID_REPEAT(), { chips: chipMgr.toJson() });
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