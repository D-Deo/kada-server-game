const cons = require('../../../../common/constants');
const fqzscons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const model = require('../../../../db/model');
const utils = require('../../../../utils');
const i18n = require('../../../../i18n');
const _ = require('underscore');

class ResultState extends Super {
    constructor(room) {
        super(room, fqzscons.RoomState.RESULT(), fqzscons.RoomStateInterval.RESULT());
    }

    enter() {
        super.enter();

        let stateMgr = this.room.getComp('state');
        let seatMgr = this.room.getComp('seat');
        let jackpotMgr = this.room.getComp('jackpot');

        let openAreas = this.toOpenAreas(stateMgr.lastRoad);
        this.logger.info('开奖区域：', openAreas);

        // let banker = stateMgr.getBanker();
        // let bankScore = 0;

        let jackpot = 0;
        let jackpotScore = 0;

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
            // if (!seat.isRobot()) {
            //     this.logger.info('投注详情：', seat.getUserId(), chips);
            // }
            _.each(chips, (num, area) => {
                cost += num;
                if (num > 0) {
                    let s = num * fqzscons.RoomAreaMulti[area];
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

            jackpotScore -= score;

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
        balance.oldJackpot = jackpotMgr.getJackpot();
        jackpotMgr.addJackpot(jackpot);

        stateMgr.setJackpot(jackpotScore);
        balance.jackpot = stateMgr.getJackpot();

        this.logger.info('当前结算：', _.compact(_.map(balance.players, (p) => {
            return p.real ? {
                userId: p.uid, cost: p.bet, score: p.score, fee: p.fee, chips: JSON.stringify(p.chips.toJson())
            } : null
        })));

        this.recordIncome(balance);
        this.broadcast_Win(balance);

        balance.players = _.sortBy(balance.players, p => -(p.score - p.bet)).splice(0, 4);
        if (balance.players[0]) {
            stateMgr.setMaxWinner(balance.players[0].uid);
        }
        this.room.getComp('round').result(balance);
    }

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
                open: JSON.stringify({ open: fqzscons.RoomOpenConfigs[balance.open], chips: s.chips }),
                game: this.room.getAttr('game'),
                area: this.room.getAttr('area'),
                coin: seat.getPlayUserScore() + s.score - s.bet,
                jackpot: balance.oldJackpot,
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

    exit() {
        super.exit();
    }

    end() {
        super.end();
        this.room.getComp('round').end(false);
    }

    toOpenAreas(road) {
        let area = fqzscons.RoomOpenConfigs[road];
        let openAreas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        openAreas[area] = 1;

        // 2老鹰，4孔雀，5鸽子，8燕子  ==  飞禽
        if (area == 2 || area == 4 || area == 5 || area == 8) {
            openAreas[10] = 1;
        }

        // 3狮子，6熊猫，7猴子，9兔子  ==  走兽
        if (area == 3 || area == 6 || area == 7 || area == 9) {
            openAreas[11] = 1;
        }

        if (area == -1) {               // -1 通赔
            openAreas = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        } else if (area == -2) {        // -2 通吃
            openAreas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        return openAreas;
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = ResultState;