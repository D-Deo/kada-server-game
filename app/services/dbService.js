class DBService {

    constructor(app) {
        this.app = app;
        // console.warn('DBService', this.app.getCurServer(), this.app.getServerId());

        let svr = this.app.getCurServer();
        if (svr.db) {
            this.dao = require('../db/' + svr.db + '/dao');
            this.db = require('../db/' + svr.db + '/db');
            this.model = require('../db/' + svr.db + '/db/model');
        }
    }

    getDB() {
        return this.db;
    }

    getDao() {
        return this.dao;
    }

    getModel() {
        return this.model;
    }
}

module.exports = (app) => new DBService(app);