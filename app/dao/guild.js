const db = require('../db');
const utils = require('../utils');
const _ = require('underscore');


let dao = module.exports = {};


dao.deleteMember = (game, guildId, userId, cb) => {
    db.delete('guild_member', {game, guildId, userId}, () => utils.invokeCallback(cb));
};


dao.list = (game, cb) => {
    db.list('guild', {game}, (err, rows) => utils.invokeCallback(cb, rows));
};


dao.getGuildMembers = (game, guildId, cb) => {
    db.call('proc_guild_members', [game, guildId], (err, rows) => utils.invokeCallback(cb, _.first(rows)));
};


dao.insert = (guild, cb) => {
    db.insert('guild', guild, (err, rows) => utils.invokeCallback(cb, rows));
};


dao.insertMember = (member, cb) => {
    db.insert('guild_member', member, (err, rows) => utils.invokeCallback(cb, rows));
};