const _ = require('underscore');


let constants = module.exports = {};


constants.PUBLIC_CARD_SIZE = _.constant(5);
constants.PLAYER_CARD_SIZE = _.constant(2);
constants.ROOM_CAPACITY = _.constant(7);
constants.PLAY_CAPACITY = _.constant(2);

constants.Bid = {};
constants.Bid.NONE = _.constant(0);
constants.Bid.ADD = _.constant(1);
constants.Bid.ALLIN = _.constant(2);
constants.Bid.FOLD = _.constant(3);
constants.Bid.FOLLOW = _.constant(4);
constants.Bid.PASS = _.constant(5);
constants.Bid.SBLIND = _.constant(6);
constants.Bid.BBLIND = _.constant(7);
constants.Bid.LEAVE = _.constant(8);


constants.Formation = {};
constants.Formation.NONE = _.constant(1);
constants.Formation.HIGH = _.constant(2);
constants.Formation.PAIR = _.constant(3);
constants.Formation.TWO_PAIR = _.constant(4);
constants.Formation.TRIPLE = _.constant(5);
constants.Formation.SEQUENCE = _.constant(6);
constants.Formation.SUIT = _.constant(7);
constants.Formation.TRIPLE_PAIR = _.constant(8);
constants.Formation.BOMB = _.constant(9);
constants.Formation.SUIT_SEQUENCE = _.constant(10);
constants.Formation.SUIT_SEQUENCE_ACE = _.constant(11);


constants.RoomState = {};
constants.RoomState.WAIT = _.constant(1);
constants.RoomState.DEAL = _.constant(2);
constants.RoomState.PLAY = _.constant(3);
constants.RoomState.RESULT = _.constant(4);


constants.RoomStateInterval = {};
constants.RoomStateInterval.WAIT = _.constant(2000);
constants.RoomStateInterval.DEAL = _.constant(1000);
constants.RoomStateInterval.PLAY = _.constant(1000);
constants.RoomStateInterval.RESULT = _.constant(3000);


constants.Turn = {};
constants.Turn.BID = _.constant(1);
constants.Turn.DEAL = _.constant(2);


constants.TurnInterval = {};
constants.TurnInterval.BID = _.constant(10000);
constants.TurnInterval.DEAL = _.constant(200);

constants.SeatPos = {};
constants.SeatPos.SB = _.constant(1);
constants.SeatPos.BB = _.constant(2);
constants.SeatPos.UTG = _.constant(3);
constants.SeatPos.MP = _.constant(4);
constants.SeatPos.HJ = _.constant(5);
constants.SeatPos.CO = _.constant(6);
constants.SeatPos.BTN = _.constant(7);
