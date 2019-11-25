const Component = require('./component');
const cons = require('../common/constants');
const utils = require('../utils');
const _ = require('underscore');


class StateManager extends Component {
    constructor(room) {
        super(room);
    }

    init() {
        super.init();

        this.balance = null;
        this.state = null;

        this.room.on(cons.RoomEvent.ROOM_UPDATE(), this.update.bind(this));
        this.room.on(cons.RoomEvent.ROUND_BEGIN(), this.onRoundBegin.bind(this));
        this.room.on(cons.RoomEvent.ROUND_RESULT(), this.onRoundResult.bind(this));
        this.room.on(cons.RoomEvent.ROUND_END(), this.onRoundEnd.bind(this));
    }

    reset() {
        this.balance = null;
    }

    action(seat, action, next) {
        if (action.name == cons.RoomAction.PLAYER_JOIN()) {
            seat.setReady();
            utils.nextOK(next);
            return;
        }

        if (!this.state) {
            utils.nextOK(next);
            return;
        }

        this.state.action(seat, action, next);
    }

    changeState(type) {
        if (this.state) {
            this.state.exit();
            this.state = null;
        }

        this.state = this.createState(type);
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_CHANGE_STATE(), this.toJson());
        this.state && this.state.enter();
    }

    createState(type) {
        return null;
    }

    clear() {
        super.clear();

        if (!this.state) {
            return;
        }

        this.state.exit();
        this.state = null;
    }

    getType() {
        return this.state ? this.state.getType() : null;
    }

    getBalance() {
        return this.balance;
    }

    isEnded() {
        return false;
    }

    onRoundBegin() {
        _.each(this.room.getComp('seat').getReadySeats(), (seat) => {
            seat.onRoundBegin();
        });
    }

    onRoundResult(balance) {

    }

    onRoundEnd() {
        _.each(this.room.getComp('seat').getReadySeats(), (seat) => {
            seat.onRoundEnd();
        });
        if (this.room.getComp('turn')) {
            this.room.getComp('turn').clear();
        }
        // if (!this.room.getComp('round').isEnded()) {
        //     this.reset();
        // }
    }

    result() {
        this.balance = _.map(this.room.getComp('seat').getSeats(), (seat) => {
            if (seat.isEmpty()) {
                return null;
            }

            // this.room.getComp('db').onUserHistory(seat);
            return seat.toJson_Result();
        });
        return this.balance;
    }

    toJson() {
        let json = this.state ? this.state.toJson() : {};
        json.balance = this.balance;
        return json;
    }

    update(dt) {
        this.state && this.state.update(dt);
    }
}


module.exports = StateManager;