class RobotCommand {
    constructor(room, robot) {
        this.room = room;
        this.robot = robot;
    }

    clear() {
        this.room = null;
        this.robot = null;
    }

    run() {
        this.clear();
    }
}


module.exports = RobotCommand;