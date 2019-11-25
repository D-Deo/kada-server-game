const constants = require('../../../common/constants');
const Hand = require('./hand');
const Super = require('../../../room/seat');
const _ = require('underscore');


class Seat extends Super {
    constructor(room, index) {
        super(room, index);

        this.clear();
    }

    clear() {
        super.clear();

        this.banker = null;
        this.bid = null;
        this.hand = null;
        this.played = false;
        // this.ready = false;
        this.timeouts = 0;
        this.record('takeAllTimes');
        this.record('payAllTimes');
        this.record('nnTimes');
        this.record('noTimes');
        this.record('winTimes');
    }

    isBanker() {
        return this.room.getComp('state').isBankerSeat(this);
    }

    isBankered() {
        return !_.isNull(this.banker);
    }

    isBankering() {
        return this.banker === 1;
    };

    setBanker(banker, timeout = false) {
        this.banker = banker;
        this.timeouts += (timeout ? 1 : 0);
        this.sendChannelAction(constants.RoomAction.PLAYER_BANKER(), { banker });
    }

    getBid() {
        return this.bid;
    }

    isBidded() {
        return !_.isNull(this.bid);
    }

    setBid(bid, timeout = false) {
        this.bid = bid;
        this.timeouts += (timeout ? 1 : 0);
        this.sendChannelAction(constants.RoomAction.PLAYER_BID(), { bid });
    }

    getHand() {
        return this.hand;
    }

    // setReady(ready) {
    //     this.ready = ready;
    //     this.sendChannelAction(constants.RoomAction.PLAYER_READY(), {ready});
    // }

    isPlayed() {
        return this.played;
    }

    setPlayed(played = true, timeout = false) {
        this.played = played;
        this.timeouts += (timeout ? 1 : 0);
        this.sendChannelAction(constants.RoomAction.PLAYER_PLAY(), { played });
    }

    isPlaying() {
        return super.isPlaying() && this.isReady() && (!!this.hand);
    }

    addTimeouts(value = 1) {
        this.timeouts += value;
    }

    getTimeouts() {
        return this.timeouts;
    }

    onRoundBegin() {
        super.onRoundBegin();
        this.hand = new Hand(this.room, this);
    }

    reset() {
        super.reset();

        this.banker = null;
        this.bid = null;
        this.hand = null;
        this.played = false;
        // this.ready = false;
        this.timeouts = 0;
    }

    result() { }

    toJson(seat) {
        let json = super.toJson(seat);
        json.banker = this.banker;
        json.bid = this.bid;
        json.hand = this.hand ? this.hand.toJson(seat) : null;
        json.ready = this.ready;
        json.played = this.played;
        return json;
    }
}


module.exports = Seat;