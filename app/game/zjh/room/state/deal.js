const cons = require('../../../../common/constants');
const zjhcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');
const redis = require('../../../../../app/redis');

/**
 * @api {push} room.action 手牌发牌
 * @apiGroup zjh
 * @param {string} name PlayerDeal
 * @param {json} msg 每个玩家手牌数据, 未参与牌局的位置为null
 */
class DealState extends Super {
    constructor(room) {
        super(room, zjhcons.RoomState.DEAL(), zjhcons.RoomStateInterval.DEAL());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');
        let seats = this.room.getComp('seat').getSeats();

        // let jackpot = await redis.async.get(`UpGame:ZJH:AREA_${this.room.getAttr('area')}:jackpot`);
        // jackpot = parseInt(jackpot) || 0;

        let jackpotMgr = this.room.getComp('jackpot');
        let jackpot = jackpotMgr.getJackpot();

        let r = _.random(100); //   0<= r <= 100


        /**
        * 1 先检查有没有真实玩家是幸运玩家或倒霉玩家
        * 2 把这些人幸运和倒霉的情况排序
        * 3 先给幸运的人或者倒霉的人发好牌和差牌，其他人不管是机器人还是真人都发随机牌
        * 4 unluckyPer ：倒霉值 动态 该值越小越容易倒霉
        * 5 luckyPer ： 幸运值 动态  该值越大越容易幸运
        * 6 最终的总倒霉值 由 倒霉值 和 用户个人奖池 共同决定  (用户赢的钱超出充值的钱越多越容易倒霉)
        * 7 最终的幸运值 由 幸运值 和 用户个人奖池 共同决定  (用户输的钱越多越容易幸运)
        * 8 不同情况下幸运值和倒霉值不同，共三种情况 1 奖池未开放  2 奖池为负 3 奖池为正
        * */

        let unluckyPer = 100;
        let luckyPer = 50;

        //奖池没开的情况下
        if (!jackpotMgr.getEnabled()) {
            unluckyPer = 100;
            luckyPer = 50;
            this.logger.info("未开放奖池");
        } else {
            //奖池为负的情况下
            if ((r <= jackpotMgr.getKillRate() && jackpot < jackpotMgr.getMinJackpot())
                || (jackpot <= this.room.getAttr('capacity') * this.room.getAttr('baseScore'))) {
                unluckyPer = 30;
                luckyPer = 30;
                this.logger.info("奖池为抽水", "jackpot=", jackpot, "getMinJackpot=", jackpotMgr.getMinJackpot());
            }

            //奖池为正的情况下
            if (r <= jackpotMgr.getWinRate() && jackpot > jackpotMgr.getMaxJackpot()
                && jackpot > this.room.getAttr('capacity') * this.room.getAttr('baseScore')) {
                unluckyPer = 100;
                luckyPer = 80;
                this.logger.info("奖池为放水", "jackpot=", jackpot, "getMaxJackpot=", jackpotMgr.getMaxJackpot());
            }
        }

        let unluckyPlayersInfo = [];

        let luckyPlayersInfo = [];

        //获取幸运的人和倒霉的人
        _.each(seats, seat => {
            if (!seat.isPlaying()) {
                return null;
            }

            if (!seat.isRobot()) {
                // let userJackpotInfo = seat.getJackpot();

                let totalPay = seat.getUser().getPayTotal();    //总充值
                // let userScore = seat.getUser().getScore(); 
                let userScore = jackpotMgr.getUserJackpot();    //总输赢 （此值只会随着玩家的输赢变动）       
                let maxMultiple = 1.3;  //赢的最大倍数 该值大于1 （后台获取）
                let minMutiple = 0.8;   //输的最大倍数 该值小于1  （后台获取）
                let noPayWinScore = 100;                        // 没有充值过的人赢钱的上限，不能超过这个金额  （后台获取）
                let unluckyMultiple = minMutiple * 0.5;         //(玩家输钱达到的倒霉值倍数) (后台获取)
                let multiple = userScore / totalPay;

                /**
                 * 考虑以下几种特殊情况
                 * 1 totalPay == 0 && userScore < noPayWinScore
                 * 2 totalPay == 0 && userScore > noPayWinScore
                 * 3 multiple < unluckyMultiple
                 */
                //1 假如玩家没有充值过钱赢了没有超过 noPayWinScore，设置 multiple = 1,此时玩家的输赢很大程度上是随机
                if (totalPay == 0 && userScore < noPayWinScore) {
                    multiple = 1;
                }

                //2 假如玩家没有充值过钱并且赢了超过 noPayWinScore，设置 multiple = maxMultiple + 0.5,此时玩家大概率输
                if (totalPay == 0 && userScore > noPayWinScore) {
                    multiple = maxMultiple + 0.5;
                }

                //3 为了保证当一个傻逼愚蠢操作导致输的很多的时候不会让他疯狂的拿好牌，这里做个限制，
                //  当用户输到一定程度，就不参与个人奖池控制，此时 设置 multiple=1，输赢随机
                if (multiple < unluckyMultiple) {
                    multiple = 1;
                }

                /**
                 * 个人奖池信息
                 * maxMultiple ：玩家赢的情况下 ->玩家携带的钱包括银行里的钱与充值的钱比的最大倍数（玩家赢的钱不能是充值的多少倍）
                 * minMutiple ： 玩家输的情况下 ->玩家携带的钱包括银行里的钱与充值的钱比的最大倍数（玩家输的钱不能是充值的多少倍）
                 * multiple ：玩家携带的钱包括银行里的钱与充值的钱比的实际倍数
                 */

                if (multiple >= maxMultiple) {              //个人奖池为正
                    let dif = multiple - maxMultiple;       //dif 越大越倒霉
                    let random = 100 + dif * 100;
                    let r = _.random(random);
                    if (r >= unluckyPer) {
                        let unluckyInfo = {};
                        unluckyInfo.dif = dif;
                        unluckyInfo.seat = seat;
                        unluckyInfo.random = r;
                        unluckyPlayersInfo.push(unluckyInfo);
                    }

                }

                if (multiple <= minMutiple) {//个人奖池为负
                    let dif = minMutiple - multiple;//dif 越大越幸运
                    let random = 100 - dif * 100;
                    if (random < 0) {
                        random = 0;
                    }

                    let r = _.random(random);

                    if (r < luckyPer) {
                        let luckyInfo = {};
                        luckyInfo.dif = dif;
                        luckyInfo.seat = seat;
                        luckyInfo.random = r;
                        luckyPlayersInfo.push(luckyInfo);
                    }

                }
            }
        });

        //排序 倒霉的人
        this.sortFromBigToSmall(unluckyPlayersInfo);

        //排序 幸运的人
        this.sortFromBigToSmall(luckyPlayersInfo);

        //获取幸运的机器人和倒霉的机器人
        _.each(seats, seat => {
            if (!seat.isPlaying()) {
                return null;
            }

            if (seat.isRobot()) {
                //奖池为负的情况下，机器人优先获取好牌
                if (r <= jackpotMgr.getKillRate() && jackpot < jackpotMgr.getMinJackpot()) {
                    let luckyInfo = {};
                    luckyInfo.seat = seat;
                    luckyPlayersInfo.unshift(luckyInfo);
                }

                //奖池为正的情况下，机器人优先获取差牌
                if (r <= jackpotMgr.getWinRate() && jackpot > jackpotMgr.getMaxJackpot()) {
                    let unluckyInfo = {};
                    unluckyInfo.seat = seat;
                    unluckyPlayersInfo.unshift(unluckyInfo);
                }
            }
        });

        //倒霉的人按照倒霉值的顺序来发差牌，越倒霉牌越差 
        for (let i = 0; i < unluckyPlayersInfo.length; i++) {
            let seat = unluckyPlayersInfo[i].seat;
            seat.deal(stateManager.getLibrary().getCardsBad());
            this.logger.info("unlucky", luckyPlayersInfo[i].seat.getUserId(), luckyPlayersInfo[i].dif);
        }

        //幸运的人按照幸运值的顺序来发好牌，越幸运牌越好
        for (let i = 0; i < luckyPlayersInfo.length; i++) {
            let seat = luckyPlayersInfo[i].seat;
            seat.deal(stateManager.getLibrary().getCardsGood());
            this.logger.info("lucky", luckyPlayersInfo[i].seat.getUserId(), luckyPlayersInfo[i].dif);
        }

        _.each(_.shuffle(seats), seat => {
            if (!seat.isPlaying()) {
                return null;
            }

            //倒霉的人也发过牌了
            for (let i = 0; i < unluckyPlayersInfo.length; i++) {
                let unluckSeat = unluckyPlayersInfo[i].seat;
                if (seat == unluckSeat) {
                    return null;
                }
            }

            //幸运的人已经发过牌了
            for (let i = 0; i < luckyPlayersInfo.length; i++) {
                let luckSeat = luckyPlayersInfo[i].seat;
                if (seat == luckSeat) {
                    return null;
                }
            }

            seat.deal(stateManager.getLibrary().getCardsRandom());
        });

        _.each(seats, s1 => {
            if (!s1.isPlaying()) {
                return null;
            }
            s1.bid(zjhcons.Bid.BASE(), this.room.getAttr('baseScore'));
            s1.sendAction(cons.RoomAction.PLAYER_DEAL(), _.map(seats, s2 => s2.toJson_Hand(s1)));
        });
    }

    //从大到小排序
    sortFromBigToSmall(list) {

        let cbLast = list.length - 1;
        let temp;
        let bSorted = true;
        do {
            bSorted = true;
            for (let i = 0; i < cbLast; i++) {
                if (list[i].dif < list[i + 1].dif) {
                    temp = list[i];
                    list[i] = list[i + 1];
                    list[i + 1] = temp;
                    bSorted = false;
                }
            }
            cbLast--;
        } while (bSorted == false);

    }

    end() {
        super.end();
        this.room.getComp('state').changeState(zjhcons.RoomState.PLAY());
    }
}


module.exports = DealState;