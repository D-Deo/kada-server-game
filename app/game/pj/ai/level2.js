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
    // switch(formation.getType()) {
    //     case cons.Poker.Formation.NONE():
    //         rate = 20;
    //         break;

    //     case cons.Poker.Formation.NIU():
    //         rate = (formation.getValue() <= 3) ? 20 : ((formation.getValue() >= 7) ? 70 : 30);
    //         break;

    //     default:
    //         rate = 70;
    //         break;
    // }
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

    let hand = seat.getHand().getLibrary();
    let formation = Formatter.create(hand);
    let min = 1;
    let max = 1;
    switch(formation.getType()) {
        case cons.Poker.Formation.NONE():
            break;

        case cons.Poker.Formation.NIU():
            max = (formation.getValue() <= 3) ? 1 : ((formation.getValue() >= 7) ? 3 : 2);
            break;

        default:
            max = 3;
            break;
    }
    return _.random(min, max);
};