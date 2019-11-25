const cons = require('../../../common/constants');
const lx9cons = require('../common/constants');
const Super = require('../../../room/stateManager');
const utils = require('../../../utils');
const _ = require('underscore');
const uuid = require('uuid/v4');
const model = require('../../../db/model');
const redis = require('../../../../app/redis');

/**
 * @api {json} room.state 房间状态数据结构
 * @type lx9
 * @param {[number]} betOptions 赌注范围
 */

class StateManager extends Super {
    constructor(room) {
        super(room);

        this.logger = this.room.getComp('logger');
    }

    init() {
        super.init();

        this.reset();
    }

    reset() {
        super.reset();
        //let betOptions = this.room.getAttr('betOptions');
        this.jackpot = 0;

        this.freeCount = 0;
        this.line = 0;
        this.bet = 0;
    }

    action(seat, action, next) {
        this.logger.info('玩家消息', this.room.getAttr('area'), this.room.getAttr('id'), seat.getIndex(), seat.getUserId(), action);

        switch (action.name) {
            case cons.RoomAction.PLAYER_OPEN():
                this.onOpen(seat, action, next);
                break;
            default:
                super.action(seat, action, next);
                break;
        }
    }

    /**
     * 开奖
     * @param {number} seat 
     * @param {object} action   { 
     *                              line: 1,      // 线数 
     *                              bet: 5,       // 赌注
     *                          } 
     */
    onOpen(seat, action, next) {
        let line = action.line;
        let bet = action.bet;
        let freeOpen = false;
        let betOptions = this.room.getAttr('betOptions');

        if (!_.isNumber(line, 1, lx9cons.RoomOpenModes.length) ||
            !_.isNumber(bet, ...betOptions)) {
            return utils.nextError(next);
        }

        if (this.freeCount > 0) {
            if (this.line != line || this.bet != bet) {
                this.logger.warn('免费次数尚未用完', this.freeCount);
                return utils.nextError(next);
            }
            freeOpen = true;
        }

        this.freeCount -= 1;
        if (this.freeCount < 0) {
            this.freeCount = 0;
        }

        this.line = line;
        this.bet = bet;

        let betTotal = line * bet;

        if (!seat.canBet(betTotal)) {
            return utils.nextError(next, '下注失败');
        }
        // seat.bet(betTotal);

        // let jackpot = await redis.async.get(`UpGame:LX9:AREA_${this.room.getAttr('area')}:jackpot`);
        // jackpot = parseInt(jackpot) || 0;

        let jackpotMgr = this.room.getComp('jackpot');
        let jackpot = jackpotMgr.getJackpot();

        let results = this.open(jackpot, lx9cons.RoomOpenTimes[this.line]);
        if (results[0].hasBar) {
            this.freeCount += 5;
        }
        let result = _.min(_.shuffle(results), (r) => r.score);
        result.free = this.freeCount;
        result.betTotal = freeOpen ? 0 : betTotal;

        let income = result.score - result.betTotal;

        // 计算玩家的个人输赢
        jackpotMgr.addUserJackpot(seat.getUserId(), income);

        let fee = (income <= 0) ? 0 : _.max([1, parseInt(income * cons.GAME_FEE())]);
        result.score -= fee;
        result.score -= result.betTotal;

        if (result.score > 0) {
            seat.getUser().changeScore(result.score, 1, cons.ItemChangeReason.PLAY_WIN());
        } else if (result.score < 0) {
            seat.getUser().changeScore(result.score, 1);
        }

        seat.sendAction(cons.RoomAction.PLAYER_OPEN(), result);

        this.room.setAttr('gameId', uuid());
        if (!seat.isTest()) {
            jackpotMgr.addJackpot(result.score * -1);
        }

        if (result.betTotal > 0) {
            let records = [{
                room: this.room.getAttr('uuid'),
                userId: seat.getUserId(),
                itemId: cons.Item.GOLD(),
                count: fee,
                timestamp: utils.date.timestamp(),
                gameId: this.room.getAttr('gameId'),
                cost: result.betTotal,
                score: result.score + result.betTotal,
                open: JSON.stringify({ count: result.counts, descript: result.opens }),
                game: this.room.getAttr('game'),
                area: this.room.getAttr('area'),
                coin: seat.getUser().getScore(),
                jackpot: jackpot,
            }];

            records = _.compact(records);
            let p = model.RoomIncomeRecord.bulkCreate(records);
            p.catch(e => {
                this.logger.error('ResultState recordIncome:', e);
            });
        }

        this.logger.info('玩家开奖', this.room.getAttr('area'), this.room.getAttr('id'), seat.getUserId(), result);
        utils.nextOK(next);
    }

    open(jackpot, times = 10, results = []) {
        let opens = [];
        for (let x = 0; x < lx9cons.ROOM_OPEN_AREA_X(); x++) {
            opens.push([]);
            for (let y = 0; y < lx9cons.ROOM_OPEN_AREA_Y(); y++) {
                let r = _.random(100);
                if (r < 3) {
                    opens[x].push(lx9cons.RoomOpenTypes.FOOTBALL());
                    // } else if (r < 7) {
                    //     opens[x].push(lx9cons.RoomOpenTypes.WHISTLE());
                } else if (r < 10) {
                    opens[x].push(lx9cons.RoomOpenTypes.CUP());
                } else if (r < 20) {
                    opens[x].push(lx9cons.RoomOpenTypes.GERMANY());
                } else if (r < 30) {
                    opens[x].push(lx9cons.RoomOpenTypes.ARGENTINA());
                } else if (r < 40) {
                    opens[x].push(lx9cons.RoomOpenTypes.BRAZIL());
                } else if (r < 50) {
                    opens[x].push(lx9cons.RoomOpenTypes.SPAIN());
                } else if (r < 60) {
                    opens[x].push(lx9cons.RoomOpenTypes.BELGIUM());
                } else if (r < 70) {
                    opens[x].push(lx9cons.RoomOpenTypes.FRANCE());
                } else if (r < 80) {
                    opens[x].push(lx9cons.RoomOpenTypes.PORTUGAL());
                } else if (r < 90) {
                    opens[x].push(lx9cons.RoomOpenTypes.ENGLAND());
                } else {
                    opens[x].push(lx9cons.RoomOpenTypes.RUSSIA());
                }
                // opens[x].push(_.random(lx9cons.RoomOpenTypes.RUSSIA()));
            }
        }

        let multiAll = 0;

        let counts = [];
        let hasBar = false;
        for (let i = 0; i < this.line; i++) {
            let mode = lx9cons.RoomOpenModes[i];
            let multi = this.checkWin([opens[0][mode[0]], opens[1][mode[1]], opens[2][mode[2]], opens[3][mode[3]], opens[4][mode[4]]]);
            if (multi == lx9cons.RoomOpenAward.BAR()) {
                hasBar = true;
                continue;
            }
            if (multi > 0) {
                counts.push(i);
                multiAll += multi;
            }
        }

        let score = multiAll * this.bet;
        // let score = multiAll * this.bet - this.bet * this.line;

        let jackpotMgr = this.room.getComp('jackpot');
        let r = _.random(100);

        let betTotal = this.bet * this.line;

        if (jackpotMgr.getEnabled()) {
            if (betTotal > jackpotMgr.getMinBet()) {
                if (r <= jackpotMgr.getWinRate() && jackpot > jackpotMgr.getMaxJackpot()) {
                    if (score > betTotal) {
                        results.push({ score, opens, counts, hasBar });
                        return results;
                    }
                }

                if (r <= jackpotMgr.getKillRate() && jackpot <= jackpotMgr.getMinJackpot()) {
                    if (score <= betTotal) {
                        results.push({ score, opens, counts, hasBar });
                        return results;
                    }
                }
            }
        }

        r = _.random(100);

        if (r >= 80 && score <= betTotal) {
            times -= 1;
            if (times > 0) {
                return this.open(jackpot, times, results);
            }
        }

        if (r <= this.line * 5 && (score <= 0 || score >= betTotal)) {
            times -= 1;
            if (times > 0) {
                return this.open(jackpot, times, results);
            }
        }

        results.push({ score, opens, counts, hasBar });
        return results;
    }

    numToFruit(type) {
        let s = '';
        switch (type) {
            case 0:
                s = '铃铛';
                break;
            case 2:
                s = 'BAR';
                break;
            case 3:
                s = '苹果';
                break;
            case 4:
                s = '石榴';
                break;
            case 5:
                s = '西瓜';
                break;
            case 6:
                s = '樱桃';
                break;
            case 7:
                s = '香蕉';
                break;
            case 8:
                s = '草莓';
                break;
            case 9:
                s = '葡萄';
                break;
            case 10:
                s = '桃子';
                break;
            case 11:
                s = '梨头';
                break;
            default:
                break;
        }
        return s;
    }

    checkWin(points) {
        let type = lx9cons.RoomOpenTypes.FOOTBALL();
        let count = 1;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            if (p1 != lx9cons.RoomOpenTypes.FOOTBALL() && type == lx9cons.RoomOpenTypes.FOOTBALL()) {
                type = p1;
            }

            if (type != p2 && p2 != lx9cons.RoomOpenTypes.FOOTBALL()) {
                break;
            }

            count++;
        }

        if (type == lx9cons.RoomOpenTypes.FOOTBALL()) {
            return count >= 5 ? lx9cons.RoomOpenMultis[lx9cons.RoomOpenTypes.GERMANY()][5] : 0;
        }

        if (type == lx9cons.RoomOpenTypes.CUP()) {
            if (count >= 3) {
                return lx9cons.RoomOpenAward.BAR();
            }
            return 0;
        }

        return count >= 2 ? lx9cons.RoomOpenMultis[type][count] : 0;
    }

    toJson() {
        // let json = this.state ? this.state.toJson() : {};
        let json = {};
        json.betOptions = this.room.getAttr('betOptions') || [];
        json.jackpot = this.jackpot;
        json.freeCount = this.freeCount;
        json.line = this.line;
        json.bet = this.bet;
        return json;
    }
}


module.exports = StateManager;