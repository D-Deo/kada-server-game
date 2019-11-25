const constants = require('../../../common/constants');
const dao = require('../../../dao/guild');
const GuildSession = require('../../../session/guildSession');
const utils = require('../../../utils');
const _ = require('underscore');


class Member {
    constructor(guild, id, level) {
        this.guild = guild;
        this.session = null;
        this.id = id;
        this.level = level;
        this.attrs = {};
    }

    bindSession(session, cb) {
        if(session.isSameWith(this.session)) {
            utils.invokeCallback(cb);
            return;
        }

        this.unbindSession();
        this.session = session;
        this.session.bindProperty('guild', this.getGuildSession().toJson(), (err) => {
            if(!session.isSameWith(this.session)) {
                utils.cbError(cb);
                return;
            }

            if(err) {
                this.session = null;
                utils.cbError(cb);
                return;
            }

            this.guild.getComp('channel').join(session);
            utils.cbOK(cb);
        });
    }

    unbindSession(cb) {
        if(!this.session) {
            utils.invokeCallback(cb);
            return;
        }

        this.guild.getComp('channel').leave(this.session);
        this.session.bindProperty('guild', null, cb);
        this.session = null;
    }

    getGuildSession() {
        return new GuildSession(this.guild.getGame(), this.guild.getId(), this.id);
    }

    getId() {
        return this.id;
    }

    isChairman() {
        return this.level === constants.GuildMemberLevel.CHAIRMAN();
    }

    loadAttrs(attrs) {
        this.attrs = _.pick(attrs, ['nick', 'head']);
    }

    remove() {
        dao.deleteMember(this.guild.getGame(), this.guild.getId(), this.getId());
    }

    save() {
        dao.insertMember(this.toJsonForSave());
    }

    toJson() {
        let json = _.pick(this.attrs, ['nick', 'head']);
        json.id = this.id;
        json.level = this.level;
        return json;
    }

    toJsonForSave() {
        return {
            game: this.guild.getGame(),
            guildId: this.guild.getId(),
            userId: this.id,
            level: this.level
        };
    }
}


module.exports = Member;