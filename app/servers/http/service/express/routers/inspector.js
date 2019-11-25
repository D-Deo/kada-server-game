const express = require('express');
const pomelo = require('pomelo');
const rpc = require('../../../../../rpc/user');
const utils = require('../../../../../utils');
const _ = require('underscore');


let router = express.Router();


router.post('/attrs', (req, res) => {
    if(!_.isObject(req.body.attrs)) {
        utils.responseError(res);
        return;
    }

    let servers = utils.pomelo.getServers(req.body.types, req.body.ids);
    _.each(servers, (s) => {
        pomelo.app.rpc[s.serverType].inspectorRemote.setAttrs(s.id, req.body.attrs, () => {});
    });
    console.info("Inspector attrs: ", _.map(servers, (s) => s.id));
    utils.responseOK(res);
});


router.post('/command/run', (req, res) => {
    if(!_.isObject(req.body.attrs)) {
        utils.responseError(res);
        return;
    }

    if(!utils.isString(req.body.name)) {
        utils.responseError(res);
        return;
    }

    if(!_.isObject(req.body.params)) {
        utils.responseError(res);
        return;
    }

    let servers = utils.pomelo.getServers(req.body.types, req.body.ids);
    _.each(servers, (s) => {
        pomelo.app.rpc[s.serverType].inspectorRemote.runCommand(s.id, req.body.name, req.body.params, () => {});
    });
    console.info("Inspector runCommand: ", _.map(servers, (s) => s.id));
    utils.responseOK(res);
});


router.post('/broadcast', (req, res) => {
    let {channel, msg} = req.body;
    if( !utils.isString(channel, 1, 30) ||
        !utils.isString(msg, 1, 100)) {
        utils.responseError(res);
        return;
    }

    utils.pomelo.broadcast(channel, msg);
    utils.responseOK(res);
});


router.post('/announce', (req, res) => {
    let {channel, msg} = req.body;
    if( !utils.isString(channel, 1, 30) ||
        !utils.isString(msg)){
        utils.responseError(res);
        return;
    }

    utils.pomelo.announce(channel, msg);
    utils.responseOK(res);   
});

router.post('/gameopen', (req, res) => {

    let {channel, msg} = req.body;
    if( !utils.isString(channel, 1, 30)){
        utils.responseError(res);
        return;
    }
    utils.pomelo.gameopen(channel, msg);
    utils.responseOK(res);   
});


router.post('/user/deposits', (req, res) => {
    if(!utils.isId(req.body.userId)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.inspectorRemote.getUserDeposits(req.body.userId, req.body.userId, (err, msg) => {
        utils.response(res, err, msg);
    });
});


router.post('/user/undeposit', (req, res) => {
    if( !utils.isId(req.body.userId) ||
        !utils.isId(req.body.id)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.inspectorRemote.popUserDeposit(req.body.userId, req.body.userId, req.body.id, (err, msg) => {
        utils.response(res, err, msg);
    });
});


module.exports = router;