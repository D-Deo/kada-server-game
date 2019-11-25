const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');

/**
 * @api {push} room.action 
 * @apiGroup dz
 * @params {string} name PlayerDeal
 * @params {json} msg 每个玩家手牌数据, 未参与牌局的位置为null
 */

class BankerState extends Super {

    constructor(room) {
        super(room, ddzcons.RoomState.BANKER());
    }

    enter() {
        super.enter();

        let seatMgr = this.room.getComp('seat');

        if (seatMgr.isBlackList()) {
            this.first = _.find(seatMgr.getPlayingSeats(), (seat) => {
                return seat.isRobot();
            });
        }

        if (!this.first) {
            this.logger.warn('有黑名单，但是没有机器人，所以不控制，也可能机器存在但是没找到');
            this.first = _.first(_.shuffle(this.room.getComp('seat').getPlayingSeats()));
        }

        let stateManager = this.room.getComp('state');
        stateManager.createTurn(ddzcons.Turn.SPEAK(), this.first, this.first.prev());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        //json.first = this.first.toJson();    // 第一个行动玩家，叫庄回合下，第一个行动的玩家有最后一次叫庄机会
        return json;
    }

}

module.exports = BankerState;