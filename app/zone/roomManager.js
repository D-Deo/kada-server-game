const cons = require('../common/constants');
const IdGenerator = require('../room/idGenerator');
const Inspector = require('../inspector/inspector');
const logger = require('log4js').getLogger('zone');
const pomelo = require('pomelo');
const Room = require('./room');
const utils = require('../utils');
const uuid = require('uuid/v4');
const _ = require('underscore');


class RoomManager {
    static getInstance() {
        return pomelo.app.components['roomManager'];
    }

    constructor() {
        this.servers = {};
        this.idGenerator = IdGenerator.create(cons.ROOM_ID_LENGTH());
        this.rooms = {};
    }

    addRoom(room) {
        this.rooms[room.getGame()] = this.rooms[room.getGame()] || {};
        this.rooms[room.getGame()][room.getId()] = room;
    }

    createRoom(params, idGenerator) {
        if (Inspector.get().isEnabled('closing')) {
            return [cons.ResultCode.SERVER_CLOSING()];
        }

        if (_.isEmpty(this.servers[params.game])) {
            return [cons.ResultCode.SERVER_BUSY()];
        }

        if (!utils.isString(params.game, 2, 4)) {
            logger.error('RoomManager createRoom: params.game - ', params.game);
            return [cons.ResultCode.ERROR()];
        }

        params.id = this.createRoomId(params.game, idGenerator || this.idGenerator);
        if (!utils.isString(params.id, 1)) {
            logger.error('RoomManager createRoom: params.id - ', params.id);
            return [cons.ResultCode.ERROR()];
        }

        if (this.getRoom(params.games, params.id)) {
            logger.error('RoomManager createRoom: used id - ', params.id);
            return [cons.ResultCode.ERROR()];
        }

        if (!utils.isNumber(params.capacity, 1)) {
            logger.error('RoomManager createRoom: params.capacity - ', params.capacity);
            return [cons.ResultCode.ERROR()];
        }

        if (!utils.isNumber(params.mode, 1)) {
            logger.error('RoomManager createRoom: params.mode - ', params.mode);
            return [cons.ResultCode.ERROR()];
        }

        if (!utils.isNumber(params.type, 1)) {
            logger.error('RoomManager createRoom: params.type - ', params.type);
            return [cons.ResultCode.ERROR()];
        }

        params.uuid = uuid();
        params.canOwnerLeave = !!params.canOwnerLeave;
        params.createDeposit = params.createDeposit || null;
        params.createAndEnter = !!params.createAndEnter;
        params.dismissable = !!params.dismissable;
        params.enterDeposit = params.enterDeposit || null;
        params.owner = params.owner || null;
        params.recording = !!params.recording;
        params.rounds = params.rounds || -1;
        params.roundCost = params.roundCost || 0;
        params.score = params.score || null;
        params.scoreMin = params.scoreMin || 0;
        params.scoreMax = params.scoreMax || 0;
        params.zone = pomelo.app.getServerId();

        let room = new Room(utils.randomArray(this.servers[params.game]), params);
        room.on('Remove', (r) => this.removeRoom(r.getGame(), r.getId()));
        this.addRoom(room);
        return [null, room];
    }

    createRoomId(game, idGenerator) {
        let retrys = 0;
        while (retrys < cons.ROOM_ID_RETRY()) {
            let id = idGenerator.generate();
            if (!this.getRoom(game, id)) {
                return id;
            }
            retrys += 1;
        }
        return null;
    }

    getRoom(game, id) {
        if (!_.has(this.rooms, game)) {
            return null;
        }

        return this.rooms[game][id];
    }

    removeRoom(game, id) {
        delete this.rooms[game][id];
    }

    addServer(game, id) {
        this.servers[game] = this.servers[game] || [];
        this.servers[game].push(id);
    }

    removeServer(id) {
        _.each(this.servers, (servers, game) => {
            this.servers[game] = _.without(servers, id);
        });
    }

    onAddServers(servers) {
        servers = _.filter(servers, (s) => s.serverType === 'room');
        _.each(servers, (server) => {
            _.each(server.game.split(','), (game) => {
                console.debug('RoomManager onAddServers', game, server.id);
                this.addServer(game, server.id);
            });
        });
    }

    onRemoveServers(servers) {
        _.each(servers, (server) => {
            return this.removeServer(server);
        });
    }

    onReplaceServers() {
        // console.log(arguments);
    }

    start(cb) {
        console.debug('roomManager start');
        pomelo.app.event.on(pomelo.events.ADD_SERVERS, this.onAddServers.bind(this));
        pomelo.app.event.on(pomelo.events.REMOVE_SERVERS, this.onRemoveServers.bind(this));
        pomelo.app.event.on(pomelo.events.REPLACE_SERVERS, this.onReplaceServers.bind(this));
        utils.cb(cb);
    }
}


module.exports = RoomManager;