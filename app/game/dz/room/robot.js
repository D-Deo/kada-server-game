const AI = require('../ai');
const cons = require('../../../common/constants');
const sdcons = require('../common/constants');
const RobotCommand_Bid = require('./robot/robotCommand_Bid');
const Super = require('../../../room/robot');


class Robot extends Super {
    constructor(room, seat, user) {
        super(room, seat, user);

        this.ai = AI.create();
    }

    bid(type, count = null) {
        let turn = this.room.getComp('turn').getTurnId();
        this.action({name: cons.RoomAction.PLAYER_BID(), turn, type, count});
    }

    onAction_TurnStart(msg) {
        if(msg.type !== sdcons.Turn.BID()) {
            return;
        }

        if(msg.seat !== this.seat.getIndex()) {
            return;
        }

        RobotCommand_Bid.create(this.room, this, this.ai);
    }

    onAction_RoomStateChangeState(msg) {
        switch(msg.type) {
            case sdcons.RoomState.WAIT():
            case sdcons.RoomState.DEAL():
            case sdcons.RoomState.RESULT():
                this.ai.init();
                break;
        }
    }
}


module.exports = Robot;