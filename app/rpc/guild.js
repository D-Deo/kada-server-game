const pomelo = require('pomelo');


let rpc = module.exports = {};


rpc.enterRoom = (game, guildId, roomId, userSession, cb) => {
    pomelo.app.rpc.guild.roomRemote.enterRoom(game, guildId, roomId, userSession.toJson(), cb || (() => {}));
};