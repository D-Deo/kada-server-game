const cons = require('../../../common/constants');
const lkpycons = require('../common/constants');
const Bullet = require('../fish/bullet');
const Super = require('../../../room/seat');
const ChipManager = require('./chipManager');
const _ = require('underscore');
const intervalTimer = require('../common/intervalTimer');
const utils = require('../../../utils');
const model = require('../../../db/model');

/**
 * @api {json} room.seats.seat seat数据结构
 * @apiGroup bjl
 * @param {json} user 玩家
 * @param {[Chip]} betChips 下注情况
 * @param {number} bankerState 当庄状态：-2 正在当庄 -1 等待下庄 0 没有上庄 >=1 正在等待上庄（当前位置）
 */

class Seat extends Super {
    constructor(room, index) {
        super(room, index);
        this.logger = this.room.getComp('logger');
    }

    bindUser(user) {
        super.bindUser(user);

        this.reset();
        this.trusteeship = false;
        this.userCoin = user.getScore();

        if (!this.room.getComp('state').hasTrust() && !user.isRobot()) {
            this.trusteeship = true;
            this.room.getComp('state').setTrust(true);
            this.sendAction(cons.RoomAction.HANDLE_ROBOT(), { trusteeship: true });
        }
    }

    unbindUser(reason, cb) {
        let user = this.getUser();
        if (user != null && (this.fishCoin != 0 || this.fishCost != 0)) {
            this.balance();
        }

        this.reset();

        super.unbindUser(reason, cb);
        if (this.trusteeship) {
            this.trusteeship = false;
            this.room.getComp('state').setTrust(false);
            this.sendAction(cons.RoomAction.HANDLE_ROBOT(), { trusteeship: false });
            _.some(this.room.getComp('seat').getSittingSeats_User(), (seat) => {
                if (!seat.isRobot() && !seat.isHosting()) {
                    seat.setTrust(true);
                    this.room.getComp('state').setTrust(true);
                    seat.sendAction(cons.RoomAction.HANDLE_ROBOT(), { trusteeship: true });
                    return;
                }
            })
        }
    }

    hostUser() {
        super.unhostUser();
        if (this.trusteeship) {
            this.trusteeship = false;
            this.room.getComp('state').setTrust(false);
            this.sendAction(cons.RoomAction.HANDLE_ROBOT(), { trusteeship: false });
            _.some(this.room.getComp('seat').getSittingSeats_User(), (seat) => {
                if (!seat.isRobot() && !seat.isHosting()) {
                    seat.setTrust(true);
                    this.room.getComp('state').setTrust(true);
                    seat.sendAction(cons.RoomAction.HANDLE_ROBOT(), { trusteeship: true });
                    return;
                }
            });
        }
    }

    unhostUser() {
        super.unhostUser();

        if (!this.room.getComp('state').hasTrust()) {
            this.trusteeship = true;
            this.setTrust(true);
            this.room.getComp('state').setTrust(true);
            this.sendAction(cons.RoomAction.HANDLE_ROBOT(), { trusteeship: true });
        }

    }

    setTrust(trusteeship) {
        this.trusteeship = trusteeship;
    }

    isTrust() {
        return this.trusteeship;
    }

    clear() {
        super.clear();
        //    this.reset();
    }

    reset() {
        super.reset();

        this.vBullet = {};
        this.vBomb = {};
        this.fishCoin = 0; // 杀死鱼得到的奖励
        this.fishCost = 0; // 开炮所消耗的分数
        this.fishFee = 0;  // 扣的税
        this.userCoin = 0;
        this.cannon = false;
        this.cannonMulrify = 0;

        if (this.cannonInterval != null) {
            this.cannonInterval.stop();
            this.cannonInterval = null;
        }
    }

    isCannon() {
        return this.cannon;
    }

    CannonMulrify() {
        return this.cannonMulrify;
    }

    isPlaying() {
        // 可以随时离开
        return false;
    }

    toJson(seat) {
        let json = super.toJson();
        json.cannon = this.cannon;
        json.cannonMulrify = this.cannonMulrify;
        return json;
    }

    canCost(cost) {
        if (this.isRobot()) {
            if (this.userCoin + this.fishCoin + this.fishCost - cost < this.room.getAttr('scoreMin')) {
                return false;
            }
        }

        if (this.userCoin + this.fishCoin + this.fishCost - cost < 0) {
            return false;
        }

        return true;
    }

    addBullet(bulletId, bulletMulriple, angle, lockFishId) {
        if (this.vBullet[bulletId] != null) {
            return false;
        }

        // 现在火力全开可以切换炮倍
        // if (this.cannon && this.cannonMulrify != bulletMulriple) {
        //     return false;
        // }

        let cost = bulletMulriple * this.room.getAttr('baseScore');
        if (!this.canCost(cost)) {
            this.room.getComp('robot').scheduleRelease(this.getUserId(), _.random(3000, 5000));
            return false;
        }

        let bulletKind = lkpycons.BULLET_NORMAL();
        if (this.cannon) {
            bulletKind = lkpycons.BULLET_CANNON();
        }

        let bullet = new Bullet(this, bulletId, bulletKind, bulletMulriple, angle, lockFishId);
        this.vBullet[bulletId] = bullet;
        this.addFishCoin(-cost);
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.FIRE(), bullet.toJson());

        return true;
    }

    addFishCoin(cost) {
        cost > 0 && (this.fishCoin += cost);
        cost < 0 && (this.fishCost += cost);

        if (!this.isRobot() && !this.isTest()) {
            let jackpotMgr = this.room.getComp('jackpot');
            jackpotMgr.addJackpot(-cost);
            jackpotMgr.addUserJackpot(this.getUserId(), cost);
        }
    }

    catchFish(bulletId, fishId) {
        let bullet = this.vBullet[bulletId];
        if (bullet == null) {
            return false;
        }

        let bulletKind = bullet.getKind();
        let bulletMulriple = bullet.getMulriple();

        let stateMgr = this.room.getComp('state');
        let fish = stateMgr.getFish(fishId);
        if (fish == null || fish.isDead()) {
            return false;
        }

        let income = 0;
        let caught = false;

        switch (fish.getKind()) {
            case lkpycons.FISH_KIND_23():
            case lkpycons.FISH_KIND_24():
            case lkpycons.FISH_KIND_31():
            case lkpycons.FISH_KIND_32():
            case lkpycons.FISH_KIND_33():
            case lkpycons.FISH_KIND_34():
            case lkpycons.FISH_KIND_35():
            case lkpycons.FISH_KIND_36():
            case lkpycons.FISH_KIND_37():
            case lkpycons.FISH_KIND_38():
            case lkpycons.FISH_KIND_39():
            case lkpycons.FISH_KIND_40():
                // 打中炸弹
                this.addBomb(fishId, bullet);
                this.sendAction(cons.RoomAction.CATCH_BOMB(), {
                    seat: this.index, bulletId, bomb_id: fishId
                });
                break;
            default:
                caught = this.bet(this.changeBulletScore(1, fish.score, bullet), fish.score);
                // caught = true;
                if (caught) {
                    stateMgr.removeFish(fishId);
                    income = fish.getScore() * bulletMulriple * this.room.getAttr('baseScore');
                    if (bullet.isCannon()) {
                        income *= 2;
                    }
                    let fee = _.max([1, parseInt(income * cons.GAME_FEE())]);
                    income -= fee;
                    if (income > 0) {
                        this.addFishCoin(income);
                        this.fishFee += fee;
                    }

                    if (fish.getScore() >= 15 && _.random(0, 100) <= 25) {
                        this.cannon = true;
                        this.cannonMulrify = bulletMulriple;

                        if (this.cannonInterval != null) {
                            this.cannonInterval.stop();
                        }

                        this.cannonInterval = new intervalTimer(lkpycons.Interval.CANNON(), () => this.cannonTerminate());
                        this.cannonInterval.start();
                        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.CHANGE_BULLET(), {
                            seat: this.index, cannon: this.cannon, CannonMulrify: this.cannonMulrify, seconds: lkpycons.Interval.CANNON() / 1000
                        });
                    }

                    if (fish.getKind() == lkpycons.FISH_KIND_22()) { // 定屏
                        stateMgr.freeze();
                        this.releaseSkill(1);
                    }
                } else if (fish.canChangeScore()) {
                    let score = fish.addScore();
                    if (score != 0) {
                        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.CHANGE_SCORE(), {
                            fishId, score
                        });
                    }
                }
        }

        delete this.vBullet[bulletId];
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.CATCH_FISH(), {
            seat: this.index, bulletId, fishId, result: caught, bulletKind, bulletMulriple, income, coin: this.userCoin + this.fishCoin + this.fishCost
        });

        return true;
    }

    cannonTerminate() {
        this.cannonInterval = null;
        this.cannon = false;
        this.cannonMulrify = 0;
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.CHANGE_BULLET(), {
            seat: this.index, cannon: this.cannon, CannonMulrify: this.cannonMulrify
        });
    }

    bombFish(seat_id, bomb_id, fish_array) {
        let stateMgr = this.room.getComp('state');
        let bomb = this.getBomb(bomb_id);
        if (bomb == null) {
            return true;
        }

        let bullet = bomb.bullet;
        if (bullet == null) {
            return false;
        }

        let score = 0;
        for (let i = 0; i < fish_array.length; ++i) {
            let fish = stateMgr.getFish(fish_array[i]);
            if (fish == null) {
                continue;
            }

            score += fish.getScore();
        }

        let caught = this.bet(this.changeBulletScore(1, score, bullet), score);
        // caught = true;
        if (caught) {
            for (let i = 0; i < fish_array.length; i++) {
                let fish = stateMgr.getFish(fish_array[i]);
                if (fish == null) {
                    fish_array[i] = { id: fish_array[i], income: 0 };
                    continue;
                }

                let income = fish.getScore() * bullet.getMulriple() * this.room.getAttr('baseScore');
                if (bullet.isCannon()) {
                    income *= 2;
                }

                if (income > 0) {
                    let fee = _.max([1, parseInt(income * cons.GAME_FEE())])
                    income -= fee;
                    this.fishFee += fee;
                }
                // _.some(fish_array, (num, key) => {
                //     if (num == fish_array[i]) {
                //         fish_array[i] = { id: num, income };
                //         return;
                //     }
                // });
                fish_array[i] = { id: fish_array[i], income };

                income > 0 && this.addFishCoin(income);
                stateMgr.removeFish(fish_array[i].id);
            }

            this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.BOMB_FISH(), {
                seat: seat_id,
                bomb_id,
                fish_array,
                bulletKind: bullet.getKind(),
                bulletMulriple: bullet.getMulriple(),
                result: caught,
                coin: this.userCoin + this.fishCoin + this.fishCost
            });
        }
        this.removeBomb(bomb_id);

        return true;
    }

    releaseSkill(skill_id) {
        if (skill_id == 1) {
            // if (!this.canCost(10)) {
            //     return false;
            // }

            // this.addFishCoin(-10);

            this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.RELEASE_SKILL(), {
                seat: this.index, skill_id, seconds: lkpycons.Interval.FREEZE()
            });
        }

        return true;
    }

    changeBulletScore(bulletScore, fishScore, bullet) {
        if (this.room.getAttr('free')) {
            return bulletScore * 2;
        }

        let jackpotMgr = this.room.getComp('jackpot');
        let enabled = jackpotMgr.getEnabled();
        let winRate = jackpotMgr.getWinRate();
        let killRate = jackpotMgr.getKillRate();
        let minBet = jackpotMgr.getMinBet();
        let jackpot = jackpotMgr.getJackpot();
        let minJackpot = jackpotMgr.getMinJackpot() || -100;
        let maxJackpot = jackpotMgr.getMaxJackpot();
        let bulletMulti = bullet.getMulriple();
        let bulletCannon = bullet.isCannon();
        let bonus = fishScore * bulletMulti * this.room.getAttr('baseScore') * (bulletCannon ? 2 : 1);
        let userJackpot = jackpotMgr.getUserJackpot(this.getUserId());
        let payTotal = this.getUser().getPayTotal();
        let change = 1;
        let r = _.random(100);
        let control = enabled && bulletScore >= minBet;
        if (control) {
            if (jackpot < minJackpot) {
                if (r <= killRate) {
                    change = 0.8 - (minJackpot - jackpot) / maxJackpot * 0.1;
                } else {
                    control = false;
                }
                // change = 0.8 / ((jackpot - minJackpot) / minJackpot);
                if (fishScore >= lkpycons.FISH_SCORE_10()) {
                    control = true;
                    change = 0; // 如果平台已经亏损，赔率很高的鱼就一定不能再死
                }
            } else if (jackpot > maxJackpot) {
                if (r <= winRate) {
                    change = (jackpot - maxJackpot) / maxJackpot * 0.2 + 1.2;
                } else {
                    control = false;
                }
                // change = jackpot / maxJackpot * 2;
                if (bonus >= jackpot * 2) {
                    control = true;
                    change = 0; // 虽然平台赚钱，但是如果捕获该鱼，奖励会导致奖池赔付很多
                }
            } else {
                if (r <= winRate) {
                    change = 1.2;
                }
                control = false;
            }
        }

        // let userChange = 0;
        // let userChange = (100 - (userJackpot + payTotal) / payTotal * 100) / 10;
        let userChange = userJackpot / (this.room.getAttr('baseScore') * 100000);
        // if (r <= winRate) {
        // }
        change -= userChange;
        let result = bulletScore * change;
        this.logger.info(this.getUserId(),
            '随机', r, '杀率', killRate, '胜率', winRate, '至少', minBet, '最低', minJackpot, '最高', maxJackpot,
            '鱼分', fishScore, '子弹', bulletMulti, '火力', bulletCannon, '奖池', jackpot,
            '奖励', bonus, '玩家', userChange, '改变', change, '最终', result, '是否控制', control);
        return result;
    }

    bet(bullet_score, fish_score) {
        if (fish_score == 0) {
            return false;
        }
        let r = _.random(1000000) / 1000000;
        let caught = r <= (bullet_score / fish_score);
        this.logger.info(this.getUserId(), '弹分', bullet_score, '鱼分', fish_score, '击杀概率', r, '鱼死概率', bullet_score / fish_score, '是否捕获', caught);

        let jackpotMgr = this.room.getComp('jackpot');
        let userJackpot = jackpotMgr.getUserJackpot(this.getUserId());
        let payTotal = this.getUser().getPayTotal();
        let winGoldRate = jackpotMgr.getWinGoldRate();
        let loseGoldRate = jackpotMgr.getLoseGoldRate();
        let winGold = jackpotMgr.getWinGold();
        let loseGold = jackpotMgr.getLoseGold();

        let payRate = payTotal ? ((userJackpot + payTotal) / payTotal * 100) : 0;
        if (winGoldRate && payRate > 100 && payRate > winGoldRate + 100) {
            caught = false;
        }
        if (loseGoldRate && payRate < 100 && (100 - payRate) > loseGoldRate) {
            caught = true;
        }
        if (winGold && userJackpot > 0 && userJackpot > winGold) {
            caught = false;
        }
        if (loseGold && userJackpot < 0 && -userJackpot > loseGold) {
            caught = true;
        }

        // let d = (100 - (userJackpot + payTotal) / payTotal * 100) * 10;
        // r = _.random(99);
        // if (d > 0 && r < d) {
        //     caught = true;
        // } else if (d < 0 && r < -d) {
        //     caught = false;
        // }
        this.logger.info(this.getUserId(), '充值比', payRate, '上限充值比', winGoldRate, '下限充值比', loseGoldRate, '上限固定', winGold, '下限固定', loseGold, '捕获', caught);

        if (this.isRobot() || this.isTest()) {
            if (_.random(100) <= 5) {
                caught = true;
            }
        }
        return caught;
    }

    addBomb(bomb_id, bullet) {
        this.vBomb[bomb_id] = {};
        this.vBomb[bomb_id].bullet = bullet;
    }

    getBomb(bomb_id) {
        return this.vBomb[bomb_id];
    }

    removeBomb(id) {
        delete this.vBomb[id];
    }

    balance() {
        if (this.isEmpty() || this.getUser().isRobot() || (this.fishCoin == 0 && this.fishCost == 0)) {
            return;
        }

        let balance = {};

        balance.bet = -this.fishCost;
        balance.score = this.fishCoin;
        balance.fee = this.fishFee;

        let score = this.fishCoin + this.fishCost;
        if (score < -this.getUser().getScore()) {   // 防止为负，容错
            score = -this.getUser().getScore();
        }

        if (score != 0) {
            (score > 0) && this.getUser().changeScore(score, 1, cons.ItemChangeReason.PLAY_WIN());
            (score < 0) && this.getUser().changeScore(score, 1, cons.ItemChangeReason.PLAY_LOSE());
            this.userCoin = this.getUser().getScore();
        }

        this.fishCoin = 0;
        this.fishCost = 0;
        this.fishFee = 0;

        this.recordIncome(balance);
    }

    recordIncome(balance) {
        if (this.room.getAttr('free')) return;

        let jackpotMgr = this.room.getComp('jackpot');

        let records = [{
            room: this.room.getAttr('uuid'),
            userId: this.getUserId(),
            itemId: cons.Item.GOLD(),
            count: balance.fee,
            timestamp: utils.date.timestamp(),
            gameId: this.room.getAttr('gameId'),
            cost: balance.bet,
            score: balance.score,
            open: '',
            game: this.room.getAttr('game'),
            area: this.room.getAttr('area'),
            coin: this.getUser().getScore(),
            jackpot: jackpotMgr.getJackpot()
        }];

        let p = model.RoomIncomeRecord.bulkCreate(records);
        p.catch(e => {
            this.logger.error('ResultState recordIncome:', e);
        });
    }
}

module.exports = Seat;