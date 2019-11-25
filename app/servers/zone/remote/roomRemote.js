const cons = require('../../../common/constants');
const RoomManager = require('../../../zone/roomManager');
const RoomSession = require('../../../session/roomSession');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.enterRoom = function (game, id, session, cb) {
    let room = RoomManager.getInstance().getRoom(game, id);
    if (!room) {
        utils.cb(cb, cons.ResultCode.ROOM_UNKNOWN());
        return;
    }

    utils.cbProm(cb, room.enter(UserSession.fromJson(session)));
};


Remote.prototype.removeRoom = function (session, cb) {
    let roomSession = RoomSession.fromJson(session);
    let room = RoomManager.getInstance().getRoom(roomSession.getGame(), roomSession.getRoomId());
    room && room.onRemove();
    utils.cbOK(cb);
};


Remote.prototype.removeUser = function (session, cb) {
    let roomSession = RoomSession.fromJson(session);
    let room = RoomManager.getInstance().getRoom(roomSession.getGame(), roomSession.getRoomId());
    room && room.removeUser();
    utils.invokeCallback(cb);
};


module.exports = (app) => new Remote(app);