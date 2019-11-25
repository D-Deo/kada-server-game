const Comp = require('./component');
const cons = require('../common/constants');
const db = require('../db/model');
const logger = require('log4js').getLogger('user');
const utils = require('../utils');
const _ = require('underscore');

class Db extends Comp {
    constructor(user) {
        super(user);

        this.loginRecord = null;
    }

    init() {
        this.user.on(cons.UserEvent.LOGIN(), this.onLogin, this);
        this.user.on(cons.UserEvent.LOGOUT(), this.onLogout, this);
    }

    onLogin() {
        if (this.loginRecord) {
            logger.error('User onLogin: recording');
        }

        let session = this.user.getSession();
        if (!session) {
            return;
        }
        this.loginRecord = db.UserLoginRecord.create({
            userId: this.user.getId(),
            ip: this.user.getIp(),
            device: this.user.getAttr('device'),
            login: utils.date.timestamp(),
            deviceinfo: this.user.getAttr('deviceinfo'),
            game: null,
            area: null
        });
        this.loginRecord.catch(e => logger.error('User onLogout:', e));
    }

    onLogout() {
        if (!this.loginRecord) {
            logger.error('User onLogout: not recording');
            return;
        }
        
        this.loginRecord.then(i => i.update({ logout: utils.date.timestamp(), game: null, area: null }));
        this.loginRecord = null;
    }
}


module.exports = Db;