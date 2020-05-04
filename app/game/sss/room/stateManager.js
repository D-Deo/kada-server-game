const cons = require('../../../common/constants');
const ssscons = require('../common/constants');
const Library = require('../poker/library');
const Super = require('../../../room/stateManager');
const utils = require('../../../utils');
const WaitState = require('./state/wait');
const DealState = require('./state/deal');
const PlayState = require('./state/play');
const ResultState = require('./state/result');
const EndState = require('./state/end');
const _ = require('underscore');

class StateManager extends Super {
    constructor(room) {
        super(room);
        this.results = [];
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
        if (type === ssscons.RoomState.WAIT()) {
            return new WaitState(this.room);
        } else if (type === ssscons.RoomState.DEAL()) {
            return new DealState(this.room);
        } else if (type === ssscons.RoomState.PLAY()) {
            return new PlayState(this.room);
        } else if (type === ssscons.RoomState.RESULT()) {
            return new ResultState(this.room);
        } else if (type === ssscons.RoomState.END()) {
            return new EndState(this.room);
        }
        return null;
    }

    init() {
        super.init();

        this.library = new Library(this.room);
        this.results = [];

        this.changeState(ssscons.RoomState.WAIT());
    }

    clear() {
        super.clear();
        this.results = null;
    }

    reset() {
        this.changeState(ssscons.RoomState.WAIT());
    }

    onRoundBegin() {
        this.library.wash();

        let jackpot = 0;
        let seatMgr = this.room.getComp('seat');

        seatMgr.clearAllMidway();
        _.each(seatMgr.getReadySeats(), (seat) => {
            seat.onRoundBegin(jackpot);
        });

        // this.changeState(ssscons.RoomState.DEAL());
        this.changeState(ssscons.RoomState.PLAY());
    }

    onRoundResult(balance) {
        this.results.push(balance);
    }

    getLibrary() {
        return this.library;
    }

    getResults() {
        return this.results;
    }

    result() {
        this.balance = {};
        this.balance.seats = _.map(this.room.getComp('seat').getSeats(), (seat) => {
            if (seat.isEmpty()) {
                return null;
            }
            return seat.toJson_Result();
        });
        this.balance.results = this.getResults();
        return this.balance;
    }

    toJson() {
        let json = this.state ? this.state.toJson() : {};
        json.results = this.getResults();
        return json;
    }

}


module.exports = StateManager;