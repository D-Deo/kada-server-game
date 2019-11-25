const pomelo = require('pomelo');
const _ = require('underscore');


class GuildSession {
    static fromBackendSession(session) {
        let json = session.get('guild');
        return json ? GuildSession.fromJson(json) : null;
    }

    static fromJson(json) {
        return new GuildSession(json.game, json.guildId, json.userId);
    }

    constructor(game, guildId, userId) {
        this.game = game;
        this.guildId = guildId;
        this.userId = userId;
    }

    getGame() {
        return this.game;
    }

    getGuildId() {
        return this.guildId;
    }

    getGuild() {
        let service = pomelo.app.get('guildService');
        return service.getGuild(this.guildId);
    }

    getUserId() {
        return this.userId;
    }

    getMember() {
        let guild = this.getGuild();
        return guild.getComp('member').getMember(this.userId);
    }

    toJson() {
        return _.pick(this, ['game', 'guildId', 'userId']);
    }
}


module.exports = GuildSession;
