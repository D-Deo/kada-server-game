const _ = require('underscore');

let constants = module.exports = {};

/**
 * 区域赔率
 */
constants.RoomAreaMulti = [1, 1, 2, 2, 11, 11, 8, 32];

// 房间最大局数后重置路单
constants.ROOM_ROAD_LIMIT = _.constant(72);

// 房间最大人数
constants.ROOM_CAPACITY = _.constant(1000);

// 每局最少需要的牌数
constants.CARD_CAPACITY = _.constant(6);

// 卡牌类型
constants.CardType = {
    /** 小牌 */
    SMALL: _.constant(6),
    /** 天王 */
    KING: _.constant(8)
};

// 房间状态
constants.RoomState = {
    /** 空间状态 */
    IDLE: _.constant(1),
    /** 下注状态 */
    BETTING: _.constant(2),
    /** 开奖状态 */
    OPENING: _.constant(3),
    /** 结算状态 */
    RESULT: _.constant(4)
};

// 房间状态倒计时
constants.RoomStateInterval = {
    /** 空间时间 */
    IDLE: _.constant(5000),
    /** 下注时间 */
    BETTING: _.constant(15000),
    /** 开奖时间 */
    OPENING: _.constant(10000),
    /** 结算时间 */
    RESULT: _.constant(5000)
};

// 下注区域
constants.RoomBetArea = {
    /** 闲 */
    PLAY: _.constant(0),
    /** 庄 */
    BANK: _.constant(1),
    /** 闲天王 */
    PLAY_KING: _.constant(2),
    /** 庄天王 */
    BANK_KING: _.constant(3),
    /** 闲对子 */
    PLAY_PAIR: _.constant(4),
    /** 庄对子 */
    BANK_PAIR: _.constant(5),
    /** 和 */
    TIE: _.constant(6),
    /** 同点和 */
    TIE_SAME_POINT: _.constant(7),
};

