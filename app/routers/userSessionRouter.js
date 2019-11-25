const constants = require('../common/constants');
const UserSession = require('../session/userSession');
const _ = require('underscore');


module.exports = () => {
    return (serverId, msg, app, cb) => {
        if (!serverId) {
            console.error('User Session Router Error: No ServerId', msg);
            cb(constants.ResultCode.ROUTE_ERROR());
            return;
        }

        let server = _.find(app.getServersByType('user'), (s) => {
            return _.contains(s.connector.split(','), serverId instanceof Object ? serverId.frontendId : serverId);
        });

        if (!server) {
            console.error('User Session Router Error: No Server', serverId, msg);
            cb(constants.ResultCode.ROUTE_ERROR());
            return;
        }

        cb(null, server.id);
    };
};