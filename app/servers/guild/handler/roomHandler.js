const constants = require('../../../common/constants');
const GuildSession = require('../../../session/guildSession');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils');


function Handler(app) {
    this.app = app;
}


Handler.prototype.createRoom = function(msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let guildSession = GuildSession.fromBackendSession(session);
    if(!guildSession) {
        utils.nextError(next);
        return;
    }

    if(!guildSession.getMember().isChairman()) {
        utils.next(next, constants.ResultCode.GUILD_MEMBER_CREATE_ROOM());
        return;
    }

    if(guildSession.getGuild().getComp('roomAgent').isFull()) {
        utils.next(next, constants.ResultCode.GUILD_ROOM_FULL());
        return;
    }

    msg.mode = constants.RoomMode.GUILD();
    msg.guild = guildSession.getGuildId();
    this.app.rpc.zone.guildRemote.createRoom(guildSession.getGame(), userSession.toJson(), msg, (err) => utils.next(next, err));
};



module.exports = (app) => new Handler(app);