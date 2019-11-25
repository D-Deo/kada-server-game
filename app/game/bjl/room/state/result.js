const cons = require('../../../../common/constants');
const bjlcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
// const logger = require('pomelo-logger').getLogger('game-bjl', __filename);
const model = require('../../../../db/model');
const utils = require('../../../../utils');
const bjlUtils = require('../../poker/utils');
const i18n = require('../../../../i18n');
const _ = require('underscore');

class ResultState extends Super {
    constructor(room) {
        super(room, bjlcons.RoomState.RESULT(), bjlcons.RoomStateInterval.RESULT());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');
        let seatManager = this.room.getComp('seat');
        let jackpotManager = this.room.getComp('jackpot');

        let openAreas = bjlUtils.toOpenAreas(stateManager.getRoadList()[0]);

        let draw = false;
        if (openAreas[6] == 1 || openAreas[7] == 1) {
            draw = true;
        }
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

            let score = 0;
            let cost = 0;
            let chips = seat.getBetChips();
            let drawmoney = 0;
            if (draw && this.room.getAttr('drawReturn')) {
                _.each(chips, (num, area) => {
                    //中了和，  闲对子和庄对子算钱，其他返还
                    if (openAreas[6] == 1 || openAreas[7] == 1) {
                        if (area == 4 || area == 5 || area == 6 || area == 7) {
                            cost += num;
                        }
                        else {
                            drawmoney += num;
                        }
                    }
                    // cost += openAreas[area] == 1 ? num : 0;
                    if (num > 0 && (area == 4 || area == 5 || area == 6 || area == 7)) {
                        let s = num * bjlcons.RoomAreaMulti[area];
                        score += openAreas[area] == 1 ? s + num : 0;
                        // cost += openAreas[area] == 1 ? num : 0;
                        // bankScore += openAreas[area] == 1 ? -s : num;
                    }
                });
            } else {
                _.each(chips, (num, area) => {
                    cost += num;
                    // cost += openAreas[area] == 1 ? num : 0;
                    if (num > 0) {
                        let s = num * bjlcons.RoomAreaMulti[area];
                        score += openAreas[area] == 1 ? s + num : 0;
                        // cost += openAreas[area] == 1 ? num : 0;
                        // bankScore += openAreas[area] == 1 ? -s : num;
                    }
                });
            }

            // 计算玩家的个人输赢
            if (!seat.isRobot()) {
                jackpotManager.addUserJackpot(seat.getUserId(), score - cost);
            }

            // 扣税 需要去除本钱
            let fee = (score - cost <= 0) ? 0 : _.max([1, parseInt((score - cost) * cons.GAME_FEE())]);
            score -= fee;
            score = Math.floor(score);

            if (!seat.isRobot()) {
                if (!seat.isTest()) {
                    jackpot -= score - cost;
                }
                (score > 0) && seat.getUser().changeScore(score, 1, cons.ItemChangeReason.PLAY_WIN());
                (drawmoney > 0) && seat.getUser().changeScore(drawmoney, 1, cons.ItemChangeReason.DRAWRETURN());
            }

            // if (!banker && !seat.isRobot()) jackpot -= score - cost;
            // if (banker && banker.isRobot() && !seat.isRobot()) jackpot -= score - cost;
            // if (banker && !banker.isRobot() && seat.isRobot()) jackpot += score - cost;

            return { uid: seat.getUserId(), score: score, bet: cost, fee: fee, chipMgr: seat.chipMgr };
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
        // this.jackpot_add(balance, seatManager, jackpotManager);

        this.logger.info('总奖池', jackpotManager.getJackpot(), '当前奖池：', jackpot, '当前结算：', balance);

        this.broadcast_Win(balance);
        this.recordIncome(balance);

        balance.players = _.sortBy(balance.players, p => -(p.score - p.bet)).splice(0, 4);
        if (balance.players[0]) {
            stateManager.setMaxWinner(balance.players[0].uid);
        }
        this.room.getComp('round').result(balance);
    }

    // jackpot_add(balance, seatManager, jackpotManager) {
    //     _.each(balance.players, (player) => {
    //         let seat = seatManager.getSeatByUserId(player.uid);
    //         if(!seat.isRobot()){
    //             jackpotManager.addJackpot((player.score - player.bet + player.fee) * -1);
    //         }
    //     })
    //     if(!balance.banker){
    //         return;
    //     }
    //     let banker = seatManager.getSeatByUserId(balance.banker.uid);
    //     if(!banker.isRobot()){
    //         jackpotManager.addJackpot((balance.banker.score + balance.banker.fee) * -1);
    //     }
    // }

    broadcast_Win(balance) {
        let template = i18n.__('BJL_Broadcast_WinScore');
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
                open: JSON.stringify({ open: balance.open, chips: s.chipMgr }),
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

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = ResultState;