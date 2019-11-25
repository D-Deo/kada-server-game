const AI = require('../ai');
const cons = require('../../../common/constants');
const ddzcons = require('../common/constants');
const RobotCommand_OutCard = require('./robot/robotCommand_OutCard');
const RobotCommand_Banker = require('./robot/robotCommand_Banker');
const RobotCommand_Grab = require('./robot/robotCommand_Grab');
const RobotCommand_Ming = require('./robot/robotCommand_Ming');
const Super = require('../../../room/robot');


class Robot extends Super {
    constructor(room, seat, user) {
        super(room, seat, user);

        this.ai = AI.create();
        this.hasRoomInfo = false;
    }

    Banker(speak) {
        let turn = this.room.getComp('turn').getTurnId();
        this.action({ name: ddzcons.RoomAction.PLAYER_SPEAK(), turn, type: speak/*, speak: speak*/ });
    }

    Grab(speak) {
        let turn = this.room.getComp('turn').getTurnId();
        this.action({ name: ddzcons.RoomAction.PLAYER_GRAB(), turn, type: speak/*, speak: speak*/ });
    }

    Ming(ming) {
        let turn = this.room.getComp('turn').getTurnId();
        this.action({ name: ddzcons.RoomAction.PLAYER_ACTION(), turn, ming });
    }

    OutCard(cards, formation) {
        let turn = this.room.getComp('turn').getTurnId();
        if (cards && cards.length > 0) {
            this.action({ name: ddzcons.RoomAction.PLAYER_ACTION(), turn, type: ddzcons.PlayerAction.PLAY(), cards: cards, formation: formation });
        }
        else {
            this.action({ name: ddzcons.RoomAction.PLAYER_ACTION(), turn, type: ddzcons.PlayerAction.PASS() });
        }
    }

    RecordCard(index, cards, turn) {
        this.ai.RecordCard(index, cards, turn);
    }

    onAction_TurnStart(msg) {
        if (!this.room.getComp('state').isPlaying()) {
            return;
        }

        // if (msg.type !== ddzcons.Turn.PLAY()) {
        //     return;
        // }

        if (msg.seat !== this.seat.getIndex()) {
            return;
        }

        msg.type == ddzcons.Turn.PLAY() && RobotCommand_OutCard.create(this.room, this, this.ai);
        msg.type == ddzcons.Turn.SPEAK() && RobotCommand_Banker.create(this.room, this, this.ai);
        msg.type == ddzcons.Turn.GRAB() && RobotCommand_Grab.create(this.room, this, this.ai);
        msg.type == ddzcons.Turn.MING() && RobotCommand_Ming.create(this.room, this, this.ai);
    }


    onAction_RoomStateChangeState(msg) {
        switch (msg.type) {
            case ddzcons.RoomState.WAIT():
                this.hasRoomInfo = false;
                this.ai.init()
                break;

            case ddzcons.RoomState.DEAL():
                break;

            case ddzcons.RoomState.BANKER():
                //RobotCommand_Banker.create(this.room, this, this.ai);
                //break;
                break;
            case ddzcons.RoomState.PLAY():
                if (!this.hasRoomInfo) {
                    this.ai.RoomInfo(this.room, this.seat);
                }
                // RobotCommand_OutCard.create(this.room, this.ai);
                break;
        }
    }

}


module.exports = Robot;