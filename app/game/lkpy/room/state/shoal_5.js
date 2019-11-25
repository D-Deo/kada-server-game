// 鱼群
const lkpycons = require('../../common/constants');
const Super = require('./shoal');

class ShoalState_5 extends Super {
    constructor(room) {
        super(room, lkpycons.RoomState.SHOAL_5(), lkpycons.RoomStateInterval.SHOAL_5());
    }

    InitShoalFish() {
        this.addShoalFish(20, lkpycons.FISH_KIND_1());
        this.addShoalFish(20, lkpycons.FISH_KIND_2());
        this.addShoalFish(20, lkpycons.FISH_KIND_5());
        this.addShoalFish(20, lkpycons.FISH_KIND_3());
        this.addShoalFish(12, lkpycons.FISH_KIND_4());
        this.addShoalFish(12, lkpycons.FISH_KIND_6());
        this.addShoalFish(6, lkpycons.FISH_KIND_7());
        this.addShoalFish(6, lkpycons.FISH_KIND_6());
        this.addShoalFish(1, lkpycons.FISH_KIND_18());
        this.addShoalFish(1, lkpycons.FISH_KIND_17());
    }
}

module.exports = ShoalState_5;