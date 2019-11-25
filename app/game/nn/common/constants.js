const _ = require('underscore');



let constants = module.exports = {};


constants.FEE = _.constant(0.01);
constants.HAND_CAPACITY = _.constant(5);
constants.PLAYER_MIN = _.constant(2);
constants.RECOMMENDER_REWARD_PLAY_ROUNDS = _.constant(30);
constants.RECOMMENDER_REWARD_PLAY_ITEM = _.constant(1);
constants.RECOMMENDER_REWARD_PLAY_COUNT = _.constant(0);
constants.ROOM_CAPACITY = _.constant(7);
constants.PLAYER_CARD_SIZE = _.constant(5);


constants.BankerMode = {};
constants.BankerMode.ASK = _.constant(1);
constants.BankerMode.TURN = _.constant(2);
constants.BankerMode.FIXED = _.constant(3);


constants.RoomState = {};
constants.RoomState.WAIT = _.constant(1);
constants.RoomState.FIRST_DEAL = _.constant(2);
constants.RoomState.BANKER = _.constant(3);
constants.RoomState.BID = _.constant(4);
constants.RoomState.SECOND_DEAL = _.constant(5);
constants.RoomState.PLAY = _.constant(6);
constants.RoomState.RESULT = _.constant(7);


constants.RoomStateInterval = {};
constants.RoomStateInterval.WAIT = _.constant(6000);
constants.RoomStateInterval.FIRST_DEAL = _.constant(3000);
constants.RoomStateInterval.BANKER = _.constant(6000);
constants.RoomStateInterval.BID = _.constant(6000);
constants.RoomStateInterval.SECOND_DEAL = _.constant(2000);
constants.RoomStateInterval.PLAY = _.constant(4000);
constants.RoomStateInterval.PLAY_FOR_PLAY = _.constant(15000);
constants.RoomStateInterval.RESULT = _.constant(2500);


constants.TimesMode = {};
constants.TimesMode.MEMBER = _.constant(1);
constants.TimesMode.CRAZY = _.constant(2);
constants.TimesMode.CLASSIC2 = _.constant(3);


constants.Poker = {};
constants.Poker.Formation = {};
constants.Poker.Formation.NONE = _.constant(0);
constants.Poker.Formation.NIU = _.constant(1);
constants.Poker.Formation.NIUNIU = _.constant(2);
constants.Poker.Formation.SEQUENCE = _.constant(3);
constants.Poker.Formation.SUIT = _.constant(4);
constants.Poker.Formation.TRIPLE_PAIR = _.constant(5);
constants.Poker.Formation.FIVE_SMALL = _.constant(6);
constants.Poker.Formation.FIVE_BIG = _.constant(7);
constants.Poker.Formation.BOMB = _.constant(8);
constants.Poker.Formation.SUIT_SEQUENCE = _.constant(9);


constants.Poker.CardPoint = {};
constants.Poker.CardPoint.ACE = _.constant(1);
constants.Poker.CardPoint.TEN = _.constant(10);
constants.Poker.CardPoint.KING = _.constant(13);
constants.Poker.CardPoint.SUB_JOKER = _.constant(14);
constants.Poker.CardPoint.MAIN_JOKER = _.constant(15);


constants.Poker.CardValue = {};
constants.Poker.CardValue.ACE = _.constant(12);
constants.Poker.CardValue.TWO = _.constant(13);
constants.Poker.CardValue.SUB_JOKER = _.constant(14);
constants.Poker.CardValue._MAIN_JOKER = _.constant(15);