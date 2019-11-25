const cons = require('../common/constants');
const Formatter = require('../poker/formatter');
const _ = require('underscore');


let ai = module.exports = {};


ai.banker = (room, index) => {
    let seat = room.getComp('seat').getSeat(index);
    if(!seat.isPlaying()) {
        return;
    }

    let hand = seat.getHand().getLibrary();
    let formation = Formatter.create(hand);
    let rate = 0;
    switch(formation.getType()) {
        case cons.Poker.Formation.NONE():
            rate = 20;
            break;

        case cons.Poker.Formation.NIU():
            rate = (formation.getValue() >= 7) ? 80 : 20;
            break;

        default:
            rate = 70;
            break;
    }
    return (_.random(0, 100) <= rate) ? 1 : 0;
};


ai.bid = (room, index) => {
    let seat = room.getComp('seat').getSeat(index);
    if(!seat.isPlaying()) {
        return;
    }

    if(room.getComp('state').isBankerSeat(seat)) {
        return;
    }

    let banker = room.getComp('state').getBankerSeat();
    if(banker.getUser().isRobot()) {
        return 1;
    }

    let hand = seat.getHand().getLibrary();
    let formation = Formatter.create(hand);
    let bankerHand = banker.getHand().getLibrary();
    let bankerFormation = Formatter.create(bankerHand);

    if(formation.isGreaterThan(bankerFormation)) {
        return _.random(2, 3);
    }

    return 1;
};