const AI = require('../../lkpy/ai/index');
const cons = require('../../../common/constants');
const lkpycons = require('../common/constants');
const RobotCommand_Fire = require('./robot/robotCommand_Fire');
const Super = require('../../../room/robot');


class Robot extends Super {
    constructor(room, seat, user) {
        super(room, seat, user);

        this.ai = AI.create();
        this.hasRoomInfo = false;
    }

    fire(action) {
        this.action(action);
    }

    onAction_TurnStart(msg) {
        if (msg.type !== ddzcons.Turn.PLAY()) {
            return;
        }

        if (msg.seat !== this.seat.getIndex()) {
            return;
        }

        RobotCommand_Fire.create(this.room, this, this.ai);
    }

    onAction() {
        if(!this.hasRoomInfo) {
            RobotCommand_Fire.create(this.room, this, this.ai);
            this.hasRoomInfo = true;
        }
    }

    onAction_RoomStateChangeState(msg) {
        switch (msg.type) {
            case lkpycons.RoomState.WAIT():
            case lkpycons.RoomState.FREE():
            case lkpycons.RoomState.LOAD():
            case lkpycons.RoomState.SHOAL_1():
            case lkpycons.RoomState.SHOAL_2():
            case lkpycons.RoomState.SHOAL_3():
            case lkpycons.RoomState.SHOAL_4():
            case lkpycons.RoomState.SHOAL_5():
            if(!this.hasRoomInfo) {
                RobotCommand_Fire.create(this.room, this, this.ai);
                this.hasRoomInfo = true;
            }
                break;

            // case ddzcons.RoomState.DEAL():
            //     break;

            // case ddzcons.RoomState.BANKER():
            //     RobotCommand_Banker.create(this.room, this, this.ai);
            //     break;

            // case ddzcons.RoomState.PLAY():
            //     if (!this.hasRoomInfo) {
            //         this.ai.RoomInfo(this.room, this.seat);
            //     }
                // RobotCommand_OutCard.create(this.room, this.ai);
                //break;
        }
    }

}


module.exports = Robot;