const cons = require('../../../../common/constants');
const mjcons = require('../../majong/majongConstants');
const ermjcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');

class SoundState extends Super {
    constructor(room) {
        super(room, ermjcons.RoomState.SOUND(), ermjcons.RoomStateInterval.SOUND());
    }

    enter() {
        super.enter();
        this.seat = this.room.getComp('state').getCurrentSeat();
        let panel = this.seat.getPanel();
        panel.refresh(2);

        if (!panel.canChi && !panel.canPon && !panel.canKan && !panel.canRon) {
            this.end();
            return;
        }

        this.seat.sendAction(ermjcons.RoomAction.PLAYER_PANEL(), panel.toJson());

        if (this.seat.isHosting()) {
            this.end();
        }
        else if (this.seat.getTinFlag() != 0 && !panel.canRon) {
            this.tmAutoDraw = setTimeout(() => this.end(), ermjcons.RoomStateInterval.AUTO());
        }
        else if (this.seat.getAuto()) {
            if (panel.canRon) {
                this.tmAutoRon = setTimeout(() => this.autoRon(), ermjcons.RoomStateInterval.AUTO());
            }
            else {
                this.end();
            }
        }
    }

    exit() {
        super.exit();

        if (this.tmAutoDraw != undefined) {
            clearTimeout(this.tmAutoDraw);
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
            case ermjcons.RoomAction.PASS():
                this.draw(seat, action, next);
                break;
            case ermjcons.RoomAction.DRAW():
                this.draw(seat, action, next);
                break;
            // 吃
            case ermjcons.RoomAction.CHI():
                this.chi(seat, action, next);
                break;
            // 碰
            case ermjcons.RoomAction.PON():
                this.pon(seat, action, next);
                break;
            // 杠
            case ermjcons.RoomAction.KAN():
                this.kan(seat, action, next);
                break;
            // 胡
            case ermjcons.RoomAction.RON():
                this.ron(seat, action, next);
                break;
            default:
                utils.nextOK(next);
                break;
        }
    }

    draw(seat, action, next) {
        if (seat.doDraw()) {
            utils.nextOK(next);
        }
        else {
            utils.nextError(next);
        }
    }

    chi(seat, action, next) {
        if (seat.doChi(...action.cards)) {
            utils.nextOK(next);
        }
        else {
            utils.nextError(next);
        }
    }

    pon(seat, action, next) {
        if (seat.doPon()) {
            utils.nextOK(next);
        }
        else {
            utils.nextError(next);
        }
    }

    kan(seat, action, next) {
        if (seat.doKan(action.card)) {
            utils.nextOK(next);
        }
        else {
            utils.nextError(next);
        }
    }

    ron(seat, action, next) {
        let ruleName = this.getRuleName(seat);

        if (seat.doRon(ruleName)) {
            utils.nextOK(next);
        }
        else {
            utils.nextError(next);
        }
    }

    getRuleName(seat) {
        let ruleName = "";
        let banker = this.room.getComp('seat').getSeat(this.room.getComp('state').getBanker());
        if (seat != banker && banker.getOutCount() == 1 && banker.handCards.length == mjcons.cardsPerPlayer()) {
            // 庄家打出的第一张牌闲家就和牌。如果庄家出牌前有暗杠，那么不算人胡
            ruleName = "人胡";
        }

        return ruleName;
    }

    end() {
        super.end();
        this.seat.doDraw();
    }

    autoRon() {
        let ruleName = this.getRuleName(this.seat);

        this.seat.doRon(ruleName);
    }

    toJson() {
        let json = super.toJson();
        json.seatIndex = this.room.getComp('state').playerIndex;
        return json;
    }
}

module.exports = SoundState;