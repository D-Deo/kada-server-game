const MatchManager = require('../../../match/manager');
const User = require('../../../zone/user');
const UserSession = require('../../../session/userSession');
const utils = require('../../../utils');


function Handler(app) {
    this.app = app;
}


/**
 * @api {request} zone.matchHandler.getZone 获取匹配信息
 * @apiGroup Zone
 * @apiSuccessExample 返回
 * [{
 *  "id": 1, 匹配区间id
 *  "params": {}, 区间参数 - 比如金币范围 房间底分等
 *  "users": 0 在线玩家数
 * }]
 * @apiVersion 1.0.0
 */
Handler.prototype.getZone = function (msg, session, next) {
    let userSession = UserSession.fromBackendSession(session);
    let zone = MatchManager.getInstance().getZone(userSession.getGame());
    utils.nextOK(next, zone ? zone.toJson() : []);
};


/**
 * @api {request} zone.matchHandler.match 匹配
 * @apiGroup Zone
 * @apiParam {id} area 匹配区间id
 * @apiVersion 1.0.0
 */
Handler.prototype.match = function (msg, session, next) {
    User.create(UserSession.fromBackendSession(session), (user) => {
        MatchManager.getInstance().match(user, msg.area, (err) => {
            utils.next(next, err);
        });
    });
};


module.exports = (app) => new Handler(app);