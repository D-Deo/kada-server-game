const _ = require('underscore');

let constants = module.exports = {};

// 开奖区域横向数量
constants.ROOM_OPEN_AREA_X = _.constant(5);
// 开奖区域纵向数量
constants.ROOM_OPEN_AREA_Y = _.constant(3);


// 开奖模式
constants.RoomOpenModes = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0]
];

// 开奖类型
constants.RoomOpenTypes = {
    FOOTBALL: _.constant(0),
    WHISTLE: _.constant(1),
    CUP: _.constant(2),
    GERMANY: _.constant(3),
    ARGENTINA: _.constant(4),
    BRAZIL: _.constant(5),
    SPAIN: _.constant(6),
    BELGIUM: _.constant(7),
    FRANCE: _.constant(8),
    PORTUGAL: _.constant(9),
    ENGLAND: _.constant(10),
    RUSSIA: _.constant(11)
};

//开Bar线
constants.RoomOpenAward = {
    BAR : _.constant("RoomOpenAwardBar"),     //开BUG
         
};

// 房间开奖赔率
constants.RoomOpenMultis = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 5, 50, 250, 800],
    [0, 0, 4, 40, 200, 500],
    [0, 0, 3, 30, 150, 300],
    [0, 0, 3, 25, 100, 200],
    [0, 0, 0, 20, 75, 150],
    [0, 0, 0, 15, 50, 100],
    [0, 0, 0, 10, 30, 80],
    [0, 0, 0, 5, 20, 60],
    [0, 0, 0, 4, 15, 50]
];

constants.RoomOpenTimes = [
    0, 5, 6, 7, 8, 10, 12, 14, 18, 20
];