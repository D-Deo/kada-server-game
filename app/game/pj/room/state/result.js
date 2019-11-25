const async = require('async');
const cons = require('../../../../common/constants');
const db = require('../../../../db');
const model = require('../../../../db/model');
const p9cons = require('../../common/constants');
const i18n = require('../../../../i18n');
const rpc = require('../../../../rpc/user');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');



/**
 * @api {json} round.balance.seat
 * @apiGroup NnRoom
 * @apiParam {number} fee 手续费
 * @apiParam {json} score 积分结构
 * @apiSuccessParam 返回
 * {
 *  "fee": 1,
 *  "score": {
 *      "change": 9,   变动值
 *      "score": 109,    变动后剩余
 *      "play": 30,    游戏结算
 *      "result": 10,   实际结算
 *  }
 * }
 */
class ResultState extends Super {
    constructor(room) {
        super(room, p9cons.RoomState.RESULT(), p9cons.RoomStateInterval.RESULT());
    }

    enter() {
        super.enter();

        let seatManager = this.room.getComp('seat');

        let banker = this.room.getComp('state').getBankerSeat();
        let bankerFormatter = banker.getHand().getFormatter();
        let bankerTimes = 0;
        // (bankerFormation.getType() === nncons.Poker.Formation.NONE()) && banker.recordAdd("noTimes", 1);
        // (bankerFormation.getType() >= nncons.Poker.Formation.NIUNIU()) && banker.recordAdd("nnTimes", 1);
        let bankerTakeAll = true;
        let bankerPayAll = true;
        let scores = _.map(seatManager.getSeats(), (seat) => {
            if ((seat === banker) || !seat.isPlaying()) {
                return null;
            }

            let bid = seat.getBid();
            let formatter = seat.getHand().getFormatter();

            let bankWin = bankerFormatter.compare(formatter);

            let roundScore = 0;
            if (bankWin < 0) {
                roundScore = bid * this.room.getAttr('baseScore');
                roundScore = _.min([roundScore, seat.getUser().getScore()]);
                seat.recordAdd("winTimes", 1);
                bankerTakeAll = false;
                bankerTimes -= bid;
            } else if (bankWin > 0) {
                roundScore = -bid * this.room.getAttr('baseScore');
                bankerPayAll = false;
                bankerTimes += bid;
            }

            return roundScore;
        });

        this.logger.debug('scores = ', JSON.stringify(scores));

        bankerTakeAll && banker.recordAdd("takeAllTimes", 1);
        bankerTakeAll && banker.recordAdd("winTimes", 1);
        bankerPayAll && banker.recordAdd("payAllTimes", 1);

        let bankerScore = banker.getUser().getScore();
        let bankerPay = 0;
        let bankerMoney = 0;

        let balance = {};
        // balance.seats = seatManager.getPlayingSeats();
        balance.seats = _.map(seatManager.getSeats(), () => null);

        let robotScore = 0;

        let pays = utils.score.pay_Proportion(bankerScore, scores);
        _.each(pays, (pay, index) => {
            if (!pay || pay <= 0) {
                return;
            }

            let seat = balance.seats[index] = {};

            // let fee = Math.floor(pay * nncons.FEE());
            let fee = Math.floor(pay * cons.GAME_FEE());
            fee = _.max([fee, 1]);
            fee = _.min([fee, pay]);
            seat.score = seatManager.getSeat(index).getUser().changeScore(pay - fee);
            seat.score.play = scores[index];
            seat.score.result = pay;
            seat.fee = fee;
            bankerPay += pay;

            if (seatManager.getSeat(index).isRobot()) {
                robotScore += pay;
            }
        });

        let moneys = utils.score.money_Proportion(bankerScore, scores);
        _.each(moneys, (money, index) => {
            if (!money || money >= 0) {
                return;
            }

            let seat = balance.seats[index] = {};

            seat.score = seatManager.getSeat(index).getUser().changeScore(money);
            seat.score.play = scores[index];
            seat.score.result = money;
            seat.fee = 0;
            bankerMoney -= seat.score.change;

            if (seatManager.getSeat(index).isRobot()) {
                robotScore += money;
            }
        });

        let bankerResult = bankerMoney - bankerPay;
        // let bankerFee = Math.floor(bankerResult * nncons.FEE());
        let bankerFee = Math.floor(bankerResult * cons.GAME_FEE());
        bankerFee = _.max([bankerFee, 1]);
        bankerFee = _.min([bankerFee, bankerResult]);
        bankerFee = bankerResult <= 0 ? 0 : bankerFee;

        balance.seats[banker.getIndex()] = {};
        balance.seats[banker.getIndex()].score = banker.getUser().changeScore(bankerResult - bankerFee);
        balance.seats[banker.getIndex()].score.play = -_.reduce(scores, (m, s) => m + (s ? s : 0), 0);
        balance.seats[banker.getIndex()].score.result = bankerResult;
        balance.seats[banker.getIndex()].fee = bankerFee;

        let jackpotManager = this.room.getComp('jackpot');
        balance.jackpot = jackpotManager.getJackpot();

        this.broadcast_Banker(balance, bankerTakeAll);
        this.broadcast_Formation(balance);
        this.broadcast_Times(bankerTimes);
        this.record(balance);
        this.room.getComp('round').result(balance);

        this.logger.debug('balance = ', JSON.stringify(balance));

        let scoreAmount = banker.isRobot() ? bankerResult + robotScore : robotScore;
        jackpotManager.addJackpot(scoreAmount);
    }

    broadcast_Banker(balance, all) {
        if (!all) {
            return;
        }

        let players = _.reduce(balance.seats, (m, s) => m + (s ? 1 : 0), 0);
        if (players < p9cons.ROOM_CAPACITY()) {
            return;
        }

        let banker = this.room.getComp('state').getBankerSeat();
        let template = i18n.__('P9_Broadcast_BankerTakeAll');
        let content = template.replace('<nick>', banker.getUser().getAttr('nick'));
        utils.pomelo.broadcast(cons.Broadcast.DEFAULT(), content);
    }

    broadcast_Formation(balance) {
        // let seatManager = this.room.getComp('seat');
        // let template = i18n.__('NN_Broadcast_Formation');
        // _.each(balance.seats, (score, index) => {
        //     let seat = seatManager.getSeat(index);
        //     let hand = seat.getHand();
        //     if (!hand) {
        //         return;
        //     }

        //     let formation = hand.getFormation();
        //     if (formation.getType() <= nncons.Poker.Formation.NIUNIU()) {
        //         return;
        //     }

        //     let content = template.replace('<nick>', seat.getUser().getAttr('nick'));
        //     content = content.replace('<formation>', formation.getName());
        //     utils.pomelo.broadcast(cons.Broadcast.DEFAULT(), content);
        // });
    }

    broadcast_Times(times) {
        // if (times < 99) {
        //     return;
        // }

        // let banker = this.room.getComp('state').getBankerSeat();
        // let template = i18n.__('P9_Broadcast_Times');
        // let content = template.replace('<nick>', banker.getUser().getAttr('nick'));
        // content = content.replace('<times>', times + '');
        // utils.pomelo.broadcast(cons.Broadcast.DEFAULT(), content);
    }

    record(balance) {
        this.recordIncome(balance);
        async.eachOfSeries(balance.seats, (seat, index, cb) => {
            if (!seat) {
                utils.cbOK(cb);
                return;
            }

            this.recordSeat(index, seat.score.play, cb);
        }, () => {
            if (this.room.isCleared()) {
                return;
            }

            this.room.getComp('round').end(false);
        });
    }

    recordIncome(balance) {
        let jackpotManager = this.room.getComp('jackpot');

        let records = _.map(balance.seats, (s, i) => {
            if (s == null || s.score == null) {
                return;
            }

            let seat = this.room.getComp('seat').getSeat(i);
            if (!seat.getPlayUserId() || seat.isRobot() || seat.getBid() == 0) {
                return;
            }

            jackpotManager.addUserJackpot(seat.getUserId(), s.score.result);

            return {
                room: this.room.getAttr('uuid'),
                userId: seat.getPlayUserId(),
                itemId: cons.Item.GOLD(),
                count: s.fee,
                timestamp: utils.date.timestamp(),
                gameId: this.room.getAttr('gameId'),
                cost: seat.getBid() * this.room.getAttr('baseScore'),
                score: s.score.result + seat.getBid() * this.room.getAttr('baseScore') - s.fee,
                game: this.room.getAttr('game'),
                open: '',
                area: this.room.getAttr('area'),
                coin: seat.getPlayUserScore() + s.score.result - seat.getBid() * this.room.getAttr('baseScore'),
                jackpot: balance.jackpot,
            };
        });
        records = _.compact(records);
        let p = model.RoomIncomeRecord.bulkCreate(records);
        p.catch(e => {
            this.logger.error('ResultState recordIncome:', e);
        });
    }

    recordSeat(index, score, cb) {
        let seat = this.room.getComp('seat').getSeat(index);
        if (seat.isRobot() || seat.getTimeouts() > 0) {
            utils.cbOK(cb);
            return;
        }

        db.call('proc_nn_play_record', [seat.getUserId(), score > 0 ? 1 : 0, score > 0 ? 0 : 1], (err, result) => {
            if (err) {
                utils.cbOK(cb);
                return;
            }

            let { recommender, play } = _.first(result[0]);
            if (!recommender) {
                utils.cbOK(cb);
                return;
            }

            if (play !== p9cons.RECOMMENDER_REWARD_PLAY_ROUNDS()) {
                utils.cbOK(cb);
                return;
            }

            rpc.changeItem(
                recommender,
                p9cons.RECOMMENDER_REWARD_PLAY_ITEM(),
                p9cons.RECOMMENDER_REWARD_PLAY_COUNT(),
                cons.ItemChangeReason.RECOMMENDER_PLAY()
            );
            utils.cbOK(cb);
        });
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(p9cons.RoomState.WAIT());
    }
}

module.exports = ResultState;