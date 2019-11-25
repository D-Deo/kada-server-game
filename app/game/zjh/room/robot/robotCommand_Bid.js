const Super = require('../../../../room/robotCommand_Think');
const zjhcons = require('../../common/constants');

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
        let { type, count, index } = this.ai.bid(this.room, this.robot.getSeatIndex());

        if (type == zjhcons.Bid.LOOK()) {
            this.robot.look();
            return;
        }

        this.robot.bid(type, count, index);
    }

    // seecard() {
    //     this.robot.bid(zjhcons.Bid.LOOK(), 0);
    //     clearTimeout(this.seecard);
    // }
}


module.exports = RobotCommand_Bid;