const constants = require('../common/constants');
const pomelo = require('pomelo');
const _ = require('underscore');


module.exports = (type) => {
    return (id, msg, app, cb) => {
        let server = _.find(app.getServersByType(type), (s) => s.id === id);
        if (!server) {
            console.error('Id Router Error: ', type, '-', id);
            cb(constants.ResultCode.ROUTE_ERROR());
            return;
        }

        cb(null, id);
    };
};