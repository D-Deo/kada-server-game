const yybfcons = require('../common/constants');
const _ = require('underscore');

/**
 * 筹码--押注
 * {
 *      userId: bet
 * }
 */
class ChipManager {
    constructor() {
        this.reset();
    }

    set chips(chips) {
        this._chips = chips;
    }

    reset() {
        this._chips = 0;
    }

    add(chip) {
        if (!this._chips) {
            this._chips = 0;
        }
        this._chips += chip;
    }

    all() {
        let sum = _.reduce(this._chips, function(memo, chip){ return memo + chip; }, 0);
        return sum;
        
        // if (!_.isNumber(area, 0, yybfcons.RoomAreaMulti.length)) {
        //     for (let chip of this._chips) {
        //         if (!chip) continue;
        //         for (let num in chip) {
        //             if (chip[num]) {
        //                 sum += chip[num] * num;
        //             }
        //         }
        //     }
        // } else {
        //     let chip = this._chips[area];
        //     if (!chip) return sum;
        //     for (let num in chip) {
        //         if (chip[num]) {
        //             sum += chip[num] * num;
        //         }
        //     }
        // }
        // return sum;
    }

    getBetChips() {
        return this._chips;
        // return _.map(this._chips, (chip) => {
        //     if (!chip) return 0;
        //     let sum = 0;
        //     for (let num in chip) {
        //         if (chip[num]) {
        //             sum += chip[num] * num;
        //         }
        //     }
        //     return sum;
        // });
    }

    getSlfBetChips(userId) {
        if(!this._chips[userId]){
            this._chips[userId] = 0;
        }
        return this._chips[userId];
        // return _.map(this._chips, (chip) => {
        //     if (!chip) return 0;
        //     let sum = 0;
        //     for (let num in chip) {
        //         if (chip[num]) {
        //             sum += chip[num] * num;
        //         }
        //     }
        //     return sum;
        // });
    }

    toJson() {
        return this._chips;
    }
}

module.exports = ChipManager;
