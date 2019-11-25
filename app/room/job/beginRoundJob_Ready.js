const cons = require('../../common/constants');
const Super = require('../job');


class KickPlayerJob_Ready extends Super {
    static create(room, min = 0) {
        let manager = room.getComp('job');
        let id = manager.nextJobId();
        let job = new KickPlayerJob_Ready(room, id, min);
        manager.addJob(job);
        return job;
    }

    constructor(room, id, min) {
        super(room, id);

        this.min = min;
    }

    clear() {
        this.room.off(cons.RoomEvent.PLAYER_READY(), this.onHost, this);

        super.clear();
    }

    init() {
        super.init();

        this.room.on(cons.RoomEvent.PLAYER_READY(), this.onReady, this);
    }

    onReady() {
        let manager = this.room.getComp('seat');

        if((this.min <= 0) && !manager.isFull()) {
            return;
        }

        if((this.min > 0) && (manager.getSittingSeats().length < this.min)) {
            return;
        }

        if(!manager.isReady()) {
            return;
        }

        this.room.getComp('round').begin();
    }
}


module.exports = KickPlayerJob_Ready;