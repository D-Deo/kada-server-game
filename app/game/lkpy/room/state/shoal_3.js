// 鱼群
const lkpycons = require('../../common/constants');
const Super = require('./shoal');

class ShoalState_3 extends Super {
    constructor(room) {
        super(room, lkpycons.RoomState.SHOAL_3(), lkpycons.RoomStateInterval.SHOAL_3());
    }

    InitShoalFish() {
        this.addShoalFish(25, lkpycons.FISH_KIND_1());
        this.addShoalFish(20, lkpycons.FISH_KIND_3());
        this.addShoalFish(15, lkpycons.FISH_KIND_4());
        this.addShoalFish(1, lkpycons.FISH_KIND_16());
        this.addShoalFish(25, lkpycons.FISH_KIND_1());
        this.addShoalFish(20, lkpycons.FISH_KIND_2());
        this.addShoalFish(15, lkpycons.FISH_KIND_5());
        this.addShoalFish(1, lkpycons.FISH_KIND_17());
    }
}

module.exports = ShoalState_3;