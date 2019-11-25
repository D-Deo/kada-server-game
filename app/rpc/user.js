const constants = require('../common/constants');
const pomelo = require('pomelo');
const utils = require('../utils');


let rpc = module.exports = {};


rpc.changeItem = (userId, itemId, count, reason) => {
    pomelo.app.rpc.user.userRemote.changeItem(userId, userId, itemId, count, reason, () => {});
};


rpc.changeItems = (userId, items, reason) => {
    pomelo.app.rpc.user.userRemote.changeItems(userId, userId, items, reason, () => {});
};


rpc.changeGold = (userId, count) => {
    rpc.changeItem(userId, constants.Item.GOLD(), count);
};


rpc.changeDiamond = (userId, count, reason) => {
    rpc.changeItem(userId, constants.Item.DIAMOND(), count, reason);
};


rpc.createRoom = (params, cb) => {
    pomelo.app.rpc.user.roomRemote.createRoom(params.owner, params, cb);
};


rpc.enterRoom = (session, room, cb) => {
    pomelo.app.rpc.user.roomRemote.enterRoom(session.getUserId(), session.toJson(), room, cb);
};


rpc.inviteRoom = (owner, users, room) => {
    pomelo.app.rpc.user.roomRemote.inviteRoom(owner, owner, users, room.toJson(), () => {});
};


rpc.leaveRoom = (userId, deposit, cb) => {
    pomelo.app.rpc.user.roomRemote.leaveRoom(userId, userId, deposit, cb);
};


rpc.get = (id, reason, cb) => {
    pomelo.app.rpc.user['userRemote'].getUser(id, id, reason, (data) => {
        utils.invokeCallback(cb, data);
    });
};


rpc.getForRoom = (id, cb) => {
    rpc.get(id, constants.UserToJsonReason.ROOM(), cb);
};


rpc.login = (session, attrs, gps, cb) => {
    pomelo.app.rpc.user.authorizationRemote.login(null, session.toJson(), attrs, gps, cb);
};


rpc.fastLogin = (session, account, gps, cb) => {
    pomelo.app.rpc.user.authorizationRemote.fastLogin(null, session.toJson(), account, gps, cb);
};