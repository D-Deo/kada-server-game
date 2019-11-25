const constants = require('../common/constants');
const _ = require('underscore');


module.exports = (type) => {
    return (game, msg, app, cb) => {
        let server = _.find(app.getServersByType(type), (s) => {
            return _.contains(s.game.split(','), game);
        });

        if(!server) {
            console.error('Game Router Error: ', type, '-', game);
            cb(constants.ResultCode.ROUTE_ERROR());
            return;
        }

        cb(null, server.id);
    };
};