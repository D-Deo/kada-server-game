const cons = require('../../../../common/constants');
const lkpycons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        canPlay: false,
        capacity: lkpycons.ROOM_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        owner: null,
        rounds: -1,
        game: cons.Game.LKPY(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        type: cons.RoomType.MATCH(),
        score: cons.Item.GOLD(),
        baseScore: area.getParam('baseScore') || 1,
        roundCost: area.getParam('roundCost') || 0,
        scoreMin: area.getParam('scoreMin'),
        scoreMax: area.getParam('scoreMax'),
        betOptions: area.getParam('betOptions'),
        free: area.getParam('free')
    };
    return [null, roomParams];
};