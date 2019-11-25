const AI = require('../ai');
const cons = require('../../../common/constants');
const ssscons = require('../common/constants');
const RobotCommand_Play = require('./robot/robotCommand_Play');
const Super = require('../../../room/robot');
const _ = require('underscore');


class Robot extends Super {
    constructor(room, seat, user) {
        super(room, seat, user);

        this.ai = AI.create();
    }

    setCards(cards) {
        this.action({ name: cons.RoomAction.PLAYER_PLAY(), cards });
    }

    onAction_RoomStateChangeState(msg) {
        switch (msg.type) {
            case ssscons.RoomState.PLAY():
                RobotCommand_Play.create(this.room, this, this.ai);
                break;
        }
    }
}

module.exports = Robot;