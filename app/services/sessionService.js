const constants = require('../common/constants');
const utils = require('../utils');
const _ = require('underscore');


class SessionService {
    constructor() {
        this.timestamps = {};
    }

    isRequestingTooOften(route) {
        if(!utils.date.isExpired(this.timestamps[route], constants.REQUEST_FREQUENCY())) {
            return true;
        }
        this.timestamps[route] = _.now();
        return false;
    }
}


module.exports = SessionService;