const Super = require('../../../../room/robotCommand_Think');
const utils = require('../../poker/utils');

class RobotCommand_OutCard extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_OutCard(room, robot, ai);
        robot.runCommand(command);
        return command;
    }

    constructor(room, robot, ai) {
        super(room, robot, 500, 4500);
        this.ai = ai;
    }

    timeout() {
        let turn = this.room.getComp('state').getTurn();
        let { cards, formation } = this.ai.getOutCards(turn);

        this.robot.OutCard(cards, formation);
    }
}

module.exports = RobotCommand_OutCard;