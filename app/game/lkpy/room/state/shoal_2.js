// 鱼群
const lkpycons = require('../../common/constants');
const Super = require('./shoal');

class ShoalState_2 extends Super {
    constructor(room) {
        super(room, lkpycons.RoomState.SHOAL_2(), lkpycons.RoomStateInterval.SHOAL_2());
    }

    InitShoalFish() {
        this.addShoalFish(100, lkpycons.FISH_KIND_1());
        this.addShoalFish(14, lkpycons.FISH_KIND_12(), lkpycons.FISH_KIND_18());
    }
}

module.exports = ShoalState_2;