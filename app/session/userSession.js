const constants = require('../common/constants');
const pomelo = require('pomelo');
const utils = require('../utils');
const _ = require('underscore');


class UserSession {
    static createRobot(userId, game, ip) {
        return new UserSession(userId, game, null, null, ip || utils.createFakeIp());
    }

    static fromBackendSession(session) {
        if (!session.uid) {
            return null;
        }

        let sps = session.uid.split('-');
        let userId = parseInt(sps[0]);
        let game = sps[1];

        let ip = null;
        if (pomelo.app.isFrontend()) {
            let address = pomelo.app.sessionService.getClientAddressBySessionId(session.id);
            ip = address ? _.last(address.ip.split(':')) : null;
        }
        return new UserSession(userId, game, session.frontendId, session.id, ip);
    }

    static fromLoginBackendSession(session, game) {
        let ip = null;
        if (pomelo.app.isFrontend()) {
            let address = pomelo.app.sessionService.getClientAddressBySessionId(session.id);
            ip = address ? _.last(address.ip.split(':')) : null;
        }
        return new UserSession(null, game, session.frontendId, session.id, ip);
    }

    static fromJson(data) {
        if (!data) {
            return null;
        }

        return new UserSession(data.userId, data.game, data.serverId, data.sessionId, data.ip);
    }

    static fromUserId(userId, data) {
        return UserSession.fromJson(_.extend(data, { userId }));
    }

    constructor(userId, game, serverId, sessionId, ip) {
        this.userId = userId;
        this.game = game;
        this.serverId = serverId;
        this.sessionId = sessionId;
        this.ip = ip;
    }

    bindProperty(key, value) {
        if (!this.serverId) {
            console.error('UserSession bindProperty: unknown serverId');
            return;
        }

        return new Promise((rs, rj) => {
            pomelo.app.get('backendSessionService').push(this.serverId, this.sessionId, key, value, (err) => {
                err ? rj(err) : rs();
            });
        });
    }

    login(game) {
        if (this.isRobot()) {
            console.error('UserSession login: robot');
            return;
        }

        this.game = game || this.game;
        return new Promise((rs, rj) => {
            pomelo.app.get('backendSessionService').bind(this.serverId, this.sessionId, this.getUserSessionId(), err => {
                err ? rj(err) : rs();
            });
        });
    }

    logout() {
        if (this.isRobot()) {
            console.error('UserSession logout: robot');
            return;
        }

        return new Promise((rs, rj) => {
            pomelo.app.get('backendSessionService').unbind(this.serverId, this.sessionId, this.getUserSessionId(), err => {
                err ? rj(err) : rs();
            });
        });
    }

    kick(reason) {
        if (this.isRobot()) {
            console.error('UserSession kick: robot');
            return;
        }

        return new Promise((rs, rj) => {
            pomelo.app.get('backendSessionService').kickBySid(this.serverId, this.sessionId, reason, err => {
                err ? rj(err) : rs();
            });
        });
    }

    async relogin(game) {
        if (this.isRobot()) {
            console.error('UserSession relogin: robot');
            return;
        }

        await this.logout();
        await this.login(game);
    }

    getChannelSession() {
        if (!this.serverId) {
            return null;
        }

        return { uid: this.getUserSessionId(), sid: this.serverId };
    }

    getGame() {
        return this.game;
    }

    getIp() {
        return this.ip;
    }

    getServerId() {
        return this.serverId;
    }

    getUserId() {
        return this.userId;
    }

    getUserSessionId() {
        return this.userId + '-' + this.game;
    }

    isRobot() {
        return !this.serverId;
    }

    isSameWith(session) {
        if (!session) {
            return false;
        }

        return this.userId === session.userId &&
            this.game === session.game &&
            this.serverId === session.serverId &&
            this.sessionId === session.sessionId;
    }

    toJson() {
        return _.pick(this, ['userId', 'game', 'serverId', 'sessionId', 'ip']);
    }

    send(route, msg, cb) {
        if (!this.serverId) {
            return;
        }

        pomelo.app.get("channelService").pushMessageByUids(route, msg, [this.getChannelSession()], null, (err) => {
            if (err) {
                // console.error('user session send error: ', err);
                utils.cbError(cb);
                return;
            }
            utils.cbOK(cb);
        });
    }

    sendToGame(game, route, msg, cb) {
        if (game !== this.getGame()) {
            utils.cbError(cb);
            return;
        }

        this.send(route, msg, cb);
    }
}


module.exports = UserSession;