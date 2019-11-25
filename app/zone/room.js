const cons = require('../common/constants');
const EventEmitter = require('eventemitter3');
const logger = require('log4js').getLogger('zone');
const pomelo = require('pomelo');
const prom = require('../prom');
const rpc = require('../rpc');
const utils = require('../utils');
const _ = require('underscore');


class Room extends EventEmitter {
    constructor(server, params) {
        super();

        this.server = server;
        this.params = params;
        this.created = false;
        this.users = 0;
    }

    addUser() {
        this.users += 1;
        this.emit('AddUser', this);
    }

    removeUser() {
        this.users -= 1;
        this.emit('RemoveUser', this);
    }

    clear() {
        _.each(this.eventNames(), (name) => {
            this.removeAllListeners(name);
        });
    }

    charge(cb) {
        if (!this.params.owner) {
            logger.error('Room charge: owner', this.params.owner);
        }

        pomelo.app.rpc.user.roomRemote.createRoom(this.params.owner, this.params, (err, deposit) => {
            if (err) {
                this.onRemove();
                utils.cb(cb, err);
                return;
            }

            this.params.deposit = deposit;
            this.create(cb);
        });
    }

    create(cb, delay = 0) {
        if (this.created) {
            console.error('ZoneRoom create: created');
            utils.cbError(cb);
            return;
        }

        if (delay > 0) {
            _.delay(() => {
                pomelo.app.rpc.room.roomRemote.createRoom(
                    this.server,
                    this.params,
                    cb || (() => { })
                );
            }, delay);
        } else {
            pomelo.app.rpc.room.roomRemote.createRoom(
                this.server,
                this.params,
                cb || (() => { })
            );
        }


        this.created = true;
        this.emit('Create');
    }

    dismiss(session, cb) {
        pomelo.app.rpc.room.roomRemote.dismissRoom(
            this.server,
            session.toJson(),
            this.getGame(),
            this.getId(),
            cb || (() => { })
        );
    }

    async enter(session) {
        if (!this.created) {
            return Promise.reject(cons.ResultCode.ROOM_UNKNOWN());
        }

        if (this.isFull()) {
            return Promise.reject(cons.ResultCode.ROOM_FULL());
        }

        this.addUser();

        let p = prom.room.enterRoom(this.server, this.getGame(), this.getId(), session.toJson());
        p.catch(() => this.removeUser());
        return p;
    }

    remove(cb) {
        pomelo.app.rpc.room.roomRemote.removeRoom(
            this.server,
            this.getGame(),
            this.getId(),
            cb || (() => { })
        );
    }

    getGame() {
        return this.params.game;
    }

    getId() {
        return this.params.id;
    }

    getParam(key) {
        return this.params[key];
    }

    setParam(key, value) {
        this.params[key] = value;
    }

    isEmpty() {
        return this.users === 0;
    }

    isFull() {
        return this.users >= this.getParam('capacity');
    }

    onRemove() {
        this.emit('Remove', this);
        this.clear();
    }
}


module.exports = Room;