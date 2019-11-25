const constants = require('../../../common/constants');
const dao = require('../../../dao/guild');
const Member = require('./member');
const utils = require('../../../utils');
const _ = require('underscore');


class MemberManager {
    constructor(guild) {
        this.guild = guild;
        this.chairman = null;
        this.members = {};
    }

    addMember(member) {
        this.members[member.getId()] = member;

        if(member.isChairman()) {
            this.chairman = member;
        }
    }

    createMember(level, data) {
        let member = new Member(this.guild, data.id, level);
        member.loadAttrs(data);
        member.save();
        this.addMember(member);
        this.guild.getComp('channel').sendMemberAction(constants.GuildMemberAction.ADD(), member.toJson());
        return member;
    }

    createChairman(data) {
        this.chairman = this.createMember(constants.GuildMemberLevel.CHAIRMAN(), data);
        return this.chairman;
    }

    getMember(id) {
        return this.members[id];
    }

    getMemberCount() {
        return _.size(this.members);
    }

    isMember(id) {
        return !!this.members[id];
    }

    removeMember(userId, cb) {
        let member = this.getMember(userId);
        if(!member) {
            utils.cb(cb);
            return;
        }

        member.unbindSession(cb);
        member.remove();
        delete this.members[userId];
        this.guild.getComp('channel').sendMemberAction(constants.GuildMemberAction.REMOVE(), userId);
    }

    getChairman() {
        return this.chairman;
    }

    getChairmanId() {
        return this.chairman.getId();
    }

    isChairman(userId) {
        return this.getChairmanId() === userId;
    }

    isFull() {
        return this.getMemberCount() >= constants.GUILD_MEMBER_MAX();
    }

    load(cb) {
        dao.getGuildMembers(this.guild.getGame(), this.guild.getId(), (rows) => {
            _.each(rows, (row) => {
                let member = new Member(this.guild, row.userId, row.level);
                member.loadAttrs(row);
                this.addMember(member);
            });
            utils.invokeCallback(cb);
        });
    }

    toJson() {
        return _.map(this.members, (m) => m.toJson());
    }
}


module.exports = MemberManager;