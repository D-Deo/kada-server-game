const cons = require('../../../common/constants');
const lx9cons = require('../common/constants');
const Super = require('../../../room/seat');
const _ = require('underscore');


/**
 * @api {json} room.seats.seat seat数据结构
 * @apiGroup lx9
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
     * @param {number} count 下注金额
     */
    bet(count) {
        (count > 0) && this.user.changeScore(-count, 1);
        this.sendAction(cons.RoomAction.PLAYER_BID(), { count });
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

    toJson(seat) {
        let json = super.toJson();
        return json;
    }
}


module.exports = Seat;