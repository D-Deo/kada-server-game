const _ = require('underscore');
const cons = require('../../../common/constants');
const ssscons = require('../common/constants');
const Hand = require('./hand');
const Super = require('../../../room/seat');
const IntervalTimer = require('../../../common/intervalTimer');

class Seat extends Super {
    constructor(room, index) {
        super(room, index);

        this.logger = this.room.getComp('logger');
        // this.timer = new IntervalTimer(ssscons.PlayerStateInterval.WAIT(), () => this.timeout());
        // this.clear();
    }

    bindUser(user) {
        super.bindUser(user);
        // this.timer.start();
    }

    unbindUser(reason, cb) {
        // this.timer.stop();
        return super.unbindUser(reason, cb);
    }

    timeout() {
        // this.timer.stop();
        this.setReady();
    }

    init() {
        this.hand = null;
        this.played = false;
        this.showed = false;
        this.timeouts = 0;
    }

    clear() {
        super.clear();

        this.finalScore = 0;
        if (this.timer) {
            this.timer.stop();
        }
        this.init();
        // this.record('takeAllTimes');
        // this.record('payAllTimes');
        // this.record('p9Times');
        // this.record('noTimes');
        // this.record('winTimes');
    }

    getHand() {
        return this.hand;
    }

    isPlayed() {
        return this.played;
    }

    setPlayed(special, cards, timeout = false) {
        this.logger.debug('setPlayed', special, cards);

        if (this.played) {
            return false;
        }

        if (special) {
            this.hand.setSpecial();
        } else {
            this.hand.arrange(cards);
        }

        if (!this.hand.isValid()) {
            return false;
        }

        this.played = true;
        this.timeouts += (timeout ? 1 : 0);
        this.sendChannelAction(cons.RoomAction.PLAYER_PLAY(), { played: this.played, special: this.hand.playedSpecial });
        return true;
    }

    canBack() {
        let scoreBack = this.room.getAttr('scoreBack');
        if (this.user.getDiamond() < scoreBack) {
            return false;
        }
        return true;
    }

    setBack(timeout = false) {
        let scoreBack = this.room.getAttr('scoreBack');
        this.user.updateDiamond(-scoreBack);

        this.played = false;
        this.hand.playedSpecial = false;
        this.timeouts += (timeout ? 1 : 0);
        this.sendChannelAction(cons.RoomAction.PLAYER_BACK());
    }

    canCut() {
        let scoreCut = this.room.getAttr('scoreCut');
        if (this.user.getDiamond() < scoreCut) {
            return false;
        }
        return true;
    }

    cut() {
        let scoreCut = this.room.getAttr('scoreCut');
        this.user.updateDiamond(-scoreCut);
    }

    setShowed() {
        this.showed = true;
    }

    isBlack() {
        if (this.isEmpty()) {
            return false;
        }
        return this.user.getAttr('state') == cons.UserState.BLACK_SSS();
    }

    isWhite() {
        if (this.isEmpty()) {
            return false;
        }
        return this.user.isWhite();
    }

    isPlaying() {
        return super.isPlaying() && this.isReady() && (!!this.hand);
    }

    isSpecial() {
        return this.hand.playedSpecial;
    }

    isCost() {
        return this.cost;
    }

    addTimeouts(value = 1) {
        this.timeouts += value;
    }

    getTimeouts() {
        return this.timeouts;
    }

    addFinalScore(score) {
        this.finalScore += score;
    }

    getFinalScore() {
        return this.finalScore;
    }

    onRoundBegin(jackpot) {
        super.onRoundBegin();
        this.init();
        this.hand = new Hand([], this, jackpot);

        if (!this.isCost()) {
            let scoreMin = this.room.getAttr('scoreMin');
            if (this.room.getAttr('aa') == 1) {
                this.user.updateDiamond(-scoreMin);
                this.cost = true;
            } else if (this.room.isOwner(this.getUserId())) {
                this.user.updateDiamond(-scoreMin);
                this.cost = true;
            } else {
                this.cost = false;
            }
        }
    }

    onRoundEnd() {
        super.onRoundEnd();
        this.ready = false;
    }

    reset() {
        super.reset();
    }

    result() { }

    toJson(seat) {
        let json = super.toJson(seat);
        json.cost = this.cost;
        json.hand = this.hand ? this.hand.toJson(this.showed || seat == this) : null;
        json.ready = this.ready;
        json.played = this.played;
        json.showed = this.showed;
        json.finalScore = this.finalScore;
        // json.time = this.timer.remain();
        // json.interval = this.timer.getInterval();
        return json;
    }

    toJson_Result() {
        let json = {};
        json.index = this.index;
        json.user = this.user ? this.user.toJson_Result() : null;
        json.finalScore = this.finalScore;
        return json;
    }
}

module.exports = Seat;