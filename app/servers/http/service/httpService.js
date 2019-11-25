/**
 * @apiDefine Http
 * HTTP接口
 */


class HttpService {
    constructor(app) {
        this.app = app;
        this.express = require('./express/index');
        this.express.set('pomelo', this.app);
    }
}


module.exports = function(app) {return new HttpService(app);};