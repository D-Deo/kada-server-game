const fqzscons = require('../common/constants');
const logger = require('pomelo-logger').getLogger('game-fqzs-robot', __filename);
const _ = require('underscore');

class Level1 {
    constructor(robot) {
        this.robot = robot;
        this.alreadyBet = 0;
        logger.info('[AI]', this.robot.user.getId(), '初始化AI');
    }

    reset() {
        this.alreadyBet = 0;
    }

    bet() {
        // if (this.alreadyBet >= 1) {
        //     return;
        // }

        let user = this.robot.user;
        let seat = this.robot.seat;
        let room = this.robot.room;

        logger.info('[AI1]', user.getId(), '开始思考...');

        let betOptions = room.getAttr('betOptions');

        let count = 0;
        let r = _.random(0, 100);
        logger.info('[AI1]', user.getId(), user.getScore(), '押注金币随机值', r);
        if (r <= 60) {
            count = betOptions[0];
        } else if (r <= 80) {
            count = betOptions[1];
        } else if (r <= 90) {
            count = betOptions[2];
        } else {
            count = betOptions[3];
        }

        r = _.random(0, 100);
        if (r >= 80) {
            this.alreadyBet++;
            logger.info('[AI1]', user.getId(), user.getScore(), '不想押注');
            return;
        }

        let area = r % fqzscons.RoomAreaMulti.length;
        logger.info('[AI1]', user.getId(), user.getScore(), '押注', area);

        if (!seat.canBet(count)) {
            this.alreadyBet++;
            logger.info('[AI1]', user.getId(), user.getScore(), '没有钱押注', area, count);
            return;
        }

        this.alreadyBet++;
        logger.info('[AI1]', user.getId(), user.getScore(), '当前押注', area, count);
        return { area, count };
    }
}

module.exports = Level1;
