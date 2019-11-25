const RoomSession = require('../../../session/roomSession');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.changeScore = function(session, userId, value, cb) {
    session = RoomSession.fromJson(session);
    let room = this.app.get('roomService').getRoom(session.getGame(), session.getRoomId());
    if(!room) {
        utils.cb(cb);
        return;
    }

    let seat = room.getComp('seat').getSeatByUserId(userId);
    if(!seat) {
        utils.cb(cb);
        return;
    }

    seat.getUser().updateScore(value);
    utils.cbOK(cb);
};


module.exports = (app) => new Remote(app);