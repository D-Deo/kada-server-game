const db = require('../db');
const logger = require('log4js').getLogger('item');
const model = require('../db/model');
const utils = require('../utils');
const _ = require('underscore');


let dao = module.exports = {};


dao.record = (userId, itemId, count, remain, exts) => {
    let data = { userId, itemId, count, remain };
    data.game = utils.isString(exts.game) ? exts.game : null;
    data.guildId = utils.isNumber(exts.guildId) ? exts.guildId : null;
    data.from = utils.isString(exts.from) ? exts.from : null;
    data.reason = utils.isNumber(exts.reason) ? exts.reason : null;
    data.memo = utils.isString(exts.memo) ? exts.memo : null;
    data.timestamp = utils.date.timestamp();

    if (data.game && !data.from) {
        logger.warn('Item record: this is game record, but from no exist', data.game);
    }

    if (!data.reason) {
        logger.warn('Item record: reason no exist', userId, itemId, count, data.game, data.from);
    }

    let p = model.ItemRecord.create(data);
    return p.catch(e => logger.error('Item record:', e));
};


dao.records = (userId, guildId, items, reason) => {
    _.each(items, (count, itemId) => {
        if (count === 0) {
            return;
        }

        dao.record(userId, guildId, itemId, count, reason);
    });
};

dao.queue = [];
dao.lock = false;

dao.callFunc = () => {
    if (dao.queue.length == 0) return;
    dao.lock = true;
    let q = dao.queue.shift();
    // console.log(q);
    db.call('proc_item_save', q, (err) => {
        if (err) {
            console.error(err);
        }
        dao.lock = false;
        dao.callFunc();
    });
};

dao.save = (userId, itemId, count, cb) => {
    dao.queue.push([userId, itemId, count]);
    if (dao.queue.length && dao.lock == false) dao.callFunc();
    // db.call('proc_item_save', [userId, itemId, count], (err) => {
    //     if (err) {
    //         console.error(err);
    //     }
    //     callFunc();
    // });
};