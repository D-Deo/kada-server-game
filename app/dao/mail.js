const db = require('../db');

let dao = module.exports = {};

dao.create = (data, cb) => {
    db.insert('mail', data, cb);
};
