const Super = require('../../../../room/robotCommand_Think');
const _ = require('underscore');


class RobotCommand_Bid extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_Bid(room, robot, ai);
        robot.runCommand(command);
        return command;
    }

    constructor(room, robot, ai) {
        super(room, robot, 1000, 4000);

        this.ai = ai;
    }

    timeout() {
        let bid = this.ai.bid(this.room, this.robot.getSeatIndex());
        if(_.isUndefined(bid)) {
            return;
        }

        this.robot.bid(bid);
    }
}


module.exports = RobotCommand_Bid;