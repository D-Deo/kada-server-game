const utils = require('../utils');
const _ = require('underscore');


let validator = module.exports = {};

validator.attrs = (attrs) => {
    if (!_.isObject(attrs)) {
        return null;
    }

    attrs = _.omit(attrs, (v, k) => {
        return (v === undefined) || !_.has(validator, k);
    });

    let result = !_.isEmpty(attrs) && _.every(attrs, (v, k) => validator[k](v));
    return result ? attrs : null;
};

validator.head = (head) => {
    if (head === null) {
        return true;
    }

    return utils.isString(head, 1, 1024);
};

validator.nick = (nick) => {
    return utils.isString(nick, 1, 30);
};

validator.phone = (phone) => {
    if (phone === null) {
        return true;
    }

    return utils.isString(phone, 1, 255);
};

validator.recommender = (recommender) => {
    if (recommender === null) {
        return true;
    }

    return utils.isId(recommender);
};

validator.sex = (sex) => {
    return utils.isNumber(sex, 0, 1);
};

validator.role = (sex) => {
    return utils.isNumber(sex, 1);
};

validator.type = (type) => {
    return utils.isNumber(type, 1);
};

validator.state = (state) => {
    return utils.isNumber(state, 0, 1);
};

validator.inviteCode = (inviteCode) => {
    if (inviteCode === null) {
        return true;
    }

    return utils.isString(inviteCode, 1, 64);
};