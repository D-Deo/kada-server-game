const _ = require('underscore');



let constants = module.exports = {};


constants.FEE = _.constant(0.01);
constants.HAND_CAPACITY = _.constant(5);
constants.PLAYER_MIN = _.constant(2);
constants.RECOMMENDER_REWARD_PLAY_ROUNDS = _.constant(30);
constants.RECOMMENDER_REWARD_PLAY_ITEM = _.constant(1);
constants.RECOMMENDER_REWARD_PLAY_COUNT = _.constant(0);
constants.ROOM_CAPACITY = _.constant(4);
constants.PLAYER_CARD_SIZE = _.constant(4);


constants.BankerMode = {};
constants.BankerMode.ASK = _.constant(1);
constants.BankerMode.TURN = _.constant(2);
constants.BankerMode.FIXED = _.constant(3);


constants.RoomState = {};
constants.RoomState.WAIT = _.constant(1);
constants.RoomState.BANKER = _.constant(3);
constants.RoomState.BID = _.constant(4);
constants.RoomState.DEAL = _.constant(5);
constants.RoomState.PLAY = _.constant(6);
constants.RoomState.RESULT = _.constant(7);


constants.RoomStateInterval = {};
constants.RoomStateInterval.WAIT = _.constant(6000);
constants.RoomStateInterval.BANKER = _.constant(6000);
constants.RoomStateInterval.BID = _.constant(6000);
constants.RoomStateInterval.DEAL = _.constant(5000);
constants.RoomStateInterval.PLAY = _.constant(15000);
constants.RoomStateInterval.RESULT = _.constant(5000);

constants.Poker = {};
constants.Poker.Formation = {};
constants.Poker.Formation.P0 = {
    type: _.constant(0),
    name: _.constant("瘪十")
};

constants.Poker.Formation.P1 = {
    type: _.constant(1),
    name: _.constant("一点")
};

constants.Poker.Formation.P2 = {
    type: _.constant(2),
    name: _.constant("两点")
};

constants.Poker.Formation.P3 = {
    type: _.constant(3),
    name: _.constant("三点")
};

constants.Poker.Formation.P4 = {
    type: _.constant(4),
    name: _.constant("四点")
};

constants.Poker.Formation.P5 = {
    type: _.constant(5),
    name: _.constant("五点")
};

constants.Poker.Formation.P6 = {
    type: _.constant(6),
    name: _.constant("六点")
};

constants.Poker.Formation.P7 = {
    type: _.constant(7),
    name: _.constant("七点")
};

constants.Poker.Formation.P8 = {
    type: _.constant(8),
    name: _.constant("八点")
};

constants.Poker.Formation.P9 = {
    type: _.constant(9),
    name: _.constant("九点")
};

constants.Poker.Formation.DG9 = {
    type: _.constant(10),
    name: _.constant("地高九")
};

constants.Poker.Formation.TG9 = {
    type: _.constant(11),
    name: _.constant("天高九")
};

constants.Poker.Formation.DG = {
    type: _.constant(12),
    name: _.constant("地杠")
};

constants.Poker.Formation.TG = {
    type: _.constant(13),
    name: _.constant("天杠")
};

constants.Poker.Formation.DW = {
    type: _.constant(14),
    name: _.constant("地王")
};

constants.Poker.Formation.TW = {
    type: _.constant(15),
    name: _.constant("天王")
};

constants.Poker.Formation.Z5 = {
    type: _.constant(16),
    name: _.constant("杂五")
};

constants.Poker.Formation.Z7 = {
    type: _.constant(17),
    name: _.constant("杂七")
};

constants.Poker.Formation.Z8 = {
    type: _.constant(18),
    name: _.constant("杂八")
};

constants.Poker.Formation.Z9 = {
    type: _.constant(19),
    name: _.constant("杂九")
};

constants.Poker.Formation.TONGCHUI = {
    type: _.constant(20),
    name: _.constant("双铜锤")
};

constants.Poker.Formation.GAOJIAO = {
    type: _.constant(21),
    name: _.constant("双高脚")
};

constants.Poker.Formation.HONGTOU = {
    type: _.constant(22),
    name: _.constant("双红头")
};

constants.Poker.Formation.FUTOU = {
    type: _.constant(23),
    name: _.constant("双斧头")
};

constants.Poker.Formation.BANDENG = {
    type: _.constant(24),
    name: _.constant("双板凳")
};

constants.Poker.Formation.CHANG = {
    type: _.constant(25),
    name: _.constant("双长")
};

constants.Poker.Formation.MEI = {
    type: _.constant(26),
    name: _.constant("双梅")
};

constants.Poker.Formation.HE = {
    type: _.constant(27),
    name: _.constant("双和")
};

constants.Poker.Formation.REN = {
    type: _.constant(28),
    name: _.constant("双人")
};

constants.Poker.Formation.DI = {
    type: _.constant(29),
    name: _.constant("双地")
};

constants.Poker.Formation.TIAN = {
    type: _.constant(30),
    name: _.constant("双天")
};

constants.Poker.Formation.ZZB = {
    type: _.constant(31),
    name: _.constant("至尊宝")
};

constants.Poker.TIAN = {
    point: _.constant(66),
    name: _.constant("天牌"),
    weight: _.constant(16)
};

constants.Poker.DI = {
    point: _.constant(11),
    name: _.constant("地牌"),
    weight: _.constant(15)
};

constants.Poker.REN = {
    point: _.constant(44),
    name: _.constant("人牌"),
    weight: _.constant(14)
};

constants.Poker.HE = {
    point: _.constant(13),
    name: _.constant("和牌"),
    weight: _.constant(13)
};

constants.Poker.MEI = {
    point: _.constant(55),
    name: _.constant("梅花"),
    weight: _.constant(12)
};

constants.Poker.CHANG = {
    point: _.constant(33),
    name: _.constant("长三"),
    weight: _.constant(11)
};

constants.Poker.BANDENG = {
    point: _.constant(22),
    name: _.constant("板凳"),
    weight: _.constant(10)
};

constants.Poker.FUTOU = {
    point: _.constant(56),
    name: _.constant("斧头"),
    weight: _.constant(9)
};

constants.Poker.HONGTOU = {
    point: _.constant(46),
    name: _.constant("红头"),
    weight: _.constant(8)
};

constants.Poker.GAOJIAO = {
    point: _.constant(16),
    name: _.constant("尖七"),
    weight: _.constant(7)
};

constants.Poker.TONGCHUI = {
    point: _.constant(15),
    name: _.constant("铜锤"),
    weight: _.constant(6)
};

constants.Poker.HONG9 = {
    point: _.constant(45),
    name: _.constant("红九"),
    weight: _.constant(5)
};

constants.Poker.HEI9 = {
    point: _.constant(36),
    name: _.constant("黑九"),
    weight: _.constant(5)
};

constants.Poker.PING8 = {
    point: _.constant(26),
    name: _.constant("平八"),
    weight: _.constant(4)
};

constants.Poker.XIE8 = {
    point: _.constant(35),
    name: _.constant("斜八"),
    weight: _.constant(4)
};

constants.Poker.HONG7 = {
    point: _.constant(34),
    name: _.constant("红七"),
    weight: _.constant(3)
};

constants.Poker.HEI7 = {
    point: _.constant(25),
    name: _.constant("黑七"),
    weight: _.constant(3)
};

constants.Poker.HONG5 = {
    point: _.constant(14),
    name: _.constant("红五"),
    weight: _.constant(2)
};

constants.Poker.HEI5 = {
    point: _.constant(23),
    name: _.constant("黑五"),
    weight: _.constant(2)
};

constants.Poker.DAHOU = {
    point: _.constant(24),
    name: _.constant("大猴"),
    weight: _.constant(1)
};

constants.Poker.XIAOHOU = {
    point: _.constant(12),
    name: _.constant("小猴"),
    weight: _.constant(1)
};