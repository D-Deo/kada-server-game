const Super = require('../../../../room/robotCommand');
const logger = require('pomelo-logger').getLogger('game-bjl-robot', __filename);
const _ = require('underscore');


class RobotCommand_Banker extends Super {
    static create(room, robot, ai) {
        let command = new RobotCommand_Banker(room, robot, ai);
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

        this.handler = setInterval(() => this.timeout(), _.random(1000, 5000));
    }

    timeout() {
        let stateMgr = this.room.getComp('state');
        let seatMgr = this.room.getComp('seat');
        let user = this.robot.user;

        if (user.getId() == stateMgr.getBankerId()) {
            return;
        }

        if (user.getScore() < this.room.getAttr('bankerLimit')) {
            return;
        }

        logger.debug('[AI] 金币足够当庄');
        let bankerList = stateMgr.getBankerList();
        let count = 0;
        if (_.some(bankerList, (userId) => {
            if (userId == user.getId()) {
                return true;
            }
            let queuer = seatMgr.getUser(userId);
            if (queuer && queuer.isRobot()) {
                count++;
            }
            return false;
        })) {
            return;
        }

        if (count > 5) {
            return;
        }

        logger.debug('[AI] 当庄', user.getId());
        this.robot.banker();
    }
}


module.exports = RobotCommand_Banker;