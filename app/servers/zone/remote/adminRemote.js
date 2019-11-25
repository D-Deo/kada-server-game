const cons = require('../../../common/constants');
const RoomManager = require('../../../zone/roomManager');
const pomelo = require('pomelo');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.dismissRoom = function(game, roomId, cb) {
    let room = RoomManager.getInstance().getRoom(game, roomId);
    if(!room) {
        utils.cb(cb, cons.ResultCode.ROOM_UNKNOWN());
        return;
    }

    pomelo.app.rpc.room.adminRemote.dismissRoom(room.getServer(), game, roomId, cb);
};


module.exports = (app) => new Remote(app);