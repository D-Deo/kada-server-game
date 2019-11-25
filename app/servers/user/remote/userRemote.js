const cons = require('../../../common/constants');
const UserManager = require('../../../user/manager');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils');
const validator = require('../../../user/attrValidator');
const _ = require('underscore');
const utility = require('utility');
const dao = require('../../../dao/index');
const db = require('../../../db/model');
const logger = require('pomelo-logger').getLogger('user-remote', __filename);


function Remote(app) {
    this.app = app;
}


Remote.prototype.bindAgent = function (id, agentId, agentNick, reward, cb) {
    let user = UserManager.get().getUserById(id);
    if (!user) {
        return utils.cb(cb);
    }

    user.setAttrs({ agentId, agentNick }, { ignoreSave: true });
    // user.getComp('bag').changeItems(reward, { reason: cons.ItemChangeReason.BIND_AGENT() });
    utils.cb(cb);
};



Remote.prototype.bindAccount = function (id, account, password, cb) {
    let manager = UserManager.get();

    let user = manager.getUserById(id);
    if (!user) {
        return utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
    }

    if (!account || manager.getUserByAccount(account)) {
        return utils.cb(cb, cons.ResultCode.USER_ACCOUNT_USED());
    }

    password = utility.md5(password).toUpperCase();

    manager.removeUser(user);
    user.setAttrs({
        account,
        password,
        type: 11
    });
    manager.addUser(user);

    db.Setting.findOne({ where: { key: 'BindUserGold' } }).then(data => {
        user.getComp('bag').changeItem(cons.Item.GOLD(), parseInt(data.value) || 0, { from: account + ':' + password, reason: cons.ItemChangeReason.BIND_PHONE() });
        utils.cbOK(cb);
    });
};

Remote.prototype.bindPhone = function (id, phone, password, cb) {
    let manager = UserManager.get();
    let user = manager.getUserById(id);
    if (!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    if (UserManager.get().getUserByPhone(phone)) {
        utils.cb(cb, cons.ResultCode.USER_BINDED_PHONE());
        return;
    }

    let from = user.getAttr('phone');
    if (from) {
        utils.cb(cb, cons.ResultCode.USER_REBIND_PHONE());
        return;
    }

    let reward = {};
    reward[cons.Item.BIND_DIAMOND()] = cons.USER_BIND_PHONE_REWARD();
    if (password != null && password != '') {
        password = utility.md5(password).toUpperCase();
    }

    manager.removeUser(user);
    user.setAttrs({
        // name: name,
        account: phone,
        phone,
        password,
        type: 11
    });
    user.getComp('bag').changeItems(reward, { reason: cons.ItemChangeReason.BIND_PHONE() });
    manager.addUser(user);
    //manager.remapUserByPhone(id, from, phone);
    utils.cbOK(cb, reward);
};


Remote.prototype.getUser = function (id, reason, cb) {
    let user = UserManager.get().getUserById(id);
    cb(user.toJson(null, reason));
};


Remote.prototype.setAgents = function (ids, agentId, agentNick, cb) {
    _.each(ids, (id) => {
        let user = UserManager.get().getUserById(id);
        if (!user) {
            return;
        }

        user.setAttrs({ agentId, agentNick }, { ignoreSave: true });
    });
    utils.cb(cb);
};


Remote.prototype.setPassword = function (account, password, cb) {
    let user = UserManager.get().getUserByAccount(account);
    if (!user) {
        utils.cbError(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    if (password != '') {
        password = utility.md5(password).toUpperCase();
    }

    user.setAttr('password', password, {
        ignoreAction: true
    });
    utils.cbOK(cb);
};

Remote.prototype.setPassword2 = function (account, password, cb) {
    let user = UserManager.get().getUserByAccount(account);
    if (!user) {
        utils.cbError(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    if (password != '') {
        password = utility.md5(password).toUpperCase();
    }

    user.setAttr('password2', password, {
        ignoreAction: true
    });

    utils.cbOK(cb);
};

Remote.prototype.resetpwd = function (account, password, password2, cb) {
    let user = UserManager.get().getUserByAccount(account);
    if (!user) {
        utils.cbError(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    if (password != '') {
        password = utility.md5(password).toUpperCase();
        user.setAttr('password', password, {
            ignoreAction: true,
            resetpwd: true
        });
    }

    if (password2 != '') {
        password2 = utility.md5(password2).toUpperCase();
        user.setAttr('password2', password2, {
            ignoreAction: true,
            resetpwd: true
        });
    }

    utils.cbOK(cb);
};

Remote.prototype.resetname = function (userId, name, nick, cb) {
    let user = UserManager.get().getUserById(userId);
    if (!user) {
        utils.cbError(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    if (name && name != '') {
        user.setAttr('name', name);
    }

    /*if (nick != '') {
        user.setAttr('nick', nick, {
            ignoreAction: true
        });
    }*/

    utils.cbOK(cb);
};

Remote.prototype.setRecommender = function (id, recommender, cb) {
    if (id === recommender) {
        utils.cbError(cb);
        return;
    }

    let manager = UserManager.get();
    let user = manager.getUserById(id);
    if (!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    let comp = user.getComp('recommender');
    if (!recommender) {
        comp.setParent(recommender);
        utils.cbOK(cb);
        return;
    }

    let parent = manager.getUserById(recommender);
    if (!parent) {
        utils.cb(cb, cons.ResultCode.USER_RECOMMENDER_UNKNOWN());
        return;
    }

    if (parent.getComp('recommender').isAncestor(user)) {
        utils.cb(cb, cons.ResultCode.USER_RECOMMENDER_ANCESTOR());
        return;
    }

    comp.setParent(parent);
    utils.cbOK(cb);
};


Remote.prototype.logout = function (jsession, cb) {
    let session = UserSession.fromJson(jsession);
    let user = UserManager.get().getUserById(session.getUserId());
    if (!user.isLogining(session)) {
        utils.cbError(cb);
        return;
    }
    utils.cbProm(cb, user.logout());
};


Remote.prototype.setAttrs = function (id, attrs, cb) {
    let user = UserManager.get().getUserById(id);
    if (!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    attrs = validator.attrs(attrs);
    if (!attrs) {
        utils.cbError(cb);
        return;
    }

    user.setAttrs(attrs);
    utils.cbOK(cb);
};


Remote.prototype.suspend = function (id, state, cb) {
    let user = UserManager.get().getUserById(id);
    if (!user) {
        return utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
    }

    if (state == cons.UserState.SUSPENDED()) {
        if (user.isSuspended()) {
            return utils.cb(cb, cons.ResultCode.USER_RESUSPEND());
        }
        user.logout(cons.UserKick.SUSPEND());
    }

    user.setAttr('state', state);
    utils.cbOK(cb);
};


Remote.prototype.unsuspend = function (id, cb) {
    let user = UserManager.get().getUserById(id);
    if (!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    // if (!user.isSuspended()) {
    //     utils.cb(cb, cons.ResultCode.USER_REUNSUSPEND());
    //     return;
    // }

    user.setAttr('state', cons.UserState.NORMAL());
    utils.cbOK(cb);
};

Remote.prototype.pushMail = function (ids, cb) {
    let even = _.reject(ids, (id) => {
        let user = UserManager.get().getUserById(id);
        if (!user) return true;
        user.send(cons.PushMail.ACTION(), { redpoint: { mail: true } });
    });
    utils.cbOK(cb, even);
};

Remote.prototype.completePay = function (orderId, money, commit, cb) {
    dao.userpay.get(orderId, (err, userpay) => {
        if (err) {
            utils.cb(cb, err);
            return;
        }

        if (!userpay) {
            utils.cb(cb, cons.ResultCode.USERPAY_UNKNOWN());
            return;
        }

        // if (userpay.state != cons.UserPayState.INITIAL()) {
        //     utils.cb(cb, cons.ResultCode.USERPAY_ERRORSTATE());
        //     return;
        // }

        if (userpay.push != cons.UserPushState.INITIAL()) {
            utils.cb(cb, cons.ResultCode.USERPAY_PUSHED());
            return;
        }

        if (userpay.money !== money) {
            utils.cb(cb, cons.ResultCode.USERPAY_ERRORMONEY());
            return;
        }

        let user = UserManager.get().getUserById(userpay.userId);
        if (!user) {
            utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
            return;
        }

        user.getComp('bag').changeItem(cons.Item.DIAMOND(), money * userpay.rate, {
            from: orderId,
            reason: commit ? cons.ItemChangeReason.USERPAY_Manual() : cons.ItemChangeReason.USERPAY()
        });
        user.setAttr('payTotal', user.getAttr('payTotal') + money * userpay.rate, { ignoreSave: true });

        dao.mail.create({
            userId: userpay.userId,
            caption: '充值成功',
            content: '本次充值￥' + Math.floor(money) + '成功，如发现没有到账，可联系客服。',
            items: '',
            send_time: utils.date.timestamp(),
            timestamp: utils.date.timestamp(),
            status: 1
        }, (err) => {
            if (err) {
                console.error(err);
                return utils.cbError(cb);
            }
            user.send(cons.PushMail.ACTION(), { redpoint: { mail: true } });

            dao.userpay.push(orderId, (err, data) => {
                if (err) {
                    utils.cb(cb, null, err);
                    return;
                }
                utils.cbOK(cb);
            });
        });
    });
}

Remote.prototype.completeApplePay = function (userId, money, cb) {

    let user = UserManager.get().getUserById(userId);
    if (!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    user.getComp('bag').changeItem(cons.Item.GOLD(), money * 100, {
        from: '',
        reason: commit ? cons.ItemChangeReason.USERPAY_Manual() : cons.ItemChangeReason.USERPAY()
    });

    utils.cbOK(cb);
}

Remote.prototype.reportProblem = function (jsession, type, msg, cb) {
    let session = UserSession.fromJson(jsession);

    dao.problem.create({
        reporterId: session.getUserId(),
        type,
        msg,
        status: 0
    }, (err, data) => {
        if (err) {
            utils.cb(cb, null, err);
            return;
        }
        utils.cbOK(cb, data);
    });
};

Remote.prototype.responseProblem = function (jsession, cb) {
    let session = UserSession.fromJson(jsession);
    let user = UserManager.get().getUserById(session.getUserId());

    dao.problem.get(user.id, (err, data) => {
        if (err) {
            utils.cb(cb, null, err);
            return;
        }
        utils.cbOK(cb, data);
        return;
    });
};

Remote.prototype.rechargeRecord = function (jsession, cb) {
    let session = UserSession.fromJson(jsession);
    let user = UserManager.get().getUserById(session.getUserId());

    dao.userpay.list(user.id, (err, data) => {
        if (err) {
            utils.cb(cb, null, err);
            return;
        }
        utils.cbOK(cb, data);
        return;
    });
}

Remote.prototype.withdraw = function (userId, coin, name, bank, bankNo, cb) {
    let user = UserManager.get().getUserById(userId);
    if (!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    let bag = user.getComp('bag');
    let gold = bag.getItem(cons.Item.GOLD()).getCount(true);
    if (gold < coin) {
        return utils.cbError(cb, '金币不足');
    }

    let id = 'p' + _.now() + _.random(100000, 999999);
    let money = coin / 100;

    dao.userwithdraw.create({
        id: id,
        userId: userId,
        money: money,
        coin: coin,
        name: name,
        bank: bank,
        bankNo: bankNo,
    }, (err, data) => {
        if (err) {
            return utils.cb(cb, null, err);
        }
        bag.changeItem(cons.Item.GOLD(), -coin, { from: '', reason: cons.ItemChangeReason.WITHDRAW() });
        utils.cbOK(cb);
    });
};

// Remote.prototype.withdrawAction = function (jsession, msg, cb) {
//     let session = UserSession.fromJson(jsession);
//     let user = UserManager.get().getUserById(session.getUserId());
//     let bag = user.getComp('bag');
//     let gold = bag.getItem(cons.Item.GOLD()).getCount(true);
//     if (gold < msg.coin) {
//         utils.nextError(next, '金币不足');
//         return;
//     }

//     let id = 'p' + _.now() + _.random(100000, 999999);

//     dao.userwithdraw.create({
//         id: id,
//         userId: msg.userId,
//         money: msg.money,
//         coin: msg.coin,
//         name: msg.name,
//         bank: msg.bank,
//         bankNo: msg.bankNo,
//         reason: msg.reason
//     }, (err, data) => {
//         if (err) {
//             utils.cb(cb, null, err);
//             return;
//         }
//         bag.changeItem(cons.Item.GOLD(), -msg.coin, { from: ' ', reason: cons.ItemChangeReason.WITHDRAW() });
//         utils.cbOK(cb);
//         return;
//     });
// };


Remote.prototype.withdrawRecord = function (jsession, cb) {
    let session = UserSession.fromJson(jsession);
    let user = UserManager.get().getUserById(session.getUserId());

    dao.userwithdraw.list(user.id, (err, data) => {
        if (err) {
            utils.cb(cb, null, err);
            return;
        }
        data = _.sortBy(data, (d) => d.createTime);
        data = data.reverse();
        utils.cbOK(cb, data);
        return;
    });
};

Remote.prototype.completeWithdraw = function (orderId, money, cb) {
    dao.userwithdraw.get(orderId, (err, userwithdraw) => {
        if (err) {
            utils.cbError(cb, err);
            return;
        }

        if (!userwithdraw) {
            utils.cb(cb, cons.ResultCode.USERWITHDRAW_UNKNOWN());
            return;
        }

        if (userwithdraw.state != cons.UserPayState.INITIAL()) {
            utils.cb(cb, cons.ResultCode.USERWITHDRAW_ERRORSTATE());
            return;
        }

        // if (userwithdraw.push === 1) {
        //     utils.cb(cb, cons.ResultCode.USERWITHDRAW_PUSHED());
        //     return;
        // }

        if (userwithdraw.money !== money) {
            utils.cb(cb, cons.ResultCode.USERWITHDRAW_ERRORMONEY());
            return;
        }

        let user = UserManager.get().getUserById(userwithdraw.uid);
        if (!user) {
            utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
            return;
        }

        let gold = money * userpay.rate;

        if (user.getItemCount(cons.Item.BANK()) < gold) {
            utils.cb(cb, cons.ResultCode.USER_NOT_ENOUGH_BANKGOLD());
            return;
        }

        user.getComp('bag').changeItem(cons.Item.BANK(), -gold, {
            from: ' ',
            reason: cons.ItemChangeReason.WITHDRAW()
        });

        dao.userwithdraw.push(orderId, (err, data) => {
            if (err) {
                utils.cb(cb, null, err);
                return;
            }

            utils.cbOK(cb);
        });
    });
}

/**
 * 提现拒绝
 * @param {string} orderId 
 * @param {number} money 
 * @param {*} cb 
 */
Remote.prototype.refuseWithdraw = function (orderId, money, cb) {
    dao.userwithdraw.get(orderId, (err, userwithdraw) => {
        if (err) {
            utils.cbError(cb, err);
            return;
        }

        if (!userwithdraw) {
            utils.cb(cb, cons.ResultCode.USERWITHDRAW_UNKNOWN());
            return;
        }

        if (userwithdraw.state != cons.UserPayState.INITIAL()) {
            utils.cb(cb, cons.ResultCode.USERWITHDRAW_ERRORSTATE());
            return;
        }

        if (userwithdraw.money !== money) {
            utils.cb(cb, cons.ResultCode.USERWITHDRAW_ERRORMONEY());
            return;
        }

        let user = UserManager.get().getUserById(userwithdraw.userId);
        if (!user) {
            utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
            return;
        }

        let item = {};
        item[cons.Item.GOLD()] = userwithdraw.coin;

        dao.mail.create({
            userId: userwithdraw.userId,
            caption: '提现失败',
            content: '本次提现￥' + userwithdraw.money + '失败，如有疑问可联系客服。',
            items: JSON.stringify(item),
            send_time: utils.date.timestamp(),
            timestamp: utils.date.timestamp(),
            status: 1
        }, (err) => {
            if (err) {
                console.error(err);
                return utils.cbError(cb);
            }
            user.send(cons.PushMail.ACTION(), { redpoint: { mail: true } });
            utils.cbOK(cb);
            // dao.userwithdraw.push(orderId, (err, data) => {
            //     if (err) {
            //         console.error(err);
            //         return utils.cbError(cb, err);
            //     }
            //     utils.cbOK(cb);
            // });
        });
    });
};

//提现下单
Remote.prototype.financeChangeRecord = function (jsession, itemId, pageIndex, pageCount, cb) {
    let session = UserSession.fromJson(jsession);
    let user = UserManager.get().getUserById(session.getUserId());

    dao.itemrecord.financeChangeRecord(user.id, itemId, pageIndex, pageCount, (err, data) => {
        if (err) {
            utils.cb(cb, null, err);
            return;
        }
        utils.cbOK(cb, data);
        return;
    });
};

Remote.prototype.financeChangeCount = function (jsession, itemId, cb) {
    let session = UserSession.fromJson(jsession);
    let user = UserManager.get().getUserById(session.getUserId());

    dao.itemrecord.financeChangeCount(user.id, itemId, (err, data) => {
        if (err) {
            utils.cb(cb, null, err);
            return;
        }
        utils.cbOK(cb, data);
        return;
    });
};

module.exports = (app) => new Remote(app);