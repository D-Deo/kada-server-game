const Super = require('../../../../room/robotCommand');
const _ = require('underscore');


class RobotCommand_Bet extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_Bet(room, robot, ai);
        robot.runCommand(command);
        return command;
    }

    constructor(room, robot, ai) {
        super(room, robot);

        this.ai = ai;
        this.handler = null;
    }

    clear() {
        super.clear();

        if (this.handler === null) {
            return;
        }

        clearInterval(this.handler);
        this.handler = null;
    }

    isThinking() {
        return this.handler !== null;
    }

    run() {
        if (this.isThinking()) {
            console.error('RobotCommand_Thinking run: thinking');
            return;
        }

        this.handler = setInterval(() => this.call(), _.random(1000, 5000));
    }

    call() {
        let stateMgr = this.room.getComp('state');
        let seatMgr = this.room.getComp('seat');
        let user = this.robot.user;

        if (user.getScore() < this.room.getAttr('betOptions')[0]) {
            return;
        }

        let ret = this.ai.bet();

        if (!ret || !_.isNumber(ret.count)) {
            return;
        }

        let seat = seatMgr.getSeatByUserId(user.getId());
        if (!seat.canBet(ret.count)) {
            return;
        }

        // if (!stateMgr.canBet(ret.count)) {
        //     return;
        // }

        this.robot.bet(ret.count);
    }
}


module.exports = RobotCommand_Bet;