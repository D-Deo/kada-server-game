const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const Turn = require('../../../../room/turn');
const _ = require('underscore');

//加倍
class DoubleTurn extends Turn {
    static create(room, seat, to) {
        room.getComp('turn').schedule(new DoubleTurn(room, seat, to));
    }

    constructor(room, seat, to) {
        super(room, ddzcons.Turn.DOUBLE(), ddzcons.TurnInterval.DOUBLE());

        this.seat = seat;
        this.to = to;
    }

    action(seat, action, next) {
        if (seat !== this.seat) {
            super.action(seat, action, next);
            return;
        }

        if (action.name !== ddzcons.RoomAction.PLAYER_DOUBLE()) {
            super.action(seat, action, next);
            return;
        }

        switch (action.type) {
            case ddzcons.DOUBLE.YES()://加倍
                this.onDoubleAction_Yes(action.count, next);
                break;

            case ddzcons.DOUBLE.NO()://不加倍
                this.onDoubleAction_No(next);
                break;

            default:
                utils.nextError(next);
                return;
        }
    }

    onDoubleAction_Yes(count, next) {
        this.seat.double(ddzcons.DOUBLE.YES, count);
        this.end(next);
    }

    onDoubleAction_No(next) {
        this.seat.double(ddzcons.DOUBLE.NO);
        this.end(next);
    }

    begin() {
        super.begin();
        this.room.getComp('state').speak();
    }

    end() {
        super.end();

        let stateManager = this.room.getComp('state');
        /*let speaks = this.room.getComp('seat').getSpeakSeats();
        if(!stateManager.isPlaying()) {
            stateManager.changeState(dzcons.RoomState.PLAY());
            return;
        }*/
        /*if(speaks.length <= 1) {
            stateManager.createTurn(ddzcons.Turn.SPEAK());
            return;
        }*/

        let banker = stateManager.getBankerSeat();
        let seats = banker.nexts();
        seats.push(banker);
        logger.debug('seats:' + JSON.stringify(seats));
        let isAllDoubled = _.every(seats, s => s.isDoubled());
        if (isAllDoubled) {
            //都选择过是否加倍
            stateManager.changeState(dzcons.RoomState.PLAY());
        }

        if (this.seat === this.to) {
            stateManager.createTurn(ddzcons.Turn.DOUBLE());
            return;
        }
        stateManager.createTurn(ddzcons.Turn.SPEAK(), this.seat.next(true), this.to);
    }
}

module.exports = DoubleTurn;