const pomelo = require('pomelo');


let prom = module.exports = {};


prom.enterRoom = (server, game, id, session) => {
    return new Promise((rs, rj) => {
        pomelo.app.rpc.room.roomRemote.enterRoom(
            server,
            game,
            id,
            session,
            (err) => err ? rj(err) : rs()
        );
    });
};