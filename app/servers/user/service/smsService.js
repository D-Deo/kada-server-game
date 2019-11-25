const cons = require('../../../common/constants');
const utils = require('../../../utils');
const _ = require('underscore');


class SmsService {
    constructor(app) {
        this.app = app;
        this.smses = {};
    }

    addSms(type, account, code) {
        this.smses[type] = this.smses[type] || {};
        this.smses[type][account] = {code, timestamp: _.now()};
    }

    getSms(type, account) {
        if(!this.smses[type]) {
            return null;
        }

        return this.smses[type][account] || null;
    }

    removeSms(type, account) {
        if(!this.smses[type]) {
            return;
        }

        delete this.smses[type][account];
    }

    isCommiting(type, account) {
        let sms = this.getSms(type, account);
        if(!sms) {
            return false;
        }

        return !utils.date.isExpired(sms.timestamp, cons.SMSInterval.COMMIT());
    }

    isSending(type, account) {
        let sms = this.getSms(type, account);
        if(!sms) {
            return false;
        }

        return !utils.date.isExpired(sms.timestamp, cons.SMSInterval.SEND());
    }

    commit(type, account, code) {
        if(code === cons.SMS.GOD_CODE()) {
            return true;
        }

        if(!this.isCommiting(type, account)) {
            return false;
        }

        let sms = this.getSms(type, account);
        if(sms.code !== code) {
            return false;
        }

        this.removeSms(type, account);
        return true;
    }

    send(type, account) {
        if(this.isSending(type, account)) {
            return utils.date.remain(this.getSms(type, account).timestamp, cons.SMSInterval.SEND());
        }

        let code = cons.SMS.DEBUG() || utils.string.randomId(cons.SMS.LENGTH());
        this.addSms(type, account, code);
        return cons.SMSInterval.SEND();
    }
}


module.exports = (app) => new SmsService(app);