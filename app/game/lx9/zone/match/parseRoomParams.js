const cons = require('../../../../common/constants');
const lx9cons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        baseScore: area.getParam('baseScore') || 1,
        canPlay: false,
        capacity: area.getParam('capacity'),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.LX9(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: null,
        roundCost: area.getParam('roundCost') || 0,
        score: cons.Item.GOLD(),
        scoreMin: area.getParam('scoreMin'),
        scoreMax: area.getParam('scoreMax'),
        betOptions: area.getParam('betOptions'),
        rounds: -1,
        type: cons.RoomType.MATCH()
    };
    return [null, roomParams];
};