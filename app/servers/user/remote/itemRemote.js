const cons = require('../../../common/constants');
const UserManager = require('../../../user/manager');
const utils = require('../../../utils');
const _ = require('underscore');


function Remote(app) {
    this.app = app;
}


Remote.prototype.changeItem = function(userId, itemId, count, exts, cb) {
    let user = UserManager.get().getUserById(userId);
    if(!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    utils.cbOK(cb, user.getComp('bag').changeItem(itemId, count, exts));
};


Remote.prototype.changeItems = function(userId, items, exts, cb) {
    let user = UserManager.get().getUserById(userId);
    if(!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    utils.cbOK(cb, user.getComp('bag').changeItems(items, exts));
};


Remote.prototype.resetItems = (userId, items, exts, cb) => {
    let user = UserManager.get().getUserById(userId);
    if(!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    user.getComp('bag').resetItems(items, exts);
    utils.cbOK(cb);
};


Remote.prototype.useItem = function(userId, itemId, count, exts, cb) {
    let user = UserManager.get().getUserById(userId);
    if(!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    if(count <= 0) {
        utils.cbError(cb);
        return;
    }

    let bag = user.getComp('bag');
    if(!bag.haveEnoughItem(itemId, count, exts)) {
        utils.cbItemNotEnough(cb, itemId);
        return;
    }

    utils.cbOK(cb, bag.useItem(itemId, count, exts));
};


Remote.prototype.useItems = function(userId, items, exts, cb) {
    let user = UserManager.get().getUserById(userId);
    if(!user) {
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    let bag = user.getComp('bag');
    if(_.some(items, (c, id) => (c <= 0) || !bag.haveEnoughItem(id, c))) {
        utils.cbItemNotEnough(cb, parseInt(_.first(_.keys(items))));
        return;
    }

    utils.cbOK(cb, bag.useItems(items, exts));
};


module.exports = (app) => new Remote(app);