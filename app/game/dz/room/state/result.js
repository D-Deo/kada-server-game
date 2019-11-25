const cons = require('../../../../common/constants');
const dzcons = require('../../common/constants');
const Formation = require('../../poker/formation');
const model = require('../../../../db/model');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const pokerUtil = require('../../poker/utils');
const _ = require('underscore');


class ResultState extends Super {
    constructor(room) {
        super(room, dzcons.RoomState.RESULT(), dzcons.RoomStateInterval.RESULT());
    }

    action(seat, action, next) {
        let index = action.index;
        let show = !!action.show;

        if (!utils.isNumber(index, 0, 1)) {
            utils.nextError(next);
            return;
        }

        if (!seat.setShowHand(index, show)) {
            utils.nextError(next);
            return;
        }

        utils.nextOK(next);
    }

    enter() {
        super.enter();

        let seatManager = this.room.getComp('seat');
        let jackpotManager = this.room.getComp('jackpot');

        let jackpots = _.map(seatManager.getSeats(), s => s.toJson_Jackpot());
        jackpots = pokerUtil.toJackpots(jackpots);

        let playedSeats = this.room.getComp('seat').getPlayedSeats();
        playedSeats = _.map(playedSeats, p => p.toJson_Result());

        _.each(jackpots, j => {
            let seats = _.filter(playedSeats, p => p.playing && p.bid >= j.bid);
            let winners = Formation.winners(_.map(seats, s => s.formation));
            winners = _.map(winners, w => seats[w]);
            let score = parseInt(j.count / winners.length);
            j.winners = _.map(winners, w => {
                w.score += score;
                return { index: w.index, score };
            });
        });

        let playings = _.filter(playedSeats, p => p.playing);

        let jackpot = 0;
        let balance = {};
        balance.winners = _.map(Formation.winners(_.map(playings, p => p.formation)), w => playings[w].index);
        balance.jackpots = jackpots;
        balance.descript = [];
        balance.seats = _.map(playedSeats, p => {
            let seat = seatManager.getSeat(p.index);
            let income = p.score - p.bid;
            if (!seat.isRobot()) {
                jackpotManager.addUserJackpot(seat.getUserId(), income);
            }
            p.fee = (income < 0) ? 0 : _.max([1, parseInt(income * cons.GAME_FEE())]);
            p.score -= p.fee;
            p.formation = p.formation.toJson();
            (p.score > 0) && seat.getUser().changeScore(p.score, null, cons.ItemChangeReason.PLAY_WIN());
            if (seat.getPlayUserId() && !seat.isRobot() && !seat.isTest()) {
                jackpot -= p.score - p.bid;
            }
            balance.descript.push({ index: p.index, hand: utils.printCards(p.hand), type: pokerUtil.printType(p.formation.type) });
            return p;
        });
        // balance.descript = _.map(playedSeats, p => {
        //     return { index: p.index, hand: utils.printCards(p.hand), type: pokerUtil.printType(p.formation.type) };
        // });

        balance.jackpot = jackpotManager.getJackpot();
        jackpotManager.addJackpot(jackpot);

        this.recordIncome(balance);
        this.room.getComp('round').result(balance);
    }

    recordIncome(balance) {
        if (this.room.getAttr('free')) return;

        let records = _.map(balance.seats, (s, i) => {
            let seat = this.room.getComp('seat').getSeat(s.index);
            if (!seat.getPlayUserId() || seat.isRobot() || s.bid == 0) {
                return;
            }
            return {
                room: this.room.getAttr('uuid'),
                userId: seat.getPlayUserId(),
                itemId: cons.Item.GOLD(),
                count: s.fee,
                timestamp: utils.date.timestamp(),
                gameId: this.room.getAttr('gameId'),
                cost: s.bid,
                score: s.score,
                game: this.room.getAttr('game'),
                open: JSON.stringify({ index: seat.index, public: utils.printCards(this.room.getComp('state').getPublicCards()), descript: balance.descript }),
                area: this.room.getAttr('area'),
                coin: seat.getPlayUserScore() + s.score - s.bid,
                jackpot: balance.jackpot,
            };
        });
        records = _.compact(records);
        let p = model.RoomIncomeRecord.bulkCreate(records);
        p.catch(e => {
            this.logger.error('ResultState recordIncome:', e);
        });
    }

    end() {
        super.end();
        this.room.getComp('round').end(false);
    }
}



module.exports = ResultState;