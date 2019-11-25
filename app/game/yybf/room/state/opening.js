const cons = require('../../../../common/constants');
const yybfcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');
const utils = require('../../../../utils');


class OpeningState extends Super {
    constructor(room) {
        super(room, yybfcons.RoomState.OPENING(), yybfcons.RoomStateInterval.OPENING());
    }

    action(seat, action, next) {
        utils.nextError(next, '当前开奖状态');
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(yybfcons.RoomState.RESULT());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        json.open = this.room.getComp('state').lastRoad;
        return json;
    }
}

module.exports = OpeningState;