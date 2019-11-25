const cons = require('../../../../common/constants');
const ermjcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');

class DrawState extends Super {
    constructor(room) {
        super(room, ermjcons.RoomState.DRAW(), ermjcons.RoomStateInterval.DRAW());
    }

    enter() {
        if (this.room.getComp('state').isAbort()) {
            this.room.getComp('state').doRon(-1);
            return;
        }

        super.enter();

        this.seat = this.room.getComp('state').getCurrentSeat();

        if (this.seat.lastDraw != undefined && this.seat.lastDraw.isFlower()) {
            let c = this.seat.lastDraw;
            this.seat.splitFlower();
            this.seat.lastAction = ermjcons.RoomAction.DRAW();
            this.seat.drawBack();

            _.forEach(this.room.getComp('seat').getSittingSeats(), s =>
                s.sendAction(ermjcons.RoomAction.FLOWER(),
                    {
                        seat: this.seat.index,
                        cards: [c.toJson()],
                        newCards: [this.seat.lastDraw.toJson(s == this.seat)],
                        front: false
                    })); //补花玩家收到的是特别事件说明自己在补花

            return;
        }

        if (this.seat.lastAction == ermjcons.RoomAction.KAN()) {
            // 杠，从后面摸牌
            this.seat.drawBack();
        }
        else {
            this.seat.drawFront();
        }

        _.each(this.room.getComp('seat').getSittingSeats(), s => {
            s.sendAction(ermjcons.RoomAction.DRAW(), {
                seat: this.seat.index,
                card: this.seat.lastDraw.toJson(s == this.seat),
                front: this.seat.lastAction != ermjcons.RoomAction.KAN()
            });
        });
    }

    end() {
        super.end();
        if (!this.seat.lastDraw.isFlower()) {
            this.room.getComp('state').changeState(ermjcons.RoomState.PLAY());
        } else {
            this.room.getComp('state').changeState(ermjcons.RoomState.DRAW());
        }
    }
}

module.exports = DrawState;