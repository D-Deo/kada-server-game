const constants = require('../../../common/constants');
const pomelo = require('pomelo');
const rpc = require('../../../rpc/user');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils/index');
const db = require('../../../db/index');
const redis = require('../../../redis/index');
const model = require('../../../db/model');
const logger = require('log4js').getLogger('crontab');
const GameManager = require('../../../game/manager');
const _ = require('underscore');
const wx = require('../../../sdk/wx');

function Handler(app) {
    this.app = app;
}

/**
 * @api {request} connector.authorizationHandler.auth 授权登陆模式
 * @apiGroup User
 * @apiParam {string} game 游戏
 * @apiParam {string} account 账号
 * @apiParam {string} password 密码
 * @apiParam {json} gps gps信息
 */
Handler.prototype.auth = function (msg, session, next) {
    if (!utils.isString(msg.account, 6, 12) ||
        !utils.isString(msg.password, 6, 12)) {
        utils.nextError(next);
        return;
    }

    let ip = pomelo.app.get('sessionService').getClientAddressBySessionId(session.id).ip;
    console.log('auth', ip);
    msg.ip = ip;
    let userSession = UserSession.fromLoginBackendSession(session, msg.game);
    pomelo.app.rpc.user.authorizationRemote.auth(null, userSession.toJson(), msg.account, msg.password, msg.ip, msg.gps, (err, user) => {
        if (err) {
            return utils.next(next, err.code, err);
        }
        db.find('mail', { userId: user.id, readed: 0 }, (err, data) => {
            if (err) {
                return utils.next(next, err);
            }
            data ? user.redPoint = { mail: true } : user.redPoint = { mail: false };
            err ? utils.next(next, err) : utils.nextOK(next, user);
        });
    });
};


Handler.prototype.commitPassword = function (msg, session, next) {
    if (!utils.isString(msg.account, 1) ||
        !utils.isString(msg.code, 1) ||
        !utils.isString(msg.password, 1)) {
        utils.nextError(next);
        return;
    }

    pomelo.app.rpc.user.authorizationRemote.commitPassword(null, msg.account, msg.code, msg.password, (err, msg) => {
        utils.next(next, err, msg);
    });
};


Handler.prototype.sendPassword = function (msg, session, next) {
    if (!utils.isString(msg.account, 1)) {
        utils.nextError(next);
        return;
    }

    pomelo.app.rpc.user.authorizationRemote.sendPassword(null, msg.account, (err, msg) => {
        utils.next(next, err, msg);
    });
};


/**
 * @api {request} connector.authorizationHandler.commitRegister 注册账号提交验证码
 * @apiGroup User
 * @apiParam {string} account 账号
 * @apiParam {string} code 验证码
 * @apiParam {string} password 密码
 * @apiParam {string} nick 昵称
 * @apiParam {number} sex 性别 男(0) 女(1)
 */
Handler.prototype.commitRegister = function (msg, session, next) {
    if (!utils.isString(msg.account, 1) ||
        !utils.isString(msg.code, 1) ||
        !utils.isString(msg.password, 1) ||
        !utils.isString(msg.nick, 1)) {
        utils.nextError(next);
        return;
    }

    if (msg.recommender && !utils.isId(msg.recommender)) {
        utils.nextError(next);
        return;
    }

    let sex = utils.isNumber(msg.sex, 0, 1) ? msg.sex : constants.Sex.MALE();
    pomelo.app.rpc.user.authorizationRemote.commitRegister(null, msg.account, msg.code, msg.nick, msg.password, msg.recommender || null, sex, (err, msg) => {
        utils.next(next, err, msg);
    });
};


/**
 * @api {request} connector.authorizationHandler.sendRegister 注册账号发送验证码
 * @apiGroup User
 * @apiParam {string} account 账号
 */
Handler.prototype.sendRegister = function (msg, session, next) {
    if (!utils.isString(msg.account, 1)) {
        utils.nextError(next);
        return;
    }

    pomelo.app.rpc.user.authorizationRemote.sendRegister(null, msg.account, (err, msg) => {
        utils.next(next, err, msg);
    });
};

/**
 * @api {request} connector.authorizationHandler.accountRegister 注册
 * @apiGroup User
 * @apiParam {string} game 游戏
 * @apiParam {string} account 账号 - uid
 * @apiParam {string} head 头像 - icon
 * @apiParam {string} nick 昵称 - nickname
 * @apiParam {number} sex 性别 - 男(0) 女(1)
 */
Handler.prototype.accountRegister = function (msg, session, next) {
    if (!utils.isString(msg.account, 6, 12) ||
        !utils.isString(msg.password, 6, 12) ||
        !utils.isString(msg.deviceid) ||
        !utils.isString(msg.device, 1, 30) ||
        !utils.isNumber(msg.sex, 0, 1)) {
        utils.nextError(next);
        return;
    }

    let ip = pomelo.app.get('sessionService').getClientAddressBySessionId(session.id).ip;
    console.log('accountRegister', pomelo.app.get('sessionService').getClientAddressBySessionId(session.id).ip);
    let attrs = {};
    attrs.account = msg.account || null;
    attrs.password = msg.password || null;
    attrs.sex = msg.sex || constants.Sex.MALE();
    attrs.type = constants.User.AUTH();
    attrs.device = msg.device || 1;
    attrs.deviceid = msg.deviceid || null;
    attrs.agentId = msg.agentId || 0;
    attrs.ip = msg.ip || ip;
    attrs.nick = msg.nick || null;
    attrs.role = msg.role || 0;

    (async () => {
        let SameIPLogin = await model.Setting.find({ where: { key: 'SameIPLogin' } }) || 10;
        let SameDeviceLogin = await model.Setting.find({ where: { key: 'SameDeviceLogin' } }) || 1;

        let userIpCount = await model.User.count({ where: { ip: attrs.ip } });
        let userDeviceIDCount = await model.User.count({ where: { deviceid: attrs.deviceid } });
        if (userIpCount > SameIPLogin.value) {
            utils.next(next, constants.ResultCode.USER_SAME_IP_OVER());
            return;
        }
        let userCountByAccount = await model.User.count({ where: { account: attrs.account } });
        if (userCountByAccount > 0) {
            utils.next(next, constants.ResultCode.USER_ACCOUNT_USED());
            return;
        }
        if (userDeviceIDCount > SameDeviceLogin.value) {
            utils.next(next, constants.ResultCode.USER_SAME_DEVICE_OVER());
            return;
        }

        if (!attrs.agentId) {
            let value = await redis.async.get(`WebServer:Bind:${attrs.ip}`);
            if (value) {
                attrs.agentId = value;
                logger.info('绑定成功,agentid:', value, 'userip:', attrs.ip);
                redis.del(attrs.ip, (value) => {
                    if (value) {
                        console.log('删除成功');
                    }
                });
            }
        }
        pomelo.app.rpc.user.authorizationRemote.register(null, attrs, null, err => {
            utils.next(next, err);
        });
    })();

};

/**
 * @api {request} connector.authorizationHandler.login 登录
 * @apiGroup User
 * @apiParam {string} game 游戏
 * @apiParam {string} account 账号 - uid
 * @apiParam {string} head 头像 - icon
 * @apiParam {string} nick 昵称 - nickname
 * @apiParam {number} sex 性别 - 男(0) 女(1)
 */
Handler.prototype.login = function (msg, session, next) {
    if (!utils.isString(msg.game, 1)) {
        utils.nextError(next);
        return;
    }

    let ip = pomelo.app.get('sessionService').getClientAddressBySessionId(session.id).ip;
    console.log('guestLogin', ip);

    let attrs = {};
    attrs.account = msg.account || null;
    attrs.head = msg.head || null;
    attrs.nick = msg.nick ? utils.string.filterNick(msg.nick) : null;
    attrs.sex = msg.sex || constants.Sex.MALE();
    attrs.type = msg.type || constants.User.GUEST();
    attrs.device = msg.device || 1;
    attrs.deviceid = msg.deviceid || null;
    attrs.agentId = msg.agentId || 0;
    attrs.ip = msg.ip || ip;
    attrs.role = msg.role || constants.Role.PLAYER();
    attrs.deviceinfo = msg.deviceinfo || null;

    if (attrs.account && !utils.isString(attrs.account, 1, 255)) {
        utils.nextError(next);
        return;
    }

    if (attrs.head && !utils.isString(attrs.account, 1, 255)) {
        utils.nextError(next);
        return;
    }

    if (attrs.nick && !utils.isString(attrs.nick, 1, 64)) {
        utils.nextError(next);
        return;
    }

    if (!utils.isNumber(attrs.sex, constants.Sex.MALE(), constants.Sex.FEMALE())) {
        utils.nextError(next);
        return;
    }

    if (!utils.isNumber(attrs.type, constants.User.GUEST(), constants.User.AUTH())) {
        utils.nextError(next);
        return;
    }

    let userSession = UserSession.fromLoginBackendSession(session, msg.game);
    rpc.login(userSession, attrs, msg.gps || null, (err, user) => {
        if (err) {
            return utils.nextError(next, err);
        }
        db.find('mail', { userId: user.id, readed: 0 }, (err, data) => {
            if (err) {
                utils.next(next, err);
                return;
            }
            data ? user.redPoint = { mail: true } : user.redPoint = { mail: false };
            err ? utils.next(next, err) : utils.nextOK(next, user);
        });
    });
};

/**
 * @api {request} connector.authorizationHandler.wxLogin 微信登录
 * @param {string} code  微信授权码
 */
Handler.prototype.wxLogin = function (msg, session, next) {
    if (!utils.isString(msg.code, 1)) {
        utils.nextError(next);
        return;
    }

    let ip = pomelo.app.get('sessionService').getClientAddressBySessionId(session.id).ip;
    console.log('wxLogin', ip);

    wx.getAccessToken(msg.code, (err, data) => {
        if (err) {
            return utils.nextError(next, err);
        }
        wx.getUserInfo(data.access_token, data.openid, (err, info) => {
            if (err) {
                return utils.nextError(next, err);
            }

            let attrs = {};
            attrs.account = info.unionid || null;   // 用户的微信唯一标示，就是他的账号
            attrs.head = info.headimgurl || null;
            attrs.nick = info.nickname ? utils.string.filterNick(info.nickname) : null;
            attrs.sex = utils.isNumber(info.sex, 1, 2) ? info.sex - 1 : constants.Sex.MALE();
            attrs.type = constants.User.AUTH();
            attrs.device = msg.device || 1;
            attrs.deviceid = msg.deviceid || null;
            attrs.agentId = msg.agentId || 0;
            attrs.ip = msg.ip || ip;
            attrs.role = msg.role || constants.Role.PLAYER();
            attrs.deviceinfo = msg.deviceinfo || null;

            let userSession = UserSession.fromLoginBackendSession(session, msg.game);
            rpc.login(userSession, attrs, msg.gps || null, (err, user) => {
                if (err) {
                    return utils.nextError(next, err);
                }
                db.find('mail', { userId: user.id, readed: 0 }, (err, data) => {
                    if (err) {
                        utils.next(next, err);
                        return;
                    }
                    data ? user.redPoint = { mail: true } : user.redPoint = { mail: false };
                    err ? utils.next(next, err) : utils.nextOK(next, user);
                });
            });
        });
    });
};

/**
 * @api {request} connector.authorizationHandler.zappLogin ZAPP登录
 * @apiGroup User
 * @apiParam {string} game 游戏
 * @apiParam {string} account 账号 - uid
 * @apiParam {string} head 头像 - icon
 * @apiParam {string} nick 昵称 - nickname
 * @apiParam {number} sex 性别 - 男(0) 女(1)
 */
Handler.prototype.zappLogin = function (msg, session, next) {
    if (!utils.isString(msg.openId, 1) ||
        !utils.isString(msg.headUrl, 1) ||
        !utils.isString(msg.nickName, 1)) {
        return utils.nextError(next);
    }

    let ip = pomelo.app.get('sessionService').getClientAddressBySessionId(session.id).ip;
    console.log('zappLogin', ip);

    let attrs = {};
    attrs.account = msg.openId || null;
    attrs.head = msg.headUrl || null;
    attrs.nick = msg.nickName || null;
    attrs.sex = constants.Sex.MALE();
    attrs.type = constants.User.AUTH();
    attrs.device = msg.device || 1;
    attrs.deviceid = msg.deviceid || null;
    attrs.agentId = msg.agentId || 0;
    attrs.ip = msg.ip || ip;
    attrs.role = msg.role || constants.Role.PLAYER();
    attrs.deviceinfo = msg.deviceinfo || null;

    let userSession = UserSession.fromLoginBackendSession(session, 'lkpy');
    rpc.login(userSession, attrs, msg.gps || null, (err, user) => {
        if (err) {
            return utils.nextError(next, err);
        }
        utils.nextOK(next, user);
        // db.find('mail', { userId: user.id, readed: 0 }, (err, data) => {
        //     if (err) {
        //         utils.next(next, err);
        //         return;
        //     }
        //     data ? user.redPoint = { mail: true } : user.redPoint = { mail: false };
        //     err ? utils.next(next, err) : utils.nextOK(next, user);
        // });
    });
};

/**
 * @api {request} connector.authorizationHandler.reportProblem 问题反馈
 * @apiGroup User
 * @apiParam {number} type 问题类型
 * @apiParam {string} msg 问题内容
 */
Handler.prototype.reportProblem = function (msg, session, next) {
    if (!utils.isString(msg.msg, 1, 255)) {
        utils.nextError(next);
        return;
    }

    let userSession = UserSession.fromBackendSession(session, null);
    if (!userSession) {
        return utils.nextError(next);
    }
    pomelo.app.rpc.user.userRemote.reportProblem(null, userSession.toJson(), msg.type, msg.msg, (err, user) => {
        utils.next(next, err, user);
    });
};

Handler.prototype.responseProblem = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session, null);
    if (!userSession) {
        return utils.nextError(next);
    }
    pomelo.app.rpc.user.userRemote.responseProblem(null, userSession.toJson(), (err, user) => {
        utils.next(next, err, user);
    });
}

//充值记录
Handler.prototype.rechargeRecord = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session, null);
    if (!userSession) {
        return utils.nextError(next);
    }
    pomelo.app.rpc.user.userRemote.rechargeRecord(null, userSession.toJson(), (err, user) => {
        utils.next(next, err, user);
    });
}

//充值代理
// Handler.prototype.rechargeAgent = function (msg, session, next) {

//     let userSession = UserSession.fromBackendSession(session, null);
//     pomelo.app.rpc.user.userRemote.rechargeAgent(null, userSession.toJson(), (err, user) => {
//         utils.next(next, err, user);
//     });
// }

//提现记录
Handler.prototype.withdrawRecord = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session, null);
    if (!userSession) {
        return utils.nextError(next);
    }
    pomelo.app.rpc.user.userRemote.withdrawRecord(null, userSession.toJson(), (err, user) => {
        utils.next(next, err, user);
    });
}

// //提现动作
// Handler.prototype.withdrawAction = function (msg, session, next) {
//     if (!utils.isId(msg.userId) ||
//         !utils.isNumber(msg.coin, 100) ||
//         !utils.isString(msg.bankNo)) {
//         utils.nextError(next);
//         return;
//     }
//     msg.money = msg.coin / 100;
//     let userSession = UserSession.fromBackendSession(session, null);
//     if (!userSession) {
//         return utils.nextError(next);
//     }
//     //msg.userId,msg.money, msg.coin, msg.name, msg.bank, msg.bankNo, msg.reason
//     pomelo.app.rpc.user.userRemote.withdrawAction(null, userSession.toJson(), msg, (err, user) => {
//         utils.next(next, err, user);
//     });
// }

//资产变动记录
Handler.prototype.financeChangeRecord = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session, null);
    if (!userSession) {
        return utils.nextError(next);
    }
    pomelo.app.rpc.user.userRemote.financeChangeRecord(null, userSession.toJson(), msg.itemId, msg.pageIndex, msg.pageCount, (err, user) => {
        utils.next(next, err, user);
    });
}

//资产变动记录数量
Handler.prototype.financeChangeCount = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session, null);
    if (!userSession) {
        return utils.nextError(next);
    }
    pomelo.app.rpc.user.userRemote.financeChangeCount(null, userSession.toJson(), msg.itemId, (err, user) => {
        utils.next(next, err, user);
    });
}

/**
 * @api connector.authorizationHandler.relogin
 * @param {*} msg 
 * @param {*} session 
 * @param {*} next 
 */
Handler.prototype.relogin = function (msg, session, next) {
    if (!utils.isString(msg.game, 1)) {
        utils.nextError(next);
        return;
    }

    let userSession = UserSession.fromBackendSession(session);
    if (!userSession) {
        utils.nextError(next);
        return;
    }

    pomelo.app.rpc.user.authorizationRemote.relogin(null, userSession.toJson(), msg.game, (e, d) => {
        if (e) {
            return utils.next(next, e);
        }

        let data = GameManager.getInstance().getData(msg.game, 'zone.match');
        if (!data) {
            console.error('no room data: ', msg.game);
            return;
        }

        let params = _.map(data.zone.areas, area => {
            let options = JSON.stringify(area.params);
            return { area: area.id, play: 0, options };
        });

        return utils.nextOK(next, params);

        // model.RoomParams.findAll({ where: { game: msg.game } }).then(params => {
        //     utils.nextOK(next, params);
        // }).catch(err => {
        //     utils.nextError(next, err);
        // });
    });
};


/**
 * @api {request} connector.authorizationHandler.fastLogin 快速登录
 * @apiGroup User
 * @apiParam {string} game 游戏
 * @apiParam {string} account 账号 - uid
 */
Handler.prototype.fastLogin = function (msg, session, next) {
    if (!utils.isString(msg.game, 1)) {
        utils.nextError(next);
        return;
    }

    if (!utils.isString(msg.account, 1, 255)) {
        utils.nextError(next);
        return;
    }

    let userSession = UserSession.fromLoginBackendSession(session, msg.game);
    rpc.fastLogin(userSession, msg.account, msg.gps || null, (err, user) => {
        err ? utils.next(next, err) : utils.nextOK(next, user);
    });
};

module.exports = (app) => new Handler(app);