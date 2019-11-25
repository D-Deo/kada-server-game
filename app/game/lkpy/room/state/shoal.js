// 鱼群
const cons = require('../../../../common/constants');
const lkpycons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const FishPath = require('../../fish/fishpath');
const _ = require('underscore');

class ShoalState extends Super {
    constructor(room, type, interval) {
        super(room, type, interval);

        this.pathKind = 0;

        if (this.type == lkpycons.RoomState.SHOAL_1()) {
            this.pathKind = lkpycons.PathKind.SHOAL_1();
        }
        else if (this.type == lkpycons.RoomState.SHOAL_2()) {
            this.pathKind = lkpycons.PathKind.SHOAL_2();
        }
        else if (this.type == lkpycons.RoomState.SHOAL_3()) {
            this.pathKind = lkpycons.PathKind.SHOAL_3();
        }
        else if (this.type == lkpycons.RoomState.SHOAL_4()) {
            this.pathKind = lkpycons.PathKind.SHOAL_4();
        }
        else if (this.type == lkpycons.RoomState.SHOAL_5()) {
            this.pathKind = lkpycons.PathKind.SHOAL_5();
        }

        this.pathId = 0;
    }

    action(seat, action, next) {
        utils.nextOK(next);
    }

    enter() {
        super.enter();

        this.InitShoalFish();

        let vFish = this.room.getComp('state').getFishArray();
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ADD_FISH(), _.map(vFish, p => p.toJson()));

        //        this.judgeFishLife_handler = setInterval(() => this.judgeFishLife(), 1000);
    }

    exit() {
        super.exit();
    }

    freeze() {
        this.timer.interval = this.timer.remain();
        this.timer.stop();
    }

    unfreeze() {
        this.timer.start();
    }

    end() {
        super.end();
        this.room.getComp('state').resetFish();
        this.room.getComp('state').changeState(lkpycons.RoomState.FREE());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        json.shoalId = this.shoalId;
        return json;
    }

    InitShoalFish() {
    }

    addShoalFish(cnt, fishKind1, fishKind2) {
        let stateManager = this.room.getComp('state');
        for (let i = 0; i < cnt; i++) {
            if (fishKind2 == null) {
                stateManager.addFish(fishKind1, new FishPath(
                    this.pathKind,
                    this.pathId++,
                    true), true);
            }
            else {
                stateManager.addFish(_.random(fishKind1, fishKind2), new FishPath(
                    this.pathKind,
                    this.pathId++,
                    true), true);
            }
        }
    }

    judgeFishLife() {
        let stateManager = this.room.getComp('state');
        stateManager.judgeFishLife();
    }
}

module.exports = ShoalState;