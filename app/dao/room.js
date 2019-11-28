const constants = require('../common/constants');
const db = require('../db');
const pomelo = require('pomelo');
const zlib = require('zlib');
const logger = require('pomelo-logger').getLogger('game');


let dao = module.exports = {};


dao.recordCreate = (params, cb) => {
    db.insert('room_record', {
        game: params.game,
        roomId: params.id,
        owner: params.owner,
        rounds: params.rounds,
        guild: params.guild,
        state: constants.RoomRecord.CREATE(),
        attrs: JSON.stringify(params),
        timestamp: (new Date()).toLocaleString()
    }, cb);
};


dao.recordPlay = (id, cb) => {
    db.update('room_record', { id }, { state: constants.RoomRecord.PLAYING() }, cb);
};


dao.recordEnd = (id, balance, cb) => {
    zlib.gzip(JSON.stringify(balance), (err, buffer) => {
        if (err) {
            return logger.error(err);
        }
        db.update('room_record', { id }, { balance: Buffer.from(buffer).toString('base64'), state: constants.RoomRecord.END() }, cb);
    });
};


dao.recordRound = (recordId, round, state, balance, actions) => {
    db.insert('room_round_record', {
        recordId,
        round,
        state: JSON.stringify(state),
        balance: balance ? JSON.stringify(balance) : null,
        actions: JSON.stringify(actions),
        timestamp: (new Date()).toLocaleString()
    });
};