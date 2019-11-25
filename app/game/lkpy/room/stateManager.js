const cons = require('../../../common/constants');
const lkpycons = require('../common/constants');
const Library = require('../fish/library');
const Super = require('../../../room/stateManager');
const utils = require('../../../utils');
const WaitState = require('./state/wait');
const FreeState = require('./state/free');
const FleeState = require('./state/flee');
const LoadState = require('./state/load');
const ShoalState_1 = require('./state/shoal_1');
const ShoalState_2 = require('./state/shoal_2');
const ShoalState_3 = require('./state/shoal_3');
const ShoalState_4 = require('./state/shoal_4');
const ShoalState_5 = require('./state/shoal_5');
const Fish = require('../fish/fish');
const intervalTimer = require('../common/intervalTimer');
const _ = require('underscore');

/**
 * @api {json} room.state 房间状态数据结构
 * @type lkpy
 * @param {number} type 状态类型 - 空间时间(idle - 1) 下注时间(betting - 2) 开奖时间(opening - 3) 结算时间(result - 4)
 */

class StateManager extends Super {
    constructor(room) {
        super(room);

        if (this.library == null) {
            this.library = new Library();
        }

        this.fishId = 0;

        this.room.on(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer, this);
    }

    onSeatRemovePlayer() {
        if (this.room.getComp('seat').isEmpty()) {
            this.reset();
            this.changeState(lkpycons.RoomState.WAIT());
        }
    }

    init() {
        super.init();

        this.reset();

        this.sceneId = 0;

        this.changeState(lkpycons.RoomState.WAIT());
    }

    reset() {
        super.reset();
        this.resetFish();

        if (this.freezeHandler != null) {
            this.freezeHandler.stop();
            this.freezeHandler = null;
        }
        this.trusteeship = false;
    }

    action(seat, action, next) {
        switch (action.name) {
            //开火
            case cons.RoomAction.FIRE():
                {
                    if (seat.isTrust()) {
                        let fireSeat = this.room.getComp('seat').getSeatByUserId(action.user_id);
                        if (fireSeat) {
                            fireSeat.addBullet(action.bulletId, action.bullet_mulriple, action.angle, action.lockFishId);
                        }
                    }
                    else {
                        let r = seat.addBullet(action.bulletId, action.bullet_mulriple, action.angle, action.lockFishId);
                    }
                    // if (!r) {
                    //     utils.nextError(next);
                    //     return;
                    // }

                    utils.nextOK(next);
                }
                break;
            //鱼池加入鱼
            case cons.RoomAction.GET_FISH():
                {
                    let json = {};
                    json.vFish = _.map(this.vFish, fish => fish.toJson());

                    seat.sendAction(cons.RoomAction.GET_FISH(), json);

                    utils.nextOK(next);
                }
                break;
            //尝试抓鱼
            case cons.RoomAction.CATCH_FISH():
                {
                    if (seat.isTrust()) {
                        let fireSeat = this.room.getComp('seat').getSeatByUserId(action.user_id);
                        if (fireSeat) {
                            fireSeat.catchFish(action.bullet_id, action.fish_id);
                        }
                    }
                    else {
                        let r = seat.catchFish(action.bullet_id, action.fish_id);
                    }
                    // if (!r) {
                    //     utils.nextError(next);
                    //     return;
                    // }

                    utils.nextOK(next);
                }
                break;
            //击中鱼
            case cons.RoomAction.BOMB_FISH():
                {
                    let r = seat.bombFish(action.seat, action.bomb_id, action.fish_array);
                    // if (!r) {
                    //     utils.nextError(next);
                    //     return;
                    // }

                    utils.nextOK(next);
                }
                break;
            case cons.RoomAction.RELEASE_SKILL():
                {
                    let r = seat.releaseSkill(action.skillId);
                    if (r) {
                        if (action.skillId == 1) {
                            this.freeze();
                        }
                    }

                    utils.nextOK(next);
                }
                break;
            default:
                super.action(seat, action, next);
        }
    }

    hasTrust() {
        return this.trusteeship;
    }

    setTrust(trusteeship) {
        this.trusteeship = trusteeship;
    }

    changeState(type) {
        if (this.freezeHandler != null) {
            this.freezeHandler.stop();
            this.freezeHandler = null;
        }

        if (this.state) {
            this.state.exit();
            this.state = null;
        }

        let seatMgr = this.room.getComp('seat');
        _.forEach(seatMgr.getSittingSeats_User(), seat => seat.balance());

        this.state = this.createState(type);
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_CHANGE_STATE(), this.toJson());
        this.state && this.state.enter();

        if (this.library == null) {
            this.library = new Library();
        }

        this.library.setRoomUUID(this.room);
    }

    createState(type) {
        if (type === lkpycons.RoomState.WAIT()) {
            return new WaitState(this.room);
        } else if (type === lkpycons.RoomState.FREE()) {
            return new FreeState(this.room);
        } else if (type === lkpycons.RoomState.FLEE()) {
            return new FleeState(this.room);
        } else if (type === lkpycons.RoomState.LOAD()) {
            return new LoadState(this.room);
        } else if (type === lkpycons.RoomState.SHOAL_1()) {
            return new ShoalState_1(this.room);
        } else if (type === lkpycons.RoomState.SHOAL_2()) {
            return new ShoalState_2(this.room);
        } else if (type === lkpycons.RoomState.SHOAL_3()) {
            return new ShoalState_3(this.room);
        } else if (type === lkpycons.RoomState.SHOAL_4()) {
            return new ShoalState_4(this.room);
        } else if (type === lkpycons.RoomState.SHOAL_5()) {
            return new ShoalState_5(this.room);
        }
        return null;
    }

    clear() {
        super.clear();
    }

    toJson() {
        let json = this.state ? this.state.toJson() : {};

        return json;
    }

    update(dt) {
        this.state && this.state.update(dt);
    }

    addFish(fishKind, path, shoal = false) {
        // let r = [lkpycons.FISH_KIND_24(), lkpycons.FISH_KIND_23(), lkpycons.FISH_KIND_1(), lkpycons.FISH_KIND_31()];
        // fishKind = r[_.random(r.length - 1)];

        let fish = new Fish(this.room, fishKind, path, shoal);
        this.vFish[fish.getId()] = fish;

        if (fishKind == lkpycons.FISH_KIND_19() || fishKind == lkpycons.FISH_KIND_20() || fishKind == lkpycons.FISH_KIND_21()) {
            this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.BOSS_COMING(), null);
        }

        return fish;
    }

    getFish(id) {
        return this.vFish[id];
    }

    removeFish(id) {
        delete this.vFish[id];
    }

    resetFish() {
        this.vFish = {};
        this.fishId = 0;
    }

    getSceneId() {
        return this.sceneId;
    }

    processNextScene() {
        if (this.sceneId == lkpycons.SHOAL_KIND_5()) {
            this.sceneId = lkpycons.SHOAL_KIND_1();
        }
        else {
            this.sceneId++;
        }

        return this.sceneId;
    }
    //获取下一条鱼ID
    getNextFishId() {
        return ++this.fishId;
    }
    //判断鱼的生命
    judgeFishLife() {
        let keys = Object.keys(this.vFish);
        if (keys.length == 0) {
            return;
        }

        keys.forEach(key => {
            if (this.vFish[key].isDead()) {
                this.removeFish(key);
            }
        })
    }
    //获取随机一条鱼
    getRdmFish() {
        let keys = Object.keys(this.vFish);
        if (keys.length == 0) {
            return;
        }

        let index = _.random(0, keys.length);
        return keys[index];
    }
    //获得随机一条鱼
    getFishArray() {
        return this.vFish;
    }
    //冰冻
    freeze() {
        if (this.freezeHandler != null) {
            this.freezeHandler.stop();
        }

        this.freezeHandler = new intervalTimer(lkpycons.Interval.FREEZE(), () => this.unfreeze());
        this.freezeHandler.start();

        if (!this.isFrozen) {
            _.each(this.vFish, (f) => f.freeze());
            this.state.freeze();
            this.isFrozen = true;
        }

        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.FREEZE(), lkpycons.Interval.FREEZE());
    }
    //解冰冻
    unfreeze() {
        if (this.isFrozen) {
            this.freezeHandler = null;
            this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.UNFREEZE(), null);

            _.each(this.vFish, (f) => f.unfreeze());
            this.state.unfreeze();
            this.isFrozen = false;
        }
    }

    toJson() {
        let json = super.toJson();

        json.baseScore = this.room.getAttr('baseScore');

        json.isFrozen = this.isFrozen;
        if (this.freezeHandler != null) {
            json.freezeTimer = this.freezeHandler.isRunning() ? this.freezeHandler.remain() : null;
        }

        return json;
    }
}


module.exports = StateManager;