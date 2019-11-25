const Area = require('./area');
const GameManager = require('../game/manager');
const IdGenerator = require('../room/idGenerator');
const utils = require('../utils');
const _ = require('underscore');


class Zone {
    static create(game) {
        return new Zone(game);
    }

    constructor(game) {
        this.game = game;
        this.areas = {};

        // this.init();
    }

    addArea(area) {
        this.areas[area.getId()] = area;
    }

    getArea(id) {
        return this.areas[id];
    }

    getGame() {
        return this.game;
    }

    match(user, areaId, cb) {
        let area = this.getArea(areaId);
        if (!area) {
            utils.cbError(cb);
            return;
        }

        area.match(user, cb);
    }

    init() {
        let data = GameManager.getInstance().getData(this.getGame(), 'zone.match');
        if (!data) {
            return;
        }

        _.each(data.zone.areas, (d) => {
            this.addArea(new Area(this, d.id, IdGenerator.fromJson(d.idGenerator), d.params));
        });
    }

    toJson() {
        return _.map(this.areas, (a) => a.toJson());
    }
}


module.exports = Zone;