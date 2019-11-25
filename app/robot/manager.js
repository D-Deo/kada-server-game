const cons = require('../common/constants');
const dao = require('../dao/user');
const pomelo = require('pomelo');
const Robot = require('./robot');
const utils = require('../utils');
const _ = require('underscore');


class Manager {
    static getInstance() {
        return pomelo.app.components['robotManager'];
    }

    constructor() {
        this.idMap = {};
        this.waitingMap = {};
        this.playingMap = {};
    }

    addRobot(r) {
        this.idMap[r.getId()] = r;
        this.addWaitingRobot(r);
    }

    addWaitingRobot(r) {
        this.waitingMap[r.getId()] = r;
        delete this.playingMap[r.getId()];
    }

    addPlayingRobot(r) {
        this.playingMap[r.getId()] = r;
        delete this.waitingMap[r.getId()];
    }

    getRobot(id) {
        return this.idMap[id];
    }

    requireRobot() {
        return utils.randomObject(this.waitingMap);
    }

    requireRobots(count) {
        let ids = _.first(_.shuffle(_.keys(this.waitingMap)), count);
        return _.map(ids, id => this.getRobot(id));
    }

    start(cb) {
        dao.list((rows) => {
            _.map(rows, (r) => {
                if (r.type !== cons.User.ROBOT()) {
                    return;
                }

                this.addRobot(new Robot(this, r.id));
            });
            utils.cb(cb);
        });
    }
}


module.exports = Manager;