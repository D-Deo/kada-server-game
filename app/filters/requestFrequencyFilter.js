const constants = require('../common/constants');
const SessionRequestService = require('../services/sessionService');


module.exports = function(msg, session, cb){
    let service = session.get('requestService');
    if(!service){
        service = new SessionRequestService();
        session.set("requestService", service);
        session.push("requestService");
    }
    cb(service.isRequestingTooOften(msg.route) ? null : constants.ResultCode.SERVER_BUSY());
};