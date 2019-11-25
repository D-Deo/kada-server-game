const async = require('async');
const constants = require('../../../common/constants');
const UserManager = require('../../../user/manager');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


// Remote.prototype.chargeDiamond = function(userId, itemId, count, cb) {
//     let user = UserManager.get().getUserById(userId);
//     if(!user) {
//         utils.cb(cb, constants.ResultCode.USER_UNKNOWN());
//         return;
//     }
//
//     let bag = user.getComp('bag');
//     bag.changeItem(itemId, count, constants.ItemChangeReason.AGENT());
//     utils.cbOK(cb, bag.toJson_ChargeDiamond());
// };


module.exports = (app) => new Remote(app);