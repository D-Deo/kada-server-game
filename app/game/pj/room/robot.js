const AI = require('../ai');
const cons = require('../../../common/constants');
const p9cons = require('../common/constants');
const RobotCommand_Banker = require('./robot/robotCommand_Banker');
const RobotCommand_Bid = require('./robot/robotCommand_Bid');
const RobotCommand_Play = require('./robot/robotCommand_Play');
const Super = require('../../../room/robot');
const _ = require('underscore');


class Robot extends Super {
    constructor(room, seat, user) {
        super(room, seat, user);

        this.ai = AI.create();
    }

    banker(b) {
        this.action({ name: cons.RoomAction.PLAYER_BANKER(), banker: b });
    }

    bid(b) {
        this.action({ name: cons.RoomAction.PLAYER_BID(), bid: b });
    }

    setCards(cards) {
        this.action({ name: cons.RoomAction.PLAYER_PLAY(), cards });
    }

    onAction_RoomStateChangeState(msg) {
        switch (msg.type) {
            case p9cons.RoomState.BANKER():
                RobotCommand_Banker.create(this.room, this, this.ai);
                break;

            case p9cons.RoomState.BID():
                RobotCommand_Bid.create(this.room, this, this.ai);
                break;

            case p9cons.RoomState.PLAY():
                RobotCommand_Play.create(this.room, this, this.ai);
                break;
        }
    }
}

module.exports = Robot;