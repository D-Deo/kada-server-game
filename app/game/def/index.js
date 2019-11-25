const cons = require('../../common/constants');
const Game = require('../game');


let game = module.exports = new Game(cons.Game.DEFAULT());


game.registerClass('room.roomAgentServer', require('../../room/roomAgentServer'));
game.registerClass('room.channel', require('../../room/channel'));
game.registerClass('room.chatManager', require('../../room/chatManager'));
game.registerClass('room.db', require('../../room/db'));
game.registerClass('room.dismissManager', require('../../room/dismissManager'));
game.registerClass('room.jobManager', require('../../room/jobManager'));
game.registerClass('room.meter', require('../../room/meter'));
game.registerClass('room.recorder', require('../../room/recorder'));
game.registerClass('room.robot', require('../../room/robot'));
game.registerClass('room.robotManager', require('../../room/robotManager'));
game.registerClass('room.roomController', require('../../room/roomController'));
game.registerClass('room.roundScheduler', require('../../room/roundScheduler'));
game.registerClass('room.seat', require('../../room/seat'));
game.registerClass('room.seatManager', require('../../room/seatManager'));
game.registerClass('room.service', require('../../room/service'));
game.registerClass('room.stateManager', require('../../room/stateManager'));
game.registerClass('room.turnScheduler', require('../../room/turnScheduler'));
game.registerClass('room.updater', require('../../room/updater'));
game.registerClass('room.zone', require('../../room/zone'));
game.registerClass('room.jackpotManager', require('../../room/jackpotManager'));
game.registerClass('room.loggerManager', require('../../room/loggerManager'));


game.registerInterface('zone.match.parseRoomParams', require('./zone/match/parseRoomParams'));
game.registerInterface('zone.private.parseRoomParams', require('./zone/private/parseRoomParams'));
