const cons = require('../../../../common/constants');
const Super = require('../../../../room/robotCommand_Think');
const _ = require('underscore');


class RobotCommand_Play extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_Play(room, robot, ai);
        robot.runCommand(command);
        return command;
    }

    constructor(room, robot, ai) {
        super(room, robot, 5000, 2000);

        this.ai = ai;
    }

    timeout() {
        if (!this.robot.seat.isPlaying()) {
            return;
        }

        let cards = this.ai.setCards(this.room, this.robot.getSeatIndex());
        this.robot.setCards(cards);
    }
}


module.exports = RobotCommand_Play;