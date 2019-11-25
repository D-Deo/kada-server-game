const Super = require('../../../room/jackpotManager');
const _ = require('underscore');

class JackpotManager extends Super {
    constructor(room) {
        super(room);
    }

    balance(seat, front) {
        if (this.room.getComp('seat').getSittingSeats_Robot().length == 0) {
            // 没有机器人，不需要控
            return;
        }

        let jackpot = this.getJackpot();
        let enabled = this.getEnabled();
        let minJackpot = this.getMinJackpot();
        let maxJackpot = this.getMaxJackpot();
        let killRate = this.getKillRate();
        let winRate = this.getWinRate();

        let r = _.random(0, 100);

        let logger = this.room.getComp('logger');
        logger.info('身份', seat.isRobot(), '控制', enabled, '最小', minJackpot, '最大', maxJackpot, '杀率', killRate, '胜率', winRate, '随机', r, '奖池', jackpot);

        // 控制没有开启，或者奖池在范围内时，不控制
        if (!this.getEnabled() || (jackpot >= minJackpot && jackpot <= maxJackpot)) {
            return;
        }

        // 当奖池回收时，只对机器人有效果
        if (jackpot < minJackpot && (!seat.isRobot() || r > killRate)) {
            return;
        }

        // 当奖池放水时，只对玩家有效果
        if (jackpot > maxJackpot && (seat.isRobot() || r > winRate)) {
            return;
        }

        let library = this.room.getComp('state').getLibrary();

        let card = null;

        for (let i = 0; i < seat.ron.length; i++) {
            let index = _.random(seat.ron.length - 1);
            let c = seat.ron[index];     // Card.createCard(seat.ron[index]);
            card = library.pickOneCard(c.suit, c.point);
            if (card) {
                break;
            }
        }

        if (card) {
            logger.info('存在胡牌', card, front);
            if (front) {
                library.cards.unshift(card);
            } else {
                library.cards.push(card);
            }
            return;
        }

        logger.info('不存在胡牌', seat.ron);
    }
}

module.exports = JackpotManager;