const _ = require('underscore');


let util = module.exports = {};


util.toAssignmentSql = (params, sp = ' AND ') => {
    let sql = _.map(params, (v, k) => '`' + k + '`' + (_.isArray(v) ? ' IN ' : ' = ') + ':' + k);
    return sql.join(sp);
};


util.toCallSql = (proc, params) => {
    return 'CALL ' + proc + util.toParamSql(params);
};


util.toDeleteSql = (table, params) => {
    return 'DELETE FROM `' + table + '` ' + util.toWhereSql(params);
};


util.toFindSql = (table, params) => {
    return util.toListSql(table, params) + ' LIMIT 1';
};


util.toInsertSql = (table, params) => {
    return 'INSERT INTO `' + table + '` SET ' + util.toAssignmentSql(params, ', ');
};

util.toListSql = (table, params) => {
    return 'SELECT * FROM `' + table + '` ' + util.toWhereSql(params);
};

util.toParamSql = (params) => {
    return '(' + _.map(params, p => '?').join(', ') + ')';
};

util.toWhereSql = (params) => {
    let as = util.toAssignmentSql(params);
    return (_.isEmpty(as) ? '' : 'WHERE ') + as;
};