const cons = require('../../../../common/constants');
const fqzscons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');

class OpeningState extends Super {
    constructor(room) {
        super(room, fqzscons.RoomState.OPENING(), fqzscons.RoomStateInterval.OPENING());
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(fqzscons.RoomState.RESULT());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        json.open = this.room.getComp('state').lastRoad;
        return json;
    }
}

module.exports = OpeningState;