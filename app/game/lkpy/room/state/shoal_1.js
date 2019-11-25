// 鱼群
const lkpycons = require('../../common/constants');
const Super = require('./shoal');

class ShoalState_1 extends Super {
    constructor(room) {
        super(room, lkpycons.RoomState.SHOAL_1(), lkpycons.RoomStateInterval.SHOAL_1());
    }

    InitShoalFish() {
        this.addShoalFish(50, lkpycons.FISH_KIND_1());
        this.addShoalFish(8, lkpycons.FISH_KIND_3());
        this.addShoalFish(8, lkpycons.FISH_KIND_5());
        this.addShoalFish(15, lkpycons.FISH_KIND_2());
        this.addShoalFish(15, lkpycons.FISH_KIND_4());
        this.addShoalFish(8, lkpycons.FISH_KIND_6());
        this.addShoalFish(1, lkpycons.FISH_KIND_20());
    }
}

module.exports = ShoalState_1;