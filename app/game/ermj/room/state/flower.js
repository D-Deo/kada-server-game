const cons = require('../../../../common/constants');
const ermjcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const mjutils = require('../../majong/utils');
const _ = require('underscore');
const mj = require('../../majong/library');

class FlowerState extends Super {
    constructor(room) {
        super(room, ermjcons.RoomState.FLOWER(), ermjcons.RoomStateInterval.FLOWER());
    }

    enter() {
        this.count = 0;
        this.check();
    }

    getCurrentSeat() {
        return (this.room.getComp('state').getBanker() + this.count)
            % ermjcons.ROOM_CAPACITY();
    }

    check() {
        if (this.count == ermjcons.ROOM_CAPACITY()) {
            this.room.getComp('state').changeState(ermjcons.RoomState.PLAY());
            return;
        }

        let index = this.getCurrentSeat();
        let seat = this.room.getComp('seat').getSeat(index);

        let cards = seat.splitFlower();
        if (cards.length > 0) {
            let newCards = _.map(cards, c => seat.drawBack());

            _.forEach(this.room.getComp('seat').getSittingSeats(), s => {
                s.sendAction(ermjcons.RoomAction.FLOWER(), {
                    seat: this.getCurrentSeat(),
                    cards: _.map(cards, c => c.toJson()),
                    newCards: _.map(newCards, c => c.toJson(s == seat)),
                    front: false
                }); //补花玩家收到的是特别事件说明自己在补花
            });
        } else {
            this.count++;
        }

        setTimeout(() => {
            this.check()
        }, ermjcons.RoomStateInterval.FLOWER());
    }

    exit() {
        super.exit();

        let banker = this.room.getComp('seat').getSeat(this.room.getComp('state').getBanker());
        banker.sortHandCards();
    }

    toJson() {
        let json = super.toJson();
        json.current = this.getCurrentSeat();
        return json;
    }
}

module.exports = FlowerState;