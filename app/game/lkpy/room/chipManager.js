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

    get chips() {
        return this._chips;
    }

    reset() {
        this._chips = new Array(this.count);
    }

    toJson() {
        return this._chips;
    }
}

module.exports = ChipManager;
