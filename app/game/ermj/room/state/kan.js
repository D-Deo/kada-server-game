const cons = require('../../../../common/constants');
const ermjcons = require('../../common/constants');
const mjcons = require('../../majong/majongConstants')
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const mjutils = require('../../majong/utils');

// 抢杠状态
class KanState extends Super {
    constructor(room) {
        super(room, ermjcons.RoomState.KAN(), ermjcons.RoomStateInterval.KAN());
    }

    enter() {
        super.enter();

        this.seat = this.room.getComp('state').getCurrentSeat();
        this.seat.getPanel().onKan();

        if (!this.seat.getPanel().canRon) {
            this.end();
            return;
        }

        this.seat.sendAction(ermjcons.RoomAction.PLAYER_PANEL(), this.seat.getPanel().toJson());

        if (this.seat.isHosting()) {
            this.end();
        }
        else if (!this.seat.getPanel().canRon) {
            this.end();
        }
        else if (this.seat.getAuto()) {
            this.tmAutoRon = setTimeout(() => this.autoRon(), ermjcons.RoomStateInterval.AUTO());
        }
    }

    exit() {
        super.exit();

        if (this.tmAutoGuo != undefined) {
            clearTimeout(this.tmAutoGuo);
        }

        if (this.tmAutoRon != undefined) {
            clearTimeout(this.tmAutoRon);
        }
    }

    // 可抓、吃、碰、杠、胡
    action(seat, action, next) {
        if (seat.index != this.room.getComp('state').playerIndex
            || !seat.canDoByLastAction(action.name)) {
            utils.nextOK(next);
            return;
        }

        switch (action.name) {
            case cons.RoomAction.PLAYER_ROBOT():
                if (this.seat.getAuto()) {
                    this.end();
                }

                utils.nextOK(next);
                break;
            // 抓
            case ermjcons.RoomAction.GUO():
                this.guo(seat, action, next);
                break;
            case ermjcons.RoomAction.RON():
                this.ron(seat, action, next);
                break;
            default:
                utils.nextOK(next);
                break;
        }
    }

    guo(seat, action, next) {
        this.end();
        utils.nextOK(next);
    }

    ron(seat, action, next) {
        if (seat.doRon("抢杠胡")) {
            utils.nextOK(next);
        }
        else {
            utils.nextError(next);
        }
    }

    end() {
        super.end();
        this.room.getComp('state').nextPlayer();
        this.room.getComp('state').changeState(ermjcons.RoomState.DRAW());
    }

    autoRon() {
        this.seat.doRon("抢杠胡");
    }

    toJson() {
        let json = super.toJson();
        json.seatIndex = this.room.getComp('state').playerIndex;
        return json;
    }
}

module.exports = KanState;