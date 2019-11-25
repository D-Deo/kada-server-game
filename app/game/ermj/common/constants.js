const _ = require('underscore');

let constants = module.exports = {};

// 房间最大人数
constants.ROOM_CAPACITY = _.constant(2);

constants.RoomState = {};//房间状态
constants.RoomState.WAIT = _.constant(0); // 等待状态
constants.RoomState.DEAL = _.constant(1); // 发牌
constants.RoomState.FLOWER = _.constant(2); // 全局补花
constants.RoomState.PAUSE = _.constant(3); // 暂停
constants.RoomState.PLAY = _.constant(4); // 出牌
constants.RoomState.SOUND = _.constant(5); // 副露
constants.RoomState.DRAW = _.constant(6); // 摸牌
constants.RoomState.RESULT = _.constant(7); // 游戏结算
constants.RoomState.KAN = _.constant(8); // 抢杠

constants.RoomStateInterval = {};//状态定时
constants.RoomStateInterval.WAIT = _.constant(3000); // 等待状态
constants.RoomStateInterval.DEAL = _.constant(3000); // 发牌
constants.RoomStateInterval.FLOWER = _.constant(1000); // 全局补花,这个是每次补花的间隔
constants.RoomStateInterval.PAUSE = _.constant(0); // 暂停
constants.RoomStateInterval.PLAY = _.constant(20000); // 出牌
constants.RoomStateInterval.SOUND = _.constant(20000); // 副露
constants.RoomStateInterval.DRAW = _.constant(500); // 摸牌
constants.RoomStateInterval.RESULT = _.constant(10000); // 游戏结算
constants.RoomStateInterval.KAN = _.constant(2000); // 抢杠
constants.RoomStateInterval.AUTO = _.constant(1000); // 自动摸打


constants.RoomAction = {};
constants.RoomAction.PLAYER_ROBOT = _.constant('PlayerRobot');  //托管
constants.RoomAction.PLAYER_PANEL = _.constant('PlayerPanel');  //操作框
constants.RoomAction.PLAY = _.constant('play');                 //出牌
constants.RoomAction.PON = _.constant('pon');                   //碰牌
constants.RoomAction.CHI = _.constant('chi');                   //吃牌
constants.RoomAction.KAN = _.constant('kan');                   //杠牌
constants.RoomAction.RON = _.constant('ron');                   //胡牌
constants.RoomAction.DRAW = _.constant('draw');
constants.RoomAction.DEAL = _.constant('deal');
constants.RoomAction.PASS = _.constant('guo');
constants.RoomAction.TIN = _.constant('tin');
constants.RoomAction.FLOWER = _.constant('flower');
constants.RoomAction.MING = _.constant('ming');

constants.RoomActionInterval = {};                          //玩家操作定时
constants.RoomActionInterval.PLAY = _.constant(20000);      //出牌
constants.RoomActionInterval.PON = _.constant(10000);       //碰牌
constants.RoomActionInterval.CHI = _.constant(10000);       //吃牌
constants.RoomActionInterval.KAN = _.constant(10000);       //杠牌
constants.RoomActionInterval.RON = _.constant(20000);       //胡牌

