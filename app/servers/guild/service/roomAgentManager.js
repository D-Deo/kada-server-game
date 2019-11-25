const constants = require('../../../common/constants');
const _ = require('underscore');


class RoomAgentManager {
    constructor(guild) {
        this.guild = guild;
        this.agents = {};
    }

    addAgent(agent) {
        this.agents[agent.getRoomId()] = agent;
        this.guild.getComp('channel').sendRoomAgentAction(constants.RoomAgentAction.ADD(), agent.toJson());
    }

    getAgent(roomId) {
        return this.agents[roomId];
    }

    removeAgent(roomSession) {
        delete this.agents[roomSession.getRoomId()];
        this.guild.getComp('channel').sendRoomAgentAction(constants.GuildRoomAgentAction.REMOVE(), roomSession.toJson());
    }

    isFull() {
        return _.size(this.agents) >= constants.GUILD_ROOM_AGENT_MAX();
    }

    onCommand(command) {
        let agent = this.getAgent(command.getRoomId());
        command.run(agent);
        this.guild.getComp('channel').sendRoomAgentAction(constants.GuildRoomAgentAction.COMMAND(), command.toJson());
    }

    toJson() {
        return _.map(this.agents, (a) => a.toJson());
    }
}


module.exports = RoomAgentManager;