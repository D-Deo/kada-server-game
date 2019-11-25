// 鱼群
const lkpycons = require('../../common/constants');
const Super = require('./shoal');

class ShoalState_4 extends Super {
    constructor(room) {
        super(room, lkpycons.RoomState.SHOAL_4(), lkpycons.RoomStateInterval.SHOAL_4());
    }

    InitShoalFish() {
        this.addShoalFish(8, lkpycons.FISH_KIND_11());
        this.addShoalFish(8, lkpycons.FISH_KIND_12());
        this.addShoalFish(8, lkpycons.FISH_KIND_13());
        this.addShoalFish(8, lkpycons.FISH_KIND_14());
        this.addShoalFish(8, lkpycons.FISH_KIND_15());
        this.addShoalFish(8, lkpycons.FISH_KIND_16());
        this.addShoalFish(8, lkpycons.FISH_KIND_17());
        this.addShoalFish(8, lkpycons.FISH_KIND_18());
    }
}

module.exports = ShoalState_4;