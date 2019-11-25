const constants = require('../../../../../common/constants');
const express = require('express');
const pomelo = require('pomelo');
const router = express.Router();
const utils = require('../../../../../utils/index');
const validator = require('../../../../../user/attrValidator');
const _ = require('underscore');
const logger = require('pomelo-logger').getLogger('http-log', __filename);

/**
 * @api {post} user.attrs 设置用户属性
 * @apiGroup user
 * @apiParam {id} userId 玩家id
 * @apiParam {json} attrs 属性object 暂时支持修改 head头像 nick昵称 phone手机号 recommender推荐人 sex性别
 */
router.post('/attrs', (req, res) => {
    let { userId, attrs } = req.body;
    attrs = validator.attrs(attrs);

    if (!utils.isId(userId) || !attrs) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.setAttrs(userId, userId, attrs, (err, msg) => {
        utils.response(res, err, msg);
    });
});

router.get('/bind/account', (req, res) => {
    let { userId, account, password } = req.query;

    userId = parseInt(userId) || null;

    if (!utils.isId(userId) ||
        !utils.isString(account, 1) ||
        !utils.isString(password, 1)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.bindAccount(userId, userId, account, password, (err, msg) => {
        err ? utils.response(res, err) : utils.responseOK(res, msg);
    });
});

router.get('/bind/phone', (req, res) => {
    let phone = req.query.phone;
    let userId = parseInt(req.query.userId);
    let password = req.query.password;

    if (!utils.isString(password, 1) ||
        !utils.isString(phone, 1) ||
        !utils.isId(userId)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.bindPhone(userId, userId, phone, password, (err, msg) => {
        err ? utils.response(res, err) : utils.responseOK(res, msg);
    });
});


router.get('/get/id', (req, res) => {
    let userId = parseInt(req.query.userId);
    if (!utils.isNumber(userId, 0)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user['adminRemote'].getUser(userId, userId, (data) => {
        if (!data) {
            utils.response(res, constants.ResultCode.USER_UNKNOWN());
            return;
        }

        let json = {};
        json.id = data.id;
        json.nick = data.nick;
        json.card = data.bag[constants.Item.ROOMCARD()] || 0;
        utils.responseOK(res, json);
    });
});


router.get('/get/nick', (req, res) => {
    let nick = req.query.nick;
    if (!utils.isString(nick, 1)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user['adminRemote'].getUsersByNick(0, nick, (data) => {
        utils.responseOK(res, _.map(data, (d) => {
            let json = {};
            json.id = d.id;
            json.nick = d.nick;
            json.card = d.bag[constants.Item.ROOMCARD()] || 0;
            return json;
        }));
    });
});

/**
 * @api {post} user/agent 玩家绑定代理
 * @class user
 * @param {string} userId 用户ID
 * @param {string} agentId 代理ID
 */
router.post('/agent', (req, res) => {
    let userId = req.body.userId;
    let agentId = req.body.agentId || null;
    let agentNick = req.body.agentNick || null;
    let reward = req.body.reward;

    // if (agentNick && !utils.isString(agentNick, 1, 30)) {
    //     utils.responseError(res);
    //     return;
    // }

    if (!utils.isId(userId)
        || !utils.isId(agentId)
        // || !utils.isItemsObject(reward)
    ) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.bindAgent(userId, userId, agentId, agentNick, reward, () => {
        utils.responseOK(res);
    });
});


router.post('/agents', (req, res) => {
    let agentNick = req.body.agentNick || null;
    let agentId = req.body.agentId || null;
    let users = req.body.users;

    if (agentNick && !utils.isString(agentNick, 1, 30)) {
        utils.responseError(res);
        return;
    }

    if (agentId && !utils.isId(agentId)) {
        utils.responseError(res);
        return;
    }

    if (!utils.isNumberArray(users, 1)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.setAgents(null, users, agentId, agentNick, () => {
        utils.responseOK(res);
    });
});


router.get('/item/charge', (req, res) => {
    let userId = parseInt(req.query.userId);
    let itemId = parseInt(req.query.itemId);
    let count = parseInt(req.query.count);

    if (!utils.isNumber(userId, 0) ||
        !utils.isNumber(itemId, constants.Item.GOLD(), constants.Item.DIAMOND()) ||
        !utils.isNumber(count, 1)) {
        utils.responseError(res);
        return;
    }
    pomelo.app.rpc.user['adminRemote'].changeItem(userId, userId, itemId, count, (result) => res.end(JSON.stringify(result)));
});

router.post('/password', (req, res) => {
    let { account, password } = req.body;

    if (!utils.isString(account, 1, 30) ||
        !utils.isString(password, 1, 30)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.setPassword(account, account, password, err => {
        utils.response(res, err);
    });
});

router.post('/password2', (req, res) => {
    let { account, password } = req.body;

    if (!utils.isString(account, 1, 30) ||
        !utils.isString(password, 1, 30)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.setPassword2(account, account, password, err => {
        utils.response(res, err);
    });
});

router.post('/resetpwd', (req, res) => {
    let { account, password, password2 } = req.body;

    if (!utils.isString(account, 1, 30) ||
        (!utils.isString(password, 1, 30) &&
            !utils.isString(password2, 1, 30))) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.resetpwd(account, account, password, password2, err => {
        utils.response(res, err);
    });
});

router.post('/resetname', (req, res) => {
    let { userId, name, nick } = req.body;

    if (!utils.isId(userId, 1) ||
        !utils.isString(name, 1, 30) &&
        !utils.isString(nick, 1, 30)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.resetname(userId, userId, name, nick, err => {
        utils.response(res, err);
    });
});



router.post('/recommender', (req, res) => {
    let { userId, recommender } = req.body;

    if (!utils.isId(userId)) {
        utils.responseError(res);
        return;
    }

    if (userId === recommender) {
        utils.responseError(res);
        return;
    }

    if (recommender && !utils.isId(recommender)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.setRecommender(userId, userId, recommender, err => {
        utils.response(res, err);
    });
});

/**
 * @api {post} user/agent/userip 玩家推广页绑定代理
 * @class user
 * @param {string} agentid 代理ID
 * @param {string} userip 用户ip
 */
router.post('/agent/userip', (req, res) => {
    let {
        agentid,
        userip
    } = req.body;

    if (!utils.isNumber(agentid, 100000, 999999999)) {
        return;
    }

    if (!_.isString(userip)) {

        return;
    }

    pomelo.app.rpc.user.userRemote.bindAgentWithIP(null, agentid, userip, err => {
        utils.response(res, err);
    });

});

router.post('/register', (req, res) => {
    let { account, device, ip, nick, password, recommender, agentId, role, type, sex, deviceid } = req.body;

    logger.debug('deviceid:' + deviceid);
    logger.debug('agentid:' + agentId);

    if (!utils.isString(account, 1, 30) ||
        !utils.isString(nick, 1, 30) ||
        !utils.isString(password, 1, 30) ||
        !utils.isNumber(role, 0) ||
        !utils.isNumber(type, 0) ||
        !utils.isNumber(sex, 0, 1)) {
        utils.responseError(res);
        return;
    }

    if (device && !utils.isString(device, 1, 255)) {
        utils.responseError(res);
        return;
    }

    if (ip && !utils.isString(ip, 1, 255)) {
        utils.responseError(res);
        return;
    }

    if (recommender && !utils.isId(recommender)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.authorizationRemote.register(null, {
        account,
        // phone: phone || null,
        device: device || null,
        ip: ip || null,
        nick,
        password,
        role,
        type,
        sex,
        agentId,
        deviceid
    }, recommender, err => {
        utils.response(res, err);
    });
});

/**
 * @api {post} /user/pay/complete 充值
 */
router.post('/pay/complete', (req, res) => {
    let {
        orderId,
        money,
        commit,
    } = req.body;

    if (!utils.isString(orderId, 1, 255) ||
        !utils.isNumber(money, 0)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.completePay(null, orderId, money, commit, err => {
        utils.response(res, err);
    });
});

/**
 * @api {post} /pay/apple/complete 苹果支付
 */
router.post('/pay/apple/complete', (req, res) => {
    let {
        userId,
        money,
    } = req.body;

    pomelo.app.rpc.user.userRemote.completeApplePay(null, userId, money, err => {
        utils.response(res, err);
    });
});

/**
 * @api {post} /user/withdraw/submit 提现
 */
router.post('/withdraw/submit', (req, res) => {
    let { userId, coin, name, bank, bankNo } = req.body;

    if (!utils.isId(userId) ||
        !utils.isNumber(coin, 1) ||
        !utils.isString(name, 1) ||
        !utils.isString(bank, 1) ||
        !utils.isString(bankNo, 1)) {
        utils.responseError(res);
        return;
    }

    //msg.userId, msg.money, msg.coin, msg.name, msg.bank, msg.bankNo, msg.reason
    pomelo.app.rpc.user.userRemote.withdraw(null, userId, coin, name, bank, bankNo, (err) => {
        utils.response(res, err);
    });
});

router.post('/withdraw/complete', (req, res) => {
    let {
        orderId,
        money
    } = req.body;

    if (!utils.isString(orderId, 1, 255) ||
        !utils.isNumber(money, 0)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.completeWithdraw(null, orderId, money, err => {
        utils.response(res, err);
    });
});

router.post('/withdraw/refuse', (req, res) => {
    let {
        orderId,
        money
    } = req.body;

    if (!utils.isString(orderId, 1, 255) ||
        !utils.isNumber(money, 0)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.refuseWithdraw(null, orderId, money, err => {
        utils.response(res, err);
    });
});

/**
 * @api {post} user/suspend
 */
router.post('/suspend', (req, res) => {
    if (!utils.isId(req.body.userId) ||
        !utils.isNumber(req.body.state)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.suspend(req.body.userId, req.body.userId, req.body.state, (err) => {
        utils.response(res, err);
    });
});

/**
 * @api {post} user/unsuspend
 */
router.post('/unsuspend', (req, res) => {
    if (!utils.isId(req.body.userId)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.userRemote.unsuspend(req.body.userId, req.body.userId, (err) => {
        utils.response(res, err);
    });
});


router.post('/mail', (req, res) => {
    let { userIds } = req.body;
    if (!utils.isArray(userIds, 0)) {
        utils.responseError(res);
        return;
    }
    pomelo.app.rpc.user.userRemote.pushMail('user-server', userIds, (err, noids) => {
        utils.response(res, err, noids);
    });
});

router.post('/marquee', (req, res) => {
    let { onoff } = req.body;
    utils.pomelo.marquee('default', '', onoff, (code, msg) => {
        utils.response(res, code, msg);
    });
});


module.exports = router;
