const AI = require('../ai');
const cons = require('../../../common/constants');
const yybfcons = require('../common/constants');
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

    bet(count) {
        if(!this.seat){
            return;
        }
        let stateManager = this.room.getComp('state');
        this.seat.bet(count);
        stateManager.addBetCount(count);
        this.action({ name: cons.RoomAction.PLAYER_BID(), userId: this.user.getId(), count: count });
    }

    onEnterRoom() {
        // let stateMgr = this.room.getComp('state');
        // let seatMgr = this.room.getComp('seat');


        // let count = 0;
        // if (_.some(stateMgr.bankList, (userId) => {
        //     if (userId == this.user.getId()) {
        //         return true;
        //     }
        //     let queuer = seatMgr.getUser(userId);
        //     if (queuer && queuer.isRobot()) {
        //         count++;
        //     }
        //     return false;
        // })) {
        //     return;
        // }

        // if (count > 5) {
        //     return;
        // }

        // this.banker();
    }

    onAction_RoomStateChangeState(msg) {
        if (this.cmd) {
            this.cmd.clear();
            this.cmd = null;
            this.ai.reset();
        }

        switch (msg.type) {
            case yybfcons.RoomState.IDLE():
                // RobotCommand_Banker.create(this.room, this, this.ai);
                break;

            case yybfcons.RoomState.BETTING():
                // RobotCommand_Banker.create(this.room, this, this.ai);
                this.cmd = RobotCommand_Bet.create(this.room, this, this.ai);
                break;

            case yybfcons.RoomState.OPENING():
                // RobotCommand_Banker.create(this.room, this, this.ai);
                break;

            case yybfcons.RoomState.RESULT():
                // RobotCommand_Banker.create(this.room, this, this.ai);
                break;
        }
    }
}


module.exports = Robot;