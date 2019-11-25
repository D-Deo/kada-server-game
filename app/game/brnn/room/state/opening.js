const cons = require('../../../../common/constants');
const brnncons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const formatter = require('../../poker/formatter');
const _ = require('underscore');

class OpeningState extends Super {
    constructor(room) {
        super(room, brnncons.RoomState.OPENING(), brnncons.RoomStateInterval.OPENING());
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(brnncons.RoomState.RESULT());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = OpeningState;