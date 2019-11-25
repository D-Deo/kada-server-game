const cons = require('../common/constants');
const pomelo = require('pomelo');
const utils = require('../utils');
const Zone = require('./zone');
const _ = require('underscore');


class Manager {
    static getInstance() {
        return pomelo.app.components['matchManager'];
    }

    constructor() {
        this.zones = {};
    }

    addZone(zone) {
        this.zones[zone.getGame()] = zone;
    }

    getZone(game) {
        return this.zones[game];
    }

    match(user, area, cb) {
        let zone = this.getZone(user.getSession().getGame());
        if (!zone) {
            utils.cb(cb, cons.ResultCode.SERVER_BUSY());
            return;
        }

        zone.match(user, area, cb);
    }

    onAddServers(servers) {
        servers = _.filter(servers, (s) => s.serverType === 'room');
        _.each(servers, (server) => {
            _.each(server.game.split(','), (game) => {
                console.debug('MatchManager onAddServers', game);
                let zone = this.getZone(game);
                zone && zone.init();
            });
        });
    }

    start(cb) {
        console.debug('match manager start');
        let games = pomelo.app.getCurServer().game.split(',');
        _.each(games, (game) => {
            this.addZone(Zone.create(game));
        });
        pomelo.app.event.on(pomelo.events.ADD_SERVERS, this.onAddServers.bind(this));
        utils.cb(cb);
    }
}


module.exports = Manager;