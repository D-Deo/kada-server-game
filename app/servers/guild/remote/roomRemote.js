const constants = require('../../../common/constants');
const rpc = require('../../../rpc/user');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.enterRoom = function(guildId, roomId, session, cb) {
    let guild = this.app.get('guildService').getGuild(guildId);
    let agent = guild.getComp('roomAgent').getAgent(roomId);
    if(!agent) {
        utils.cb(cb, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    let userSession = UserSession.fromJson(session);
    if(!guild.getComp('member').isMember(userSession.getUserId())) {
        utils.cb(cb, constants.ResultCode.USER_NOT_IN_GUILD());
        return;
    }

    agent.join(UserSession.fromJson(session), cb);
};


module.exports = (app) => new Remote(app);