const constants = require('../../../../../common/constants');
const dao = require('../../../../../dao/order');
const express = require('express');
const pomelo = require('pomelo');
const router = express.Router();
const rpc = require('../../../../../rpc/user');
const utils = require('../../../../../utils/index');
const wx = require('../../../../../sdk/wx');


router.get('/order', (req, res) => {
    if(!wx.verify(req.query)) {
        console.log('微信验证失败');
        utils.responseError(res);
        return;
    }

    dao.get(req.query['out_trade_no'], (data) => {
        if(!data || data.state !== constants.OrderState.UNPAY()) {
            utils.responseError(res);
            return;
        }

        rpc.changeDiamond(data.userId, data.diamond);
        dao.commit(data.id);
        utils.responseOK(res);
    });
});


module.exports = router;
