const Super = require('../../../room/jackpotManager');
const yybfcons = require('../common/constants');
const _ = require('underscore');

class JackpotManager extends Super {
    constructor(room) {
        super(room);
        this.logger = this.room.getComp('logger');
    }

    balance() {
        let seatMgr = this.room.getComp('seat');
        let players = seatMgr.getPlayingSeats();

        let r = _.random(100);
        let winRate = this.getWinRate();
        let killRate = this.getKillRate();
        let jackpot = this.getJackpot();
        let enabled = this.getEnabled();
        let minJackpot = this.getMinJackpot();
        let maxJackpot = this.getMaxJackpot();

        let isPlatformNeedWin = enabled && r <= killRate && jackpot <= minJackpot;
        let isPlatformNeedLose = enabled && r <= winRate && jackpot >= maxJackpot;

        //机器人下注总值
        let robotScore = _.reduce(players, (robotScore, seat) => {
            if (!seat || !seat.getUser() || (!seat.isRobot() && !seat.isTest())) {
                return robotScore;
            }
            return robotScore + seat.getBetChips();
        }, 0);

        // 判断奖池是否需要回收
        if (isPlatformNeedWin) {
            let fPlayers = _.filter(players, (seat) => {
                return seat.getBetChips() > this.getMinBet() && seat.isRobot();
            });
            players = _.size(fPlayers) == 0 ? players : fPlayers;
        }

        // 正常模式，如果赔付率在奖池的80%，那就可以
        let fPlayers = _.filter(players, (seat) => {
            return seat.getBetChips() > this.getMinBet() && (robotScore < (jackpot * 0.8) ? true : seat.isRobot());
        });
        players = _.size(fPlayers) == 0 ? players : fPlayers;

        // 判断奖池是否需要放水，那么机器就不需要参与了
        if (isPlatformNeedLose) {
            let fPlayers = _.filter(players, (seat) => {
                return seat.getBetChips() > this.getMinBet() && !seat.isRobot();
            });
            players = _.size(fPlayers) == 0 ? players : fPlayers;
        }

        this.logger.info('开关', enabled, '随机', r, '杀率', killRate, '胜率', winRate, '最小', minJackpot, '最大', maxJackpot, '奖池', jackpot, '赔付', robotScore,
            '玩家结果', _.map(players, (p) => { return { userId: p.getIndex(), player: !p.isRobot() && !p.isTest() } }));
        return players;
    }

}

module.exports = JackpotManager;
