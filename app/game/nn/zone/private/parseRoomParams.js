const cons = require('../../../../common/constants');
const nncons = require('../../common/constants');
const utils = require('../../../../utils/index');


/**
 * @api {request} zone.privateHandler.createRoom 创建房间
 * @params {number} baseScore 底分
 * @params {number} scoreMin 最低分
 */


/**
 * @api {request} zone.privateHandler.enterRoom 加入房间
 * @params {string} id 房间id
 */
module.exports = (session, params) => {
    let {baseScore, scoreMin} = params;
    if( !utils.isNumber(baseScore, 1) ||
        !utils.isNumber(scoreMin, 500)) {
        return [cons.ResultCode.ERROR()];
    }

    let roomParams = {
        bankerMode: nncons.BankerMode.ASK(),
        baseScore,
        canPlay: false,
        capacity: nncons.ROOM_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.NN(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: session.getUserId(),
        roundCost: 0,
        score: cons.Item.GOLD(),
        scoreMin,
        rounds: -1,
        timesMode: nncons.TimesMode.CRAZY(),
        type: cons.RoomType.PRIVATE()
    };
    return [null, roomParams];
};