const cons = require('../common/constants');
const depositer = require('./depositer');
const Gps = require('../user/gps');
const pomelo = require('pomelo');
const rpc = require('../rpc/user');
const UserScore = require('./user/score');
const utils = require('../utils/index');
const _ = require('underscore');
const model = require('../db/model');


class User {
    static create(session, room, cb) {
        rpc.enterRoom(session, room.toJson_User(), (err, data) => {
            utils.cb(cb, err, err || new User(room, session, data));
        });
    }

    constructor(room, session, data) {
        this.room = room;
        this.session = session;
        this.attrs = {};
        this.comps = {};

        this.init(data);
    }

    setAttr(key, value) {
        this.attrs[key] = value;
    }

    getAttr(key) {
        return this.attrs[key];
    }

    getComp(key) {
        return this.comps[key];
    }

    bindSession(session) {
        this.session = session;
    }

    unbindSession() {
        let session = this.session;
        this.session = null;
        return session;
    }

    getSession() {
        return this.session;
    }

    chargeDeposit(count) {
        // depositer.charge(this.getId(), this.deposit, count);
    }

    /**
     * 改变分数
     * @param {number} value 
     * @param {number} mode   模式调用 null-群发通知消息 0-不发消息 1-只发给自己 
     * @param {string} reason 改变原因 null-默认
     */
    changeScore(value, mode = null, reason = null) {
        let ret = this.getComp('score').change(value, reason);
        if (mode == null) {
            this.sendChannelAction(cons.RoomAction.PLAYER_SCORE(), ret);
        } else if (mode == 1) {
            this.sendAction(cons.RoomAction.PLAYER_MY_SCORE(), ret);
        }
        return ret;
    }

    getScore() {
        return this.getComp('score').get();
    }

    updateScore(value) {
        return this.getComp('score').update(value);
    }

    updateDiamond(value) {
        let ret = this.getComp('scoreDiamond').change(value);
        this.sendAction(cons.RoomAction.PLAYER_MY_SCORE(), ret);
        return ret;
    }

    updateState(state) {
        this.setAttr('state', state);
    }

    getDiamond() {
        return this.getComp('scoreDiamond').get();
    }

    getId() {
        return this.getAttr('id');
    }

    getPayTotal() {
        return this.getAttr('payTotal');
    }

    init(data) {
        this.attrs.id = this.session.getUserId();
        this.attrs.ip = this.session.getIp();
        this.attrs.agent = data.agent;
        this.attrs.deposit = data.deposit;
        this.attrs.desp = data.desp;
        this.attrs.gps = Gps.fromJson(data.gps);
        this.attrs.head = data.head;
        this.attrs.nick = data.nick;
        this.attrs.sex = data.sex;
        this.attrs.type = data.type;
        this.attrs.account = data.account;
        this.attrs.state = data.state;
        this.attrs.role = data.role;
        this.attrs.payTotal = data.payTotal;

        this.comps = {};

        if (this.room.getAttr('score') == cons.Item.DIAMOND()) {
            this.comps.score = UserScore.create(this.room, this, 0);
            this.comps.scoreDiamond = UserScore.create(this.room, this, data.score);
        } else {
            this.comps.score = UserScore.create(this.room, this, data.score);
        }

        model.UserLoginRecord.update({ game: this.room.getAttr('game'), area: this.room.getAttr('area') }, { where: { logout: null, userId: this.getId() } });
    }

    isTest() {
        return this.getAttr('role') === cons.Role.TEST();
    }

    isRobot() {
        return this.getAttr('type') === cons.User.ROBOT();
    }

    isWhite() {
        return this.getAttr('state') === cons.UserState.WHITE_LIST();
    }

    leaveRoom(reason, cb) {
        if (reason !== null) {
            this.sendAction(cons.RoomAction.PLAYER_LEAVE_ROOM(), reason);
        }

        model.UserLoginRecord.update({ game: null, area: null }, { where: { userId: this.getId(), game: this.room.getAttr('game'), area: this.room.getAttr('area') } });
        rpc.leaveRoom(this.getId(), this.getAttr('deposit'), cb);
    }

    sendAction(name, msg) {
        if (!this.session) {
            return;
        }

        this.session.send(cons.RoomAction.ROUTE(), { name, msg });
    }

    sendChannelAction(name, msg) {
        let cmsg = _.defaults({ id: this.getId() }, msg);
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), name, cmsg);
    }

    toJson() {
        let json = _.pick(this.attrs, [
            // 'account',
            'agent',
            'desp',
            'head',
            'id',
            'ip',
            'nick',
            'sex'
        ]);
        json.gps = this.getComp('gps') ? this.getComp('gps').toJson() : null;
        json.score = this.getScore();
        json.robot = this.room.getAttr('game') == 'lkpy' ? this.isRobot() : false;
        return json;
    }

    toJson_Agent() {
        return _.pick(this.attrs, ['head', 'id', 'nick', 'sex']);
    }

    toJson_Result() {
        let json = _.pick(this.attrs, [
            'agent',
            'desp',
            'head',
            'id',
            'nick',
            'sex'
        ]);
        json.score = this.getScore();
        return json;
    }
}


module.exports = User;