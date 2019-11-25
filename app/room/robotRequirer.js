class RobotRequirer {
    static create(room, score, delay) {
        return new RobotRequirer(room, score, delay);
    }

    constructor(room, score, delay) {
        this.room = room;
        this.score = score;
        this.handler = setTimeout(() => this.run(), delay);
    }

    clear() {
        if(this.handler === null) {
            return;
        }

        clearTimeout(this.handler);
        this.handler = null;
    }

    end() {
        this.handler = null;
        this.room.getComp('robot').unscheduleRequire(this);
    }

    run() {
        this.end();

        if(this.room.isCleared()) {
            return;
        }

        let users = this.room.getComp('seat').getSittingSeats_User();
        if(users.length === 0) {
            return;
        }

        this.room.getComp('robot').requireRobot(this.score);
    }
}


module.exports = RobotRequirer;