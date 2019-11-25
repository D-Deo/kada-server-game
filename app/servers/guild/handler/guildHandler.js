const constants = require('../../../common/constants');
const GuildSession = require('../../../session/guildSession');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils');


function Handler(app) {
    this.app = app;
}


Handler.prototype.enterGuild = function(msg, session, next) {
    if(!utils.isNumber(msg.guildId)) {
        utils.nextError(next);
        return;
    }

    let userSession = UserSession.fromBackendSession(session);
    let guildSession = GuildSession.fromBackendSession(session);
    guildSession && guildSession.getMember().unbindSession();

    let guild = this.app.get('guildService').getGuild(msg.guildId);
    if(!guild) {
        utils.next(next, constants.ResultCode.GUILD_UNKNOWN());
        return;
    }

    let member = guild.getComp('member').getMember(userSession.getUserId());
    if(!member) {
        utils.next(next, constants.ResultCode.USER_NOT_IN_GUILD());
        return;
    }

    member.bindSession(userSession, (err) => {
        if(err) {
            utils.next(next, err);
            return;
        }

        utils.nextOK(next, guild.toJson())
    });
};


Handler.prototype.leaveGuild = function(msg, session, next) {
    let guildSession = GuildSession.fromBackendSession(session);
    if(!guildSession) {
        utils.nextOK(next);
        return;
    }

    guildSession.getMember().unbindSession(() => utils.nextOK(next));
};


Handler.prototype.quitGuild = function(msg, session, next) {
    let guildSession = GuildSession.fromBackendSession(session);
    if(!guildSession) {
        utils.nextOK(next);
        return;
    }

    let guild = guildSession.getGuild();
    if(guild.getComp('member').isChairman(guildSession.getUserId())) {
        utils.next(next, constants.ResultCode.GUILD_CHAIRMAN_QUIT());
        return;
    }

    guild.getComp('member').removeMember(guildSession.getUserId(), () => utils.nextOK(next));
};


module.exports = (app) => new Handler(app);