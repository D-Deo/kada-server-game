const cons = require('../../../../common/constants');
const zjhcons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        baseScore: area.getParam('baseScore') || 1,
        canPlay: false,
        capacity: zjhcons.ROOM_CAPACITY(),
        capacityMin: zjhcons.PLAY_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.ZJH(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: null,
        roundCost: area.getParam('roundCost') || 0,
        score: cons.Item.GOLD(),
        scoreMin: area.getParam('scoreMin'),
        scoreMax: area.getParam('scoreMax'),
        rounds: -1,
        roundMax: area.getParam('roundMax'),
        betOptions: area.getParam('betOptions'),
        type: cons.RoomType.MATCH(),
        lookTurn: area.getParam('lookTurn'),
        free: area.getParam('free'),
    };
    return [null, roomParams];
};