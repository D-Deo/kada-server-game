const cons = require('../../../../common/constants');
const zjhcons = require('../../common/constants');
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
        !utils.isNumber(scoreMin, baseScore * 2)) {
        return [cons.ResultCode.ERROR()];
    }

    let roomParams = {
        baseScore,
        canPlay: false,
        capacity: zjhcons.ROOM_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.ZJH(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: session.getUserId(),
        roundCost: 0,
        score: cons.Item.GOLD(),
        scoreMin,
        rounds: -1,
        betOption : [],
        type: cons.RoomType.PRIVATE()
    };
    return [null, roomParams];
};