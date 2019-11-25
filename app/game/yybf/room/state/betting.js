const Super = require('../../../../room/timerState');
const ChisManager = require('../chipManager');
const cons = require('../../../../common/constants');
const yybfcons = require('../../common/constants');
const utils = require('../../../../utils');
const _ = require('underscore');

class BettingState extends Super {
    constructor(room) {
        super(room, yybfcons.RoomState.BETTING(), yybfcons.RoomStateInterval.BETTING());
        this.betTimer = null;
    }

    action(seat, action, next) {
        if (action.name === cons.RoomAction.PLAYER_BID()) {
            let count = action.count;

            if (!utils.isNumber(count, 1)) {
                this.logger.warn('参数错误', count);
                return utils.nextError(next);
            }

            let stateManager = this.room.getComp('state');

            if (!seat.canBet(count)) {
                this.logger.warn('金币不足', count);
                return utils.nextError(next, '金币不足');
            }
            seat.bet(count);
            stateManager.addBetCount(count);
            utils.nextOK(next);
        } else if (action.name === cons.RoomAction.PLAYER_BID_REPEAT()) {
            let chips = action.chips;
            if (!utils.isArray(chips, 8, 8)) {
                this.logger.warn('参数错误', chips);
                return utils.nextError(next);
            }

            //let chipMgr = new ChisManager();
            //chipMgr.chips = chips;

            let stateMgr = this.room.getComp('state');

            //let count = chipMgr.all();


            if (!seat.canBet(count)) {
                this.logger.warn('金币不足', count);
                return utils.nextError(next, '金币不足');
            }

            _.each(chipMgr.getBetChips(), (count) => {
                seat.bet(count);
                stateMgr.addBetCount(count);
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
        this.room.getComp('state').changeState(yybfcons.RoomState.OPENING());
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