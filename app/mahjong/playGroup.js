const constants = require('../common/constants');
const Group = require('./group');
const _ = require('underscore');


class PlayGroup {
    static take(seat, play, hand) {
        return new PlayGroup(constants.Mahjong.Group.TAKE(), seat, play, hand);
    }

    static touch(seat, play, hand) {
        return new PlayGroup(constants.Mahjong.Group.TOUCH(), seat, play, hand);
    }

    static privateBar(seat, hand) {
        return new PlayGroup(constants.Mahjong.Group.PRIVATE_BAR(), seat, _.first(hand), hand);
    }

    static publicBar(seat, play, hand) {
        return new PlayGroup(constants.Mahjong.Group.PUBLIC_BAR(), seat, play, hand);
    }

    static touchBar(seat, play, hand) {
        return new PlayGroup(constants.Mahjong.Group.TOUCH_BAR(), seat, play, hand);
    }

    constructor(type, seat, play, hand) {
        this.type = type;
        this.seat = seat;
        this.play = play;
        this.hand = hand;
    }

    getType() {
        return this.type;
    }

    getPlaySeat() {
        return this.seat;
    }

    getPlayCard() {
        return this.play;
    }

    getHand() {
        return this.hand;
    }

    getSuit() {
        return _.first(this.hand).getSuit();
    }

    getPoint() {
        let cards = _.flatten([this.hand, this.play]);
        cards = _.sortBy(cards, (c) => c.getOrder());
        return _.first(cards).getPoint();
    }

    getTag() {
        return this.getPoint() + this.getSuit() * 100 + this.type * 10000;
    }

    is(type, suit, point) {
        return (this.type === type) && (suit === this.getSuit()) && (point === this.getPoint());
    }

    canTouchBar(suit, point) {
        if(this.type !== constants.Mahjong.Group.TOUCH()) {
            return false;
        }

        return _.first(this.hand).isSameWith(suit, point);
    }

    toTouchBar(card) {
        this.type = constants.Mahjong.Group.TOUCH_BAR();
        this.hand.push(card);
    }

    toGroup() {
        return new Group(this.type, _.flatten([this.play, this.hand]));
    }

    toJson() {
        let json = {};
        json.type = this.type;
        json.seat = this.seat.getIndex();
        json.play = this.play.toJson();
        json.hand = _.map(this.hand, (c) => c.toJson());
        return json;
    }
}

module.exports = PlayGroup;