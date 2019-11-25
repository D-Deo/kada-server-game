const bjlcons = require('../common/constants');
const logger = require('pomelo-logger').getLogger('game-bjl-robot', __filename);
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
        if (r <= 70) {
            count = betOptions[0];
        } else if (r <= 90) {
            count = betOptions[1];
        } else if (r <= 95) {
            count = betOptions[2];
        } else {
            count = betOptions[3];
        }

        let area = 0;

        if (_.random(0, 100) > 80) {
            this.alreadyBet++;
            logger.info('[AI1]', user.getId(), user.getScore(), '不想押注');
            return;
        }

        if (_.random(0, 100) <= 60) {
            logger.info('[AI1]', user.getId(), user.getScore(), '押注庄闲');
            area = _.random(0, 100) > 50 ? 0 : 1;
        } else if (_.random(0, 100) <= 50) {
            logger.info('[AI1]', user.getId(), user.getScore(), '押注天王');
            area = _.random(0, 100) > 50 ? 2 : 3;
        } else if (_.random(0, 100) <= 30) {
            logger.info('[AI1]', user.getId(), user.getScore(), '押注和');
            area = 6;
        } else if (_.random(0, 100) <= 25) {
            logger.info('[AI1]', user.getId(), user.getScore(), '押注对子');
            area = _.random(0, 100) > 50 ? 4 : 5;
        } else if (_.random(0, 100) <= 2) {
            logger.info('[AI1]', user.getId(), user.getScore(), '押注同点和');
            area = 7;
        } else {
            logger.info('[AI1]', user.getId(), user.getScore(), '不想押注');
            return;
        }

        if (!seat.canBet(count)) {
            this.alreadyBet++;
            logger.info('[AI1]', user.getId(), user.getScore(), '没有钱押注', area, count);
            return;
        }

        this.alreadyBet++;
        logger.info('[AI1]', user.getId(), user.getScore(), '当前押注', area, count);
        return { area: area, count: count };
    }
}

module.exports = Level1;
