const cons = require('../../../../common/constants');
const ermjcons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        baseScore: area.getParam('baseScore') || 1,
        canPlay: false,
        capacity: ermjcons.ROOM_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.ERMJ(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: null,
        roundCost: area.getParam('roundCost') || 0,
        score: cons.Item.GOLD(),
        scoreMin: area.getParam('scoreMin'),
        scoreMax: area.getParam('scoreMax'),
        bankerLimit: area.getParam('bankerLimit'),
        bankerCount: area.getParam('bankerCount'),
        betOptions: area.getParam('betOptions'),
        rounds: -1,
        type: cons.RoomType.MATCH()
    };
    return [null, roomParams];
};