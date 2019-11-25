const cons = require('../../../../common/constants');
const ermjcons = require('../../common/constants');
const model = require('../../../../db/model');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');

class ResultState extends Super {
    constructor(room) {
        super(room, ermjcons.RoomState.RESULT(), ermjcons.RoomStateInterval.RESULT());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');
        let score = this.room.getAttr('baseScore');

        let balance = {};
        balance.banker = stateManager.getBanker();
        balance.winner = stateManager.getWinner();

        if (balance.winner != -1) {
            score *= stateManager.ron.getFan();
            balance.ron = stateManager.ron.toJson();
        }

        let jackpot = 0;

        balance.seats = _.map(this.room.getComp('seat').getSittingSeats(), seat => {
            let p = {
                index: seat.getIndex(),
                uid: seat.getUserId(),
                handCards: _.map(seat.handCards, c => c.toJson()),
                flowerCards: _.map(seat.flowerCards, c => c.toJson()),
                seqArray: _.map(seat.seqArray, c => c.toJson()),
                triArray: _.map(seat.triArray, c => c.toJson()),
            };

            // 需要考虑不够赔付的情况 todo
            p.score = (seat.index == balance.winner) ? score : -score;

            // 扣税
            let fee = (p.score <= 1) ? 0 : _.max([1, parseInt(p.score * cons.GAME_FEE())]);
            p.fee = fee;
            p.score -= fee;

            if (!seat.isRobot() && !seat.isTest()) {
                jackpot -= p.score;
            }

            seat.getUser().changeScore(p.score);

            return p
        });

        // 奖池修改
        this.room.getComp('jackpot').addJackpot(jackpot);

        this.recordIncome(balance);

        _.delay(() => {
            this.room.getComp('round').result(balance);
            this.room.getComp('round').end(false);
        }, 2000);
    }

    recordIncome(balance) {
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
                score: s.score,
                open: '',
                game: this.room.getAttr('game'),
                area: this.room.getAttr('area'),
            };
        });
        records = _.compact(records);
        let p = model.RoomIncomeRecord.bulkCreate(records);
        p.catch(e => {
            console.warn('ResultState recordIncome:', e);
        });
    }

    end() {
        super.end();
        this.room.getComp('state').changeBanker();
        this.room.getComp('state').changeState(ermjcons.RoomState.WAIT());
    }
}

module.exports = ResultState;