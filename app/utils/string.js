const base64 = require('Base64');
const _ = require('underscore');


let util = module.exports = {};


util.filterAddress = (str) => {
    if(!str) {
        return str;
    }

    str = str.replace(/'/g, "");
    str = str.replace(/,/g, " ");
    return str;
};


util.filterEnter = (str) => {
    if(!str) {
        return str;
    }

    return str.replace(/\n/g, "");
};


util.filterNick = (nick) => {
    let ret = '';
    _.map(nick, (c) => ret += (/[a-zA-Z0-9]/.test(c) || /[\u4e00-\u9fa5]/.test(c)) ? c : "*");
    return ret;
};


util.randomGuestAccount = (tracer) => {
    let account = null;
    do {
        account = 'Guest' + base64.btoa(Date.now() * 1000 + _.random(0, 999));
    } while(_.has(tracer, account));
    return account;
};


util.randomId = (length) => {
    let str = '';
    _.times(length, () => {
        str += _.random(0, 9);
    });
    return str;
};
