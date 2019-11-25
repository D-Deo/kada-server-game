const cons = require('../../../../common/constants');
const brnncons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        created: area.getParam('created'),
        baseScore: area.getParam('baseScore') || 1,
        standard: area.getParam('standard'),
        canPlay: false,
        capacity: brnncons.ROOM_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.BRNN(),
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
        type: cons.RoomType.MATCH(),
        baseMulti: area.getParam('baseMulti'),
    };
    return [null, roomParams];
};