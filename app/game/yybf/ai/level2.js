/**
 * Level2 猥琐型
 */
const yybfcons = require('../common/constants');
const logger = require('pomelo-logger').getLogger('game-yybf-robot', __filename);
const _ = require('underscore');

class Level2 {
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

        let betIndex = this._getSmallestBet( seat , betOptions ) ;
        if ( betIndex == -1 ) {
            this.alreadyBet++;
            logger.info('[AI1]', user.getId(), user.getScore(), '没有钱押注');
            return;
        }

        let r = _.random(0, 100);
        if (r >= 50) {
            this.alreadyBet++;
            logger.info('[AI1]', user.getId(), user.getScore(), '不想押注');
            return;
        }

        logger.info('[AI1]', user.getId(), user.getScore(), '押注最大金币');
        this.alreadyBet++;
        count = betOptions[betIndex];

        logger.info('[AI1]', user.getId(), user.getScore(), '当前押注', count);
        return { count: count };
    }

    _getSmallestBet( seat , betOptions ){
        let index = 0 ;
        for( let i = index ; i <= 3 ; i++ ){
            if( seat.canBet( betOptions[i] ) ){
                return i ;
            }
        }
        return -1 ;
    }
}

module.exports = Level2;
