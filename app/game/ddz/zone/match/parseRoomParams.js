const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');


module.exports = (area) => {
    let roomParams = {
        area: area.getId(),
        canPlay: false,
        createDeposit: null,
        enterDeposit: null,
        dismissable: false,
        owner: null,
        rounds: -1,
        game: cons.Game.DDZ(),
        mode: cons.RoomMode.PRIVATE_SELF(),
        type: cons.RoomType.MATCH(),
        score: cons.Item.GOLD(),
        wash: area.getParam('wash') || false,
        baseScore: area.getParam('baseScore') || 1,
        scoreMin: area.getParam('scoreMin'),
        scoreMax: area.getParam('scoreMax'),
        capacity: area.getParam('capacity') || 3,
        standard: area.getParam('standard'),
        blacklist: area.getParam('blacklist'),
        roundCost: area.getParam('roundCost') || 0,
        free: area.getParam('free')
    };
    return [null, roomParams];
};