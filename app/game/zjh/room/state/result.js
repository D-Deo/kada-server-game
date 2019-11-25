const cons = require('../../../../common/constants');
const zjhcons = require('../../common/constants');
const model = require('../../../../db/model');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const pokerUtil = require('../../poker/utils');
const _ = require('underscore');


class ResultState extends Super {
    constructor(room) {
        super(room, zjhcons.RoomState.RESULT(), zjhcons.RoomStateInterval.RESULT());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');
        let seatManager = this.room.getComp('seat');
        let jackpotManager = this.room.getComp('jackpot');

        let jackpot = 0;
        let balance = {};
        let descript = [];
        balance.seats = _.map(seatManager.getSeats(), (seat) => {
            let p = seat.toJson_Result();
            p.score = seat.isPlaying() ? stateManager.getBidTotal() : 0;
            let income = p.score - p.bid;
            if (!seat.isRobot()) {
                jackpotManager.addUserJackpot(seat.getUserId(), income);
            }
            p.fee = (income <= 0) ? 0 : _.max([1, parseInt(income * cons.GAME_FEE())]);
            p.score -= p.fee;
            (p.score > 0) && seat.getUser().changeScore(p.score, null, cons.ItemChangeReason.PLAY_WIN());
            descript.push({ index: p.index, hand: utils.printCards(seat.hand), type: pokerUtil.printType(p.formation.type) });
            if (seat.getPlayUserId() && !seat.isRobot() && !seat.isTest()) {
                jackpot -= p.score - p.bid;
            }
            return p;
        });
        balance.descript = descript;

        balance.jackpot = jackpotManager.getJackpot();
        jackpotManager.addJackpot(jackpot);       // 奖池修改

        this.recordIncome(balance);

        _.each(seatManager.getSeats(), (seat) => {
            if (seat.isEmpty()) return;
            let seats = _.map(seat.getCompares(), (index) => {
                let other = seatManager.getSeat(index);
                return other.toJson_ShowHand();
            });
            seats.push(seat.toJson_ShowHand());
            seat.sendAction(cons.RoomAction.ROOM_STATE_SHOW_HAND(), { seats: seats });
        });

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
                open: JSON.stringify({ index: seat.index, descript: balance.descript }),
                game: this.room.getAttr('game'),
                area: this.room.getAttr('area'),
                coin: seat.getPlayUserScore() + s.score - s.bid,
                jackpot: balance.jackpot,
            };
        });
        records = _.compact(records);
        let p = model.RoomIncomeRecord.bulkCreate(records);
        p.catch(e => {
            console.error('ResultState recordIncome:', e);
        });
    }

    end() {
        super.end();
        this.room.getComp('round').end(false);
    }
}



module.exports = ResultState;