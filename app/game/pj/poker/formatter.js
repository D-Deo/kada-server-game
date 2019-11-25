const p9cons = require('../common/constants');
const Formation = require('./formation');
const _ = require('underscore');


class Formatter {
    static create(...cards) {
        return new Formatter(...cards);
    }

    constructor(...cards) {
        this.formation1 = new Formation(cards[0], cards[1]);
        this.formation1.resolve();

        this.formation2 = new Formation(cards[2], cards[3]);
        this.formation2.resolve();

        if (this.formation1.compare(this.formation2) > 0) {
            let x = this.formation1;
            this.formation1 = this.formation2;
            this.formation2 = x;
        }

        this.win1 = 0;
        this.win2 = 0;
    }

    getFormation() {
        return [this.formation1, this.formation2];
    }

    getBestType() {
        return _.max([this.formation1.getType(), this.formation2.getType()]);
    }

    // 庄 compare 闲
    compare(formatter) {
        return this.formation1.compare(formatter.formation1) + this.formation2.compare(formatter.formation2);
    }

    toJson() {
        let json = {};

        json.formation1 = this.formation1.toJson();
        json.formation2 = this.formation2.toJson();

        json.win1 = this.win1;
        json.win2 = this.win2;

        return json;
    }
}

module.exports = Formatter;