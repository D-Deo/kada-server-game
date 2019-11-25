const AI = require('../ai');
const cons = require('../../../common/constants');
const ermjcons = require('../common/constants');
const RobotCommand_OutCard = require('./robot/robotCommand_OutCard');
const RobotCommand_Operate = require('../room/robot/robotCommand_Operate')
const RobotCommand_DrawCard = require('../room/robot/robotCommand_DrawCard')
//const RobotCommand_Banker = require('./robot/robotCommand_Banker');
const Super = require('../../../room/robot');


class Robot extends Super {
    constructor(room, seat, user) {
        super(room, seat, user);

        this.ai = AI.create(this);
        this.hasRoomInfo = false;
    }

    Banker(speak) {
        let stateMgr = this.room.getComp('state');

        this.action({ name: ddzermjcons.RoomAction.PLAYER_SPEAK(), speak: speak });
    }

    OutCard(cards, formation) {
        let turn = this.room.getComp('turn').getTurnId();
        if (cards && cards.length > 0) {
            this.action({ name: ermjcons.RoomAction.PLAY(), /*turn, type: ddzcons.PlayerAction.PLAY(),*/ cards: cards, formation: formation });
        }
        else {
            this.action({ name: ermjcons.RoomAction.PLAY(), /*turn, type: ddzcons.PlayerAction.PASS() */ });
        }
    }

    RecordCard(index, cards, turn) {
        this.ai.RecordCard(index, cards, turn);
    }

    onAction_TurnStart(msg) {
        if (msg.type !== ddzcons.Turn.PLAY()) {
            return;
        }

        if (msg.seat !== this.seat.getIndex()) {
            return;
        }

        RobotCommand_OutCard.create(this.room, this, this.ai);
    }

    onAction_RoomStateChangeState(msg) {
        switch (msg.type) {
            // case ddzcons.RoomState.WAIT():
            //     this.hasRoomInfo = false;
            //     this.ai.init()
            //     break;

            //         case ddzcons.RoomState.DEAL():
            //             break;

            //         case ddzcons.RoomState.BANKER():
            //             //RobotCommand_Banker.create(this.room, this, this.ai);
            //             break;
            case ermjcons.RoomState.DEAL():
                this.ai.RoomInfo(this.room, this.seat);
                break;
            case ermjcons.RoomState.PLAY():
                // if (!this.hasRoomInfo) {
                //     this.ai.RoomInfo(this.room, this.seat);
                // }
                if (msg.current !== this.seat.getIndex()) {
                    return;
                }
                RobotCommand_OutCard.create(this.room, this, this.ai);
                break;
            case ermjcons.RoomState.SOUND():
                if (msg.current !== this.seat.getIndex()) {
                    return;
                }
                RobotCommand_Operate.create(this.room, this, this.ai);
                break;
            case ermjcons.RoomState.DRAW():
                if (msg.current !== this.seat.getIndex()) {
                    return;
                }
                RobotCommand_DrawCard.create(this.room, this, this.ai);
                break;
        }
    }

}


module.exports = Robot;