const async = require('async');
const cons = require('../../../../common/constants');
const db = require('../../../../db');
const model = require('../../../../db/model');
const ssscons = require('../../common/constants');
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
        super(room, ssscons.RoomState.RESULT()); //ssscons.RoomStateInterval.RESULT()
    }

    enter() {
        // super.enter();

        let seatManager = this.room.getComp('seat');
        let seats = _.filter(seatManager.getPlayingSeats(), s => !s.hand.playedSpecial);
        if (seats.length >= 3) {
            _.each(seats, (seat1) => {
                seat1.hand.allGun = true;
                _.each(seats, (seat2) => {
                    if (seat1.getIndex() == seat2.getIndex()) {
                        return;
                    }
                    if (seat1.hand.fireGun(seat2.hand) <= 0) {
                        seat1.hand.allGun = false;
                        return;
                    }
                });
            });
        }

        let guns = [];

        let scores = _.map(seatManager.getSeats(), (seat1) => {
            if (!seat1.isPlaying()) {
                return null;
            }

            let score = {};
            score.allGun = seat1.hand.allGun;
            score.specialScore = 0;
            score.score1 = 0;
            score.score2 = 0;
            score.score3 = 0;
            score.finalScore = 0;
            score.cards = _.map(seat1.hand.cards, (c) => c.toJson(true));

            _.each(seatManager.getSeats(), (seat2) => {
                if (seat1 == seat2 || !seat2.isPlaying()) {
                    return false;
                }

                let result = {
                    specialScore: 0,
                    score1: 0,
                    score2: 0,
                    score3: 0
                };

                if (!seat1.isSpecial() && !seat2.isSpecial()) {
                    let r = seat1.hand.formatter.rule1.compare(seat2.hand.formatter.rule1);
                    if (r != 0) {
                        seat1.hand.formatter.rule1.touSan = this.room.getAttr('touSan');
                        seat2.hand.formatter.rule1.touSan = this.room.getAttr('touSan');
                        result.score1 = r > 0 ? seat1.hand.formatter.rule1.getScore(1) : -seat2.hand.formatter.rule1.getScore(1);
                    }
                    r = seat1.hand.formatter.rule2.compare(seat2.hand.formatter.rule2);
                    if (r != 0) {
                        result.score2 = r > 0 ? seat1.hand.formatter.rule2.getScore(2) : -seat2.hand.formatter.rule2.getScore(2);
                    }
                    r = seat1.hand.formatter.rule3.compare(seat2.hand.formatter.rule3);
                    if (r != 0) {
                        result.score3 = r > 0 ? seat1.hand.formatter.rule3.getScore(3) : -seat2.hand.formatter.rule3.getScore(3);
                    }
                } else if (seat1.isSpecial() && seat2.isSpecial()) {
                    let r = seat1.hand.rule0.compare(seat2.hand.rule0);
                    if (r != 0) {
                        // result.specialScore = score.specialScore + (r > 0 ? seat1.hand.rule0.getScore() : -seat2.hand.rule0.getScore());
                        result.specialScore = r > 0 ? seat1.hand.rule0.getScore() : -seat2.hand.rule0.getScore();
                    }
                } else if (seat1.isSpecial()) {
                    result.specialScore = seat1.hand.rule0.getScore();
                } else if (seat2.isSpecial()) {
                    result.specialScore = -seat2.hand.rule0.getScore();
                }

                // 获取手牌的倍数
                // let handMulti = _.max([seat1.hand.getMulti(), seat2.hand.getMulti()]);
                let handMulti = seat1.hand.getMulti() * seat2.hand.getMulti();  //翻倍计算
                result.specialScore *= handMulti;
                result.score1 *= handMulti;
                result.score2 *= handMulti;
                result.score3 *= handMulti;

                score.specialScore += result.specialScore;
                score.score1 += result.score1;
                score.score2 += result.score2;
                score.score3 += result.score3;

                let fireGun = result.score1 > 0 && result.score2 > 0 && result.score3 > 0;
                if (!seat1.hand.allGun) {
                    if (fireGun) {
                        guns.push([seat1.getIndex(), seat2.getIndex()]);
                    }
                }

                let finalScore = result.specialScore + result.score1 + result.score2 + result.score3;

                if (result.specialScore == 0) {
                    if (seat1.hand.allGun || seat2.hand.allGun) {
                        score.finalScore += finalScore * 4;
                    } else if (fireGun || (result.score1 < 0 && result.score2 < 0 && result.score3 < 0)) {
                        score.finalScore += finalScore * 2;
                    } else {
                        score.finalScore += finalScore;
                    }
                } else {
                    score.finalScore += finalScore;
                }

                // return fireGun;
            });

            return score;
        });

        this.logger.debug('当前结算\n', scores);

        this.record(scores);

        // 剩余未发的牌
        let cards = this.room.getComp('state').getLibrary().getCardsRemain();
        cards = _.map(cards, (c) => c.toJson(true));

        this.room.getComp('round').result({ scores, cards, guns });

        this.end();
    }

    record(scores) {
        this.recordIncome(scores);
        async.eachOfSeries(scores, (score, index, cb) => {
            if (!score) {
                utils.cbOK(cb);
                return;
            }
            this.recordSeat(index, score.finalScore, cb);
        }, () => {
            if (this.room.isCleared()) {
                return;
            }
            // this.room.getComp('round').end(false);
        });
    }

    recordIncome(scores) {
        let records = _.map(scores, (s, i) => {
            if (s == null) {
                return;
            }

            let seat = this.room.getComp('seat').getSeat(i);
            if (!seat.getPlayUserId() || seat.isRobot()) {
                return;
            }

            return {
                room: this.room.getAttr('uuid'),
                userId: seat.getPlayUserId(),
                itemId: this.room.getAttr('score'),
                count: 0,
                timestamp: utils.date.timestamp(),
                gameId: this.room.getAttr('gameId'),
                cost: 0,
                score: s.finalScore,
                game: this.room.getAttr('game'),
                open: '',
                area: this.room.getAttr('area'),
                coin: seat.getPlayUserScore() + s.finalScore, // - s.cost
                jackpot: 0, //balance.jackpot
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

        seat.addFinalScore(score);
        seat.sendChannelAction(cons.RoomAction.PLAYER_SCORE(), { score: seat.getFinalScore() });

        utils.cbOK(cb);
    }

    end() {
        // super.end();
        this.room.getComp('seat').refreshState();

        if (this.room.getComp('round').isEnded()) {
            this.room.getComp('state').changeState(ssscons.RoomState.END());
            return;
        }
        this.room.getComp('round').end(true);
    }
}

module.exports = ResultState;