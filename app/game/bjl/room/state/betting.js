const Super = require('../../../../room/timerState');
const ChisManager = require('../chipManager');
const cons = require('../../../../common/constants');
const bjlcons = require('../../common/constants');
const utils = require('../../../../utils');
const _ = require('underscore');

class BettingState extends Super {
    constructor(room) {
        super(room, bjlcons.RoomState.BETTING(), bjlcons.RoomStateInterval.BETTING());
        this.betTimer = null;
    }

    action(seat, action, next) {
        if (action.name === cons.RoomAction.PLAYER_BID()) {
            let area = action.area;
            let count = action.count;

            if (!utils.isNumber(area, bjlcons.RoomBetArea.PLAY(), bjlcons.RoomBetArea.TIE_SAME_POINT()) ||
                !utils.isNumber(count, 1)) {
                this.logger.warn('参数错误', area, count);
                return utils.nextError(next);
            }

            let stateManager = this.room.getComp('state');

            // if (!stateManager.canBet(area, count)) {
            //     this.logger.warn('超过房间当前最大下注额', count);
            //     return utils.nextError(next, '已达本轮下注上限');
            // }

            // let banker = stateManager.getBanker();
            // if (banker) {
            //     if (seat.getUserId() == banker.getId()) {
            //         this.logger.warn('庄家不能下注');
            //         return utils.nextError(next);
            //     }
            // }

            if (!seat.canBet(count)) {
                this.logger.warn('自己金额不够', count);
                return utils.nextError(next, '金币不足');
            }

            seat.bet(area, count);
            stateManager.addBetCount(area, count);
        } else if (action.name === cons.RoomAction.PLAYER_BID_CANCEL()) {
            if (seat.chipMgr.all() == 0) {
                this.logger.warn('没有押注无法撤销');
                return utils.nextError(next, '没有押注无法撤销');
            }

            seat.cancelBet();
        } else if (action.name === cons.RoomAction.PLAYER_BID_REPEAT()) {
            let chips = action.chips;
            if (!utils.isArray(chips, 8, 8)) {
                this.logger.warn('参数错误', chips);
                return utils.nextError(next);
            }

            let chipMgr = new ChisManager();
            chipMgr.chips = chips;

            let stateMgr = this.room.getComp('state');

            // let banker = stateMgr.getBanker();
            // if (banker) {
            //     if (seat.getUserId() == banker.getId()) {
            //         this.logger.warn('庄家不能下注');
            //         return utils.nextError(next);
            //     }
            // }

            let count = chipMgr.all();
            // if (!stateMgr.canBet(-1, count)) {
            //     this.logger.warn('超过房间当前最大下注额', count);
            //     return utils.nextError(next, '已达本轮下注上限');
            // }

            if (!seat.canBet(count)) {
                this.logger.warn('自己金额不够', count);
                return utils.nextError(next, '金币不足');
            }

            seat.betByChips(chipMgr);
            stateMgr.addBetCountByChips(chipMgr);
        }

        utils.nextOK(next);
    }

    enter() {
        super.enter();
        this.betTimer = setInterval(() => this.call(), 1000);
    }

    exit() {
        super.exit();
        if (this.betTimer) {
            clearInterval(this.betTimer);
        }
        this.betTimer = null;
    }

    end() {
        super.end();
        this.room.getComp('state').open();
    }

    call() {
        this.room.getComp('state').sendBetChips();
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = BettingState;