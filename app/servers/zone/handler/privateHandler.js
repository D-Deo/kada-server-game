const constants = require('../../../common/constants');
const GameManager = require('../../../game/manager');
const rpc = require('../../../rpc/guild');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils');


function Handler(app) {
    this.app = app;
}


Handler.prototype.createRoom = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let [err1, params] = GameManager.getInstance().call2(userSession.getGame(), 'zone.private.parseRoomParams', userSession, msg);
    if (err1) {
        utils.next(next, err1);
        return;
    }

    let [err2, room] = this.app.get('privateService').createRoom(params);
    if (err2) {
        utils.next(next, err2);
        return;
    }

    room.charge(err3 => {
        if (err3) {
            utils.next(next, err3);
            return;
        }

        utils.nextProm(next, room.enter(userSession));
    });
};


Handler.prototype.dismissRoom = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let room = this.app.get('privateService').getRoom(userSession.getGame(), msg.id);
    if (!room) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    room.dismiss(userSession, (err) => utils.next(next, err));
};


Handler.prototype.enterRoom = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let room = this.app.get('privateService').getRoom(userSession.getGame(), msg.id);
    if (!room) {
        utils.next(next, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    utils.nextProm(next, room.enter(userSession));
};


module.exports = (app) => new Handler(app);