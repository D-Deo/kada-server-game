const _ = require('underscore');

let constants = module.exports = {};

/**
 * 区域赔率
 * 0金鲨，1银鲨，2老鹰，3狮子，4孔雀，5鸽子，6熊猫，7猴子，8燕子，9兔子，10飞禽，11走兽
 */
constants.RoomAreaMulti = [100, 24, 12, 12, 8, 8, 8, 8, 6, 6, 2, 2];

/**
 * 房间开奖配置
 * 从通赔开始顺时针
 * 通赔 -1， 通吃 -2，其他等于区域配置
 */
constants.RoomOpenConfigs = [
    -1, 5, 5, 5, 8, 8, 8, 0, 9, 9, 9, 7, 7, 7,
    -2, 6, 6, 6, 3, 3, 3, 1, 2, 2, 2, 4, 4, 4
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
    IDLE: _.constant(10000),
    /** 下注时间 */
    BETTING: _.constant(15000),
    /** 开奖时间 */
    OPENING: _.constant(10000),
    /** 结算时间 */
    RESULT: _.constant(5000)
};
