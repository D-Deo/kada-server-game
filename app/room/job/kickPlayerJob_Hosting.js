const cons = require('../../common/constants');
const Super = require('../job');


class KickPlayerJob_Hosting extends Super {
    static create(room) {
        let manager = room.getComp('job');
        let id = manager.nextJobId();
        let job = new KickPlayerJob_Hosting(room, id);
        manager.addJob(job);
        return job;
    }

    clear() {
        this.room.off(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onHost, this);
        this.room.off(cons.RoomEvent.ROOM_CHANGE_PLAYING(), this.onPlaying, this);

        super.clear();
    }

    init() {
        super.init();

        this.room.on(cons.RoomEvent.SEAT_HOST_PLAYER(), this.onHost, this);
        this.room.on(cons.RoomEvent.ROOM_CHANGE_PLAYING(), this.onPlaying, this);
    }

    onHost(seat) {
        if(!seat.isHosting()) {
            return;
        }

        if(seat.isPlaying()) {
            return;
        }

        seat.unbindUser(cons.RoomClearReason.KICK_HOSTING_USER());
    }

    onPlaying() {
        if(this.room.isPlaying()) {
            return;
        }

        this.room.getComp('seat').removeHostingUsers();
    }
}


module.exports = KickPlayerJob_Hosting;