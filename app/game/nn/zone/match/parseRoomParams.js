const cons = require('../../../../common/constants');
const nncons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        bankerMode: nncons.BankerMode.ASK(),
        baseScore: area.getParam('baseScore') || 1,
        canPlay: false,
        standard: area.getParam('standard'),
        capacity: nncons.ROOM_CAPACITY(),
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        game: cons.Game.NN(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        owner: null,
        roundCost: area.getParam('roundCost') || 0,
        score: cons.Item.GOLD(),
        scoreMin: area.getParam('scoreMin'),
        scoreMax: area.getParam('scoreMax'),
        rounds: -1,
        timesMode: nncons.TimesMode.CRAZY(),
        type: cons.RoomType.MATCH(),
        free: area.getParam('free'),
    };
    return [null, roomParams];
};