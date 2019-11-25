const constants = require('../common/constants');
const PomeloRoute = require('../common/pomeloRoute');
const UserSession = require('../session/userSession');


module.exports = function(msg, session, next) {
    let route = PomeloRoute.fromString(msg.route);
    if(route.isConnector()) {
        next();
        return;
    }

    let userSession = UserSession.fromBackendSession(session);
    if(userSession) {
        next();
        return;
    }

    next(constants.ResultCode.SESSION_ERROR());
};