const cons = require('../common/constants');
const dao = require('../dao/index');
const EventEmitter = require('eventemitter3');
const GameManager = require('../game/manager');
const RoomSession = require('../session/roomSession');
const utils = require('../utils');
const _ = require('underscore');


/**
 * @api {json} room.attrs 房间参数说明
 * @apiGroup Room
 * @apiParam {string}   game 游戏类型
 * @apiParam {string}   id 房间id
 * @apiParam {bool}     canOwnerLeave           房主能否退出房间
 * @apiParam {number}   capacity                房间人数上限
 * @apiParam {bool}     createAndEnter          创建时直接进入房间
 * @apiParam {number}   createDeposit           创建房间预扣
 * @apiParam {number}   enterDeposit            进入房间预扣
 * @apiParam {bool}     dismissable             是否支持中途解散
 * @apiParam {[id]}     invitations             邀请玩家id列表
 * @apiParam {number}   mode                    开房模式 - 自己开 替人开 公会开 匹配开
 * @apiParam {id}       owner                   房主id 可以为null
 * @apiParam {bool}     recording               是否录制游戏
 * @apiParam {number}   rounds                  局数 -1 - 无限
 * @apiParam {number}   roundCost               每局消耗筹码数
 * @apiParam {json}     score                   筹码配置
 * @apiParam {json}     scoreMin                最小筹码数
 * @apiParam {number}   type                    房间类型 - 包间 匹配 比赛等
 * @apiVersion 1.0.0
 */
class Room extends EventEmitter {
    constructor(attrs) {
        super();

        this.attrs = attrs;
        this.cleared = false;
        this.comps = {};
        this.playing = false;
        this.playedUserID = [];
        this.init();
    }

    clear(reason) {
        this.cleared = true;
        this.emit(cons.RoomEvent.ROOM_BEFORE_CLEAR(), reason);
        this.emit(cons.RoomEvent.ROOM_CLEAR(), reason);
    }

    dismiss(reason) {
        this.isPlaying() ? this.result() : this.emit(cons.RoomEvent.ROOM_DISMISS(), reason);
        this.clear(reason);
    }

    getAttr(key) {
        return this.attrs[key];
    }

    setAttr(key, value) {
        let old = this.attrs[key];
        this.attrs[key] = value;
        return old;
    }

    getComp(key) {
        return this.comps[key];
    }

    isBlack(user) {
        if (user.getAttr('state') != cons.UserState.BLACK_DDZ()) return false;
        let seatMgr = this.getComp('seat');

        let count = 0;
        count = _.reduce(seatMgr.getSittingSeats(), (count, seat) => {
            if (seat.isRobot() || !seat.isBlack()) {
                return count;
            }
            count += 1;
            return count;
        }, 0);

        return count > 0;
    }

    isPlayed(user) {
        let seatMgr = this.getComp('seat');
        let count = 0;

        _.each(seatMgr.getSittingSeats(), (seat) => {
            for (let i = 0; i < this.playedUserID.length; i++) {
                if (this.playedUserID[i] == user.getAttr('id') || this.playedUserID[i] == seat.getUserId()) {
                    count++;
                }
            };
        });
        return count >= 2;
    }

    getGame() {
        return this.getAttr('game');
    }

    getId() {
        return this.getAttr('id');
    }

    getType() {
        return this.getAttr('type');
    }

    init() {
        this.comps.logger = GameManager.getInstance().new1(this.getGame(), 'room.loggerManager', this);
        this.comps.jackpot = GameManager.getInstance().new1(this.getGame(), 'room.jackpotManager', this);
        this.comps.agent = GameManager.getInstance().new1(this.getGame(), 'room.roomAgentServer', this);
        this.comps.channel = GameManager.getInstance().new1(this.getGame(), 'room.channel', this);
        this.comps.chat = GameManager.getInstance().new1(this.getGame(), 'room.chatManager', this);
        this.comps.controller = GameManager.getInstance().new1(this.getGame(), 'room.roomController', this);
        this.comps.db = GameManager.getInstance().new1(this.getGame(), 'room.db', this);
        this.comps.dismiss = GameManager.getInstance().new1(this.getGame(), 'room.dismissManager', this);
        this.comps.job = GameManager.getInstance().new1(this.getGame(), 'room.jobManager', this);
        this.comps.meter = GameManager.getInstance().new1(this.getGame(), 'room.meter', this);
        this.comps.recorder = GameManager.getInstance().new1(this.getGame(), 'room.recorder', this);
        this.comps.robot = GameManager.getInstance().new1(this.getGame(), 'room.robotManager', this);
        this.comps.round = GameManager.getInstance().new1(this.getGame(), 'room.roundScheduler', this);
        this.comps.seat = GameManager.getInstance().new1(this.getGame(), 'room.seatManager', this);
        this.comps.service = GameManager.getInstance().new1(this.getGame(), 'room.service', this);
        this.comps.session = RoomSession.fromRoom(this);
        this.comps.state = GameManager.getInstance().new1(this.getGame(), 'room.stateManager', this);
        this.comps.turn = GameManager.getInstance().new1(this.getGame(), 'room.turnScheduler', this);
        this.comps.updater = GameManager.getInstance().new1(this.getGame(), 'room.updater', this);
        this.comps.zone = GameManager.getInstance().new1(this.getGame(), 'room.zone', this);
        this.emit(cons.RoomEvent.ROOM_CREATE());
    }

    isCleared() {
        return this.cleared;
    }

    isMatch() {
        return this.getAttr('type') === cons.RoomType.MATCH();
    }

    isOwner(userId) {
        return this.isPrivate() && (userId === this.getAttr('owner'));
    }

    isPlaying() {
        return this.playing;
    }

    setPlaying(value) {
        if (value === this.playing) {
            return;
        }

        this.playing = value;
        this.emit(cons.RoomEvent.ROOM_CHANGE_PLAYING(), this.playing);
    }

    isPrivate() {
        return this.getAttr('type') === cons.RoomType.PRIVATE();
    }

    reset() {
        this.emit(cons.RoomEvent.ROOM_RESET());
    }

    result() {
        let balance = this.getComp('state').result();
        balance = this.getComp('meter').result(balance);
        this.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_RESULT(), balance);
        this.emit(cons.RoomEvent.ROOM_RESULT(), balance);
    }

    toJson(seat) {
        let json = _.omit(
            this.attrs,
            'createAndEnter',
            'createDeposit',
            'enterDeposit',
            'invitations',
            'recording',
            'zone'
        );
        json.dismiss = this.getComp('dismiss').toJson();
        json.round = this.getComp('round').toJson();
        json.seats = this.getComp('seat').toJson(seat);
        json.state = this.getComp('state').toJson();
        json.turn = this.getComp('turn').toJson();
        json.playing = this.playing;
        return json;
    }

    toJson_virtual(seat) {
        let json = this.toJson(seat);
        json.seats = [];
        json.virtual = true;
        return json;
    }

    toJsonForAgent() {
        let json = {};
        json.session = this.getComp('session').toJson();
        json.playing = this.playing;
        json.attrs = _.pick(this.attrs, ['rounds']);
        json.seats = _.map(this.getComp('seat').getSeats(), (seat) => seat.toJsonForAgent());
        return json;
    }

    toJson_Db() {
        let json = _.pick(this.attrs, ['uuid', 'game', 'guild', 'owner', 'rounds']);
        json.attrs = JSON.stringify(this.attrs);
        json.roomId = this.getId();
        return json;
    }

    toJson_Robot() {
        return _.pick(this.attrs, [
            'game',
            'id',
            'uuid'
        ]);
    }

    toJson_User() {
        let json = {};
        json.session = this.getComp('session').toJson();
        json.deposit = this.getAttr('enterDeposit');
        json.score = this.getAttr('score');
        return json;
    }
}


module.exports = Room;