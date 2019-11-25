const _ = require('underscore');

let constants = module.exports = {};

constants.BOTTOM_CARD_SIZE = _.constant(3);     // 底牌3张
constants.PLAYER_CARD_SIZE = _.constant(17);    // 玩家

constants.ROOM_CAPACITY = _.constant(3);        // 房间3个人

constants.RoomState = {
    WAIT: _.constant(1),        //等待
    DEAL: _.constant(2),        //发牌
    BANKER: _.constant(3),      //抢庄
    PLAY: _.constant(4),        //出牌
    RESULT: _.constant(5),      //结算
};

constants.RoomStateInterval = {
    WAIT: _.constant(3000),
    DEAL: _.constant(5000),
    BANKER: _.constant(10000),
    PLAY: _.constant(60000),
    RESULT: _.constant(10000),
};

constants.Formation = {
    ONE: _.constant(1),                // 单牌
    PAIR: _.constant(2),               // 对子
    TRIPLE: _.constant(3),             // 三张
    SEQUENCE: _.constant(4),           // 顺子
    SEQUENCE_PAIR: _.constant(5),      // 连对
    SEQUENCE_PLANE: _.constant(6),     // 飞机
    TRIPLE_1: _.constant(7),           // 三张带单张
    TRIPLE_2: _.constant(8),           // 三张带对子
    QUAD_2: _.constant(9),             // 四张带两张
    BOMB: _.constant(10),               //炸弹
    ROCKET: _.constant(11),             //火箭
};

constants.RoomAction = {
    ROOM_STATE_WAIT: _.constant("RoomStateWait"),       //房间准备
    ROOM_STATE_SPEAK: _.constant("RoomStateSpeak"),     //叫庄

    ROOM_MULTIPLE: _.constant("RoomMultiple"),     //房间倍数发生变化

    PLAYER_DEAL_BOTTOM: _.constant('PlayerDealBottom'),            //玩家发底牌
    PLAYER_SPEAK: _.constant('PlayerSpeak'),            //玩家叫庄
    PLAYER_DOUBLE: _.constant('PlayerDouble'),          //玩家加倍
    PLAYER_ACTION: _.constant('PlayerTurn'),            //玩家回合
    PLAYER_GRAB: _.constant('PlayerGrab'),              //玩家抢庄
    PLAYER_MING: _.constant('PlayerMing'),              //玩家明牌
};

constants.PlayerAction = {
    PLAY: _.constant('Play'),       //出牌
    PASS: _.constant("Pass"),       //过
    ROBOT: _.constant("Robot"),       //过
    GRAB: _.constant("Grab"),
    MING: _.constant('Ming'),

};

constants.Turn = {
    SPEAK: _.constant(1),
    DOUBLE: _.constant(2),
    DEAL: _.constant(3),
    PLAY: _.constant(4),
    GRAB: _.constant(5),
    MING: _.constant(6),
};

constants.TurnInterval = {
    SPEAK: _.constant(5000),
    DOUBLE: _.constant(2000),
    DEAL: _.constant(2000),
    PLAY: _.constant(20000),
    ROBOT: _.constant(1000),
    MING: _.constant(5000),
    GRAB: _.constant(5000),

};

constants.DOUBLE = {
    YES: _.constant(0),
    NO: _.constant(1),
};

constants.SPEAK = {
    NO: _.constant(0),
    YES: _.constant(1),
    THREE: _.constant(3),
};

constants.GRAB = {
    NO: _.constant(0),
    YES: _.constant(1),
};

constants.RoomEvent = {
    SPEAK: _.constant('PlayerSpeak'),
    PLAYER_DRAW: _.constant('PlayerDraw'),
    PLAYER_PLAY: _.constant('PlayerPlay'),
};

constants.CardPoint = {
    THREE: _.constant(1),
    TEN: _.constant(8),
    JACK: _.constant(9),
    QUEEN: _.constant(10),
    KING: _.constant(11),
    ACE: _.constant(12),
    TWO: _.constant(13),
    SUB_JOKER: _.constant(14),
    MAIN_JOKER: _.constant(15),
};

constants.CardSuit = {
    DIAMOND: _.constant(1),
    CLUB: _.constant(2),
    HEART: _.constant(3),
    SPADE: _.constant(4),
    JOKER: _.constant(5),
};
