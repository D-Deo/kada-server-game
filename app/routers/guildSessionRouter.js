const constants = require('../common/constants');
const UserSession = require('../session/userSession');
const _ = require('underscore');


module.exports = () => {
    return (session, msg, app, cb) => {
        let userSession = UserSession.fromBackendSession(session);
        let server = _.find(app.getServersByType('guild'), (s) => s.game === userSession.getGame());
        if(!server) {
            console.error('Guild Session Router Error: ', userSession.getGame());
            cb(constants.ResultCode.ROUTE_ERROR());
            return;
        }

        cb(null, server.id);
    };
};