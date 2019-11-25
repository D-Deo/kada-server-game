const _ = require('underscore');

let constants = module.exports = {};

/**
 * 区域赔率
 */
constants.RoomAreaMulti = [40, 30, 20, 10, 5, 5, 5, 5];


/**
 * 房间开奖配置
 */
constants.RoomOpenConfigs = [
    0, 3, 4, 6, 2, 7, 5, 1, 6, 5, 4, 3, 7, 6, 4, 2, 3, 5, 7,
    0, 3, 4, 6, 2, 7, 5, 1, 6, 5, 4, 3, 7, 6, 4, 2, 1, 5, 7
];

// 房间最大局数后重置路单
constants.ROOM_ROAD_LIMIT = _.constant(100);

// 房间最大人数
constants.ROOM_CAPACITY = _.constant(1000);

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
    BETTING: _.constant(60000),
    /** 开奖时间 */
    OPENING: _.constant(5000),
    /** 结算时间 */
    RESULT: _.constant(5000)
};
