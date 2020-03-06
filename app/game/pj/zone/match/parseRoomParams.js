const cons = require('../../../../common/constants');
const p9cons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        bankerMode: p9cons.BankerMode.ASK(),
        baseScore: area.getParam('baseScore') || 1,
        canPlay: false,
        standard: area.getParam('standard'),
        capacity: p9cons.ROOM_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.PJ(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: null,
        roundCost: area.getParam('roundCost') || 0,
        score: cons.Item.GOLD(),
        scoreMin: area.getParam('scoreMin'),
        scoreMax: area.getParam('scoreMax'),
        rounds: -1,
        type: cons.RoomType.MATCH()
    };
    return [null, roomParams];
};