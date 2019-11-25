const fqzscons = require('../common/constants');
const _ = require('underscore');

/**
 * 筹码
 */
class ChipManager {
    constructor(count) {
        this.count = count;
        this.reset();
    }

    set chips(chips) {
        this._chips = chips;
    }

    reset() {
        this._chips = new Array(this.count);
    }

    add(area, num) {
        if (!this._chips[area]) {
            this._chips[area] = {};
        }
        if (!this._chips[area][num]) {
            this._chips[area][num] = 0;
        }

        this._chips[area][num]++;
    }

    minus(chips) {
        for (let area in chips) {
            let chip = chips[area];
            if (!chip) continue;
            for (let num in chip) {
                if (chip[num] && this._chips[area] && this._chips[area][num]) {
                    this._chips[area][num] -= chip[num];
                    if (this._chips[area][num] <= 0) {
                        this._chips[area][num] = 0;
                    }
                }
            }
        }
    }

    all(area) {
        let sum = 0;

        if (!_.isNumber(area, 0, fqzscons.RoomAreaMulti.length)) {
            for (let chip of this._chips) {
                if (!chip) continue;
                for (let num in chip) {
                    if (chip[num]) {
                        sum += chip[num] * num;
                    }
                }
            }
        } else {
            let chip = this._chips[area];
            if (!chip) return sum;
            for (let num in chip) {
                if (chip[num]) {
                    sum += chip[num] * num;
                }
            }
        }

        return sum;
    }

    getBetChips() {
        return _.map(this._chips, (chip) => {
            if (!chip) return 0;
            let sum = 0;
            for (let num in chip) {
                if (chip[num]) {
                    sum += chip[num] * num;
                }
            }
            return sum;
        });
    }

    toJson() {
        return this._chips;
    }
}

module.exports = ChipManager;
