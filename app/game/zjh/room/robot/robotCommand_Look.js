const Super = require('../../../../room/robotCommand_Observe');
const _ = require('underscore');


class RobotCommand_Look extends Super {
    static create(room, robot) {
        let command = new RobotCommand_Look(room, robot);
        command.run();
        // let command = new RobotCommand_Look(room, robot);
        // robot.runCommand(command);
        return command;
    }

    constructor(room, robot) {
        super(room, robot, 2000, 5000);
    }

    call() {
        let logger = this.room.getComp('logger');

        if (!this.robot.getSeat()) {
            this.clear();
            return;
        }

        if (this.robot.getSeat().isLooked()) {
            this.clear();
            return;
        }

        let stateManager = this.room.getComp('state');
        if (stateManager.getRound() < 2) {
            return;
        }

        let selfBid = this.robot.getSeat().getBidTotal() / this.room.getAttr('baseScore');
        let r = _.random(100);
        if (selfBid * 5 >= r) {
            logger.debug('[AI] [LOOK]', this.robot.getSeatIndex(), '押注额太高，需要看牌', selfBid, r);
            this.robot.look();
            return;
        }

        let curBid = this.room.getComp('state').getBid();
        let betOptions = this.room.getAttr('betOptions');

        let bidSeat = stateManager.getBidSeat();

        for (let i in betOptions) {
            let opt = betOptions[i];
            if (curBid == opt) {
                let rdm = (parseInt(i) + 1) / betOptions.length * 100;
                let r = _.random(100);
                if (bidSeat.isLooked()) {
                    r = r / 2;
                    logger.debug('[AI] [LOOK]', this.robot.getSeatIndex(), '对方已看牌', rdm, r);
                }
                if (rdm >= r) {
                    logger.debug('[AI] [LOOK]', this.robot.getSeatIndex(), '要看牌', rdm, r);
                    this.robot.look();
                    return;
                }
            }
        }
    }
}


module.exports = RobotCommand_Look;