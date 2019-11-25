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
        let grab = this.ai.grabAction(this.room, this.robot.getSeatIndex());
        if (_.isUndefined(grab)) {
            grab = 0;
        }

        this.robot.Grab(grab);
        //this.robot.Grab(0);
    }
}

module.exports = RobotCommand_Grab;