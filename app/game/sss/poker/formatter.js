const ssscons = require('../common/constants');
const Rule = require('./rule');
const _ = require('underscore');

class Formatter {
    static create(...cards) {
        return new Formatter(...cards);
    }

    constructor(...cards) {
        this.cards = [...cards];
        this.valid = false;

        this.rule1 = Rule.create(...cards.splice(0, 3));
        this.rule2 = Rule.create(...cards.splice(0, 5));
        this.rule3 = Rule.create(...cards.splice(0, 5));

        if (this.rule1.compare(this.rule2) > 0 || this.rule1.compare(this.rule3) > 0 || this.rule2.compare(this.rule3) > 0) {
            return;
        }

        this.valid = true;
    }

    fireGun(formatter) {
        // if (!this.valid || !formatter.valid) {
        //     return false;
        // }

        let r1 = this.rule1.compare(formatter.rule1);
        let r2 = this.rule2.compare(formatter.rule2);
        let r3 = this.rule3.compare(formatter.rule3);

        if (r1 > 0 && r2 > 0 && r3 > 0) {
            return 1;
        }
        else if (r1 < 0 && r2 < 0 && r3 < 0) {
            return -1;
        }

        return 0;
    }

    isValid() {
        return true;
    }

    toJson() {
        let json = {};
        json.valid = this.valid;
        json.rule1 = this.rule1.toJson();
        json.rule2 = this.rule2.toJson();
        json.rule3 = this.rule3.toJson();

        return json;
    }
}

module.exports = Formatter;