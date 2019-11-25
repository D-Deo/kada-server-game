// 鱼群之前的等待
const cons = require('../../../../common/constants');
const lkpycons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');

class LoadState extends Super {
    constructor(room) {
        super(room, lkpycons.RoomState.LOAD(), lkpycons.RoomStateInterval.LOAD());
    }

    action(seat, action, next) {
        utils.nextOK(next);
    }

    enter() {
        this.sceneId = this.room.getComp('state').processNextScene();
        super.enter();
        this.removeRobot();
    }

    exit() {
        super.exit();
    }

    freeze() {
    }

    unfreeze() {
    }

    removeRobot() {
        _.each(this.room.getComp('seat').getSeats(), (seat) => {
            if (seat.isRobot()) {
                this.room.getComp('robot').scheduleRelease(seat.getUserId(), _.random(3000, 5000));
            }
        });
    }

    end() {
        super.end();
        this.room.getComp('state').resetFish();

        if (this.sceneId == lkpycons.SHOAL_KIND_1()) {
            this.room.getComp('state').changeState(lkpycons.RoomState.SHOAL_1());
        }
        else if (this.sceneId == lkpycons.SHOAL_KIND_2()) {
            this.room.getComp('state').changeState(lkpycons.RoomState.SHOAL_2());
        }
        else if (this.sceneId == lkpycons.SHOAL_KIND_3()) {
            this.room.getComp('state').changeState(lkpycons.RoomState.SHOAL_3());
        }
        else if (this.sceneId == lkpycons.SHOAL_KIND_4()) {
            this.room.getComp('state').changeState(lkpycons.RoomState.SHOAL_4());
        }
        else if (this.sceneId == lkpycons.SHOAL_KIND_5()) {
            this.room.getComp('state').changeState(lkpycons.RoomState.SHOAL_5());
        }
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        json.sceneId = this.sceneId;
        return json;
    }
}

module.exports = LoadState;