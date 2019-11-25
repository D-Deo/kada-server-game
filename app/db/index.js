const conf = require('../../config/db.json');
const cons = require('../common/constants');
const Sequelize = require('sequelize');
const utils = require('../utils');
const _ = require('underscore');
const logger = require('log4js').getLogger('crontab');

let db = module.exports = {};


db.sequelize = new Sequelize(conf.database, conf.user, conf.password, {
    dialect: 'mysql',
    host: conf.host,

    port: conf.port,
    logging: false,
    operatorsAliases: false,
    timezone: '+08:00',

    define: {
        timestamps: false
    },

    pool: {
        max: conf.pool,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});


db.query = (sql, options, cb) => {
    let p = db.sequelize.query(sql, options);
    p = p.catch(e => {
        console.error(e);
        return Promise.reject(cons.ResultCode.ERROR());
    });
    return _.isFunction(cb) ? utils.cbProm(cb, p) : p;
};


db.call = (proc, params, cb) => {
    return db.query(utils.sql.toCallSql(proc, params), {
        replacements: params,
        type: Sequelize.QueryTypes.SELECT
    }, cb);
};


db.delete = (table, params, cb) => {
    return db.query(utils.sql.toDeleteSql(table, params), {
        replacements: params,
        type: Sequelize.QueryTypes.DELETE
    }, cb);
};


db.find = (table, params, cb) => {
    let p = db.query(utils.sql.toFindSql(table, params), {
        replacements: params,
        type: Sequelize.QueryTypes.SELECT
    });
    p = p.then(d => _.first(d));
    return _.isFunction(cb) ? utils.cbProm(cb, p) : p;
};


db.insert = (table, params, cb) => {
    let p = db.query(utils.sql.toInsertSql(table, params), {
        replacements: params,
        type: Sequelize.QueryTypes.INSERT
    });
    p = p.then(d => _.first(d));
    return _.isFunction(cb) ? utils.cbProm(cb, p) : p;
};


db.list = (table, params, cb) => {
    return db.query(utils.sql.toListSql(table, params), {
        replacements: params,
        type: Sequelize.QueryTypes.SELECT
    }, cb);
};


db.update = (table, filter, data, cb) => {
    let params = [];

    let dsql = _.map(data, (v, k) => {
        params.push(v);
        return '`' + k + '` = ?';
    });
    dsql = dsql.join(', ');

    let fsql = _.map(filter, (v, k) => {
        params.push(v);
        return '`' + k + '` = ?';
    });
    fsql = fsql.join(' AND ');

    let sql = 'UPDATE `' + table + '` SET ' + dsql + (_.isEmpty(filter) ? '' : ' WHERE ') + fsql;

    return db.query(sql, {
        replacements: params
    }, cb);
};
