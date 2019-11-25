const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const ddzutils = require('../../poker/utils');
const Super = require('../../../../room/state');
const utils = require('../../../../utils');


class PlayState extends Super {
    constructor(room) {
        super(room, ddzcons.RoomState.PLAY());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');

        let banker = stateManager.getBankerSeat();
        banker.dealBottom(stateManager.getBottomCards());
        //banker.sendAction(cons.RoomAction.PLAYER_MING_NOTICE());
        stateManager.createTurn(ddzcons.Turn.MING(), banker, null);
        //stateManager.createTurn(ddzcons.Turn.PLAY(), banker, null);
        let isRobot = banker.isRobot() ? '机器人' : '玩家';
        this.logger.debug('房间', this.room.getAttr('id'), '庄家', banker.getIndex(), isRobot, banker.getUser().getAttr('id'),
            '手牌', ddzutils.printCards(banker.getCards()));
    }

    toJson() {
        let json = super.toJson();
        return json;
    }
}

module.exports = PlayState;