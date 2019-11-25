const Super = require('../../../room/jackpotManager');
const bcbmcons = require('../common/constants');
const _ = require('underscore');

class JackpotManager extends Super {
    constructor(room) {
        super(room);
    }

    balance() {
        let logger = this.room.getComp('logger');

        let r = _.random(100);
        let winRate = this.getWinRate();
        let killRate = this.getKillRate();
        let minBet = this.getMinBet();
        let enabled = this.getEnabled();
        let jackpot = this.getJackpot();
        let minJackpot = this.getMinJackpot();
        let maxJackpot = this.getMaxJackpot();

        logger.info('开关', enabled, '容差', minBet,
            '权重', r, '杀率', killRate, '胜率', winRate,
            '最小', minJackpot, '最大', maxJackpot, '奖池', jackpot);

        if (!enabled) {
            let road = _.random(bcbmcons.RoomOpenConfigs.length - 1);
            logger.debug('当前不控制奖池', road);
            return { road };
        }

        let seatMgr = this.room.getComp('seat');

        let opens = [];
        let scores = [];

        for (let i = 0; i < bcbmcons.RoomAreaMulti.length; i++) {
            // 当前区域玩家是否投注
            let isBet = false;

            let allScore = _.reduce(seatMgr.getSeats(), (allScore, seat) => {
                if (!seat || !seat.getUser() || seat.isRobot() || seat.isTest()) {
                    return allScore;
                }

                let score = _.reduce(seat.getBetChips(), (score, cost, area) => {
                    if (cost > 0) {
                        let s = cost * bcbmcons.RoomAreaMulti[area];
                        score -= cost;   // 先去掉成本
                        // score += area == i ? s : -cost;
                        if (area == i) {
                            isBet = true;
                            score += s;
                        }
                    }
                    return score;
                }, 0);

                allScore -= score;

                return allScore;
            }, 0);

            if (Math.abs(allScore) >= minBet) {
                if (r <= winRate && allScore > 0 && jackpot >= maxJackpot && !isBet) {
                    logger.debug('当前区域平台赚钱，奖池模式放水，玩家不投注的区域，不需要进入开奖队列', i, allScore);
                    scores.push({ area: i, score: allScore });
                    continue;
                }

                if (r <= killRate && allScore < 0 && jackpot <= minJackpot) {
                    logger.debug('当前区域平台亏钱，奖池模式回收，不需要进入开奖队列', i, allScore);
                    scores.push({ area: i, score: allScore });
                    continue;
                }
            }

            opens.push({ area: i, score: allScore, multi: bcbmcons.RoomAreaMulti[i] });
            scores.push({ area: i, score: allScore });
        }

        logger.debug('奖池控制筛选后的开奖', opens);

        // 过滤掉赔付不够的奖池
        opens = _.filter(opens, (o) => {
            return o.score >= 0 || jackpot + o.score >= 0;
        });
        logger.debug('过滤掉不够赔付的开奖', opens);

        if (r <= winRate && jackpot >= maxJackpot) {
            let t = _.filter(opens, (o) => {
                return o.score < 0;
            });
            if (t.length > 0) opens = t;
            logger.debug('胜率满足，过滤掉玩家不赚的开奖', opens);
        }

        // 有开奖结果
        let open = null;
        if (opens.length > 0) {
            let r = _.random(100);

            let cm = _.reduce(opens, (cm, o) => {
                return cm * o.multi;
            }, 1);

            let all = _.reduce(opens, (all, o) => {
                return all += cm / o.multi;
            }, 0);

            open = _.find(opens, (o) => {
                let p = cm / o.multi / all * 100;
                if (r <= p) {
                    return true;
                }
                r -= p;
                return false;
            });

            if (!open) {
                logger.warn('不可能没有开奖结果', opens);
            }
        }

        logger.debug('筛选后的开奖', open);

        if (!open) {
            // 只能赔最少
            open = _.max(_.shuffle(scores), s => s.score);
            logger.debug('没有赢钱，只能赔最少', open, scores);
        }

        let roads = _.map(bcbmcons.RoomOpenConfigs, (area, road) => {
            return area == open.area ? { area, road } : null;
        });
        let road = _.first(_.shuffle(_.filter(roads, r => r != null)));
        logger.debug('筛选结果', road);

        return road;
    }

}

module.exports = JackpotManager;
