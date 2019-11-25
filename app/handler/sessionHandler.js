const pomelo = require('pomelo');
const GuildSession = require('../session/guildSession');
const RoomSession = require('../session/roomSession');
const UserSession = require('../session/userSession');


function clearUserSession(session) {
    let userSession = UserSession.fromBackendSession(session);
    if(!userSession) {
        return;
    }

    pomelo.app.rpc.user.userRemote.logout(userSession.getUserId(), userSession.toJson(), () => {});
}


function clearRoomSession(session) {
    let userSession = UserSession.fromBackendSession(session);
    let roomSession = RoomSession.fromBackendSession(session);
    if(!userSession || !roomSession) {
        return;
    }

    pomelo.app.rpc.room.roomRemote.leaveRoom(session, roomSession.toJson(), userSession.toJson(), () => {});
}


function clearGuildSession(session) {
    let guildSession = GuildSession.fromBackendSession(session);
    if(!guildSession) {
        return;
    }
    pomelo.app.rpc.guild.guildRemote.leaveGuild(session, guildSession.toJson(), () => {});
}


module.exports = function(session){
    clearUserSession(session);
    clearRoomSession(session);
    clearGuildSession(session);
};