const Bag = require('./bag');
const Zone = require('./zone');


class Robot {
    constructor(manager, id) {
        this.manager = manager;
        this.id = id;
        this.comps = {};

        this.init();
    }

    getId() {
        return this.id;
    }

    getComp(key) {
        return this.comps[key];
    }

    init() {
        this.comps.bag = new Bag(this);
        this.comps.zone = new Zone(this);
    }

    require() {
        this.manager.addPlayingRobot(this);
    }

    release() {
        this.manager.addWaitingRobot(this);
    }
}


module.exports = Robot;