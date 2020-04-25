const cons = require('../../../../common/constants');
const ssscons = require('../../common/constants');
const utils = require('../../../../utils/index');
const _ = require('underscore');

/**
 * @api {request} zone.privateHandler.createRoom 创建房间
 * @param {number} baseScore 底分
 * @param {number} scoreMin 最低分
 */


/**
 * @api {request} zone.privateHandler.enterRoom 加入房间
 * @param {string} id 房间id
 * @param {number} capacity 房间人数 2 3 4 5
 * @param {number} rounds 局数 8 16 24
 * @param {number} aa AA(1) 房主支付(0)
 * @param {boolean} touSan
 * @param {number} kings
 * @param {boolean} addSuits 加色
 * @param {boolean} flyCard
 */

module.exports = (session, params) => {
    if (!utils.isNumber(params.capacity, 0, 6)) {
        return [cons.ResultCode.ERROR()];
    }

    if (!utils.isNumber(params.rounds, 1)) {
        return [cons.ResultCode.ERROR()];
    }

    // params.rounds = 2;

    // 如果是不固定人数或者6人场以上，必须加两色（黑桃，红桃）
    if (params.capacity == 0 || params.capacity >= 6) {
        params.addSuits = 2;
    } else if (params.capacity == 5) {  // 如果是5人场，必须至少加1色
        params.addSuits = params.addSuits > 1 ? params.addSuits : 1;
    }

    // 不固定场的话，最小2人，最多6人
    if (params.capacity == 0) {
        // params.capacityMin = 2;
        params.capacity = 6;
        // params.aa = 1;
    }

    params.capacityMin = 2;
    params.aa = 1;

    let scoreMin = Math.floor(params.rounds / 5);
    // 如果不是aa，房主一人承担
    if (params.aa != 1) {
        scoreMin *= params.capacity
    }

    let roomParams = {
        baseScore: 1,
        canPlay: false,
        createDeposit: null,
        enterDeposit: null,
        dismissable: true,
        game: cons.Game.SSS(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: session.getUserId(),
        roundCost: 0,
        type: cons.RoomType.PRIVATE(),
        score: cons.Item.DIAMOND(),
        scoreMin: scoreMin,
        scoreBack: 10,
        scoreCut: 2,
        capacity: params.capacity,                      //人数
        capacityMin: params.capacityMin,                //最小支持人数
        rounds: params.rounds,                          //局数
        aa: params.aa == 1,                             //房费
        touSan: params.touSan,                          //三条冲出算
        kings: params.kings ? params.kings : 2,         //几张王
        addSuits: params.addSuits,                      //加色
        flyCard: params.flyCard,                        //马牌花色 [1]黑桃A [2]红桃A
        send: params.send                               //发牌模式
    };

    return [null, roomParams];
};