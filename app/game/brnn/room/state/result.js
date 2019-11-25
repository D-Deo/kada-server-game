const cons = require('../../../../common/constants');
const brnncons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const model = require('../../../../db/model');
const utils = require('../../../../utils');
const _ = require('underscore');

class ResultState extends Super {
    constructor(room) {
        super(room, brnncons.RoomState.RESULT(), brnncons.RoomStateInterval.RESULT());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');
        let seatManager = this.room.getComp('seat');
        let jackpotManager = this.room.getComp('jackpot');

        let openCards = stateManager.getOpenResult();
        // let openCards = stateManager.getOpenResult();
        //let openAreas = brnnUtils.toOpenAreas(stateManager.getRoadList()[0]);

        // let banker = stateManager.getBanker();
        // let bankScore = 0;

        let jackpot = 0;

        let balance = {};
        let players = _.map(seatManager.getSeats(), (seat) => {
            // if (!seat || !seat.getUser() || seat.getUserId() === stateManager.getBankerId()) {
            //     return null;
            // }

            // if (!seat || !seat.getUser() || seat.isRobot()) {
            //     return null;
            // }

            if (!seat || !seat.getUser()) {
                return null;
            }

            let multi = this.room.getAttr('baseMulti');

            let score = 0;
            let cost = 0;
            let chips = seat.getBetChips();
            _.each(chips, (num, area) => {
                cost += num;
                // cost += openAreas[area] == 1 ? num : 0;
                if (num > 0) {
                    //let s = num * brnncons.RoomAreaMulti[area];
                    // 玩家赢，按闲倍率，否则，按庄家倍率，同时算上房间赔率
                    let s = num * openCards.r_array[area] * (multi || 1);
                    // 本金下注时候已经扣除，所以此处要还本金，赔率2时，赢钱算本金一共收回3;输钱时需要再拿1;
                    score += (s + num);
                    // 庄不赚本金
                    // bankScore -= s; //openAreas[area] == 1 ? -s : num;
                }
            });

            // if (!banker && !seat.isRobot()) jackpot -= score - cost;
            // if (banker && banker.isRobot() && !seat.isRobot()) jackpot -= score - cost;
            // if (banker && !banker.isRobot() && seat.isRobot()) jackpot += score - cost;

            // 计算玩家的个人输赢
            if (!seat.isRobot()) {
                jackpotManager.addUserJackpot(seat.getUserId(), score - cost);
            }

            // 扣税 需要去除本钱
            let fee = (score - cost <= 0) ? 0 : _.max([1, parseInt((score - cost) * cons.GAME_FEE())]);
            score -= fee;
            score = Math.floor(score);

            // cost
            if (!seat.isRobot()) {
                if (!seat.isTest()) {
                    jackpot -= score - cost;
                }
                // (score != 0) && seat.getUser().changeScore(score, 1);
                (score > 0) && seat.getUser().changeScore(score, 1, cons.ItemChangeReason.PLAY_WIN());
                (score < 0) && seat.getUser().changeScore(score, 1, cons.ItemChangeReason.PLAY_LOSE());
            }

            return {
                uid: seat.getUserId(),
                score: score,
                bet: cost,
                fee: fee,
                chipMgr: seat.chipMgr
            };
        });

        balance.players = _.compact(players);
        balance.open = stateManager.getRoadList()[0];

        // let banker = stateManager.getBanker();
        // if (banker) {
        //     let fee = (bankScore <= 0) ? 0 : _.max([1, parseInt(bankScore * cons.GAME_FEE())]);
        //     bankScore -= fee;
        //     bankScore = Math.floor(bankScore);

        //     balance.banker = {
        //         uid: banker.getId(),
        //         score: bankScore,
        //         fee: fee
        //     };
        //     banker.changeScore(bankScore);
        // }

        balance.jackpot = jackpotManager.getJackpot();
        jackpotManager.addJackpot(jackpot);

        this.logger.info('总奖池', jackpotManager.getJackpot(), '当前奖池：', jackpot, '当前结算：', balance);

        this.recordIncome(balance);
        //        stateManager.pushRoadToList();

        balance.players = _.sortBy(balance.players, p => -(p.score - p.bet)).splice(0, 4);
        if (balance.players[0]) {
            stateManager.setMaxWinner(balance.players[0].uid);
        }
        this.room.getComp('round').result(balance);
    }

    recordIncome(balance) {
        let records = _.map(balance.players, (s, i) => {
            let seat = this.room.getComp('seat').getSeatByUserId(s.uid);
            if (!seat.getPlayUserId() || seat.isRobot() || s.bet == 0) {
                return;
            }

            return {
                room: this.room.getAttr('uuid'),
                userId: seat.getPlayUserId(),
                itemId: cons.Item.GOLD(),
                count: s.fee,
                timestamp: utils.date.timestamp(),
                gameId: this.room.getAttr('gameId'),
                cost: s.bet,
                score: s.score,
                open: JSON.stringify({ open: balance.open, chips: s.chipMgr }),
                game: this.room.getAttr('game'),
                area: this.room.getAttr('area'),
                coin: seat.getPlayUserScore() + s.score - s.bet,
                jackpot: balance.jackpot,
            };
        });

        // if (balance.banker) {
        //     let seat = this.room.getComp('seat').getSeatByUserId(balance.banker.uid);
        //     if (seat.isRobot() || balance.banker.fee <= 0) {
        //         return;
        //     }

        //     records.push({
        //         room: this.room.getAttr('uuid'),
        //         userId: seat.getUserId(),
        //         itemId: cons.Item.GOLD(),
        //         count: balance.banker.fee,
        //         timestamp: utils.date.timestamp()
        //     });
        // }

        // this.logger.debug(this.room.getAttr('gameId'), '过滤前', records);
        records = _.compact(records);
        // this.logger.debug(this.room.getAttr('gameId'), '过滤前', records);

        let p = model.RoomIncomeRecord.bulkCreate(records);
        p.catch(e => {
            this.logger.error('ResultState recordIncome:', e);
        });
    }

    end() {
        super.end();
        this.room.getComp('round').end(false);
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = ResultState;