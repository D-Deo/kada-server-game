const express = require('express');
const pomelo = require('pomelo');
const router = express.Router();
const utils = require('../../../../../utils');
const _ = require('underscore');


router.post('/change', (req, res) => {
    let {userId, items, exts} = req.body;

    if( !utils.isNumber(userId, 0) ||
        !utils.isItemsObject(items) ||
        !_.isObject(exts)) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.itemRemote.changeItems(userId, userId, items, exts, (err, msg) => {
        utils.response(res, err, msg);
    });
});


router.post('/charge', (req, res) => {
    let {userId, items, exts} = req.body;

    if( !utils.isNumber(userId, 0) ||
        !utils.isItemsObject(items) ||
        !_.isObject(exts)) {
        utils.responseError(res);
        return;
    }

    if(_.some(items, c => !utils.isNumber(c, 1))) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.itemRemote.changeItems(userId, userId, items, exts, (err, msg) => {
        utils.response(res, err, msg);
    });
});


router.post('/use', (req, res) => {
    let {userId, items, exts} = req.body;

    if( !utils.isNumber(userId, 0) ||
        !utils.isItemsObject(items) ||
        !_.isObject(exts)) {
        utils.responseError(res);
        return;
    }

    if(_.some(items, c => !utils.isNumber(c, 1))) {
        utils.responseError(res);
        return;
    }

    pomelo.app.rpc.user.itemRemote.useItems(userId, userId, items, exts, (err, msg) => {
        utils.response(res, err, msg);
    });
});


// router.post('/diamond/charge', (req, res) => {
//     let {userId, itemId, count, reason} = req.body;
//
//     if( !utils.isId(userId) ||
//         !utils.isId(itemId) ||
//         !utils.isNumber(count) ||
//         !utils.isNumber(reason)) {
//         utils.responseError(res);
//         return;
//     }
//
//     pomelo.app.rpc.user.itemRemote.chargeDiamond(userId, userId, itemId, count, reason, (err, msg) => {
//         utils.response(res, err, msg);
//     });
// });
//
//
// router.post('/diamond/use', (req, res) => {
//     let {userId, count, reason, bind} = req.body;
//
//     if( !utils.isId(userId) ||
//         !utils.isNumber(count, 1) ||
//         !utils.isNumber(reason)) {
//         utils.responseError(res);
//         return;
//     }
//
//     pomelo.app.rpc.user.itemRemote.useDiamond(userId, userId, count, reason, !!bind, (err, msg) => {
//         utils.response(res, err, msg);
//     });
// });


module.exports = router;
