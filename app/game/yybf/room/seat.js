const cons = require('../../../common/constants');
const yybfcons = require('../common/constants');
const Super = require('../../../room/seat');
const SeatManager = require('./seatManager');
const _ = require('underscore');


/**
 * @api {json} room.seats.seat seat数据结构
 * @type yybf
 * @param {json} user 玩家
 * @param {number} betChips 下注金额
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
        this.betChips = 0;
    }

    /**
     * 是否有足够金币下注
     * @param {number} chip 下注金额
     * @return {boolean}
     */
    canBet(chip) {
        return chip > 0 && this.user.getScore() >= chip;
    }

    /**
     * 下注
     * @param {number} count 下注金额
     */
    bet(count) {
        if(!this.betChips){
            this.betChips = 0;
        }
        this.betChips += count;
        (count > 0) && !this.isRobot() && this.user.changeScore(-count, 1);
        this.sendAction(cons.RoomAction.PLAYER_BID(), { count });
        // this.sendChannelAction(cons.RoomAction.PLAYER_BID(), { area, count });
    }

    /**
     * 获取下注情况
     * @return {number}
     */
    getBetChips() {
        return this.betChips;
    }

    isPlaying() {
        return this.getBetChips() > 0;
    }

    toJson(seat) {
        let json = super.toJson();
        json.betChip = this.getBetChips();
        json.betChipsAll = this.room.getComp('seat').getBetAll() || 0;
        return json;
    }

    toJson_Result() {
        let json = super.toJson_Result();
        json.betChip = this.getBetChips();
        json.betChipsAll = this.room.getComp('seat').getBetAll() || 0;
        return json;
    }
}


module.exports = Seat;