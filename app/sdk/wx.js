const constants = require('../common/constants');
const pomelo = require('pomelo');
const request = require('request');
const utility = require('utility');
const utils = require('../utils');
const xml2js = require('xml2js');
const _ = require('underscore');


let sdk = module.exports = {};

sdk.APPID = "";
sdk.APPSECRET = "";
sdk.MCHID = "";
sdk.KEY = "";
sdk.NOTIFY_URL = 'http://127.0.0.1:30099/api/wx';

sdk.md5 = (data) => {
    let str = "";
    _.each(_.sortBy(_.keys(data)), (key) => {
        if (!_.isEmpty(str)) {
            str += "&";
        }
        str += key + "=" + data[key];
    });
    return utility.md5(str + "&key=" + sdk.KEY).toUpperCase();
};

sdk.toXml = (data) => {
    let xml = "<xml>\n";
    let keys = _.sortBy(_.keys(data));
    _.each(keys, (key) => { xml += "<" + key + "><![CDATA[" + data[key] + "]]></" + key + ">\n"; });
    xml += "</xml>";
    return xml;
};

sdk.result = (err, res, body, cb) => {
    if (err) {
        console.warn('微信登录', err, res, body);
    }

    try {
        let data = JSON.parse(body);
        if (_.has(data, 'errcode')) {
            console.warn('微信登录，验证失败', data);
            utils.invokeCallback(cb, constants.ResultCode.ERROR());
            return;
        }
        utils.invokeCallback(cb, null, data);
    } catch (e) {
        utils.invokeCallback(cb, constants.ResultCode.ERROR());
    }
};

sdk.verify = (data) => sdk.md5(_.omit(data, 'sign')) === data.sign;

/**
 * 获取用户第三方授权凭证
 * @returns {object} {
        "access_token":"ACCESS_TOKEN",              // 接口调用凭证
        "expires_in":7200,                          // access_token接口调用凭证超时时间，单位（秒）
        "refresh_token":"REFRESH_TOKEN",            // 用户刷新access_token
        "openid":"OPENID",                          // 授权用户唯一标识
        "scope":"SCOPE",                            // 用户授权的作用域，使用逗号（,）分隔
        "unionid":"o6_bmasdasdsad6_2sgVt7hMZOPfL"   // 当且仅当该移动应用已获得该用户的userinfo授权时，才会出现该字段
    }
 */
sdk.getAccessToken = function (code, cb) {
    request({
        uri: `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${sdk.APPID}&secret=${sdk.APPSECRET}&code=${code.trim()}&grant_type=authorization_code`,
        // uri: "https://api.weixin.qq.com/sns/oauth2/access_token?" + "appid=" + sdk.APPID + '&secret=' + sdk.APPSECRET + '&code=' + code.trim() + '&grant_type=authorization_code',
        method: "GET"
    }, (err, res, body) => sdk.result(err, res, body, cb));
};

/**
 * 获取用户微信信息
 * @return {object} {
        "openid":"OPENID",          // 普通用户的标识，对当前开发者帐号唯一
        "nickname":"NICKNAME",      // 普通用户昵称
        "sex":1,                    // 普通用户性别，1为男性，2为女性
        "province":"PROVINCE",      // 普通用户个人资料填写的省份
        "city":"CITY",              // 普通用户个人资料填写的城市
        "country":"COUNTRY",        // 国家，如中国为CN

        // 用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空
        "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
        "privilege": [              // 用户特权信息，json数组，如微信沃卡用户为（chinaunicom）
            "PRIVILEGE1",
            "PRIVILEGE2"
        ],
        "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL"     // 用户统一标识。针对一个微信开放平台帐号下的应用，同一用户的unionid是唯一的。
    }
*/
sdk.getUserInfo = function (accessToken, openId, cb) {
    request({
        uri: `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}`,
        // uri: "https://api.weixin.qq.com/sns/userinfo?" + "access_token=" + accessToken + "&openid=" + openId,
        method: "GET"
    }, (err, res, body) => sdk.result(err, res, body, cb));
};

sdk.refreshAccessToken = function (refreshToken, cb) {
    request({
        uri: "https://api.weixin.qq.com/sns/oauth2/refresh_token?" + "appid=" + sdk.APPID + '&grant_type=refresh_token&refresh_token=' + refreshToken,
        method: "GET"
    }, (err, res, body) => sdk.result(err, res, body, cb));
};

sdk.unifiedorder = function (no, fee, desp, cb) {
    // fee = 1;
    // if (pomelo.app.getCurServer().serverType !== 'gate') {
        // pomelo.app.rpc.gate['wxRemote'].unifiedorder('', no, fee, desp, cb);
        // return;
    // }

    let data = {};
    data.appid = sdk.APPID;
    data.body = desp;
    data.mch_id = sdk.MCHID;
    data.nonce_str = _.random(1000000000, 9999999999) + '';
    data.notify_url = sdk.NOTIFY_URL;
    data.out_trade_no = no;
    data.spbill_create_ip = "1.1.1.1";
    data.total_fee = fee;
    data.trade_type = "APP";
    data.sign = sdk.md5(data);

    let req = request({
        uri: "https://api.mch.weixin.qq.com/pay/unifiedorder",
        method: "POST"
    }, function (err, res, body) {
        let parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(body, function (err, data) {
            if (err || data.xml['return_code'] !== "SUCCESS") {
                utils.invokeCallback(cb, constants.ResultCode.ERROR());
                return;
            }

            if (!sdk.verify(data.xml)) {
                console.log('微信支付, 验证失败');
                cb && cb(constants.ResultCode.ERROR());
                return;
            }

            let ret = {};
            ret.appId = data.xml.appid;
            ret.partnerId = data.xml.mch_id;
            ret.prepayId = data.xml.prepay_id;
            ret.package = "Sign=WXPay";
            ret.nonceStr = _.random(1000000000, 9999999999) + '';
            ret.timeStamp = Math.floor(_.now() / 1000);

            let signData = {};
            signData.appid = ret.appId;
            signData.partnerid = ret.partnerId;
            signData.prepayid = ret.prepayId;
            signData.package = ret.package;
            signData.noncestr = ret.nonceStr;
            signData.timestamp = ret.timeStamp;

            ret.sign = sdk.md5(signData);
            utils.invokeCallback(cb, null, ret);
        });
    });
    req.write(sdk.toXml(data));
};