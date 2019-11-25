const _ = require('underscore');
const Formatter = require('../poker/formatter');
const cons = require('../common/constants');
let ai = module.exports = {};


ai.banker = (room, index) => {
    let seat = room.getComp('seat').getSeat(index);
    if (!seat.isPlaying()) {
        return;
    }

    return (_.random(0, 100) <= 30) ? 1 : 0;
};


ai.bid = (room, index) => {
    let seat = room.getComp('seat').getSeat(index);
    if (!seat.isPlaying()) {
        return;
    }

    if (room.getComp('state').isBankerSeat(seat)) {
        return;
    }


    return _.random(1, 3);
};