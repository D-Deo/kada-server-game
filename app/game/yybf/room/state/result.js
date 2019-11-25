const cons = require('../../../../common/constants');
const yybfcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const model = require('../../../../db/model');
const utils = require('../../../../utils');
const i18n = require('../../../../i18n');
const _ = require('underscore');

class ResultState extends Super {
    constructor(room) {
        super(room, yybfcons.RoomState.RESULT(), yybfcons.RoomStateInterval.RESULT());
    }

    enter() {
        super.enter();

        let stateMgr = this.room.getComp('state');
        let seatMgr = this.room.getComp('seat');
        let jackpotMgr = this.room.getComp('jackpot');

        let balance = {};
        balance.players = seatMgr.getPlayingSeats();
        balance.winner = stateMgr.lastRoad && seatMgr.getUser(stateMgr.lastRoad.id);

        let robotScore = _.reduce(balance.players, (robotScore, seat) => {
            if (!seat || !seat.getUser() || !seat.isRobot()) {
                return robotScore;
            }
            return robotScore + seat.getBetChips();
        }, 0);
        balance.score = _.reduce(balance.players, (ret, seat) => {
            if (!seat || !seat.getUser()) {
                return ret;
            }
            return ret + seat.getBetChips();
        }, 0);

        balance.jackpot = jackpotMgr.getJackpot();
        balance.winner && balance.winner.isRobot() ? jackpotMgr.addJackpot(balance.score - robotScore) : jackpotMgr.addJackpot(robotScore * -1);
        balance.fee = (balance.score <= 0) ? 0 : _.max([1, parseInt((balance.score - seatMgr.getSeatByUserId(balance.winner.getAttr('id')).getBetChips()) * cons.GAME_FEE())]);
        balance.score = Math.floor(balance.score - balance.fee);
        (balance.score > 0) && !seatMgr.getUser(stateMgr.lastRoad.id).isRobot() && stateMgr.lastRoad && seatMgr.getUser(stateMgr.lastRoad.id).changeScore(balance.score, 1, cons.ItemChangeReason.PLAY_WIN());

        this.broadcast_Win(balance);
        this.recordIncome(balance);
        // this.room.getComp('round').result(balance);
    }

    broadcast_Win(balance) {
        setTimeout(() => {
            let template = i18n.__('YYBF_Broadcast_WinScore');
            if (balance.score <= 0) {
                return;
            }
            let content = template.replace('<nick>', balance.winner.getAttr('nick'));
            content = content.replace('<score>', utils.helper.getValueChinese(balance.score));
            utils.pomelo.broadcast(cons.Broadcast.DEFAULT(), content);
        }, 5000);
    }

    recordIncome(balance) {
        let jackpotMgr = this.room.getComp('jackpot');

        let records = _.map(balance.players, (s, i) => {
            let seat = this.room.getComp('seat').getSeatByUserId(s.index);
            if (!seat.getPlayUserId() || seat.isRobot() || seat.getBetChips() == 0) {
                return;
            }

            jackpotMgr.addUserJackpot(seat.getUserId(), (s.index == balance.winner.getAttr('id') ? balance.score : 0) - seat.getBetChips());

            return {
                room: this.room.getAttr('uuid'),
                userId: s.index,
                itemId: cons.Item.GOLD(),
                count: s.index == balance.winner.getAttr('id') ? balance.fee : 0,
                timestamp: utils.date.timestamp(),
                gameId: this.room.getAttr('gameId'),
                cost: seat.getBetChips(),
                score: s.index == balance.winner.getAttr('id') ? balance.score + balance.fee : 0,
                open: JSON.stringify({ bet: seat.getBetChips(), winner: balance.winner.getAttr('id'), betTotal: this.room.getComp('state').getcrtScore() }),//descript,
                game: this.room.getAttr('game'),
                coin: seat.getPlayUserScore() + (s.index == balance.winner.getAttr('id') ? balance.score - seat.getBetChips() : -seat.getBetChips()),
                jackpot: balance.jackpot,
            };
        });

        records = _.compact(records);
        let p = model.RoomIncomeRecord.bulkCreate(records);
        p.catch(e => {
            this.logger.error('ResultState recordIncome:', e);
        });
    }

    exit() {
        super.exit();
    }

    end() {
        super.end();
        this.room.getComp('round').end(false);
    }

    toOpenAreas(road) {
        let area = yybfcons.RoomOpenConfigs[road];
        let openAreas = [0, 0, 0, 0, 0, 0, 0, 0];
        openAreas[area] = 1;
        return openAreas;
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        json.open = this.room.getComp('state').lastRoad;
        return json;
    }
}

module.exports = ResultState;