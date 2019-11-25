// const cons = require('../../../../common/constants');
const mjcons = require('../../majong/majongConstants');
const ermjcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const ermjutils = require('../../majong/utils');
const _ = require('underscore');

class PlayState extends Super {
    constructor(room) {
        super(room, ermjcons.RoomState.PLAY(), ermjcons.RoomStateInterval.PLAY());
    }

    enter() {
        super.enter();

        this.seat = this.room.getComp('state').getCurrentSeat();
        let panel = this.seat.getPanel();
        panel.refresh(1);
        this.seat.sendAction(ermjcons.RoomAction.PLAYER_PANEL(), panel.toJson());

        if (this.seat.isHosting()) {
            this.end();
        }
        else if (this.seat.getTinFlag() != 0 && !panel.canRon) {
            this.tmAutoPlay = setTimeout(() => this.end(), ermjcons.RoomStateInterval.AUTO());
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

        if (this.tmAutoPlay != undefined) {
            clearTimeout(this.tmAutoPlay);
        }

        if (this.tmAutoRon != undefined) {
            clearTimeout(this.tmAutoRon);
        }
    }

    action(seat, action, next) {
        if (seat.index != this.room.getComp('state').playerIndex
            || !seat.canDoByLastAction(action.name)) {
            utils.nextOK(next);
            return;
        }

        switch (action.name) {
            case ermjcons.RoomAction.PLAYER_ROBOT():
                if (this.seat.getAuto()) {
                    this.end();
                }

                utils.nextOK(next);
                break;
            // 抓
            case ermjcons.RoomAction.PASS():
                this.play(seat, action, next);
                break;
            // 出牌
            case ermjcons.RoomAction.PLAY():
                this.play(seat, action, next);
                break;
            //明牌
            case ermjcons.RoomAction.MING():
                this.mingPai(seat, action, next);
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

    mingPai(seat, action, next) {
        let statMgr = this.room.getComp('state');
        if (!statMgr.isbanker(seat.getIndex()) || statMgr.hasOutCards()) {
            utils.nextOK(next);
            return;
        }

        seat.mingPai();
        utils.cbOK(next)
    }

    play(seat, action, next) {
        let value = -1;
        let tin = false;

        if (action.name != ermjcons.RoomAction.PASS()) {
            value = action.card;
            tin = action.tin;
        } else {
            let panel = seat.getPanel();
            //panel.reset();
            if (this.seat.getTinFlag() != 0) {
                this.tmAutoPlay = setTimeout(() => this.end(), ermjcons.RoomStateInterval.AUTO());
                return utils.next(next);;
            }
            seat.sendAction(ermjcons.RoomAction.PLAYER_PANEL(), panel.toJson_false());
            return utils.next(next);
        }
        this.logger.info('发牌数据', ermjutils.printCards(seat.handCards));
        if (seat.doPlay(value, tin)) {
            utils.nextOK(next);
        } else {
            utils.nextError(next);
        }

        utils.nextOK(next);
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
        let ruleName = "自摸";
        if (seat.lastAction == ermjcons.RoomAction.KAN()) {
            ruleName = "杠上开花";
        }
        else if (seat.handCards.length == mjcons.cardsPerPlayer() + 1 && seat.getOutCount() == 0) {
            if (seat.index == this.room.getComp('state').getBanker()) {
                // 庄家在发完牌就和牌。如果庄家有补花，在补完花后就和牌也算。如果庄家在发完牌后由暗杠，那么不算天胡。
                ruleName = "天胡";
            }
            else {
                let banker = this.room.getComp('seat').getSeat(this.room.getComp('state').getBanker());
                if (banker.handCards.length == mjcons.cardsPerPlayer()) {
                    // 闲家摸到第一张牌就和牌，称为地胡。如果闲家抓的第一张牌是花牌，那么补花之后和也算地胡。如果闲家抓牌之前有人吃碰杠（包括暗杠），那么不算地胡。
                    ruleName = "地胡";
                }
            }
        }

        return ruleName;
    }

    end() {
        super.end();
        this.seat.doPlay(-1, false);
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

module.exports = PlayState;