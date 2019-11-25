const cons = require('../../../../common/constants');
const bcbmcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');

class OpeningState extends Super {
    constructor(room) {
        super(room, bcbmcons.RoomState.OPENING(), bcbmcons.RoomStateInterval.OPENING());
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(bcbmcons.RoomState.RESULT());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        json.open = this.room.getComp('state').lastRoad;
        return json;
    }
}

module.exports = OpeningState;