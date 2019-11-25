const cons = require('../../../../common/constants');
const bcbmcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const model = require('../../../../db/model');
const utils = require('../../../../utils');
const i18n = require('../../../../i18n');
const _ = require('underscore');

class ResultState extends Super {
    constructor(room) {
        super(room, bcbmcons.RoomState.RESULT(), bcbmcons.RoomStateInterval.RESULT());
    }

    enter() {
        super.enter();

        let stateMgr = this.room.getComp('state');
        let seatMgr = this.room.getComp('seat');
        let jackpotMgr = this.room.getComp('jackpot');

        let openAreas = this.toOpenAreas(stateMgr.lastRoad);

        // let banker = stateMgr.getBanker();
        // let bankScore = 0;

        let jackpot = 0;

        let balance = {};
        let players = _.map(seatMgr.getSeats(), (seat) => {
            // if (!seat || !seat.getUser() || seat.getUserId() === stateMgr.getBankerId()) {
            //     return null;
            // }
            if (!seat || !seat.getUser()) {
                return null;
            }

            let score = 0;
            let cost = 0;
            let chips = seat.getBetChips();
            _.each(chips, (num, area) => {
                cost += num;
                if (num > 0) {
                    let s = num * bcbmcons.RoomAreaMulti[area];
                    score += openAreas[area] == 1 ? s : 0;
                    // bankScore += openAreas[area] == 1 ? -s + num : num;
                }
            });

            if (cost <= 0) {
                return null;
            }

            // 计算玩家的个人输赢
            if (!seat.isRobot()) {
                jackpotMgr.addUserJackpot(seat.getUserId(), score - cost);
            }

            let fee = (score - cost <= 0) ? 0 : _.max([1, parseInt((score - cost) * cons.GAME_FEE())]);
            score -= fee;
            score = Math.floor(score);

            if (!seat.isRobot()) {
                if (!seat.isTest()) {
                    jackpot -= score - cost;
                }
                (score > 0) && seat.getUser().changeScore(score, 1, cons.ItemChangeReason.PLAY_WIN());
            }

            return { uid: seat.getUserId(), score: score, bet: cost, fee: fee, chips: seat.chipMgr, real: !seat.isRobot() && !seat.isTest() };
        });

        balance.players = _.compact(players);

        balance.open = stateMgr.lastRoad;

        // let banker = stateMgr.getBanker();
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

        // this.jackpot_add(balance, seatMgr, jackpotMgr);

        balance.jackpot = jackpotMgr.getJackpot();
        jackpotMgr.addJackpot(jackpot);

        this.logger.info('当前结算：', _.compact(_.map(balance.players, (p) => {
            return p.real ? {
                userId: p.uid, cost: p.bet, score: p.score, fee: p.fee, chips: JSON.stringify(p.chips.toJson())
            } : null
        })));

        this.recordIncome(balance);
        this.broadcast_Win(balance);

        balance.players = _.sortBy(balance.players, p => -(p.score - p.bet)).splice(0, 4);
        this.room.getComp('round').result(balance);
    }

    // jackpot_add(balance, seatMgr, jackpotMgr) {
    //     _.each(balance.players, (player) => {
    //         let seat = seatMgr.getSeatByUserId(player.uid);
    //         if(!seat.isRobot()){
    //             jackpotMgr.addJackpot((player.score - player.bet + player.fee) * -1);
    //         }
    //     })
    //     if(!balance.banker){
    //         return;
    //     }
    //     let banker = seatMgr.getSeatByUserId(balance.banker.uid);
    //     if(!banker.isRobot()){
    //         jackpotMgr.addJackpot((balance.banker.score + balance.banker.fee) * -1);
    //     }
    // }

    broadcast_Win(balance) {
        let template = i18n.__('BCBM_Broadcast_WinScore');
        let seatManager = this.room.getComp('seat');
        if (balance.banker && balance.banker.score > cons.Broadcast.MINGCOIN()) {
            let banker = seatManager.getSeatByUserId(balance.banker.uid).getUser();
            let content = template.replace('<nick>', banker.getAttr('nick'));
            content = content.replace('<score>', utils.helper.getValueChinese(balance.banker.score));
            utils.pomelo.broadcast(cons.Broadcast.DEFAULT(), content);
        }
        _.each(balance.players, (player, index) => {
            let seat = seatManager.getSeatByUserId(player.uid);
            let user = seat.getUser();
            if (!user || !player.score) {
                return;
            }
            if (player.score < cons.Broadcast.MINGCOIN()) {
                return;
            }
            let content = template.replace('<nick>', user.getAttr('nick'));
            content = content.replace('<score>', utils.helper.getValueChinese(player.score));
            utils.pomelo.broadcast(cons.Broadcast.DEFAULT(), content);
        });
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
                open: JSON.stringify({ open: bcbmcons.RoomOpenConfigs[balance.open], chips: s.chips }),
                game: this.room.getAttr('game'),
                area: this.room.getAttr('area'),
                coin: seat.getPlayUserScore() + s.score - s.bet,
                jackpot: balance.jackpot,
            };
        });

        // if (balance.banker) {
        //     let seat = this.room.getComp('seat').getSeatByUserId(balance.banker.uid);
        //     if (!seat.isRobot() && balance.banker.fee > 0) {
        //         records.push({
        //             room: this.room.getAttr('uuid'),
        //             userId: seat.getUserId(),
        //             itemId: cons.Item.GOLD(),
        //             count: balance.banker.fee,
        //             timestamp: utils.date.timestamp()
        //         });
        //     }
        // }

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

    toOpenAreas(road) {
        let area = bcbmcons.RoomOpenConfigs[road];
        let openAreas = [0, 0, 0, 0, 0, 0, 0, 0];
        openAreas[area] = 1;
        return openAreas;
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = ResultState;