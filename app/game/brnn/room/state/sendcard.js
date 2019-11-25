const Super = require('../../../../room/timerState');
const ChisManager = require('../chipManager');
const cons = require('../../../../common/constants');
const brnncons = require('../../common/constants');
const utils = require('../../../../utils');
const _ = require('underscore');

class SendCardState extends Super {
    constructor(room) {
        super(room, brnncons.RoomState.SENDCARD(), brnncons.RoomStateInterval.SENDCARD());
    }
    
    end() {
        super.end();
        this.room.getComp('state').changeState(brnncons.RoomState.BETTING());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = SendCardState;