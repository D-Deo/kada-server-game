const UserSession = require('../../../session/userSession');


function Remote(app) {
    this.app = app;
}


Remote.prototype.createRoom = function(session, params, cb) {
    let userSession = UserSession.fromJson(session);
    // let creator = games.new0(userSession.getGame(), 'zone.roomCreator', RoomCreator);
    // creator.createPrivate(userSession, params, cb);
};


module.exports = (app) => new Remote(app);
