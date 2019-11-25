const cons = require('../../../common/constants');
const _ = require('underscore');


class UserScore {
    static create(room, user, count = 0) {
        return new UserScore(room, user, count);
    }

    constructor(room, user, count = 0) {
        this.room = room;
        this.user = user;
        this.count = count;
    }

    change(value) {
        this.count += value;
        return {change: value, score: this.count};
    }

    charge(scores, limit = 0) {
        let total = _.reduce(scores, (m, s) => m - (s >= 0 ? 0 : s));

        if(!limit || this.have(total * limit)) {
            return scores;
        }

        limit *= this.get();
        return _.map(scores, s => {
            if(s >= 0) {
                return s;
            }

            if(total == 0)
            {
                let i = 0;
            }

            return parseInt(s * limit / total);
        });
    }

    get() {
        return this.count;
    }

    have(count) {
        return true;
    }

    pay(scores) {
        let need = _.reduce(scores, (m, s) => m + (s <= 0 ? 0 : s));

        if(this.have(need)) {
            return scores;
        }

        let remain = this.get();
        return _.map(scores, (s) => {
            if(s <= 0) {
                return s;
            }

            return parseInt(s * remain / need);
        });
    }

    update(value) {
        this.count += value;
        let ret = {change: value, score: this.count};
        this.user.sendChannelAction(ret);
        return ret;
    }
}


module.exports = UserScore;