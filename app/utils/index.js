const constants = require('./../common/constants');
const data = require('./../data');
const _ = require('underscore');


let utils = module.exports = {};


utils.date = require('./date');
utils.item = require('./item');
utils.number = require('./number');
utils.poker = require('./poker');
utils.pomelo = require('./pomelo');
utils.score = require('./score');
utils.sql = require('./sql');
utils.string = require('./string');
utils.helper = require('./helper');


utils.cb = (cb, err, msg) => {
    cb && cb(err || null, err ? null : (_.isUndefined(msg) ? null : msg));
};


utils.cbBusy = () => {
    utils.cb(cb, constants.ResultCode.SERVER_BUSY(), msg);
};


utils.cbError = (cb, msg) => {
    utils.cb(cb, constants.ResultCode.ERROR(), msg);
};


utils.cbItemNotEnough = (cb, item) => {
    if(utils.isNumber(item)) {
        item = data.getItemName(item);
    }

    let err = _.clone(constants.ResultCode.ITEM_NOT_ENOUGH());
    err.msg = item + err.msg;
    utils.cb(cb, err);
};


utils.cbItemTooMuch = (cb, item) => {
    if(utils.isNumber(item)) {
        item = data.getItemName(item);
    }

    let err = _.clone(constants.ResultCode.ITEM_TOO_MUCH());
    err.msg = item + err.msg;
    utils.cb(cb, err);
};


utils.cbOK = (cb, msg) => {
    utils.cb(cb, null, msg);
};


utils.cbProm = (cb, p) => {
    p.catch(console.log);
    p.then(d => utils.cbOK(cb, d))
    .catch(e => utils.cb(cb, e));
};


utils.cr = (res, code) => {
    return res.code === code.code;
};


utils.crOK = (res) => {
    return utils.cr(res, constants.ResultCode.OK());
};


utils.createFakeIp = () => {
    return _.random(0, 255) + '.' + _.random(0, 255) + '.' + _.random(0, 255) + '.' + _.random(0, 255);
};


utils.invokeCallback = function(cb) {
    if(!cb){
        return;
    }

    cb.apply(null, _.rest(arguments));
};


utils.isArray = (arr, min, max) => {
    if(!_.isArray(arr)) {
        return false;
    }

    return utils.isBetween(arr.length, min, max);
};


utils.isNumberArray = (arr, min, max) => {
    if(!utils.isArray(arr)) {
        return false;
    }

    return _.every(arr, (n) => utils.isNumber(n, min, max));
};


utils.isObjectArray = (arr, min, max) => {
    if(!utils.isArray(arr, min, max)) {
        return false;
    }

    return _.every(arr, (a) => _.isObject(a));
};


utils.isSingletonArray = (arr) => {
    return _.uniq(arr).length === arr.length;
};


utils.isBetween = (n, i, a) => {
    if (!_.isUndefined(i) && !_.isNull(i) && n < i) {
        return false;
    }

    return !(!_.isUndefined(a) && !_.isNull(a) && n > a);
};


utils.isNumber = (num, min, max) => {
    if(!_.isNumber(num)){
        return false;
    }

    if(_.isNaN(num)) {
        return false;
    }

    return utils.isBetween(num, min, max);
};


utils.isId = (id) => {
    return utils.isNumber(id, 1);
};


utils.isItemsObject = (obj) => {
    if(!_.isObject(obj)) {
        return false;
    }

    if(_.some(_.keys(obj), (id) => !utils.isId(parseInt(id)))) {
        return false;
    }

    return _.every(_.values(obj), (c) => utils.isNumber(c));
};


utils.isOK = (err) => {
    return err.code === constants.ResultCode.OK().code;
};


utils.isString = (value, min, max) => {
    if(!_.isString(value)){
        return false;
    }

    return utils.isBetween(value.length, min, max);
};


utils.next = (next, code, msg) => {
    code = code || constants.ResultCode.OK();
    next(null, {code: code.code, msg: (_.isUndefined(msg) || _.isNull(msg)) ? code.msg : msg});
};


utils.nextError = (next, msg) => {
    utils.next(next, constants.ResultCode.ERROR(), msg);
};


utils.nextOK = (next, msg) => {
    utils.next(next, constants.ResultCode.OK(), msg);
};


utils.nextProm = (next, p) => {
    p.catch(console.log);
    p.then(d => utils.nextOK(next, d))
    .catch(e => utils.next(next, e));
};


utils.randomArray = (arr) => {
    return arr[_.random(0, arr.length - 1)];
};


utils.randomId = (length) => {
    let id = _.random(0, Math.pow(10, length) - 1) + '';
    _.times(constants.PRIVATE_ROOM_ID_LENGTH() - id.length, () => id = '0' + id);
    return id;
};


utils.randomObject = (obj) => {
    return obj[utils.randomArray(_.keys(obj))];
};


utils.response = (res, code, msg) => {
    code = code || constants.ResultCode.OK();
    res.json({code: code.code, msg: (_.isUndefined(msg) || _.isNull(msg)) ? code.msg : msg});
    res.end();
};


utils.responseError = (res, msg) => {
    utils.response(res, constants.ResultCode.ERROR(), msg);
};


utils.responseOK = (res, msg) => {
    utils.response(res, constants.ResultCode.OK(), msg);
};

utils.printCards = (cards) => {
    let rs = '';
    _.each(cards, (c) => {
        let s = '';
        switch (c.suit) {
            case constants.Poker.CardSuit.DIAMOND():
                s += '方片';
                break;
            case constants.Poker.CardSuit.CLUB():
                s += '草花';
                break;
            case constants.Poker.CardSuit.HEART():
                s += '红桃';
                break;
            case constants.Poker.CardSuit.SPADE():
                s += '黑桃';
                break;
        }
        switch (c.point) {
            case constants.Poker.CardPoint.ACE():
                s += 'A';
                break;
            case constants.Poker.CardPoint.JACK():
                s += 'J';
                break;
            case constants.Poker.CardPoint.QUEEN():
                s += 'Q';
                break;
            case constants.Poker.CardPoint.KING():
                s += 'K';
                break;
            default:
                s += '' + c.point;
                break;
        }
        rs += rs.length > 0 ? ',' + s : s;
    });
    return '<' + rs + '>';
};