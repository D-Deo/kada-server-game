const cons = require('../common/constants');
const rpc = require('../rpc/user');
const utils = require('../utils');


class User {
    static create(session, cb) {
        rpc.get(session.getUserId(), cons.UserToJsonReason.MATCH(), (data) => {
            utils.cb(cb, new User(session, data));
        });
    }

    constructor(session, data) {
        this.session = session;

        this.gold = data.gold;
    }

    haveEnoughGold(gold) {
        return this.gold >= gold;
    }

    getId() {
        return this.session.getUserId();
    }

    getSession() {
        return this.session;
    }
}


module.exports = User;