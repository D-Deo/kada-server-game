const constants = require('../../../common/constants');
const UserManager = require('../../../user/manager');
const UserSession = require('../../../session/userSession');
const model = require('../../../db/model');

const utils = require('../../../utils');
const utility = require('utility');


function Remote(app) {
    this.app = app;
}


Remote.prototype.auth = function (session, account, password, ip, gps, cb) {
    (async () => {
        let user = await UserManager.get().loadUserByAccount(account);
        if (!user || (user.getAttr('type') !== constants.User.AUTH())) {
            utils.cb(cb, constants.ResultCode.USER_UNKNOWN());
            return;
        }

        if (password != null && password != '') {
            password = utility.md5(password).toUpperCase();
        }

        if (user.getAttr('password') != password) {
            utils.cb(cb, constants.ResultCode.USER_PASSWORD_ERROR());
            return;
        }

        utils.cbProm(cb, user.login(UserSession.fromUserId(user.getId(), session), {}, ip, gps));
    })();
};


Remote.prototype.register = function (attrs, recommender, cb) {
    let userMgr = UserManager.get();
    if (userMgr.getUserByAccount(attrs.account) || userMgr.getUserById(attrs.account)) {
        utils.cb(cb, constants.ResultCode.USER_ACCOUNT_USED());
        return;
    }

    let parent = recommender ? UserManager.get().getUserById(recommender) : null;
    if (recommender && !parent) {
        utils.cb(cb, constants.ResultCode.USER_RECOMMENDER_UNKNOWN());
        return;
    }

    (async () => {
        user = await UserManager.get().createUser(attrs);
        user.getComp('recommender').setParent(parent);
        utils.cbOK(cb);
    })();
};


Remote.prototype.login = function (session, attrs, gps, cb) {
    let user = null;

    if (attrs.account && attrs.account.length) {
        user = UserManager.get().getUserByAccount(attrs.account);
    }

    // if (user == null && UserManager.get().getUserByDeviceID(attrs.deviceid)) {      //设备号存在不能二次注册
    //     utils.cb(cb, constants.ResultCode.USER_DEVICE_USED());
    //     return;
    // }

    (async () => {
        if (user == null) {
            // attrs.account = '';
            // attrs.ip = session.ip;

            // let SameIPLogin = await model.Setting.find({ where: { key: 'SameIPLogin' } });
            // let SameDeviceLogin = await model.Setting.find({ where: { key: 'SameDeviceLogin' } });

            // let userIpCount = await model.User.count({ where: { ip: attrs.ip } });
            // let userDeviceCount = await model.User.count({ where: { deviceid: attrs.deviceid } });

            // if (userIpCount >= (SameIPLogin.value || 5)) {              //同IP最多 SameIPLogin 个注册账号
            //     utils.cb(cb, constants.ResultCode.USER_SAME_IP_OVER());
            //     return;
            // }

            // if ((attrs.device != 'PCH5' && attrs.device != 'H5') && userDeviceCount >= (SameDeviceLogin.value || 1)) {      // 同设备限制
            //     utils.cb(cb, constants.ResultCode.USER_SAME_DEVICE_OVER());
            //     return;
            // }

            user = await UserManager.get().createUser(attrs);
        }

        // if (user.getAttr('type') != constants.User.GUEST()) {
        //     utils.cb(cb, constants.ResultCode.USER_ACCOUNT_USED());
        //     return;
        // }

        let head = attrs.head || user.getAttr('head');
        let nick = attrs.nick || user.getAttr('nick');
        let sex = attrs.sex || user.getAttr('sex');
        let type = attrs.type || user.getAttr('type');
        let device = attrs.device || user.getAttr('device');
        let deviceid = attrs.deviceid || user.getAttr('deviceid');
        let bankId = attrs.bankId || user.getAttr('bankId');
        let agentId = attrs.agentId || user.getAttr('agentId');
        let ip = attrs.ip || user.getAttr('ip');
        let role = user.getAttr('role') || attrs.role;
        let deviceinfo = attrs.deviceinfo || user.getAttr('deviceinfo');
        utils.cbProm(cb, user.login(UserSession.fromUserId(user.getId(), session), { head, nick, sex, type, device, bankId, agentId, deviceid, ip, role, deviceinfo }, gps));
    })();
};


Remote.prototype.relogin = function (jsession, game, cb) {
    let session = UserSession.fromJson(jsession);
    let user = UserManager.get().getUserById(session.getUserId());
    if (!user || user.isRobot()) {
        utils.cbError(cb);
        return;
    }

    utils.cbProm(cb, user.relogin(session, game));
};


Remote.prototype.fastLogin = function (session, account, gps, cb) {
    let user = UserManager.get().getUserByAccount(account);
    if (!user || user.isRobot()) {
        utils.cb(cb, constants.ResultCode.USER_UNKNOWN());
        return;
    }

    utils.cbProm(cb, user.login(UserSession.fromUserId(user.getId(), session), {}, gps));
};


module.exports = (app) => new Remote(app);