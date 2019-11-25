const cons = require('../../../common/constants');
const dzcons = require('../common/constants');
const numberUtil = require('../../../utils/number');
const _ = require('underscore');


let utils = module.exports = {};

utils.printType =(type, value)=> {
    let s = '';
    switch(type) {
        case 0:
            s = '没牛'
        break;
        case 1:
            s = '牛' + value;
        break;
        case 2:
            s = '牛牛';
        break;
        case 3:
            s = '顺子'
        break;
        case 4:
            s = '同花'
        break;
        case 5:
            s = '葫芦'
        break;
        case 6:
            s = '五小牛';
        break;
        case 7:
            s = '五花牛';
        break;
        case 8:
            s = '炸弹';
        break;
        case 9:
            s = '同花顺';
        break;
        default:
            break;
    }
    return s;
}