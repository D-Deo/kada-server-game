const Super = require('../../../../room/robotCommand_Think');
const cons = require('../../../../common/constants')
const ermjcons = require('../../common/constants');
class RobotCommand_DrawCard extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_DrawCard(room, robot, ai);
        // robot.runCommand(command);
        return command;
    }

    constructor(room, robot, ai) {
        super(room, robot, 0, 0);
        this.ai = ai;

        if (this.ai.seat.getTinFlag() != 0) {
            if (this.ai.seat.lastAction == ermjcons.RoomAction.KAN()) {
                this.room.getComp('jackpot').balance(this.ai.seat, false);
            }
            else {
                this.room.getComp('jackpot').balance(this.ai.seat, true);
            }
        }
    }
}

module.exports = RobotCommand_DrawCard;