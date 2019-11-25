const pomelo = require('pomelo');
const utils = require('../../../utils');


function Remote(app) {
    this.app = app;
}


Remote.prototype.login = function(sid, userId, properties, cb) {
    let service = pomelo.app.get('sessionService');
    let session = service.get(sid);
    if(!session) {
        utils.cbError(cb);
        return;
    }

    service.importAll(sid, properties);
    service.bind(sid, userId, cb);
};


Remote.prototype.logout = function(userId, cb) {
    let service = pomelo.app.get('sessionService');
    let session = service.getByUid(userId);
    if(!session) {
        utils.cbError(cb);
        return;
    }

    service.unbind(session.id, userId, cb);
};


Remote.prototype.relogin = function() {

};


module.exports = (app) => new Remote(app);