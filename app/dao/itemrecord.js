const db = require('../db');
const logger = require('log4js').getLogger('item');
const model = require('../db/model');
const utils = require('../utils');
const cons = require('../common/constants');
const _ = require('underscore');

let dao = module.exports = {};

dao.financeChangeRecord = (userId, itemId, pageIndex, pageCount, cb) => {
    db.call('proc_finance_changerecord', [userId, itemId, pageIndex, pageCount], (err, data) => {
        let rows = data[0];
        let records = [];
        _.each(rows, row => {
            let r = {
                id: row.id,
                timestamp: row.timestamp,
                count: row.count,
                game: row.game,
                reason: row.reason
            };

            records.push(r);
        });
        utils.invokeCallback(cb, err, records);
    });
};

dao.financeChangeCount = (userId, itemId, cb) => {
    let params = [userId, itemId];
    db.query('select count(*) cnt from item_record where userid = ? and itemid = ?',
        {
            replacements: params
        }, (err, data) => {
            let rows = data[0];
            utils.invokeCallback(cb, err, rows[0].cnt);
        });
};