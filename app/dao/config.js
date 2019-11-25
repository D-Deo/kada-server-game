const db = require('../db');
const utils = require('../utils');
const _ = require('underscore');

let dao = module.exports = {};

dao.list = (cb) => {
    db.list('config', {
    }, cb);
};