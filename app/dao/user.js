const db = require('../db');
const utils = require('../utils');
const _ = require('underscore');


let dao = module.exports = {};


dao.insert = (data) => {
    data.timestamp = utils.date.timestamp();
    db.insert('user', data);
};


dao.list = (cb) => {
    db.call('proc_user_details', [], (err, result) => {
        utils.invokeCallback(cb, _.first(result));
    });
};


dao.history = (userId, recordId) => {
    db.insert('user_history', { userId, recordId, timestamp: (new Date()).toLocaleString() });
};


dao.recommender = (userId, recommender) => {
    db.call('proc_recommender_update', [userId, recommender]);
};

dao.update = (id, data, cb) => {
    db.update('user', { id }, data, cb);
};