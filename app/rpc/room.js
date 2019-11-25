const pomelo = require('pomelo');


let rpc = module.exports = {};


rpc.create = (server, params, cb) => {
    pomelo.app.rpc.room.roomRemote.createRoom(server, params, cb || (() => {}));
};


rpc.enter = (server, game, id, user, cb) => {
    pomelo.app.rpc.room.roomRemote.enterRoom(server, game, id, user, cb || (() => {}));
};


rpc.remove = (server, game, id, cb) => {
    pomelo.app.rpc.room.roomRemote.removeRoom(server, game, id, cb || (() => {}));
};