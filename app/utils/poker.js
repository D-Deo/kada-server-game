const cons = require('../common/constants');


let util = module.exports = {};


util.isJoker = (p) => {
    return p === cons.Poker.CardPoint.SUB_JOKER() ||
        p === cons.Poker.CardPoint.MAIN_JOKER();
};