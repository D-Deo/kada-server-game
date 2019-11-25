const Super = require('../../../room/jackpotManager');
const fqzscons = require('../common/constants');
const _ = require('underscore');

class JackpotManager extends Super {
    constructor(room) {
        super(room);
    }

    init() {
        super.init();
    }

    balance() {
        let logger = this.room.getComp('logger');

        let r = _.random(100);
        let minBet = this.getMinBet();
        let enabled = this.getEnabled();
        let jackpot = this.getJackpot();
        let winRate = this.getWinRate();
        let killRate = this.getKillRate();
        let minJackpot = this.getMinJackpot();
        let maxJackpot = this.getMaxJackpot();

        logger.info('开关', enabled, '容差', minBet
            , '权重', r, '杀率', killRate, '胜率', winRate
            , '最小', minJackpot, '最大', maxJackpot, '奖池', jackpot);

        if (!enabled) {
            let road = _.random(fqzscons.RoomOpenConfigs.length - 1);
            logger.debug('当前不控制奖池', road);
            return { road };
        }

        let seatMgr = this.room.getComp('seat');

        let opens = [];
        let scores = [];

        // 只判断各类实际动物，不判断飞禽和走兽
        for (let i = 0; i < 10; i++) {
            // 当前区域玩家是否投注
            let isBet = false;

            // 平台盈亏，正数说明平台赚钱，负数说明平台亏钱
            let allScore = _.reduce(seatMgr.getSeats(), (allScore, seat) => {
                if (!seat || !seat.getUser() || seat.isRobot() || seat.isTest()) {
                    return allScore;
                }

                let score = _.reduce(seat.getBetChips(), (score, cost, area) => {
                    if (cost > 0) {
                        //area 0金鲨，1银鲨，2老鹰，3狮子，4孔雀，5鸽子，6熊猫，7猴子，8燕子，9兔子，10飞禽，11走兽
                        let s = cost * fqzscons.RoomAreaMulti[area];
                        score -= cost;   // 先去掉成本

                        if (area == i) {
                            isBet = true;
                            score += s;
                        } else if (area == 10 && (i == 2 || i == 4 || i == 5 || i == 8)) {
                            isBet = true;
                            score += s;
                        } else if (area == 11 && (i == 3 || i == 6 || i == 7 || i == 9)) {
                            isBet = true;
                            score += s;
                        }
                    }
                    return score;
                }, 0);

                allScore -= score;
                return allScore;
            }, 0);

            if (Math.abs(allScore) > minBet) {
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

            opens.push({ area: i, score: allScore, multi: fqzscons.RoomAreaMulti[i] });
            scores.push({ area: i, score: allScore });
        }

        logger.debug('奖池控制筛选后的开奖', opens);

        // 过滤掉赔付不够的奖池
        opens = _.filter(opens, (o) => {
            return o.score >= 0 || jackpot + o.score >= 0;
        });
        logger.debug('过滤掉不够赔付的开奖', opens);

        if (r <= winRate && jackpot >= maxJackpot * 1.5) {
            let t = _.filter(opens, (o) => {
                return o.score < 0;
            });
            if (t.length > 0) opens = t;
            logger.debug('当前奖池大于放水线 1.5 倍，过滤掉玩家不赚的开奖', opens);
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
                if (r <= p + 1) {
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

        //========================
        // 这里判断通吃和通赔的情况

        // 真实玩家的总盈亏
        let playerScore = 0;
        // 计算所有玩家包含机器人和测试的总盈亏
        let allScore = _.reduce(seatMgr.getSeats(), (allScore, seat) => {
            if (!seat || !seat.getUser()) {
                return allScore;
            }

            let score = _.reduce(seat.getBetChips(), (score, cost, area) => {
                if (cost > 0) {
                    let s = cost * fqzscons.RoomAreaMulti[area];
                    score += s - cost;
                    if (!seat.isRobot() && !seat.isTest()) {
                        playerScore += cost;
                    }
                }
                return score;
            }, 0);

            allScore += score;
            return allScore;
        }, 0);

        let stateMgr = this.room.getComp('state');
        if (allScore > minBet) {
            let r = _.random(100);
            logger.debug('计算通赔，通吃开奖', r, allScore, stateMgr.getJackpot());
            if (r <= winRate && jackpot >= maxJackpot && jackpot - allScore >= 0 && stateMgr.getJackpot() >= allScore * 2 && r >= 50) {
                logger.debug('当前放水模式，概率触发，游戏奖金池大于总赔率2倍，可以通赔', r, allScore, stateMgr.getJackpot());
                open = { area: -1 };
            } else if (r <= killRate && jackpot <= minJackpot && jackpot + playerScore >= minJackpot && r >= 50) {
                logger.debug('当前回收模式，概率触发，玩家一次填充奖池的钱，可以通吃', r, allScore);
                open = { area: -2 };
            }
        }

        //========================

        if (!open) {
            // 只能赔最少
            open = _.max(_.shuffle(scores), s => s.score);
            logger.debug('没有赢钱，只能赔最少', open, scores);
        }

        let roads = _.map(fqzscons.RoomOpenConfigs, (area, road) => {
            if (area == open.area) {
                return { area, road };
            }
            //10飞禽 = 2老鹰，4孔雀，5鸽子，8燕子
            if (open.area == 10 && (area == 2 || area == 4 || area == 5 || area == 8)) {
                return { area, road };
            }
            //11走兽 = 3狮子，6熊猫，7猴子，9兔子
            if (open.area == 11 && (area == 3 || area == 6 || area == 7 || area == 9)) {
                return { area, road };
            }

            return null;
        });
        let road = _.first(_.shuffle(_.filter(roads, r => r != null)));
        logger.debug('筛选结果', road);

        return road;
    }

}

module.exports = JackpotManager;
