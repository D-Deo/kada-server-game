const constants = require('../common/constants');
const RoomSession = require('../session/roomSession');
const _ = require('underscore');
const logger = require('pomelo-logger').getLogger('pomelo');

module.exports = () => {
    return (session, msg, app, cb) => {
        let roomSession = RoomSession.fromBackendSession(session);
        if (!roomSession) {
            logger.warn('Room Session Router Error: unkown session');
            cb(constants.ResultCode.ROUTE_ERROR());
            return;
        }

        let server = _.find(app.getServersByType('room'), (s) => s.id === roomSession.getServerId());
        if (!server) {
            logger.warn('Room Session Router Error: ', roomSession.getServerId());
            cb(constants.ResultCode.ROUTE_ERROR());
            return;
        }

        cb(null, server.id);
    };
};