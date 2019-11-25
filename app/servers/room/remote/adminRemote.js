const cons = require('../../../common/constants');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.dismissRoom = function(game, roomId, cb) {
    let room = this.app.get('roomService').getRoom(game, roomId);
    if(!room) {
        utils.cb(cb, cons.ResultCode.ROOM_UNKNOWN());
        return;
    }

    room.dismiss(cons.RoomClearReason.ADMIN());
    utils.cbOK(cb);
};


Remote.prototype.profile = function(cb) {
    let service = this.app.get("roomService");
    cb(service.profile());
};


module.exports = (app) => new Remote(app);