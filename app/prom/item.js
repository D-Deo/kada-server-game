const pomelo = require('pomelo');


let prom = module.exports = {};


prom.changeItem = (userId, itemId, count, exts) => {
    return new Promise((rs, rj) => {
        pomelo.app.rpc.user.itemRemote.changeItem(
            userId,
            userId,
            itemId,
            count,
            exts,
            e => e ? rj(e) : rs()
        );
    });
};
