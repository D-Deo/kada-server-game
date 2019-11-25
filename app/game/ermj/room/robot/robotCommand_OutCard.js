const Super = require('../../../../room/robotCommand_Think');
const cons = require('../../../../common/constants')
//const utils = require('../../poker/utils');
const ermjcons = require('../../common/constants');
class RobotCommand_OutCard extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_OutCard(room, robot, ai);
        robot.runCommand(command);
        return command;
    }

    constructor(room, robot, ai) {
        super(room, robot, 1000, 4000);
        this.ai = ai;
    }

    timeout() {
        if (this.room.getComp('state').state.type != ermjcons.RoomState.PLAY()) return;
        //let turn = this.room.getComp('state').getTurn();
        let action = this.ai.getOutCards();

        this.room.getComp('state').state.action(this.ai.robot.seat, action, () => { })

    }
}

module.exports = RobotCommand_OutCard;