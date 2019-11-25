// 鱼群之前的等待
const cons = require('../../../../common/constants');
const lkpycons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');

class FleeState extends Super {
    constructor(room) {
        super(room, lkpycons.RoomState.FLEE(), lkpycons.RoomStateInterval.FLEE());
    }

    action(seat, action, next) {
        utils.nextOK(next);
    }

    enter() {
        super.enter();
        this.sceneId = this.room.getComp('state').processNextScene();
    }

    exit() {
        super.exit();
    }

    freeze() {
    }

    unfreeze() {
    }

    end() {
        super.end();
        this.room.getComp('state').resetFish();
        this.room.getComp('state').changeState(lkpycons.RoomState.LOAD());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = FleeState;