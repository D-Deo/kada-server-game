const constants = require('../../../../../common/constants');
const express = require('express');
const pomelo = require('pomelo');
const rpc = require('../../../../../rpc/user');
const utils = require('../../../../../utils/index');


let router = express.Router();


router.get('/create', (req, res) => {
    let game = req.query.game;
    let userId = parseInt(req.query.userId);
    let name = req.query.name;


    if(!utils.isString(game, 2, 2) ||
        !utils.isNumber(userId, 0) ||
        !utils.isString(name, 1, 30)) {
        utils.responseError(res);
        return;
    }

    rpc.isUser(userId, (result) => {
        if(!result) {
            utils.response(res, constants.ResultCode.USER_UNKNOWN());
            return;
        }

        pomelo.app.rpc.guild.guildRemote.createGuild(game, userId, name, (err, guildId) => {
            utils.response(res, err, guildId);
        });
    });
});


router.get('/join', (req, res) => {
    let game = req.query.game;
    let guildId = parseInt(req.query.guildId);
    let userId = parseInt(req.query.userId);

    if(!utils.isString(game, 2, 2) ||
        !utils.isNumber(guildId, 0) ||
        !utils.isNumber(userId, 0)) {
        utils.responseError(res);
        return;
    }

    rpc.isUser(userId, (result) => {
        if(!result) {
            utils.response(res, constants.ResultCode.USER_UNKNOWN());
            return;
        }

        pomelo.app.rpc.guild.guildRemote.joinGuild(game, guildId, userId, (err) => {
            utils.response(res, err);
        });
    });
});


module.exports = router;