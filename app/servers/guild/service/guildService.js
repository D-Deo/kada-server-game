const constants = require('../../../common/constants');
const dao = require('../../../dao/guild');
const Guild = require('./guild');
const pomelo = require('pomelo');
const utils = require('../../../utils');
const _ = require('underscore');


class GuildService {
    constructor(app) {
        this.app = app;
        this.idGenerator = 1;
        this.guilds = {};
        this.nameMap = {};
        this.userMap = {};

        this.load();
    }

    addGuild(guild) {
        this.guilds[guild.getId()] = guild;
        this.nameMap[guild.getName()] = guild;

        let chairmanId = guild.getComp('member').getChairmanId();
        if(!this.userMap[chairmanId]) {
            this.userMap[chairmanId] = [];
        }
        this.userMap[chairmanId].push(guild);
    }

    createGuild(name, chariman) {
        let guild = new Guild(this.idGenerator++, name);
        guild.getComp('member').createChairman(chariman);
        guild.save();
        this.addGuild(guild);
        return guild;
    }

    getGuild(id) {
        return this.guilds[id];
    }

    getGuildCountByUserId(userId) {
        return this.userMap[userId] ? _.size(this.userMap[userId]) : 0;
    }

    isGuildByName(name) {
        return !!this.nameMap[name];
    }

    isFull(userId) {
        return this.getGuildCountByUserId(userId) >= constants.GUILD_MAX();
    }

    load() {
        // dao.list(pomelo.app.getCurServer().game, (rows) => {
        //     _.each(rows, (row) => {
        //         let guild = new Guild(row.id, row.name);
        //         guild.load(() => this.addGuild(guild));
        //
        //         if(guild.getId() >= this.idGenerator) {
        //             this.idGenerator = guild.getId() + 1;
        //         }
        //     });
        // });
    }
}


module.exports = (app) => new GuildService(app);