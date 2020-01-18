// 自由出鱼
const Super = require('../../../../room/timerState');
const cons = require('../../../../common/constants');
const lkpycons = require('../../common/constants');
const intervalTimer = require('../../common/intervalTimer');
const utils = require('../../../../utils');
const _ = require('underscore');
const FishPath = require('../../fish/fishpath');

class FreeState extends Super {
    constructor(room) {
        super(room, lkpycons.RoomState.FREE(), lkpycons.RoomStateInterval.FREE());
    }

    enter() {
        super.enter();

        this.isFrozen = false;

        this.timerArray = [];

        this.createSmallFish_handler = new intervalTimer(lkpycons.Interval.SMALL_FISH(), null);
        this.createSmallFish_handler.callback = () => this.createSmallFish(this.createSmallFish_handler);
        this.timerArray.push(this.createSmallFish_handler);
        this.createSmallFish_handler.start();

        this.createMediumFish_handler = new intervalTimer(lkpycons.Interval.MEDIUM_FISH(), null);
        this.createMediumFish_handler.callback = () => this.createMediumFish(this.createMediumFish_handler);
        this.timerArray.push(this.createMediumFish_handler);
        this.createMediumFish_handler.start();

        this.createNo18Fish_handler = new intervalTimer(lkpycons.Interval.FISH_18(), null);
        this.createNo18Fish_handler.callback = () => this.createNo18Fish(this.createNo18Fish_handler);
        this.timerArray.push(this.createNo18Fish_handler);
        this.createNo18Fish_handler.start();

        this.createNo19Fish_handler = new intervalTimer(lkpycons.Interval.FISH_19(), null);
        this.createNo19Fish_handler.callback = () => this.createNo19Fish(this.createNo19Fish_handler);
        this.timerArray.push(this.createNo19Fish_handler);
        this.createNo19Fish_handler.start();

        this.createNo20Fish_handler = new intervalTimer(lkpycons.Interval.FISH_20(), null);
        this.createNo20Fish_handler.callback = () => this.createNo20Fish(this.createNo20Fish_handler);
        this.timerArray.push(this.createNo20Fish_handler);
        this.createNo20Fish_handler.start();

        this.createFishKing_handler = new intervalTimer(lkpycons.Interval.FISH_KING(), null);
        this.createFishKing_handler.callback = () => this.createFishKing(this.createFishKing_handler);
        this.timerArray.push(this.createFishKing_handler);
        this.createFishKing_handler.start();

        this.createFishLock_handler = new intervalTimer(lkpycons.Interval.FISH_LOCK(), null);
        this.createFishLock_handler.callback = () => this.createFishLock(this.createFishLock_handler);
        this.timerArray.push(this.createFishLock_handler);
        this.createFishLock_handler.start();

        this.createFishBomb_handler = new intervalTimer(lkpycons.Interval.FISH_BOMB(), null);
        this.createFishBomb_handler.callback = () => this.createFishBomb(this.createFishBomb_handler);
        this.timerArray.push(this.createFishBomb_handler);
        this.createFishBomb_handler.start();

        this.createFishSuperBomb_handler = new intervalTimer(lkpycons.Interval.FISH_SUPERBOMB(), null);
        this.createFishSuperBomb_handler.callback = () => this.createFishSuperBomb(this.createFishSuperBomb_handler);
        this.timerArray.push(this.createFishSuperBomb_handler);
        this.createFishSuperBomb_handler.start();

        this.createFishBoss_handler = new intervalTimer(lkpycons.Interval.FISH_BOSS(), null);
        this.createFishBoss_handler.callback = () => this.createFishBoss(this.createFishBoss_handler);
        this.timerArray.push(this.createFishBoss_handler);
        this.createFishBoss_handler.start();

        this.createFish3YUAN_handler = new intervalTimer(lkpycons.Interval.FISH_3YUAN(), null);
        this.createFish3YUAN_handler.callback = () => this.createFish3Yuan(this.createFish3YUAN_handler);
        this.timerArray.push(this.createFish3YUAN_handler);
        this.createFish3YUAN_handler.start();

        this.createFish4XI_handler = new intervalTimer(lkpycons.Interval.FISH_4XI(), null);
        this.createFish4XI_handler.callback = () => this.createFish4Xi(this.createFish4XI_handler);
        this.timerArray.push(this.createFish4XI_handler);
        this.createFish4XI_handler.start();

        this.judgeFishLife_handler = new intervalTimer(1000, null);
        this.judgeFishLife_handler.handle = () => this.judgeFishLife(this.judgeFishLife_handler);
        this.timerArray.push(this.judgeFishLife_handler);
        this.judgeFishLife_handler.start();
    }

    exit() {
        super.exit();

        _.each(this.timerArray, (t) => t.stop());
        this.timerArray = [];
    }

    createSmallFish(handler) {
        this.addFish(14 + _.random(8), lkpycons.FISH_KIND_1(), lkpycons.FISH_KIND_10());
        handler.restart();
    }

    createMediumFish(handler) {
        this.addFish(2 + _.random(2), lkpycons.FISH_KIND_11(), lkpycons.FISH_KIND_17());
        handler.restart();
    }

    createNo18Fish(handler) {
        this.addFish(1, lkpycons.FISH_KIND_18(), lkpycons.FISH_KIND_18());
        handler.restart();
    }

    createNo19Fish(handler) {
        this.addFish(1, lkpycons.FISH_KIND_19(), lkpycons.FISH_KIND_19());
        handler.restart();
    }

    createNo20Fish(handler) {
        this.addFish(1, lkpycons.FISH_KIND_20(), lkpycons.FISH_KIND_20());
        handler.restart();
    }

    createFishBoss(handler) {
        this.addFish(1, lkpycons.FISH_KIND_21(), lkpycons.FISH_KIND_21());
        handler.restart();
    }

    createFishLock(handler) {
        this.addFish(1, lkpycons.FISH_KIND_22(), lkpycons.FISH_KIND_22());
        handler.restart();
    }

    createFishBomb(handler) {
        this.addFish(1, lkpycons.FISH_KIND_23(), lkpycons.FISH_KIND_23());
        handler.restart();
    }

    createFishSuperBomb(handler) {
        this.addFish(1, lkpycons.FISH_KIND_24(), lkpycons.FISH_KIND_24());
        handler.restart();
    }

    createFish3Yuan(handler) {
        this.addFish(1, lkpycons.FISH_KIND_25(), lkpycons.FISH_KIND_27());
        handler.restart();
    }

    createFish4Xi(handler) {
        this.addFish(1, lkpycons.FISH_KIND_28(), lkpycons.FISH_KIND_30());
        handler.restart();
    }

    createFishKing(handler) {
        this.addFish(1, lkpycons.FISH_KIND_31(), lkpycons.FISH_KIND_40());
        handler.restart();
    }

    judgeFishLife(handler) {
        let stateManager = this.room.getComp('state');
        stateManager.judgeFishLife();
        handler.restart();
    }

    addFish(num, minkind, maxkind) {
        let stateManager = this.room.getComp('state');
        let vFish = [];
        for (let i = 0; i < num; ++i) {
            let fishKind = _.random(minkind, maxkind);
            let path = this.getPathByFishKind(fishKind);
            let fish = stateManager.addFish(fishKind, path);
            vFish.push(fish);
        }

        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ADD_FISH(), _.map(vFish, p => p.toJson()));
    }

    getPathByFishKind(fishKind) {
        let kind = "";
        let id = 0;

        if (fishKind == lkpycons.FISH_KIND_1() || fishKind == lkpycons.FISH_KIND_2()) {
            kind = lkpycons.PathKind.SPECIAL();
            id = _.random(lkpycons.MAX_SPECIAL_PATH_COUNT() - 1);
        }
        else if (fishKind <= lkpycons.FISH_KIND_10()) {
            kind = lkpycons.PathKind.SMALL();
            id = _.random(lkpycons.MAX_SMALL_PATH_COUNT() - 1);
        }
        else if (fishKind <= lkpycons.FISH_KIND_15()) {
            kind = lkpycons.PathKind.BIG();
            id = _.random(lkpycons.MAX_BIG_PATH_COUNT() - 1);
        }
        else {
            kind = lkpycons.PathKind.HUGE();
            id = _.random(lkpycons.MAX_HUGE_PATH_COUNT() - 1);
        }

        return new FishPath(kind, id, _.random(0, 1) == 0);
    }

    freeze() {
        _.each(this.timerArray, (t) => t.freeze());

        this.timer.interval = this.timer.remain();
        this.timer.stop();
    }

    unfreeze() {
        _.each(this.timerArray, (t) => t.unfreeze());

        this.timer.start();
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(lkpycons.RoomState.FLEE());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = FreeState;