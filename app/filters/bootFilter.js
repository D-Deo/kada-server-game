const constants = require('../common/constants');
const Inspector = require('../inspector/inspector');


module.exports = function(msg, session, next) {
    next(Inspector.get().isEnabled('booted') ? null : constants.ResultCode.SERVER_BOOTING());
};