const constants = require('../common/constants');
const db = require('../db');
const utils = require('../utils');

let dao = module.exports = {};

dao.create = (data, cb) => {
    db.insert('user_withdraw', data, cb);
};

dao.push = (id, cb) => {
    db.update('user_withdraw', {
        id
    }, {
            state: 1
        }, cb);
};

dao.get = (id, cb) => {
    db.find('user_withdraw', {
        id
    }, cb);
};

dao.list = (userId, cb) => {
    db.list('user_withdraw', {
        userId
    }, cb);
}