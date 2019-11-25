const cons = require('../../../common/constants');
const logger = require('log4js').getLogger('user');
const RoomSession = require('../../../session/roomSession');
const UserManager = require('../../../user/manager');
const utils = require('../../../utils');
const _ = require('underscore');


function Remote(app) {
    this.app = app;
}


Remote.prototype.createRoom = function(params, cb) {
    let user = UserManager.get().getUserById(params.owner);
    if(!user) {
        utils.cbError(cb);
        return;
    }

    if(user.isPlaying()) {
        utils.cb(cb, cons.ResultCode.USER_PLAYING());
        return;
    }

    if(user.isSuspended()) {
        utils.cb(cb, cons.ResultCode.USER_SUSPENDED());
        return;
    }

    let bag = user.getComp('bag');

    if( params.createDeposit &&
        !bag.haveEnoughItemBundle(params.createDeposit.bundle, params.createDeposit.count)) {
        utils.cbItemNotEnough(cb, _.first(params.createDeposit.bundle));
        return;
    }

    if( params.createAndEnter &&
        params.enterDeposit &&
        !bag.haveEnoughItemBundle(params.enterDeposit.bundle, params.enterDeposit.count)) {
        utils.cbItemNotEnough(cb, _.first(params.enterDeposit.bundle));
        return;
    }

    let exts = {
        game: params.game,
        from: params.uuid,
        reason: cons.ItemChangeReason.DEPOSIT()
    };
    let deposit = params.createDeposit ? bag.useItemBundle(params.createDeposit.bundle, params.createDeposit.count, exts) : null;
    utils.cbOK(cb, deposit);
};


Remote.prototype.enterRoom = function(session, params, cb) {
    let user = UserManager.get().getUserById(session.userId);

    if(!user) {
        logger.error('RoomRemote enterRoom: user', user);
        utils.cb(cb, cons.ResultCode.USER_UNKNOWN());
        return;
    }

    if(user.isPlaying()) {
        logger.error('RoomRemote enterRoom: playing');
        utils.cb(cb, cons.ResultCode.USER_PLAYING());
        return;
    }

    if(user.isSuspended()) {
        console.error('RoomRemote enterRoom: suspended');
        utils.cb(cb, cons.ResultCode.USER_SUSPENDED());
        return;
    }

    let bag = user.getComp('bag');

    if( params.enterDeposit &&
        !bag.haveEnoughItemBundle(params.enterDeposit.bundle, params.enterDeposit.count)) {
        utils.cbItemNotEnough(cb, _.first(params.enterDeposit.bundle));
        return;
    }

    utils.cbProm(cb, user.getComp('room').bind(params.session, params.enterDeposit, params.score));
};


Remote.prototype.inviteRoom = function(owner, users, room, cb) {
    let manager = UserManager.get();
    let roomSession = RoomSession.fromJson(room);
    owner = manager.getUserById(owner);
    users = _.map(users, (id) => manager.getUserById(id));
    users = _.compact(users);
    _.each(users, (user) => {
        user.sendRoomAction(roomSession.getGame(), cons.RoomAction.PLAYER_INVITE(), {
            userId: owner.getId(),
            nick: owner.getAttr('nick'),
            roomId: roomSession.getRoomId()
        });
    });
    utils.cb(cb);
};


Remote.prototype.leaveRoom = function(userId, deposit, cb) {
    let user = UserManager.get().getUserById(userId);
    utils.cbProm(cb, user.getComp('room').unbind());
};


Remote.prototype.changeScore = function(userId, count, exts, cb) {
    let user = UserManager.get().getUserById(userId);
    user.getComp('room').changeScore(count, exts);
    utils.cb(cb);
};

Remote.prototype.getUserState = function(userId, cb) {
    let user = UserManager.get().getUserById(userId);
    if (!user) {
        return utils.cbError(cb, 'no user:' + userId);
    }
    return utils.cbOK(cb, user.getState());
}


module.exports = (app) => new Remote(app);