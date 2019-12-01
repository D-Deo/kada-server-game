const constants = require('../../../common/constants');
const RoomSession = require('../../../session/roomSession');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils');
const pomelo = require('pomelo');


function Handler(app) {
    this.app = app;
}


Handler.prototype.action = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let roomSession = RoomSession.fromBackendSession(session);
    if (!roomSession) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    let room = this.app.get('roomService').getRoom(roomSession.getGame(), roomSession.getRoomId());
    if (!room) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    room.getComp('controller').action(userSession.getUserId(), msg, next);
};


Handler.prototype.chat = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let roomSession = RoomSession.fromBackendSession(session);
    if (!roomSession) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    let room = this.app.get('roomService').getRoom(roomSession.getGame(), roomSession.getRoomId());
    if (!room) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    room.getComp('chat').chat(userSession.getUserId(), msg.type, msg.content, next);
};


Handler.prototype.dismiss = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let roomSession = RoomSession.fromBackendSession(session);
    if (!roomSession) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    let room = this.app.get('roomService').getRoom(roomSession.getGame(), roomSession.getRoomId());
    if (!room) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    room.getComp('controller').dismiss(userSession.getUserId(), (err) => utils.next(next, err));
};


Handler.prototype.dismissVote = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let roomSession = RoomSession.fromBackendSession(session);
    if (!roomSession) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    let room = this.app.get('roomService').getRoom(roomSession.getGame(), roomSession.getRoomId());
    if (!room) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    room.getComp('dismiss').vote(userSession.getUserId(), !!msg.vote, next);
};


Handler.prototype.leave = function (msg, session, next) {
    let roomSession = RoomSession.fromBackendSession(session);
    let userSession = UserSession.fromBackendSession(session);

    if (!roomSession) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    let room = this.app.get('roomService').getRoom(roomSession.getGame(), roomSession.getRoomId());
    if (!room) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    room.getComp('seat').removeUser(userSession.getUserId(), constants.RoomClearReason.REQUEST(), (err) => {
        utils.next(next, err);
    });
};


Handler.prototype.reconnect = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let roomSession = RoomSession.fromBackendSession(session);
    if (!roomSession) {
        pomelo.app.rpc.user.roomRemote.leaveRoom(session, userSession.getUserId(), null, () => { });
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    let room = this.app.get('roomService').getRoom(roomSession.getGame(), roomSession.getRoomId());
    if (!room) {
        pomelo.app.rpc.user.roomRemote.leaveRoom(session, userSession.getUserId(), null, () => { });
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    if (!room.isPrivate() && !room.getComp('seat').unhostUser(userSession) /* || !room.playing*/) {
        pomelo.app.rpc.user.roomRemote.leaveRoom(session, userSession.getUserId(), null, () => { });
        utils.next(next, constants.ResultCode.ROOM_ERROR());
        return;
    }
    utils.nextOK(next);
};


module.exports = (app) => new Handler(app);