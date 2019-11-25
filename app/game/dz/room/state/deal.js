const cons = require('../../../../common/constants');
const dzcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');
const redis = require('../../../../../app/redis');


/**
 * @api {push} room.action 手牌发牌
 * @apiGroup dz
 * @params {string} name PlayerDeal
 * @params {json} msg 每个玩家手牌数据, 未参与牌局的位置为null
 */
class DealState extends Super {
    constructor(room) {
        super(room, dzcons.RoomState.DEAL(), dzcons.RoomStateInterval.DEAL());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');

        let library = stateManager.getLibrary();
        let seats = this.room.getComp('seat').getPlayingSeats();

        let jackpotMgr = this.room.getComp('jackpot');
        let jackpot = jackpotMgr.getJackpot();
        let enabled = jackpotMgr.getEnabled();
        let minJackpot = jackpotMgr.getMinJackpot();
        let maxJackpot = jackpotMgr.getMaxJackpot();
        let winRate = jackpotMgr.getWinRate();
        let killRate = jackpotMgr.getKillRate();

        let rate = jackpot / (maxJackpot - minJackpot) * 100;
        this.logger.info('奖池', jackpot, '最小', minJackpot, '最大', maxJackpot, '比例', rate, '送率', winRate, '杀率', killRate, '控制', enabled);


        // let r = _.random(100);

        // 1. 统计出所有玩家的点数，负数代表拿好牌，正数代表拿差牌

        // let goodPoint = 0;
        // let badPoint = 0;

        // let point = 0;

        // _.each(seats, seat => {
        // if (seat.isRobot()) {
        // return;
        // }

        // let userJackpot = jackpotMgr.getUserJackpot(seat.getUserId());
        // point += userJackpot;

        // let userPayTotal = seat.getUser().getPayTotal();
        // let realPoint = (userJackpot + userPayTotal) / userPayTotal * 100;
        // this.logger.debug('玩家', seat.getUserId(), '输赢', userJackpot, '总充', userPayTotal, '实际', realPoint);

        // if (realPoint > 110) {
        //     badPoint += userJackpot;
        // }

        // if (realPoint < 90) {
        //     goodPoint += userJackpot * -1;
        // }
        // });

        let orderSeats = _.sortBy(seats, (seat) => {
            if (seat.isRobot()) {
                if (jackpot > maxJackpot) {
                    return 200;
                } else if (jackpot > 0) {
                    return 110;
                } else if (jackpot < 0) {
                    return 90;
                } else {
                    return 0;
                }
            }
            let userJackpot = jackpotMgr.getUserJackpot(seat.getUserId());
            let userPayTotal = seat.getUser().getPayTotal();
            let realPoint = (userJackpot + userPayTotal) / userPayTotal * 100;
            this.logger.info('玩家', seat.getUserId(), '输赢', userJackpot, '总充', userPayTotal, '实际', realPoint);
            return realPoint;
        });

        // 临时打印位置信息
        // this.logger.debug('根据点数排序后的位置：\n', _.map(orderSeats, seat => {
        //     return { userId: seat.getUserId(), robot: seat.isRobot() };
        // }));

        _.each(orderSeats, (seat) => {
            let r = _.random(100);

            if (seat.isRobot()) {
                if (enabled) {                      // 是否开启总奖池控制
                    if (jackpot > maxJackpot) {     // 是否放水
                        if (r <= winRate) {         // 触发放水概率，机器人拿差牌
                            seat.deal(library.getCardsBad());
                            this.logger.info('电脑', seat.getUserId(), '差牌', r);
                        }
                    }

                    if (jackpot < minJackpot) {     // 是否回收
                        if (r <= killRate) {        // 触发回收概率，机器人拿好牌
                            seat.deal(library.getCardsGood());
                            this.logger.info('电脑', seat.getUserId(), '好牌', r);
                        }
                    }
                }

                return;
            }

            let userJackpot = jackpotMgr.getUserJackpot(seat.getUserId());
            let userPayTotal = seat.getUser().getPayTotal();

            let p = ((userJackpot + userPayTotal) / userPayTotal * 100 - 100) * 10;
            let d = rate - p;
            this.logger.info('玩家', seat.getUserId(), '随机', r, '种子', d, '个控', p);

            if (d > 0) {
                if (r <= d) {
                    seat.deal(library.getCardsGood());
                    this.logger.debug('玩家', seat.getUserId(), '当前玩家拿好牌');
                }
            }

            if (d < 0) {
                if (r <= d * -1) {
                    seat.deal(library.getCardsBad());
                    this.logger.debug('玩家', seat.getUserId(), '当前玩家拿差牌');
                }
            }
        });

        // 其余没有牌的玩家随机拿牌
        _.each(seats, seat => {
            if (seat.hasHand()) return;
            seat.deal(library.getCardsRandom());
            this.logger.info('玩家', seat.getUserId(), '电脑', seat.isRobot(), '随机发牌');
        });

        _.each(seats, s1 => {
            s1.sendAction(cons.RoomAction.PLAYER_DEAL(), _.map(seats, s2 => s2.toJson_Hand(s1)));
        });

        stateManager.getSblindSeat().bid(dzcons.Bid.SBLIND(), this.room.getAttr('baseScore') / 2);
        stateManager.getBblindSeat().bid(dzcons.Bid.BBLIND(), this.room.getAttr('baseScore'));
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(dzcons.RoomState.PLAY());
    }
}


module.exports = DealState;