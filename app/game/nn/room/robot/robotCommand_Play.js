const cons = require('../../../../common/constants');
const Super = require('../../../../room/robotCommand_Think');
const _ = require('underscore');


class RobotCommand_Play extends Super {
    static create(room, robot) {
        let command = new RobotCommand_Play(room, robot);
        robot.runCommand(command);
        return command;
    }

    constructor(room, robot) {
        super(room, robot, 1000, 4000);
    }

    timeout() {
        this.robot.seat.isPlaying() && this.robot.action({
            name: cons.RoomAction.PLAYER_PLAY()
        });

        this.clear();
    }
}


module.exports = RobotCommand_Play;