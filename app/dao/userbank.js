const db = require('../db');
const utils = require('../utils');
const _ = require('underscore');

let dao = module.exports = {};

dao.insert = (data, cb) => {
    data.createTime = utils.date.timestamp();
    data.updateTime = data.createTime;
    db.insert('user_bank', data, cb);
};

dao.update = (id, data, cb) => {
    data.updateTime = utils.date.timestamp();
    db.update('user_bank', { id }, data, cb);
};

dao.list = (id, cb) => {
    db.list('user_bank', { id }, cb);
};

dao.get = (bankNo, cb) => {
    db.find('user_bank', { bankNo }, cb);
};
