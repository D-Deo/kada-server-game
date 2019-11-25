const UserManager = require('../../../user/manager');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils');
const utility = require('utility');
const dao = require('../../../dao/index');
const db = require('../../../db/index');
const cons = require('../../../common/constants');
const model = require('../../../db/model');
const wx = require('../../../sdk/wx');
const _ = require('underscore');

class Handler {

    constructor(app) {
        this.app = app;
    }

    logout(msg, jsession, next) {
        let session = UserSession.fromBackendSession(jsession);
        let user = UserManager.get().getUserById(session.getUserId());
        utils.nextProm(next, user.logout());
    }

    /**
     * @api {request} user.userHandler.setDesp 设置用户备注
     * @apiGroup User
     * @apiParam {string{0..100}} desp 备注
     */
    setDesp(msg, session, next) {
        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());
        if (!utils.isString(msg.desp, 0, 100)) {
            utils.nextError(next);
            return;
        }
        user.setAttr('desp', utils.string.filterEnter(msg.desp));
        utils.nextOK(next);
    }

    /**
     * @api {request} user.userHandler.setGps 设置用户Gps信息
     * @apiGroup User
     * @apiParam {json} gps gps
     */
    setGps(msg, session, next) {
        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());
        user.setGps(msg.gps);
        utils.nextOK(next);
    }

    /**
     * @api {request} user.userHandler.setHead 设置head
     * @apiGroup User
     * @apiParam {string} head nullable
     */
    setHead(msg, session, next) {
        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());
        let head = msg.head;
        if (head !== null && !utils.isString(msg.head)) {
            utils.nextError(next);
            return;
        }
        user.setAttr('head', head);
        utils.nextOK(next);
    }

    setNick(msg, bsession, next) {
        let session = UserSession.fromBackendSession(bsession);
        let user = UserManager.get().getUserById(session.getUserId());
        if (!utils.isString(msg.nick, 1, 30)) {
            utils.nextError(next);
            return;
        }
        user.setAttr('nick', msg.nick);
        utils.nextOK(next);
    }

    setPassword(msg, session, next) {
        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());

        if (!utils.isString(msg.oldPassword, 0, 32) ||
            !utils.isString(msg.newPassword, 1, 32)) {
            utils.nextError(next);
            return;
        }

        if (msg.oldPassword) {
            msg.oldPassword = utility.md5(msg.oldPassword).toUpperCase();
        }

        if (msg.newPassword) {
            msg.newPassword = utility.md5(msg.newPassword).toUpperCase();
        }

        if (msg.oldPassword != user.getAttr('password')) {
            return utils.next(next, cons.ResultCode.USER_PASSWORD_WRONG());
        }

        user.setAttr('password', msg.newPassword);
        utils.nextOK(next);
    }

    setPassword2(msg, session, next) {
        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());

        if (!utils.isString(msg.oldPassword, 0, 32) ||
            !utils.isString(msg.newPassword, 1, 32)) {
            utils.nextError(next);
            return;
        }

        // if (user.hasbankpass) {
        //     utils.nextError(next, '手机验证码不能为空');
        //     return;
        // }

        if (msg.oldPassword) {
            msg.oldPassword = utility.md5(msg.oldPassword).toUpperCase();
        }

        if (msg.newPassword) {
            msg.newPassword = utility.md5(msg.newPassword).toUpperCase();
        }

        if (msg.oldPassword != user.getAttr('password2')) {
            return utils.next(next, cons.ResultCode.USER_BANK_PASSWORD_WRONG());
        }

        user.setAttr('password2', msg.newPassword);
        utils.nextOK(next);
    }

    /**
     * 添加银行卡
     * @param {object} msg { name: 姓名, bank: 开户银行, bankNo: 开户账号 }
     * @param {*} session 
     * @param {*} next 
     */
    addBank(msg, session, next) {
        if (!utils.isString(msg.name, 1) ||
            !utils.isString(msg.bank, 1) ||
            !utils.isString(msg.bankNo, 1)) {
            utils.nextError(next);
            return;
        }

        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());

        let name = user.getAttr('name');
        let isFirst = false;//是否第一次绑定银行卡
        if (!name) {
            isFirst = true;
        }
        if (name && name !== msg.name) {
            return utils.next(next, cons.ResultCode.USER_BANK_ADD_WRONG());
        }

        dao.userbank.get(msg.bankNo, (err, data) => {
            if (err) {
                return utils.nextError(next, err);
            }
            if (data) {
                return utils.next(next, cons.ResultCode.USER_BANK_SAME_WRONG());
            }
            dao.userbank.insert({
                userId: userSession.getUserId(),
                bank: msg.bank,
                bankNo: msg.bankNo
            }, (err, bankId) => {
                if (err) {
                    return utils.nextError(next, err);
                }

                user.setAttr('name', msg.name);
                if (!user.getAttr('bankId')) {
                    user.setAttr('bankId', bankId);
                }

                if (isFirst) {
                    model.Setting.findOne({ where: { key: 'BindBankGold' } }).then(data => {
                        user.getComp('bag').changeItem(cons.Item.GOLD(), parseInt(data.value), { from: ' ', reason: cons.ItemChangeReason.BIND_BANK() });
                        utils.nextOK(next, { bankId });
                    });
                } else {
                    utils.nextOK(next, { bankId });
                }


            });
        });
    }

    /**
     * 绑定银行卡
     * @param {object} msg { bankId: 银行卡ID } 
     * @param {*} session 
     * @param {*} next 
     */
    bindBank(msg, session, next) {
        if (!utils.isId(msg.bankId)) {
            utils.nextError(next);
            return;
        }

        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());

        user.setAttr('bankId', msg.bankId);
        utils.nextOK(next);
    }

    depositGold(msg, session, next) {
        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());
        if (!utils.isNumber(msg.count, 1)) {
            utils.nextError(next);
            return;
        }
        let bag = user.getComp('bag');
        let gold = bag.getItem(cons.Item.GOLD()).getCount(true);
        if (gold < msg.count) {
            return utils.next(next, cons.ResultCode.USER_NOT_ENOUGH_GOLD());
        }
        bag.changeItem(cons.Item.GOLD(), -msg.count, { from: ' ', reason: cons.ItemChangeReason.DEPOSIT() });
        bag.changeItem(cons.Item.BANK(), msg.count, { from: ' ', reason: cons.ItemChangeReason.DEPOSIT() });
        utils.nextOK(next);
    }

    withdrawGold(msg, session, next) {
        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());
        if (!utils.isNumber(msg.count, 1) ||
            !utils.isString(msg.password, 1, 32)) {
            utils.nextError(next);
            return;
        }
        if (!utils.isString(user.getAttr('password2'), 1)) {
            return utils.next(next, cons.ResultCode.USER_NO_BANK_PASSWORD())
        }
        if (msg.password != '') {
            msg.password = utility.md5(msg.password).toUpperCase();
        }
        if (msg.password != user.getAttr('password2')) {
            return utils.next(next, cons.ResultCode.USER_BANK_PASSWORD_ERROR());
        }
        let bag = user.getComp('bag');
        let bank = bag.getItemCount(cons.Item.BANK());
        if (bank < msg.count) {
            return utils.next(next, cons.ResultCode.USER_NO_BANK_MONEY());
        }
        bag.changeItem(cons.Item.BANK(), -msg.count, { from: ' ', reason: cons.ItemChangeReason.UNDEPOSIT() });
        bag.changeItem(cons.Item.GOLD(), msg.count, { from: ' ', reason: cons.ItemChangeReason.UNDEPOSIT() });
        utils.nextOK(next);
    }

    /**
     * 登录签到奖励
     * @api user.userHandler.loginSign
     */
    async loginSign(msg, session, next) {
        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());

        let data = await model.UserLoginReward.findOne({
            where: { userId: userSession.getUserId() },
            order: [['logTime', 'DESC']]
        });

        // 无记录表示领取第一天的奖励，有记录则判断时间是否已经是第二天或相隔几天了
        let day = 1;
        if (data) {
            let now = new Date().getDate();
            let last = new Date(data.logTime).getDate();
            if (now - last < 1) {
                return utils.next(next, cons.ResultCode.ACTIVITY_LOGIN_REWARD_GOT());
            }
            day = data.day + 1;
        }

        let activity = await model.ActivityLogin.findOne({
            where: { id: day }
        });
        if (!activity) {
            console.warn('请注意，没有登录奖励可以领取，检查配置表是否没有当天奖励，还是恶意请求');
            return utils.nextError(next, '当前已无奖励可以领取');
        }

        db.insert('user_login_reward', {
            userId: userSession.getUserId(),
            day: activity.id,
            coin: activity.coin
        }, (err, id) => {
            if (err || !id) {
                return utils.nextError(next);
            }
            let bag = user.getComp('bag');
            bag.changeItem(cons.Item.GOLD(), activity.coin, { reason: cons.ItemChangeReason.ACTIVITY_LOGIN() });
            utils.nextOK(next);
        });
    }

    wxRecharge(msg, session, next) {
        let userSession = UserSession.fromBackendSession(session);
        let user = UserManager.get().getUserById(userSession.getUserId());

        if (!utils.isNumber(msg.index)) {
            utils.nextError(next);
            return;
        }

        let orderId = utility.md5(new Date().getTime() + '' + _.random(1000, 9999) + '' + user.getAttr('id'));
        const fees = [800, 2400, 4000, 10000, 20000, 40000, 60000, 80000];
        const gem = [10, 30, 50, 125, 280, 620, 1000, 1460];

        wx.unifiedorder(orderId, fees[msg.index], '猪猪在线--游戏充值' + msg.index, (code, ret) => {
            if (code) {
                return utils.next(next, code);
            }

            dao.userpay.add([orderId, user.getAttr('id'), fees[msg.index] / 100, 1, 'ad_wx', 0, '', gem[msg.index] * 100.0 / fees[msg.index]], (err) => {
                if (err) {
                    console.error(err);
                    return utils.nextError(next);
                }
                utils.nextOK(next, ret);
            });
        });
    }
}

module.exports = (app) => new Handler(app);