const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');

/**
 * 加倍
 */
class DoubleState extends Super {
    constructor(room) {
        super(room, ddzcons.RoomState.DOUBLE(), ddzcons.RoomStateInterval.DOUBLE());
    }

    action(seat, action, next) {
        this.logger.info('玩家消息', seat.getIndex(), seat.getUserId(), action);

        if (action.name !== ddzcons.RoomAction.PLAYER_DOUBLE()) {
            utils.nextOK(next);
            return;
        }

        if (!utils.isNumber(action.double, ddzcons.DOUBLE.NO(), ddzcons.DOUBLE.YES()) ||
            seat.isDoubled()) {
            return utils.nextError(next);
        }

        seat.double(action.double);
        utils.nextOK(next);

        // 如果所有人都操作过是否加倍行为，则立即进行当回合结束的判断
        this.room.getComp('seat').isDoubled() && this.end();

        // if (!utils.isNumber(action.see, ddzcons.SEE.NO(), ddzcons.SEE.YES()) ||
        //     seat.isBankered()) {
        //     return;
        // }

        // seat.speak(action.speak);
        // this.room.getComp('seat').isBankered() && this.end();
        // utils.nextOK(next);
    }

    enter() {
        super.enter();

        _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
            if (!seat.isHosting()) {
                return;
            }

            seat.double(ddzcons.DOUBLE.NO());
        });

        // 如果所有人都操作过是否加倍行为，则立即进行当回合结束的判断
        if (this.room.getComp('seat').isDoubled()) {
            this.end();
        }
    }

    end() {
        super.end();

        _.delay(() => {
            this.room.getComp('state').changeState(ddzcons.RoomState.SEEING());
        }, 1500);
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = DoubleState;