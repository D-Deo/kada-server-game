const express = require('express');
const pomelo = require('pomelo');
const utils = require('../../../../../utils');
const constants = require('../../../../../common/constants');
const _ = require('underscore');

let router = express.Router();


router.post('/dismiss', (req, res) => {
    let game = req.body.game;
    let roomId = req.body.roomId;

    if (!utils.isString(req.body.game, 2, 4) ||
        !utils.isString(req.body.roomId, 1)) {
        utils.responseError(res);
        return;
    }

    let zoneServer = utils.pomelo.getZoneServer(game);
    if (!zoneServer) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.zone.adminRemote.dismissRoom(zoneServer.id, game, roomId, (err) => {
        utils.response(res, err);
    });
});

// router.get('/onlineRoom', (req, res) => {
//     pomelo.app.rpc.room['roomRemote'].getRooms('room-server-1', (data) => {
//         if (!data) {
//             utils.response(res, constants.ResultCode.ERROR());
//             return;
//         }
//         let json = {};
//         json.onlineRoom = data.length;
//         utils.responseOK(res, json);
//     });
// });

router.post('/chargeScore', (req, res) => {
    let { game, area, score } = req.body;
    if (!utils.isString(game, 2, 4) ||
        !utils.isNumber(area) ||
        !utils.isNumber(score)) {
        utils.responseError(res);
        return;
    }
    let room_server = {
        'nn': 1,
        'dz': 2,
        'bjl': 3,
        'bcbm': 4,
        'zjh': 5,
        'lx9': 6,
        'brnn': 7,
        'yybf': 8,
        'ddz': 9,
        'lkpy': 10,
        'fqzs': 11,
        'ermj': 12,
        'pj': 13,
        'sss': 14,
    };
    pomelo.app.rpc.room['roomRemote'].chargeJackpot('room-server-' + room_server[game], game, area, score, () => {
        utils.responseOK(res);
    });
});

router.post('/chargeSettings', (req, res) => {
    let { game, area, enabled, minJackpot, maxJackpot, minBet, prob, winRate, jackpotRate, winGoldRate, loseGoldRate, winGold, loseGold } = req.body;
    if (!utils.isString(game, 2, 4) ||
        !utils.isNumber(area)) {
        utils.responseError(res);
        return;
    }
    let room_server = {
        'nn': 1,
        'dz': 2,
        'bjl': 3,
        'bcbm': 4,
        'zjh': 5,
        'lx9': 6,
        'brnn': 7,
        'yybf': 8,
        'ddz': 9,
        'lkpy': 10,
        'fqzs': 11,
        'ermj': 12,
        'pj': 13,
        'sss': 14,
    };
    pomelo.app.rpc.room['roomRemote'].chargeSettings('room-server-' + room_server[game], game, area, enabled, minJackpot, maxJackpot, minBet, prob, winRate, jackpotRate, winGoldRate, loseGoldRate, winGold, loseGold, () => {
        utils.responseOK(res);
    });
});

module.exports = router;