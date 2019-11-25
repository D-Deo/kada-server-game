const _ = require('underscore');

let constants = module.exports = {};
//麻将配置文件

constants.CardSuit = {};
constants.CardSuit.WAN = _.constant(0); // 万
constants.CardSuit.TONG = _.constant(1); // 筒
constants.CardSuit.SUO = _.constant(2); // 索
constants.CardSuit.WIND = _.constant(3); // 字

constants.CardSuit.NUMCH = _.constant('一二三四五六七八九');
constants.CardSuit.WINDCH = _.constant('东南西北白发中');
constants.CardSuit.FLOWERCH = _.constant('春夏秋冬梅兰竹菊');

constants.playerCount = _.constant(2);                                        //玩家数
constants.cardsPerPlayer = _.constant(13);                                    //每人牌数
constants.typeValid = _.constant([true, false, false, true]);                    //所用牌类型
constants.cardIndex = _.constant([0, 1, 2, 3]);                                  //所用牌
constants.cardStart = _.constant([1, 1, 1, 1]);                                  //所用牌
constants.cardEnd = _.constant([9, 9, 9, 9]);                                    //所用牌
constants.cardRepeat = _.constant(4);                                         //所用牌张数
constants.totalCards = _.constant(72);                                        //所用牌总数

//面子类型
constants.barType = {};
constants.barType.SEQ = _.constant(1);//顺子
constants.barType.TRI = _.constant(3);//暗刻
constants.barType.QUAD = _.constant(5);//暗杠
constants.barType.MINGQUAD = _.constant(6);//明/加杠