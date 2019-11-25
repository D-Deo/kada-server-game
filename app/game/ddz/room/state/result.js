const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const model = require('../../../../db/model');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');

class ResultState extends Super {

    constructor(room) {
        super(room, ddzcons.RoomState.RESULT());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');
        let seatManager = this.room.getComp('seat');
        let banker = stateManager.getBanker();
        let bankerSeat = stateManager.getBankerSeat();
        let bombTimes = 0;

        let winner = stateManager.getWinner();
        let score = stateManager.getSpeakScore();
        let multiple = stateManager.getMultiple();
        let botMulti = stateManager.getBotMulti();

        this.logger.debug('score ', score, 'multiple :', multiple);

        let baseScore = this.room.getAttr('baseScore');
        score = score * multiple * baseScore * botMulti;

        let cardDatas = [];
        let jackpot = 0;
        let seats = _.map(seatManager.getSeats(), (seat) => {
            let p = { index: seat.getIndex(), uid: seat.getUserId(), win: 0 };

            if (seat.getIndex() == banker) {
                p.score = (winner == banker) ? 2 * score : -2 * score;
            } else {
                p.score = (winner == banker) ? -score : score;
            }

            // 扣税
            let fee = (p.score <= 1) ? 0 : _.max([1, parseInt(p.score * cons.GAME_FEE())]);
            p.fee = fee;
            p.score -= fee;

            if (p.score < 0) {
                if (seat.getUser().getScore() + p.score < 0) {
                    p.score = seat.getUser().getScore() * -1;
                }
            }

            if (!seat.isRobot() && !seat.isTest()) {
                jackpot -= p.score;
            }
            seat.getUser().changeScore(p.score);

            if (p.score < 0) {
                p.cost = p.score * -1;
            }

            if (p.score > 0) {
                p.cost = baseScore;
                p.win = p.score + p.cost;
            }

            bombTimes += seat.getBombTimes();
            cardDatas.push(seat.getCards());

            return p;
        });

        // 奖池修改
        this.room.getComp('jackpot').addJackpot(jackpot);

        let balance = {};
        balance.banker = banker;
        balance.winner = winner;
        balance.seats = seats;
        balance.cardDatas = cardDatas;
        balance.baseScore = this.room.getAttr('baseScore');     //初始
        balance.speaked = stateManager.getSpeakScore();         //叫分
        balance.grabbed = stateManager.getGrabTimes();          //抢地主
        balance.multiple = multiple * botMulti;                 //加倍
        balance.baseCards = botMulti;                           //底牌
        balance.spring = stateManager.getSpring() > 0 ? 1 : 0;  //春天
        balance.bankerSpring = (bankerSeat.getPlayTimes() == 1 && winner != banker) ? true : false;
        balance.bombTimes = bombTimes;                          //炸弹
        balance.mingPai = bankerSeat.isMing();
        this.recordIncome(balance);

        _.delay(() => {
            this.room.getComp('round').result(balance);
            this.room.getComp('round').end(false);
        }, 2000);
    }

    recordIncome(balance) {
        if (this.room.getAttr('free')) return;

        let records = _.map(balance.seats, (s, i) => {
            let seat = this.room.getComp('seat').getSeat(s.index);
            if (!seat.getPlayUserId() || seat.isRobot()) {
                return;
            }

            return {
                room: this.room.getAttr('uuid'),
                userId: seat.getPlayUserId(),
                itemId: cons.Item.GOLD(),
                count: s.fee,
                timestamp: utils.date.timestamp(),
                gameId: this.room.getAttr('gameId'),
                cost: s.cost,
                score: s.win,
                open: '',
                game: this.room.getAttr('game'),
                area: this.room.getAttr('area'),
                coin: seat.getPlayUserScore() + s.score,
            };
        });
        records = _.compact(records);
        let p = model.RoomIncomeRecord.bulkCreate(records);
        p.catch(e => {
            this.logger.error('ResultState recordIncome:', e);
        });
    }

}

module.exports = ResultState;