const Component = require('./component');
const constants = require('../common/constants');
const Timer = require('../common/intervalTimer');
const utils = require('../utils/index');
const _ = require('underscore');


class DismissManager extends Component {
    constructor(room) {
        super(room);
        this.timer = new Timer(constants.ROOM_DISMISS_INTERVAL(), () => this.stop());
        this.voters = null;
    }

    clear() {
        this.timer.stop();
        this.voters = null;
    }

    start(userId) {
        if (this.isRunning()) {
            return;
        }

        this.timer.start();
        this.voters = _.map(this.room.getComp('seat').getSittingSeats(), (seat) => {
            if (seat.getUserId() == userId) {
                this.sender = seat;
                return true;
            }
            return null;
        });
        this.room.emit(constants.RoomEvent.ROOM_ACTION(), constants.RoomAction.DISMISS_START(), this.toJson());
    }

    stop() {
        this.room.emit(constants.RoomEvent.ROOM_ACTION(), constants.RoomAction.DISMISS_STOP());

        if (this.isFail()) {
            this.clear();
            return;
        }

        this.room.result();
        this.room.clear(constants.RoomClearReason.VOTE_DISMISS());
    }

    isEnded() {
        return this.isAllVoted() || this.isFail();
    }

    isFail() {
        return _.some(this.voters, (v) => v === false);
    }

    isRunning() {
        return this.voters !== null;
    }

    isVoted(userId) {
        let seat = this.room.getComp('seat').getSeatByUserId(userId);
        return this.voters[seat.getIndex()] !== null;
    }

    isAllVoted() {
        return _.every(this.voters, (v) => v !== null);
    }

    toJson() {
        let json = _.pick(this, ['voters']);
        json.timer = this.timer ? this.timer.remain() : null;
        json.sender = this.sender ? this.sender.toJson() : null;
        return json;
    }

    vote(userId, v, next) {
        if (!this.isRunning()) {
            utils.nextError(next);
            return;
        }

        let seat = this.room.getComp('seat').getSeatByUserId(userId);
        if (!seat) {
            utils.nextError(next);
            return;
        }

        if (this.isVoted(userId)) {
            utils.nextError(next);
            return;
        }

        this.voters[seat.getIndex()] = !!v;
        seat.sendChannelAction(constants.RoomAction.DISMISS_VOTE(), { vote: !!v });
        this.isEnded() && this.stop();
        utils.nextOK(next);
    }
}


module.exports = DismissManager;