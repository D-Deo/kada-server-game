const Bag = require('./bag');
const cons = require('../common/constants');
const dao = require('../dao/user');
const Db = require('./db');
const model = require('../db/model');
const EventEmitter = require('eventemitter3');
const Gps = require('./gps');
const pomelo = require('pomelo');
const Recommender = require('./recommender');
const Room = require('./room');
const utils = require('../utils');
const logger = require('pomelo-logger').getLogger('pomelo', __filename);
const _ = require('underscore');


/**
 * @api {json} User 玩家定义
 * @apiGroup User
 */
class User extends EventEmitter {
    constructor(id) {
        super();

        this.id = id;
        this.attrs = {};
        this.comps = {};
        this.session = null;
        this.logining = false;
        this.hasbankpass = false;

        this.init();
    }

    async bindSession(session) {
        if (session.isSameWith(this.session)) {
            logger.error('session same', session, this.session);
            return;
        }
        this.logout(cons.UserKick.RELOGIN());

        this.session = session;
        await this.session.login(this.getComp('room').toJson_Login());
        await this.session.bindProperty('room', this.getComp('room').toJson_User());
        this.logining = false;

        this.emit(cons.UserEvent.LOGIN());
    }

    getAttr(key) {
        return this.attrs[key];
    }

    setAttr(key, value, options = {}) {
        if (this.attrs[key] === value) {
            return;
        }
        this.attrs[key] = value;

        //屏蔽数据库里不需要更新的字段，或者数据库里没有的字段，只是在缓存里用到的
        let shieldKey = this.getShieldKey();
        if (shieldKey[key]) return;

        let { ignoreAction, ignoreSave, resetpwd } = options;
        !ignoreAction && this.sendAttributeChangeAction(key);

        if (resetpwd) {//重置密码
            let attr = _.pick(this.attrs, [key]);
            model.User.findById(this.getId()).then(u => {
                u.update(attr);
            });
        } else {
            !ignoreSave && dao.update(this.getId(), _.pick(this.attrs, [key]));
        }
    }

    setAttrs(attrs, options = {}) {
        let changed = false;
        _.each(attrs, (value, key) => {
            if (this.attrs[key] === value) {
                return;
            }

            this.attrs[key] = value;
            changed = true;
        });

        this.hasbankpass = (this.attrs.password2 != "");

        let { ignoreAction, ignoreSave } = options;
        !ignoreAction && changed && this.sendAttributeAction(cons.UserAttributeAction.CHANGE(), attrs);
        !ignoreSave && changed && dao.update(this.getId(), attrs);
    }

    getComp(key) {
        return this.comps[key];
    }

    setGps(gps) {
        this.comps.gps = Gps.fromJson(gps);
    }

    getId() {
        return this.id;
    }

    setIp(ip) {
        this.ip = ip;
    }

    getIp() {
        return this.ip;
    }

    getState() {
        return this.getAttr('state');
    }

    getSession() {
        return this.session;
    }

    init() {
        this.comps.bag = new Bag(this);
        this.comps.db = new Db(this);
        this.comps.recommender = new Recommender(this);
        this.comps.room = new Room(this);
    }

    isLogining(session) {
        if (!this.session) {
            return false;
        }

        return this.session.isSameWith(session);
    }

    isPlaying() {
        return this.getComp('room').isBinding();
    }

    isRobot() {
        return this.getAttr('type') === cons.User.ROBOT();
    }

    isSuspended() {
        return this.getAttr('state') !== cons.UserState.NORMAL()
            && this.getAttr('state') !== cons.UserState.WHITE_LIST()
            && this.getAttr('state') <= cons.UserState.SUSPENDED();
    }

    async load() {
        for (let k in this.comps) {
            await this.comps[k].load();
        }

        if (this.attrs.role == cons.Role.PLAYER()) {
            // 获取当前用户的总充值
            let payTotal = await model.UserPay.sum('money', {
                where: {
                    userId: this.id,
                    state: 1
                }
            });
            console.debug('当前用户', this.id, '总充值', payTotal * 100);
            this.attrs.payTotal = payTotal * 100;
        }
    }

    loadAttrs(attrs) {
        this.attrs.id = this.id;
        this.attrs.account = attrs.account;
        this.attrs.agentId = attrs.agentId || null;
        this.attrs.desp = attrs.desp || null;
        this.attrs.device = attrs.device || null;
        this.attrs.deviceid = attrs.deviceid || null;
        this.attrs.head = attrs.head || '';
        this.attrs.ip = attrs.ip || null;
        this.attrs.name = attrs.name || null;
        this.attrs.nick = attrs.nick || this.getId() + '';
        this.attrs.password = attrs.password || null;
        this.attrs.phone = attrs.phone || null;
        this.attrs.recommender = attrs.recommender || '';
        this.attrs.role = attrs.role || cons.Role.PLAYER();
        this.attrs.sex = attrs.sex ? parseInt(attrs.sex) : cons.Sex.MALE();
        this.attrs.state = attrs.state || cons.UserState.NORMAL();
        this.attrs.type = attrs.type || cons.User.GUEST();
        this.attrs.password2 = attrs.password2 || "";
        this.attrs.bankId = attrs.bankId || null;
        this.attrs.deviceid = attrs.deviceid || null;
        this.attrs.deviceinfo = attrs.deviceinfo || null;
        this.attrs.payTotal = 0;
        this.hasbankpass = (this.attrs.password2 != "");
    }

    login(session, attrs, ip, gps) {
        if (this.logining) {
            return Promise.reject(cons.ResultCode.SERVER_BUSY());
        }

        if (this.isSuspended()) {
            return Promise.reject(cons.ResultCode.USER_SUSPENDED());
        }

        this.logining = true;
        return this.bindSession(session).then(() => {
            this.logining = false;
            this.setAttrs(attrs, { ignoreAction: true });
            this.setGps(gps);
            this.setIp(ip);
            return this.toJson_Login();
        }, e => {
            this.logining = false;
            this.session = null;
            return Promise.reject(e);
        });
    }

    logout(kick) {
        if (!this.session) {
            return Promise.resolve();
        }
        if (kick == cons.UserKick.RELOGIN()) {
            this.session.send('onKick', 'same_session');
        }
        let p = kick ? this.session.kick(kick) : this.session.logout();
        this.session = null;
        this.emit(cons.UserEvent.LOGOUT(), this);
        return p.catch(() => { });
    }

    async relogin(session, game) {
        if (!session.isSameWith(this.session)) {
            return;
        }

        await this.session.relogin(game);

        return {};
    }

    send(route, msg) {
        this.session && this.session.send(route, msg);
    }

    sendToGame(game, route, msg) {
        this.session && this.session.sendToGame(game, route, msg);
    }

    sendAttributeAction(name, msg) {
        this.send(cons.UserAttributeAction.ROUTE(), { name, msg });
    }

    sendAttributeChangeAction(property) {
        this.sendAttributeAction(cons.UserAttributeAction.CHANGE(), _.pick(this.attrs, [property]));
    }

    sendItemAction(name, msg) {
        this.send(cons.ItemAction.ROUTE(), { name, msg });
    }

    sendItemChangeAction(id) {
        let msg = {};
        msg.id = id;
        msg.count = this.getComp('bag').getItemCount(id, true);
        this.sendItemAction(cons.ItemAction.CHANGE(), msg);
    }

    sendRoomAction(game, name, msg) {
        this.sendToGame(game, cons.RoomAction.ROUTE(), { name, msg });
    }

    sendRoomAgentAction(game, name, msg) {
        this.sendToGame(game, cons.RoomAgentAction.ROUTE(), { name, msg });
    }

    toJson(game, reason) {
        switch (reason) {
            case cons.UserToJsonReason.LOGIN():
                return this.toJson_Login(game);
                break;

            case cons.UserToJsonReason.ROOM():
                return this.toJson_Room(game);
                break;

            case cons.UserToJsonReason.GUILD():
                return this.toJsonForGuild(game);
                break;

            case cons.UserToJsonReason.MATCH():
                return this.toJson_Match(game);
                break;

            default:
                console.error('User toJson:', reason);
                break;
        }
    }

    toJson_Login() {
        let json = _.pick(this.attrs, [
            'id',
            'account',
            'agentId',
            'agentNick',
            'desp',
            'name',
            'nick',
            'phone',
            'type',
            'ip',
            'role',
            'sex',
            'head',
            'bankId'
        ]);
        // json.ip = this.session ? this.session.getIp() : null;
        json.bag = this.getComp('bag').toJson(true);
        json.recommender = this.getComp('recommender').toJson();
        json.room = this.getComp('room').toJson_User();
        json.hasbankpass = this.hasbankpass;
        return json;
    }

    toJsonForGuild() {
        let json = _.pick(this.attrs, ['id', 'nick', 'head']);
        json.session = this.session ? this.session.toJson() : null;
        return json;
    }

    getShieldKey() {
        return { payTotal: 1 };
    }

    toJsonForSave() {
        return _.omit(this.attrs, 'agentNick', 'room', 'deviceinfo', 'payTotal');
    }

    toJson_Room() {
        let json = _.pick(this.attrs, [
            //'account',
            'agentId',
            'agentNick',
            'desp',
            'id',
            'nick',
            'sex',
            'head',
            'type',
            'state',
            'role',
            'payTotal'
        ]);
        json.gps = this.getComp('gps') ? this.getComp('gps').toJson() : null;
        return json;
    }

    toJson_Match() {
        let json = _.pick(this.attrs, ['id']);
        json.gold = this.getComp('bag').getItemCount(cons.Item.GOLD());
        return json;
    }
}


module.exports = User;