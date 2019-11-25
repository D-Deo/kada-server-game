const Super = require('../../../../room/robotCommand_Think');
const _ = require('underscore');


class RobotCommand_Banker extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_Banker(room, robot, ai);
        robot.runCommand(command);
        return command;
    }

    constructor(room, robot, ai) {
        super(room, robot, 5000, 2000);

        this.ai = ai;
    }

    timeout() {
        let banker = this.ai.banker(this.room, this.robot.getSeatIndex());
        if(_.isUndefined(banker)) {
            return;
        }

        this.robot.banker(banker);
    }
}


module.exports = RobotCommand_Banker;