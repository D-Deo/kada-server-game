const Component = require('./component');
const constants = require('../common/constants');
const GameManager = require('../game/manager');
const rpc = require('../rpc/user');
const utils = require('../utils/index');
const _ = require('underscore');


class SeatManager extends Component {
    constructor(room) {
        super(room);
    }

    addUser(user, cb) {
        if (this.room.isCleared()) {
            user.leaveRoom(null, () => utils.cb(cb, constants.ResultCode.ROOM_UNKNOWN()));
            return;
        }

        let seat = this.getEmptySeat(this.room.getAttr('randomSeat'));
        if (!seat) {
            user.leaveRoom(null, () => utils.cb(cb, constants.ResultCode.ROOM_FULL()));
            return;
        }

        let score = this.room.getAttr('score');
        let scoreLimit = true;
        if (this.room.isPrivate()) {
            scoreLimit = false;
            let aa = this.room.getAttr('aa');
            if (aa == 1) {
                scoreLimit = true;
            } else {
                if (this.room.isOwner(user.getId())) {
                    scoreLimit = true;
                }
            }
        }

        if (scoreLimit) {
            let scoreMin = this.room.getAttr('scoreMin');

            let scoreUser = user.getScore();
            if (score == constants.Item.DIAMOND()) {
                scoreUser = user.getDiamond();
            }

            if (score && scoreMin && scoreUser < scoreMin) {
                user.leaveRoom(null, () => utils.cbItemNotEnough(cb, this.room.getAttr('score')));
                return;
            }

            let scoreMax = this.room.getAttr('scoreMax');
            if (score && scoreMax && scoreUser > scoreMax) {
                user.leaveRoom(null, () => utils.cbItemTooMuch(cb, this.room.getAttr('score')));
                return;
            }
        }

        seat.bindUser(user);
        utils.cbOK(cb);
    }

    hostUser(userId) {
        let seat = this.getSeatByUserId(userId);
        if (!seat) {
            return;
        }

        seat.hostUser();
        this.room.emit(constants.RoomEvent.SEAT_HOST_PLAYER(), seat);
    }

    unhostUser(session) {
        let seat = this.getSeatByUserId(session.getUserId());
        if (!seat) {
            return false;
        }

        seat.unhostUser(session);
        this.room.emit(constants.RoomEvent.SEAT_HOST_PLAYER(), seat);
        return true;
    }

    removeUser(userId, reason, cb) {
        let seat = this.getSeatByUserId(userId);
        if (!seat) {
            utils.cbOK(cb);
            return;
        }

        if (this.room.getAttr('canOwnerLeave') && this.room.isOwner(userId)) {
            utils.cb(cb, constants.ResultCode.ROOM_OWNER_LEAVE());
            return;
        }

        if (seat.isPlaying()) {
            utils.cb(cb, constants.ResultCode.ROOM_PLAYING());
            return;
        }

        seat.unbindUser(reason, cb);
    }

    removeSittingUser() {
        _.each(this.getSittingSeats(), (seat) => {
            seat.unbindUser(constants.RoomClearReason.RESULT());
        });
    }

    removeAnotherUser() {
        _.each(this.getSittingSeats(), (seat) => {
            seat.unbindUser(constants.RoomClearReason.NONE());
        });
    }

    removeHostingUsers() {
        console.log('removeHostingUsers len:', this.getHostingSeats().length);
        _.each(this.getHostingSeats(), (seat) => {
            console.log('removeHostingUsers seat:', seat.toJson());
            seat.unbindUser(constants.RoomClearReason.KICK_HOSTING_USER())
        });
    }

    removeNotEnoughScoreUsers() {
        let scoreMin = this.room.getAttr('scoreMin');
        if (scoreMin <= 0) {
            return;
        }

        let seats = _.filter(this.getSittingSeats(), (seat) => {
            return seat.getUser().getScore() < scoreMin;
        });
        _.each(seats, (seat) => {
            seat.unbindUser(constants.RoomClearReason.KICK_NOT_ENOUGH_SCORE_USER());
        });
    }

    clear(reason) {
        _.each(this.seats, (seat) => seat.unbindUser(reason));
        this.controller = null;
        this.seats = null;
    }

    getUser(userId) {
        let seat = _.find(this.seats, s => s.getUserId() == userId);
        return seat ? seat.getUser() : null;
    }

    getSeat(index) {
        return this.seats[index];
    }

    getSeatByUserId(userId) {
        return _.find(this.seats, (s) => s.getUserId() === userId);
    }

    getEmptySeat(random) {
        let seats = this.getEmptySeats();
        if (_.isEmpty(seats)) {
            return null;
        }

        return random ? utils.randomArray(seats) : _.first(seats);
    }

    getSeats() {
        return this.seats;
    }

    immortalCnt() {
        let count = 0;
        _.each(this.seats, (s) => {
            if (!s.isRobot()) {
                count++;
            }
        });
        return count;
    }

    robotCnt() {
        let count = 0;
        _.each(this.seats, (s) => {
            if (s.isRobot()) {
                count++;
            }
        });
        return count;
    }

    OnlyImmortalIndex() {
        let index = -1;
        if (this.immortalCnt() == 1) {
            _.each(this.seats, (s) => {
                if (!s.isRobot()) {
                    index = s.getIndex();
                }
            });
        }
        return index;
    }
    onlyRobotIndex() {
        let index = -1;
        if (this.robotCnt() == 1) {
            _.each(this.seats, (s) => {
                if (s.isRobot()) {
                    index = s.getIndex();
                }
            });
        }
        return index;
    }

    anotherRobotIndex(robotIndex) {
        let index = -1;
        if (this.robotCnt() == 2) {
            _.each(this.seats, (s) => {
                if (s.isRobot() && s.getIndex() != robotIndex) {
                    index = s.getIndex();
                }
            });
        }
        return index;
    }

    getEmptySeats() {
        return _.filter(this.seats, (s) => s.isEmpty());
    }

    getReadySeats() {
        return _.filter(this.seats, (s) => s.isReady());
    }

    getHostingSeats() {
        return _.filter(this.seats, (s) => s.isHosting());
    }

    getPlayingSeats() {
        return _.filter(this.seats, (s) => s.isPlaying());
    }

    getSittingSeats() {
        return _.filter(this.seats, (s) => !s.isEmpty());
    }

    getSittingSeats_User() {
        let seats = this.getSittingSeats();
        return _.reject(seats, s => s.getUser().isRobot());
    }

    getSittingSeats_Robot() {
        let seats = this.getSittingSeats();
        return _.filter(seats, s => s.getUser().isRobot());
    }

    init() {
        super.init();

        this.initSeats();
        this.room.on(constants.RoomEvent.ROOM_CREATE(), this.sendInvitations.bind(this));
    }

    initSeats() {
        this.seats = [];
        _.times(this.room.getAttr("capacity"), (index) => {
            this.seats.push(GameManager.getInstance().new2(this.room.getGame(), 'room.seat', this.room, index));
        });
    }

    isEmpty() {
        return _.every(this.seats, (s) => s.isEmpty());
    }

    isFull() {
        return _.every(this.seats, (s) => !s.isEmpty());
    }

    isReady() {
        return _.every(this.getSittingSeats(), s => s.isReady());
    }

    reset() {
        _.each(this.seats, (s) => s.reset());
    }

    sendInvitations() {
        let invitations = this.room.getAttr('invitations');
        if (!invitations) {
            return;
        }
        rpc.inviteRoom(this.room.getAttr('owner'), invitations, this.room.getComp('session'));
    }

    shuffle() {
        this.seats = _.shuffle(this.seats);
        let result = _.map(this.seats, (s) => s.getIndex());
        _.each(this.seats, (seat, index) => seat.setIndex(index));
        return result;
    }

    toJson(seat) {
        return _.map(this.seats, (s) => s.toJson(seat));
    }
}


module.exports = SeatManager;