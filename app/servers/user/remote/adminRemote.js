const async = require('async');
const constants = require('../../../common/constants');
const UserManager = require('../../../user/manager');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.changeItems = function(userId, items, reason, cb){
    let user = UserManager.get().getUserById(userId);
    if(!user) {
        utils.cb(cb, constants.ResultCode.USER_UNKNOWN());
        return;
    }

    utils.cbOK(cb, user.getComp('bag').changeItems(items, reason));
};


// Remote.prototype.chargeDiamond = function(userId, itemId, count, cb) {
//     let user = UserManager.get().getUserById(userId);
//     if(!user) {
//         utils.cb(cb, constants.ResultCode.USER_UNKNOWN());
//         return;
//     }
//
//     let bag = user.getComp('bag');
//     if(count < 0 && !bag.haveEnoughItem(itemId, -count)) {
//         utils.cb(cb, constants.ResultCode.USER_NOT_ENOUGH_DIAMOND());
//         return;
//     }
//
//     bag.changeItem(itemId, count, constants.ItemChangeReason.ADMIN());
//     utils.cbOK(cb, bag.toJson_ChargeDiamond());
// };


Remote.prototype.getUser = function(id, cb){
    let user = UserManager.get().getUserById(id);
    cb(user ? user.toJson(constants.UserToJsonReason.ROOM()) : null);
};


module.exports = (app) => new Remote(app);