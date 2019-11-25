const constants = require('../common/constants');
const _ = require('underscore');


module.exports = (type) => {
    return (session, msg, app, cb) => {
        let server = _.first(app.getServersByType(type));
        if(!server) {
            console.error('Type Router Error: ', type);
            cb(constants.ResultCode.ROUTE_ERROR());
            return;
        }

        cb(null, server.id);
    };
};