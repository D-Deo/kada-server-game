const Super = require('../../../../room/robotCommand_Think');
const utils = require('../../poker/utils');
const _ = require('underscore');

class RobotCommand_Grab extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_Grab(room, robot, ai);
        robot.runCommand(command);
        return command;
    }

    constructor(room, robot, ai) {
        super(room, robot, 500, 4500);
        this.ai = ai;
    }

    timeout() {
        let ming = this.ai.mingAction(this.room, this.robot.getSeatIndex());
        if (_.isUndefined(ming)) {
            ming = false;
        }
        this.robot.Ming(ming);
    }
}

module.exports = RobotCommand_Grab;