const constants = require('../../../common/constants');
const RoomAgent = require('../../../session/roomAgent');
const RoomAgentCommand = require('../../../session/roomAgentCommand');
const RoomSession = require('../../../session/roomSession');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.onCommand = function(json, cb) {
    let command = RoomAgentCommand.fromJson(json);
    let guild = this.app.get('guildService').getGuild(command.getGuild());
    guild.getComp('roomAgent').onCommand(command);
    utils.cb(cb);
};


Remote.prototype.onRoomCreate = function(room, cb) {
    let agent = RoomAgent.fromJson(room);
    let guild = this.app.get('guildService').getGuild(agent.getGuild());
    guild.getComp('roomAgent').addAgent(agent);
    utils.cb(cb);
};


Remote.prototype.onRoomClear = function(session, cb) {
    let roomSession = RoomSession.fromJson(session);
    let guild = this.app.get('guildService').getGuild(roomSession.getGuild());
    guild.getComp('roomAgent').removeAgent(roomSession);
    utils.cb(cb);
};


module.exports = (app) => new Remote(app);