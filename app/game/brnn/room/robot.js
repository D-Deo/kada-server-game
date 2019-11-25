const AI = require('../ai');
const cons = require('../../../common/constants');
const brnncons = require('../common/constants');
const RobotCommand_Banker = require('./robot/robotCommand_Banker');
const RobotCommand_Bet = require('./robot/robotCommand_Bet');
const Super = require('../../../room/robot');
const _ = require('underscore');


class Robot extends Super {
    constructor(room, seat, user) {
        super(room, seat, user);

        this.ai = AI.create(this);
        this.cmd = null;
    }

    banker(b) {
        let stateMgr = this.room.getComp('state');

        if (this.user.getId() == stateMgr.getBankerId()) {
            return;
        }

        if (this.user.getScore() < this.room.getAttr('bankerLimit')) {
            return;
        }

        this.action({ name: cons.RoomAction.ROOM_UP_BANKER() });
    }

    bet(area, count) {
        let stateMgr = this.room.getComp('state');

        if (this.user.getId() == stateMgr.getBankerId()) {
            return;
        }

        this.action({ name: cons.RoomAction.PLAYER_BID(), area: area, count: count });
    }

    onAction_RoomStateChangeState(msg) {
        if (this.cmd) {
            this.cmd.clear();
            this.cmd = null;
            this.ai.reset();
        }

        let stateMgr = this.room.getComp('state');
        if (this.user.getId() == stateMgr.getBankerId()) {
            return;
        }

        switch (msg.type) {
            case brnncons.RoomState.IDLE():
                RobotCommand_Banker.create(this.room, this, this.ai);
                break;

            case brnncons.RoomState.SENDCARD():
                RobotCommand_Banker.create(this.room, this, this.ai);
                break;

            case brnncons.RoomState.BETTING():
                this.cmd = RobotCommand_Bet.create(this.room, this, this.ai);
                break;

            case brnncons.RoomState.OPENING():
                RobotCommand_Banker.create(this.room, this, this.ai);
                break;

            case brnncons.RoomState.RESULT():
                RobotCommand_Banker.create(this.room, this, this.ai);
                break;
        }
    }
}


module.exports = Robot;