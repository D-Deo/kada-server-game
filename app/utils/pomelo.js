const cons = require('../common/constants');
const pomelo = require('pomelo');
const helper = require('./helper');
const _ = require('underscore');
const db = require('../db/index');
const utils = require('../utils/index');

let util = module.exports = {};


util.broadcast = (name, msg) => {
    let service = pomelo.app.get('channelService');
    service.broadcast('connector', cons.Broadcast.ACTION(), { name, msg }, { binded: true }, () => { });
};

util.announce = (name, msg) => {
    let service = pomelo.app.get('channelService');
    service.broadcast('connector', cons.Broadcast.ANNOUNCE(), { name, msg }, { binded: true }, () => { });
};

util.gameopen = (name, msg) => {
    let service = pomelo.app.get('channelService');
    service.broadcast('connector', cons.Broadcast.GAMEOPEN(), { name, msg }, { binded: true }, () => { });
};


util.onoff = false;
util.marquee = (name, msg, onoff, cb) => {
    util.onoff = onoff;
    let service = pomelo.app.get('channelService');
    let games = ['牛牛', '德州扑克', '扎金花', '捕鱼', '水果连线'];
    db.list('user', { type: 1001 }, (err, rows) => {
        if (err) {
            cb(400, err);
            return false;
        }
        if (rows.length == 0) {
            cb(400, "开启失败,没有玩家数据");
            return false;
        }
        let call = () => {
            if (!util.onoff) return false;
            msg = "恭喜玩家【" + rows[_.random(0, rows.length - 1)].nick + "】在【" + games[_.random(0, 3)] + "】中狂赢";
            //msg += helper.getValueChinese(_.random(50000, 1000000)) + "金币";
            msg += helper.getValueChinese(_.random(500, 5000)) + ".00";
            service.broadcast('connector', cons.Broadcast.ACTION(), { name, msg }, { binded: true }, () => { });
            _.delay(call, helper.getNoticeDelay() * 1000);
        };
        _.delay(call, helper.getNoticeDelay() * 1000);
        cb(null, "ok");
    });
};


util.getServers = (types, ids) => {
    let servers = pomelo.app.getServers();
    servers = _.reject(servers, (s) => {
        return types && !_.contains(types, s.serverType);
    });
    servers = _.reject(servers, (s) => {
        return ids && !_.contains(ids, s.id);
    });
    return servers;
};


util.getZoneServer = (game) => {
    let servers = util.getServers(['zone']);
    return _.find(servers, (server) => {
        return server.game && _.contains(server.game.split(','), game);
    });
};
