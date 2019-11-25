const Component = require('./component');
const GameManager = require('../game/manager');
const _ = require('underscore');

class JackpotManager extends Component {
    constructor(room) {
        super(room);
    }

    init() {
        super.init();

        this.status = {
            jackpot: 0,             // 当前奖池
            minJackpot: 0,          // 奖池下限
            maxJackpot: 0,          // 奖池上限
            enabled: 0,             // 是否开启奖池控制
            minBet: 0,              // 最小押注量 
            prob: 0,                // 触发概率
            winRate: 0,             // 放水概率 
            jackpotRate: 1,         // 奖池转换率 
            winGoldRate: 100,       // 玩家赢钱上限充值比 
            loseGoldRate: 100,      // 玩家输钱下限充值比 
            winGold: 500,           // 玩家赢钱上限金额 
            loseGold: -1000,        // 玩家输钱下限金额 
        };
    }

    reset() {

    }

    clear() {

    }

    setJackpot(score) {
        this.status.jackpot = score;
    }

    setStatus(enabled, minJackpot, maxJackpot, minBet, prob, winRate, jackpotRate, winGoldRate, loseGoldRate, winGold, loseGold) {
        this.status.enabled = enabled;
        this.status.minJackpot = minJackpot;
        this.status.maxJackpot = maxJackpot;
        this.status.minBet = minBet;
        this.status.prob = prob;
        this.status.winRate = winRate;
        this.status.jackpotRate = jackpotRate;
        this.status.winGoldRate = winGoldRate;
        this.status.loseGoldRate = loseGoldRate;
        this.status.winGold = winGold;
        this.status.loseGold = loseGold;
    }

    addUserJackpot(userId, score) {
        if (this.room.getAttr('free')) return;
        let jackpot = score;
        GameManager.getInstance().addUserJackpot(this.room.getAttr('game'), this.room.getAttr('area'), userId, jackpot);
    }

    getUserJackpot(userId) {
        return GameManager.getInstance().getUserJackpot(this.room.getAttr('game'), this.room.getAttr('area'), userId);
    }

    addJackpot(score) {
        if (this.room.getAttr('free')) return;
        let jackpot = score;
        if (jackpot > 0) {
            jackpot = parseInt(jackpot * this.getJackpotRate() / 100);
            if (jackpot < 1) {
                jackpot = 1;
            }
        }
        GameManager.getInstance().addJackpot(this.room.getAttr('game'), this.room.getAttr('area'), jackpot);
    }

    getJackpot() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'jackpot');
    }

    getMinJackpot() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'minJackpot');
    }

    getMaxJackpot() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'maxJackpot');
    }

    getEnabled() {
        if (this.room.getAttr('free')) return false;
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'enabled');
    }

    getMinBet() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'minBet');
    }

    getWinRate() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'winRate');
    }

    getKillRate() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'prob');
    }

    getJackpotRate() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'jackpotRate');
    }

    getWinGoldRate() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'winGoldRate');
    }

    getLoseGoldRate() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'loseGoldRate');
    }

    getWinGold() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'winGold');
    }

    getLoseGold() {
        return GameManager.getInstance().getJackpot(this.room.getAttr('game'), this.room.getAttr('area'), 'loseGold');
    }
}

module.exports = JackpotManager;
