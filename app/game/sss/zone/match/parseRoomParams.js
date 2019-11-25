const cons = require('../../../../common/constants');
const ssscons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        bankerMode: ssscons.BankerMode.ASK(),
        baseScore: area.getParam('baseScore') || 1,
        canPlay: false,
        standard: area.getParam('standard'),
        capacity: ssscons.ROOM_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.SSS(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: null,
        roundCost: area.getParam('roundCost') || 0,
        score: cons.Item.GOLD(),
        scoreMin: area.getParam('scoreMin'),
        scoreMax: 0,
        rounds: -1,
        type: cons.RoomType.MATCH()
    };
    return [null, roomParams];
};