const _ = require('underscore');

let constants = module.exports = {};

constants.PLAYER_CARD_SIZE = _.constant(3);
constants.ROOM_CAPACITY = _.constant(5);
constants.PLAY_CAPACITY = _.constant(2);

/**
 * 用户行为
 */
constants.PlayerAction = {
    LOOK: _.constant(1000),                 //看牌
    SHOW_HAND: _.constant(1001)             //亮牌
};

constants.Bid = {
    NONE: _.constant(0),
    ADD: _.constant(1),
    ALLIN: _.constant(2),
    FOLD: _.constant(3),
    FOLLOW: _.constant(4),
    BASE: _.constant(5),
    COMPARE: _.constant(6),
    LOOK: _.constant(7),
    LEAVE: _.constant(8),
    // ROBOTCOMPARE: _.constant(9),
};

constants.Formation = {
    SPECIAL: _.constant(1),
    HIGH: _.constant(2),
    PAIR: _.constant(3),
    SEQUENCE: _.constant(4),
    SUIT: _.constant(5),
    SUIT_SEQUENCE: _.constant(6),
    BOMB: _.constant(7),
};

/**
 * 房间状态
 */
constants.RoomState = {
    WAIT: _.constant(1),
    DEAL: _.constant(2),
    PLAY: _.constant(3),
    RESULT: _.constant(4),
};

/**
 * 房间状态时间间隔
 */
constants.RoomStateInterval = {
    WAIT: _.constant(5000),
    DEAL: _.constant(1000),
    PLAY: _.constant(1000),
    RESULT: _.constant(3000),
};

/**
 * 游戏回合
 */
constants.Turn = {
    BID: _.constant(1),
    COMPARE: _.constant(2),
};

/**
 * 游戏回合时间间隔
 */
constants.TurnInterval = {
    BID: _.constant(10000),
    COMPARE: _.constant(5000),
};

