const cons = require('../../common/constants');
const Game = require('../game');


let game = module.exports = new Game(cons.Game.DZ());

// game.registerClass('room.db', require('./room/db'));
game.registerClass('room.robot', require('./room/robot'));
game.registerClass('room.robotManager', require('./room/robotManager'));
game.registerClass('room.seat', require('./room/seat'));
game.registerClass('room.seatManager', require('./room/seatManager'));
game.registerClass('room.stateManager', require('./room/stateManager'));
game.registerClass('room.loggerManager', require('./room/loggerManager'));
// game.registerClass('room.jackpotManager', require('./room/jackpotManager'));

game.registerData('zone.match', require('./data/match'));

game.registerInterface('zone.match.parseRoomParams', require('./zone/match/parseRoomParams'));
// game.registerInterface('zone.private.parseRoomParams', require('./zone/private/parseRoomParams'));