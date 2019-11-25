class RobotReleaser {
    static create(room, id, delay) {
        return new RobotReleaser(room, id, delay);
    }

    constructor(room, id, delay) {
        this.room = room;
        this.id = id;
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

        let robot = this.room.getComp('robot').getRobot(this.id);
        if(!robot) {
            return;
        }

        robot.leave();
    }
}


module.exports = RobotReleaser;