const _ = require('underscore');

let constants = module.exports = {};

constants.FEE = _.constant(0.01);
constants.HAND_CAPACITY = _.constant(5);
constants.PLAYER_MIN = _.constant(2);
constants.RECOMMENDER_REWARD_PLAY_ROUNDS = _.constant(30);
constants.RECOMMENDER_REWARD_PLAY_ITEM = _.constant(1);
constants.RECOMMENDER_REWARD_PLAY_COUNT = _.constant(0);
constants.ROOM_CAPACITY = _.constant(6);
constants.PLAYER_CARD_SIZE = _.constant(13);

constants.BankerMode = {};
constants.BankerMode.ASK = _.constant(1);
constants.BankerMode.TURN = _.constant(2);
constants.BankerMode.FIXED = _.constant(3);

constants.RoomState = {};
constants.RoomState.WAIT = _.constant(1);
constants.RoomState.DEAL = _.constant(2);
constants.RoomState.PLAY = _.constant(3);
constants.RoomState.RESULT = _.constant(4);
constants.RoomState.END = _.constant(5);

constants.RoomStateInterval = {};
constants.RoomStateInterval.WAIT = _.constant(1000);
constants.RoomStateInterval.WAIT_PLAYING = _.constant(10000);
constants.RoomStateInterval.DEAL = _.constant(5000);
constants.RoomStateInterval.PLAY = _.constant(30000);
constants.RoomStateInterval.RESULT = _.constant(7000);
constants.RoomStateInterval.END = _.constant(5000);

constants.PlayerStateInterval = {};
constants.PlayerStateInterval.WAIT = _.constant(10000);

constants.RoomAction = {};
constants.RoomAction.PLAYER_CUT = _.constant('PlayerCut');

constants.SSS = {};
constants.SSS.Formation = {};
constants.SSS.Formation.SP = { anim: _.constant(0), name: _.constant("散牌"), score: _.constant(1), type: _.constant(0) };
constants.SSS.Formation.DZ = { anim: _.constant(1), name: _.constant("对子"), score: _.constant(1), type: _.constant(1) };
constants.SSS.Formation.LD = { anim: _.constant(2), name: _.constant("两对"), score: _.constant(1), type: _.constant(2) };
constants.SSS.Formation.ST = { anim: _.constant(3), name: _.constant("三条"), score: _.constant(1), type: _.constant(3) };
constants.SSS.Formation.SZ = { anim: _.constant(4), name: _.constant("顺子"), score: _.constant(1), type: _.constant(4) };
constants.SSS.Formation.TH = { anim: _.constant(5), name: _.constant("同花"), score: _.constant(1), type: _.constant(5) };
constants.SSS.Formation.HL = { anim: _.constant(6), name: _.constant("葫芦"), score: _.constant(1), type: _.constant(6) };
constants.SSS.Formation.ZD = { anim: _.constant(7), name: _.constant("炸弹"), score: _.constant(4), type: _.constant(7) };
constants.SSS.Formation.THS = { anim: _.constant(8), name: _.constant("同花顺"), score: _.constant(5), type: _.constant(8) };
constants.SSS.Formation.WZZ = { anim: _.constant(9), name: _.constant("五张炸"), score: _.constant(8), type: _.constant(9) };
constants.SSS.Formation.SZW = { anim: _.constant(23), name: _.constant("四张王"), score: _.constant(10), type: _.constant(10) };
constants.SSS.Formation.BX = { anim: _.constant(10), name: _.constant("半小"), score: _.constant(3), type: _.constant(11) };
constants.SSS.Formation.BD = { anim: _.constant(11), name: _.constant("半大"), score: _.constant(3), type: _.constant(11) };
constants.SSS.Formation.STH = { anim: _.constant(12), name: _.constant("三同花"), score: _.constant(3), type: _.constant(11) };
constants.SSS.Formation.SSZ = { anim: _.constant(13), name: _.constant("三顺子"), score: _.constant(3), type: _.constant(11) };
constants.SSS.Formation.LDB = { anim: _.constant(14), name: _.constant("六对半"), score: _.constant(6), type: _.constant(12) };
constants.SSS.Formation.QX = { anim: _.constant(15), name: _.constant("全小"), score: _.constant(6), type: _.constant(12) };
constants.SSS.Formation.QD = { anim: _.constant(16), name: _.constant("全大"), score: _.constant(6), type: _.constant(12) };
constants.SSS.Formation.WDST = { anim: _.constant(17), name: _.constant("五对三条"), score: _.constant(9), type: _.constant(13) };
constants.SSS.Formation.YTL = { anim: _.constant(18), name: _.constant("一条龙"), score: _.constant(13), type: _.constant(14) };
constants.SSS.Formation.QHEYDH = { anim: _.constant(19), name: _.constant("全黑一点红"), score: _.constant(13), type: _.constant(14) };
constants.SSS.Formation.QHOYDH = { anim: _.constant(20), name: _.constant("全红一点黑"), score: _.constant(13), type: _.constant(14) };
constants.SSS.Formation.QHE = { anim: _.constant(21), name: _.constant("全黑"), score: _.constant(26), type: _.constant(15) };
constants.SSS.Formation.QHO = { anim: _.constant(22), name: _.constant("全红"), score: _.constant(26), type: _.constant(15) };

// 以下暂时不需要
// constants.SSS.Formation.STST = { type: _.constant(14), name: _.constant("四套三条"), score: _.constant(6) };
// constants.SSS.Formation.CYS = { type: _.constant(15), name: _.constant("凑一色"), score: _.constant(10) };
// constants.SSS.Formation.SFTX = { type: _.constant(18), name: _.constant("三分天下"), score: _.constant(20) };
// constants.SSS.Formation.SHTS = { type: _.constant(19), name: _.constant("三花同顺"), score: _.constant(20) };
// constants.SSS.Formation.SEHZ = { type: _.constant(20), name: _.constant("十二皇族"), score: _.constant(24) };
// constants.SSS.Formation.ZZQL = { type: _.constant(22), name: _.constant("至尊青龙"), score: _.constant(108) };