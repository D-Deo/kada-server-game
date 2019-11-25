const constants = require('../../../common/constants');
const utils = require('../../../utils');
const User = require('../../../room/user');
const UserSession = require('../../../session/userSession');
const GameManager = require('../../../game/manager');
const _ = require('underscore');


function Remote(app) {
    this.app = app;
}


Remote.prototype.createRoom = function (params, cb) {
    this.app.get('roomService').createRoom(params);
    utils.cbOK(cb);
};


Remote.prototype.dismissRoom = function (session, game, roomId, cb) {
    let userSession = UserSession.fromJson(session);
    let room = this.app.get('roomService').getRoom(game, roomId);
    if (!room) {
        utils.cb(cb, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    if (!room.isOwner(userSession.getUserId())) {
        utils.cbError(cb);
        return;
    }

    if (room.isPlaying()) {
        utils.cb(cb, constants.ResultCode.ROOM_PLAYING());
        return;
    }

    room.clear(constants.RoomClearReason.OWNER_DISMISS());
    utils.cbOK(cb);
};


Remote.prototype.enterRoom = function (game, id, session, cb) {
    let room = this.app.get('roomService').getRoom(game, id);
    if (!room) {
        utils.invokeCallback(cb, constants.ResultCode.ROOM_UNKNOWN());
        return;
    }

    User.create(UserSession.fromJson(session), room, (err, user) => {
        if (err) {
            utils.cb(cb, err);
            return;
        }

        // if ((room.getComp('seat').isFull() || room.isBlack(user) || room.isPlayed(user)) && game == 'ddz') {
        //     room = this.app.get('roomService').getWhiteRoom(game, id, user);
        // }
        room.getComp('seat').addUser(user, cb);
    });
};


Remote.prototype.leaveRoom = function (roomSession, userSession, cb) {
    let room = this.app.get('roomService').getRoom(roomSession.game, roomSession.roomId);
    if (!room) {
        utils.invokeCallback(cb);
        return;
    }

    room.getComp('seat').hostUser(UserSession.fromJson(userSession).getUserId());
    utils.invokeCallback(cb);
};


Remote.prototype.removeRoom = function (game, id, cb) {
    let room = this.app.get('roomService').getRoom(game, id);
    room && room.clear();
    cb();
};

Remote.prototype.getRooms = function (cb) {
    let rooms = this.app.get('roomService').getPlayingRoom();
    cb(rooms ? rooms : null);
};

Remote.prototype.chargeJackpot = function (game, area, score, cb) {
    GameManager.getInstance().addJackpot(game, area, score, true);
    cb();
};

Remote.prototype.chargeSettings = function (game, area, enabled, minJackpot, maxJackpot, minBet, prob, winRate, jackpotRate, winGoldRate, loseGoldRate, winGold, loseGold, cb) {
    let room = this.app.get('roomService').getRooms(game, area);
    _.each(room, (r) => {
        r.getComp('jackpot').setStatus(enabled, minJackpot, maxJackpot, minBet, prob, winRate, jackpotRate, winGoldRate, loseGoldRate, winGold, loseGold);
    });

    GameManager.getInstance().setJackpot(game, area, 'enabled', enabled);
    GameManager.getInstance().setJackpot(game, area, 'minJackpot', minJackpot);
    GameManager.getInstance().setJackpot(game, area, 'maxJackpot', maxJackpot);
    GameManager.getInstance().setJackpot(game, area, 'minBet', minBet);
    GameManager.getInstance().setJackpot(game, area, 'prob', prob);
    GameManager.getInstance().setJackpot(game, area, 'winRate', winRate);
    GameManager.getInstance().setJackpot(game, area, 'jackpotRate', jackpotRate);
    GameManager.getInstance().setJackpot(game, area, 'winGoldRate', winGoldRate);
    GameManager.getInstance().setJackpot(game, area, 'loseGoldRate', loseGoldRate);
    GameManager.getInstance().setJackpot(game, area, 'winGold', winGold);
    GameManager.getInstance().setJackpot(game, area, 'loseGold', loseGold);

    cb();
};


module.exports = (app) => new Remote(app);