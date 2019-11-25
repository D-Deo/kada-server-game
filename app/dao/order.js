const constants = require('../common/constants');
const db = require('../db');
const utils = require('../utils');


let dao = module.exports = {};


dao.create = (data, cb) => {
    db.insert('order', data, cb);
};


dao.commit = (id, cb) => {
    db.update('order', {id}, {state: constants.OrderState.FINISH()}, cb);
};


dao.get = (id, cb) => {
    db.find('order', {id}, (err, data) => utils.invokeCallback(cb, data));
};