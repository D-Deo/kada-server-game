const constants = require('../common/constants');
const db = require('../db');
const utils = require('../utils');

let dao = module.exports = {};

dao.create = (data, cb) => {
    db.insert('user_pay', data, cb);
};

dao.push = (id, cb) => {
    db.update('user_pay', { id }, {
        // state: 1,
        push: 1
    }, cb);
};

dao.get = (id, cb) => {
    db.find('user_pay', { id }, cb);
};

dao.list = (userId, cb) => {
    db.list('user_pay', { userId }, cb);
};

dao.add = (params, cb) => {
    db.call('proc_user_pay', params, cb);
};
