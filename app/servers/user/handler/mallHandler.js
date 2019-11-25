const constants = require('../../../common/constants');
const utils = require('../../../utils');


function Handler(app) {this.app = app;}


Handler.prototype.buy = function(msg, session, next){
    let service = this.app.get('mallService');
    service.buy(session.uid, msg.id, next);
};


module.exports = function(app) {return new Handler(app);};