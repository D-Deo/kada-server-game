const cons = require('../../../common/constants');
const nncons = require('../common/constants');
const Library = require('../poker/library');
const Super = require('../../../room/stateManager');
const utils = require('../../../utils');
const WaitState = require('./state/wait');
const BankerState = require('./state/banker');
const FirstDealState = require('./state/firstDeal');
const BidState = require('./state/bid');
const SecondDealState = require('./state/secondDeal');
const PlayState = require('./state/play');
const ResultState = require('./state/result');
const _ = require('underscore');
const redis = require('../../../../app/redis');


class StateManager extends Super {
    constructor(room) {
        super(room);
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
        if (type === nncons.RoomState.WAIT()) {
            return new WaitState(this.room);
        } else if (type === nncons.RoomState.BANKER()) {
            return new BankerState(this.room);
        } else if (type === nncons.RoomState.FIRST_DEAL()) {
            return new FirstDealState(this.room);
        } else if (type === nncons.RoomState.BID()) {
            return new BidState(this.room);
        } else if (type === nncons.RoomState.SECOND_DEAL()) {
            return new SecondDealState(this.room);
        } else if (type === nncons.RoomState.PLAY()) {
            return new PlayState(this.room);
        } else if (type === nncons.RoomState.RESULT()) {
            return new ResultState(this.room);
        }
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

    getLibrary() {
        return this.library;
    }

    washLibrary() {
        let needs = this.room.getComp('seat').getSittingSeats() * nncons.HAND_CAPACITY();
        if (this.library.haveEnoughCard(needs)) {
            return;
        }
        this.library.wash();
    }

    getBankerSeat() {
        if (this.banker === null) {
            return null;
        }

        let seat = this.room.getComp('seat').getSeat(this.banker);
        return seat.isEmpty() ? null : seat;
    }

    isBankerSeat(seat) {
        return this.banker === seat.getIndex();
    }
    
    resetBanker(random = false) {
        let seats = _.map(this.room.getComp('seat').getSittingSeats(), (s) => s.getIndex());
        if (random) {
            seats = _.shuffle(seats);
        }
        this.setBanker(_.first(seats));
    }

    setBanker(banker) {
        this.banker = banker;
        this.room.getComp('channel').sendAction(cons.RoomAction.ROOM_STATE_BANKER(), this.banker);
    }

    init() {
        super.init();

        this.banker = null;
        this.library = new Library();
        this.state = null;
        this.changeState(nncons.RoomState.WAIT());
    }

    onRoundBegin() {
        if (this.room.getAttr('bankerMode') === nncons.BankerMode.ASK()) {
            this.setBanker(null);
        } if (this.room.getAttr('bankerMode') === nncons.BankerMode.FIXED()) {
            !this.getBankerSeat() && this.resetBanker();
        } else {
            !this.getBankerSeat() && this.resetBanker(true);
        }

        this.washLibrary();

        // let jackpot = await redis.async.get(`UpGame:NN:AREA_${this.room.getAttr('area')}:jackpot`);
        // jackpot = parseInt(jackpot) || 0;

        _.each(_.shuffle(this.room.getComp('seat').getReadySeats()), (seat) => {
            seat.onRoundBegin();
        });

        if (this.room.getAttr('standard')) {
            this.changeState(nncons.RoomState.BANKER());
        }
        else {
            this.changeState(nncons.RoomState.FIRST_DEAL());
        }
    }

    onRoundResult() {
        if (this.room.getAttr("bankerMode") !== nncons.BankerMode.TURN()) {
            return;
        }

        let banker = this.getBankerSeat();
        if (!banker.getHand().getFormation().is(nncons.Poker.Formation.NONE(), 0)) {
            return;
        }

        banker = banker.next(true);
        this.setBanker(banker.getIndex());
    }

    reset() {
        this.changeState(nncons.RoomState.WAIT());
    }

    toJson() {
        let json = this.state ? this.state.toJson() : {};
        json.banker = this.banker;
        return json;
    }

    update(dt) {
        this.state && this.state.update(dt);
    }
}


module.exports = StateManager;