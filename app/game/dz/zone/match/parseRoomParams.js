const cons = require('../../../../common/constants');
const dzcons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        baseScore: area.getParam('baseScore') || 1,
        canPlay: false,
        capacity: dzcons.ROOM_CAPACITY(),
        capacityMin: dzcons.PLAY_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.DZ(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: null,
        roundCost: area.getParam('roundCost') || 0,
        score: cons.Item.GOLD(),
        scoreMin: area.getParam('scoreMin'),
        scoreMax: area.getParam('scoreMax'),
        rounds: -1,
        type: cons.RoomType.MATCH(),
        free: area.getParam('free'),
    };
    return [null, roomParams];
};