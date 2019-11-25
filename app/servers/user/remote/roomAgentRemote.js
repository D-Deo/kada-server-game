const constants = require('../../../common/constants');
const UserManager = require('../../../user/manager');
const RoomAgent = require('../../../session/roomAgent');
const RoomAgentCommand = require('../../../session/roomAgentCommand');
const RoomSession = require('../../../session/roomSession');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.onCommand = function(json, cb) {
    let command = RoomAgentCommand.fromJson(json);
    let user = UserManager.get().getUserById(command.getOwner());
    user.getComp('roomAgent').onCommand(command);
    utils.cbOK(cb);
};


Remote.prototype.onRoomClear = function(session, cb) {
    let roomSession = RoomSession.fromJson(session);
    let user = UserManager.get().getUserById(roomSession.getOwner());
    user.getComp('roomAgent').removeAgent(roomSession);
    utils.cbOK(cb);
};


Remote.prototype.onRoomCreate = function(room, cb) {
    let agent = RoomAgent.fromJson(room);
    let user = UserManager.get().getUserById(agent.getOwner());
    user.getComp('roomAgent').addAgent(agent);
    utils.cbOK(cb);
};


module.exports = (app) => new Remote(app);