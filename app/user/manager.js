const cons = require('../common/constants');
const dao = require('../dao/user');
const db = require('../db/model');
const pomelo = require('pomelo');
const User = require('./user');
const utils = require('../utils');
const _ = require('underscore');
const utility = require('utility');
const Sequelize = require('sequelize');
const logger = require('log4js').getLogger('crontab');
const Op = Sequelize.Op;


class UserManager {
    static get() {
        return pomelo.app.components['userManager'];
    }

    static set() {
        pomelo.app.load('userManager', new UserManager());
    }

    constructor() {
        this.accountMap = {};
        this.idMap = {};
        this.phoneMap = {};
        this.deviceidMap = {};
        this.useripBindMap = {};
    }

    addUser(user) {
        this.idMap[user.getId()] = user;
        this.accountMap[user.getAttr('account').toString().toUpperCase()] = user;

        let phone = user.getAttr('phone');
        if (phone) {
            this.phoneMap[phone] = user;
        }

        let deviceid = user.getAttr('deviceid');
        if (deviceid) {
            this.deviceidMap[deviceid] = user;
        }

    }

    removeUser(user) {
        delete this.idMap[user.getId()];
        delete this.accountMap[user.getAttr('account').toString().toUpperCase()];

        let phone = user.getAttr('phone');
        if (phone) {
            delete this.phoneMap[phone];
        }

        let deviceid = user.getAttr('deviceid');
        if (deviceid) {
            delete this.deviceidMap[deviceid];
        }
    }


    async createUser(attrs) {
        let settings = await db.Setting.findAll({
            where: {
                [Sequelize.Op.or]: [{ key: 'NewUserGold' }, { key: 'BindUserGold' }]
            },
            order: [['key', 'ASC']]
        });

        if (attrs.password != null && attrs.password != '') {
            attrs.password = utility.md5(attrs.password).toUpperCase();
        }

        // V1 版本的用户ID是6位的
        let user = new User(utils.number.randomUniqueId(this.idMap, 6));
        attrs.account = attrs.account || user.id.toString();    //utils.string.randomGuestAccount(this.accountMap);

        if (attrs.type != cons.User.GUEST()) {
            user.getComp('bag').changeItem(cons.Item.GOLD(), parseInt(settings[0].value) || 0, { from: attrs.account + ":" + attrs.password, reason: cons.ItemChangeReason.BIND_PHONE() });
        }

        user.loadAttrs(attrs);

        // user.getComp('bag').changeItem(cons.Item.DIAMOND(), cons.NEW_USER_DIAMOND(), { from: attrs.account + ":" + attrs.password, reason: cons.ItemChangeReason.NEW_USER() });
        // user.getComp('bag').changeItem(cons.Item.GOLD(), parseInt(settings[1].value) || 0, { from: attrs.account + ":" + attrs.password, reason: cons.ItemChangeReason.NEW_USER() });
        // user.getComp('bag').changeItem(cons.Item.BANK(), cons.NEW_USER_BANK(), { from: attrs.account + ":" + attrs.password, reason: cons.ItemChangeReason.NEW_USER() });

        this.addUser(user);
        dao.insert(user.toJsonForSave());
        return user;
    }

    async loadUserByAccount(account) {
        let user = this.getUserByAccount(account);
        if (user) {
            return user;
        }

        let u = await db.User.findOne({ where: { account } });
        if (!u) {
            return null;
        }

        user = new User(u.id);
        user.loadAttrs(u);
        this.addUser(user);

        await user.load();
        return user;
    }

    getUserByAccount(account) {
        return this.accountMap[account.toString().toUpperCase()];
    }

    getUserById(id) {
        return this.idMap[id];
    }

    getUserByPhone(phone) {
        return this.phoneMap[phone];
    }

    getUserByDeviceID(deviceid) {
        return this.deviceidMap[deviceid];
    }

    remapUserByPhone(id, from, to) {
        if (from) {
            delete this.phoneMap[from];
        }

        if (to) {
            this.phoneMap[to] = this.getUserById(id);
        }
    }

    async load() {
        await db.UserLoginRecord.update({ logout: utils.date.timestamp(), game: null, area: null }, { where: { logout: null } });
        // let users = await db.User.findAll({ where: { type: { [Op.notIn]: [10, 11] } } });
        let users = await db.User.findAll();

        users = _.map(users, r => {
            let user = new User(r.id);
            user.loadAttrs(r);
            this.addUser(user);
            return user;
        });

        for (let u of users) {
            await u.load();
        }
    }

    start(cb) {
        utils.cbProm(cb, this.load());
    }
}


module.exports = UserManager;