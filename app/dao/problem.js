const constants = require('../common/constants');
const db = require('../db');
const utils = require('../utils');


let dao = module.exports = {};


dao.create = (data, cb) => {
    db.insert('problem', data, cb);
};


dao.commit = (id, cb) => {
    db.update('problem', {
        id
    }, {

    }, cb);
};


dao.get = (reporterId, cb) => {
    db.list('problem', {
        reporterId
    }, cb);
};