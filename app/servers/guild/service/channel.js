const constants = require('../../../common/constants');
const pomelo = require('pomelo');


class Channel {
    constructor(guild) {
        this.guild = guild;
        this.channel = pomelo.app.get('channelService').createChannel("guild-" + this.guild.getId());
    }

    join(session) {
        this.channel.add(session.getUserSessionId(), session.getServerId());
    }

    leave(session) {
        this.channel.leave(session.getUserSessionId(), session.getServerId());
    }

    send(route, msg) {
        this.channel.pushMessage(route, msg, {}, () => {});
    }

    sendMemberAction(name, msg) {
        this.send(constants.GuildMemberAction.ROUTE(), {name, msg});
    }

    sendRoomAgentAction(name, msg) {
        this.send(constants.GuildRoomAgentAction.ROUTE(), {name, msg});
    }
}


module.exports = Channel;
