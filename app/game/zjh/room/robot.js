const AI = require('../ai');
const cons = require('../../../common/constants');
const zjhcons = require('../common/constants');
const RobotCommand_Bid = require('./robot/robotCommand_Bid');
const RobotCommand_Look = require('./robot/robotCommand_Look');
const Super = require('../../../room/robot');


class Robot extends Super {
    constructor(room, seat, user) {
        super(room, seat, user);

        this.ai = AI.create();
    }

    bid(type, count = null, index = null) {
        let turn = this.room.getComp('turn').getTurnId();
        this.action({ name: cons.RoomAction.PLAYER_BID(), turn, type, count, index });
    }

    look() {
        this.seat.isPlaying() && this.action({ name: cons.RoomAction.PLAYER_ACTION(), type: zjhcons.PlayerAction.LOOK() });
    }

    onAction_TurnStart(msg) {
        if (msg.type !== zjhcons.Turn.BID()) {
            return;
        }

        if (msg.seat !== this.seat.getIndex()) {
            return;
        }

        RobotCommand_Bid.create(this.room, this, this.ai);
    }

    onAction_RoomStateChangeState(msg) {
        if (this.lookCmd) {
            this.lookCmd.clear();
            this.lookCmd = null;
        }

        switch (msg.type) {
            case zjhcons.RoomState.WAIT():
            case zjhcons.RoomState.DEAL():
            case zjhcons.RoomState.RESULT():
                this.ai.init();
                break;
            case zjhcons.RoomState.PLAY():
                this.lookCmd = RobotCommand_Look.create(this.room, this);
                // RobotCommand_Look.create(this.room, this);
                break;
        }
    }
}


module.exports = Robot;