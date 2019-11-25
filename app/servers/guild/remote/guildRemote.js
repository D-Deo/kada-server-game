const constants = require('../../../common/constants');
const rpc = require('../../../rpc/user');
const UserSession = require('../../../session/userSession');
const GuildSession = require('../../../session/guildSession');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.createGuild = function(userId, name, cb) {
    rpc.get(userId, constants.UserToJsonReason.GUILD(), (user) => {
        if(!user) {
            utils.cb(cb, constants.ResultCode.USER_UNKNOWN());
            return;
        }

        let service = this.app.get('guildService');
        if(service.isFull(userId)) {
            utils.cb(cb, constants.ResultCode.USER_GUILD_FULL());
            return;
        }

        if(service.isGuildByName(name)) {
            utils.cb(cb, constants.ResultCode.GUILD_NAME_USED());
            return;
        }

        let userSession = UserSession.fromJson(user.session);
        let guild = service.createGuild(name, user);
        userSession && userSession.sendToGame(guild.getGame(), constants.GuildAction.ROUTE(), {
            name: constants.GuildAction.ADD(),
            msg: guild.toJsonForList()
        });
        utils.cbOK(cb);
    });
};


Remote.prototype.leaveGuild = function(session, cb) {
    let guildSession = GuildSession.fromJson(session);
    guildSession.getMember().unbindSession(cb);
};


Remote.prototype.joinGuild = function(guildId, userId, cb) {
    rpc.get(userId, constants.UserToJsonReason.GUILD(), (user) => {
        if(!user) {
            utils.cb(cb, constants.ResultCode.USER_UNKNOWN());
            return;
        }

        let guild = this.app.get('guildService').getGuild(guildId);
        if(!guild) {
            utils.cb(cb, constants.ResultCode.GUILD_UNKNOWN());
            return;
        }

        if(guild.getComp('member').isMember(userId)) {
            utils.cbOK(cb);
            return;
        }

        if(guild.getComp('member').isFull()) {
            utils.cb(cb, constants.ResultCode.GUILD_FULL());
            return;
        }

        let userSession = UserSession.fromJson(user.session);
        userSession && userSession.sendToGame(guild.getGame(), constants.GuildAction.ROUTE(), {
            name: constants.GuildAction.ADD(),
            msg: guild.toJsonForList()
        });

        guild.getComp('member').createMember(constants.GuildMemberLevel.NORMAL(), user);
        utils.cbOK(cb);
    });
};


module.exports = (app) => new Remote(app);