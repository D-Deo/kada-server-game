const Super = require('../../../../room/timerState');
const ChisManager = require('../chipManager');
const cons = require('../../../../common/constants');
const bcbmcons = require('../../common/constants');
const utils = require('../../../../utils');
const _ = require('underscore');

class BettingState extends Super {
    constructor(room) {
        super(room, bcbmcons.RoomState.BETTING(), bcbmcons.RoomStateInterval.BETTING());
        this.betTimer = null;
    }

    action(seat, action, next) {
        if (action.name === cons.RoomAction.PLAYER_BID()) {
            let area = action.area;
            let count = action.count;

            if (!utils.isNumber(area, 0, bcbmcons.RoomAreaMulti.length - 1) ||
                !utils.isNumber(count, 1)) {
                this.logger.warn('参数错误', area, count);
                return utils.nextError(next);
            }

            let stateManager = this.room.getComp('state');

            if (!seat.canBet(count)) {
                this.logger.warn('金币不足', count);
                return utils.nextError(next, '金币不足');
            }

            seat.bet(area, count);
            stateManager.addBetCount(area, count);
            utils.nextOK(next);
        } else if (action.name === cons.RoomAction.PLAYER_BID_CANCEL()) {
            if (seat.chipMgr.all() == 0) {
                this.logger.warn('没有押注无法撤销');
                return utils.nextError(next, '没有押注无法撤销');
            }

            seat.cancelBet();
            utils.nextOK(next);
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
            //         return utils.nextError(next, '庄家不能下注');
            //     }
            // }

            // if (_.some(chipMgr.getBetChips(), (count, area) => {
            //     if (!stateMgr.canBet(area, count)) {
            //         this.logger.warn('超过庄家最大赔付', area, count);
            //         return true;
            //     }
            //     return false;
            // })) {
            //     return utils.nextError(next, '超过庄家最大赔付');
            // }

            let count = chipMgr.all();

            // if (!stateMgr.canBet(-1, count)) {
            //     this.logger.warn('超过庄家最大赔付', count);
            //     return utils.nextError(next, '超过庄家最大赔付');
            // }

            if (!seat.canBet(count)) {
                this.logger.warn('金币不足', count);
                return utils.nextError(next, '金币不足');
            }

            _.each(chipMgr.getBetChips(), (count, area) => {
                seat.bet(area, count);
                stateMgr.addBetCount(area, count);
            });
            utils.nextOK(next);
        } else {
            utils.nextOK(next);
        }
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