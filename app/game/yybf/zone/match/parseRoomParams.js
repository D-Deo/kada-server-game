const cons = require('../../../../common/constants');
const yybfcons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        created: area.getParam('created'),
        baseScore: area.getParam('baseScore') || 1,
        canPlay: false,
        capacity: yybfcons.ROOM_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.YYBF(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: null,
        roundCost: area.getParam('roundCost') || 0,
        score: cons.Item.GOLD(),
        scoreMin: area.getParam('scoreMin'),
        betOptions: area.getParam('betOptions'),
        rounds: -1,
        type: cons.RoomType.MATCH()
    };
    return [null, roomParams];
};