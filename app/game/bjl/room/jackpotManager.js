const Super = require('../../../room/jackpotManager');
const bjlcons = require('../common/constants');
const _ = require('underscore');
const utils = require('../poker/utils');

class JackpotManager extends Super {
    constructor(room) {
        super(room);
    }

    balance() {
        let jackpot = this.getJackpot();

        let logger = this.room.getComp('logger');
        let stateMgr = this.room.getComp('state');
        let seatMgr = this.room.getComp('seat');

        let library = stateMgr.getLibrary();

        let opens = [];

        let minJackpot = this.getMinJackpot();
        let maxJackpot = this.getMaxJackpot();
        let winRate = this.getWinRate();
        let killRate = this.getKillRate();
        let enabled = this.getEnabled();

        logger.info('当前奖池', '控制', enabled, '奖池', jackpot, '最小', minJackpot, '最大', maxJackpot, '胜率', winRate, '杀率', killRate);

        // 10次内判断是否有合理的开奖结果
        let i = 10;
        let bestOpen = null;
        do {
            let open = library.open();
            let openAreas = utils.toOpenAreas(open.road);

            let allScore = _.reduce(seatMgr.getPlayingSeats(), (allScore, seat) => {
                if (!seat || !seat.getUser() || seat.isRobot()) {
                    return allScore;
                }

                let userJackpot = this.getUserJackpot(seat.getUserId());
                let userPayTotal = seat.getUser().getPayTotal();

                let score = _.reduce(seat.getBetChips(), (score, num, area) => {
                    if (num > 0) {
                        let s = num * bjlcons.RoomAreaMulti[area];
                        score += openAreas[area] == 1 ? s : -num;
                    }
                    return score;
                }, 0);

                let weight = (userJackpot + userPayTotal) / userPayTotal * 100;
                let r = _.random(99);
                let d = (100 - weight) * 10;

                logger.info(seat.getUserId(), r, d, '分数', score, '输赢', userJackpot, '充值', userPayTotal, '权重', weight);

                if (d > 0 && r < d) {
                    if (score >= 0) {
                        open.wanted += 1;
                    }
                    // if (score < 0) {
                    //     open.wanted -= 1;
                    // }
                }

                if (d < 0 && r < d * -1) {
                    if (score <= 0) {
                        open.wanted += 1;
                    }
                    // if (score > 0) {
                    //     open.wanted -= 1;
                    // }
                }

                allScore -= score;
                return allScore;
            }, 0);

            open.score = allScore;

            let r = _.random(99);
            let weight = 0;
            if (enabled) {
                if (jackpot < minJackpot) {     // 奖池低于下限，一定概率杀分
                    if (r < killRate) {
                        if (open.score < 0) {
                            weight = -100;
                        }
                    }
                }

                if (jackpot > maxJackpot) {     // 奖池高于上限，一定概率送分
                    if (r < winRate) {
                        if (open.score > 0) {
                            weight = -100;
                        }
                    }
                }
            }

            open.weight = ((open.wanted / seatMgr.getPlayingSeats().length * 100) || 0) + weight; // 想要的玩家占比 + 奖池控制的权重
            logger.info('当前结果', '概率', r, '权重', open.weight, '分数', open.score, '期望', open.wanted, '开奖', open.road.toString(2));

            if (r < open.weight) {
                bestOpen = open;
                break;
            }
            opens.push(open);
            i -= 1;
        } while (i);

        opens.length && library.addOpen(...opens);
        return bestOpen || library.getBestOpen();
    }
}

module.exports = JackpotManager;
