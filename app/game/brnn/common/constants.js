const _ = require('underscore');

let constants = module.exports = {};

// 房间最大人数
constants.ROOM_CAPACITY = _.constant(1000);

// 每局最少需要的牌数
constants.CARD_CAPACITY = _.constant(25);

// 首次发牌的数量
constants.FIRST_CARDS_COUNT = _.constant(3);

// 开牌数量
constants.ROOM_OPEN_COUNT = _.constant(5);

// 每堆牌的数量
constants.OPEN_CARDS_COUNT = _.constant(5);

constants.Poker = {};
constants.Poker.Formation = {};
constants.Poker.Formation.NONE = _.constant(0);         // 没牛
constants.Poker.Formation.NIU_1 = _.constant(1);
constants.Poker.Formation.NIU_2 = _.constant(2);
constants.Poker.Formation.NIU_3 = _.constant(3);
constants.Poker.Formation.NIU_4 = _.constant(4);
constants.Poker.Formation.NIU_5 = _.constant(5);
constants.Poker.Formation.NIU_6 = _.constant(6);
constants.Poker.Formation.NIU_7 = _.constant(7);
constants.Poker.Formation.NIU_8 = _.constant(8);
constants.Poker.Formation.NIU_9 = _.constant(9);
constants.Poker.Formation.NIUNIU = _.constant(10);      // 牛牛
constants.Poker.Formation.FIVE_SMALL = _.constant(11);  // 五小牛
constants.Poker.Formation.FIVE_BIG = _.constant(12);    // 五花牛

constants.Poker.Multi = [ 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 4, 5];

// 玩家手牌数量
constants.PLAYER_CARD_SIZE = _.constant(5);

// 房间状态
constants.RoomState = {
    /** 空间状态 */
    IDLE: _.constant(1),
    /*发牌状态*/
    SENDCARD: _.constant(2),
    /** 下注状态 */
    BETTING: _.constant(3),
    /** 开奖状态 */
    OPENING: _.constant(4),
    /** 结算状态 */
    RESULT: _.constant(5)
};

// 房间状态倒计时
constants.RoomStateInterval = {
    /** 空间时间 */
    IDLE: _.constant(5000),
    /**发牌时间 */
    SENDCARD: _.constant(5000),
    /** 下注时间 */
    BETTING: _.constant(15000),
    /** 开奖时间 */
    OPENING: _.constant(10000),
    /** 结算时间 */
    RESULT: _.constant(5000)
};

// 下注区域
constants.RoomBetArea = {
    /** 天 */
    TIAN: _.constant(0),
    /** 地 */
    DI: _.constant(1),
    /** 玄 */
    XUAN: _.constant(2),
    /** 黄 */
    HUANG: _.constant(3),
};

