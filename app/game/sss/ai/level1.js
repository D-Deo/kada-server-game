const _ = require('underscore');

let ai = module.exports = {};

ai.setCards = (room, index) => {
    let seat = room.getComp('seat').getSeat(index);
    let bestFormatter = seat.getHand().bestFormatter;
    let array = _.shuffle([bestFormatter.formation1, bestFormatter.formation2]);
    let cards = [];
    cards.push(...array[0].cards);
    cards.push(...array[1].cards);
    return _.map(cards, c => c.getPoint());
}