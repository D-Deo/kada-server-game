const cons = require('../../../../common/constants');
const bjlcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const Group = require('../../poker/group');
const _ = require('underscore');

class OpeningState extends Super {
    constructor(room) {
        super(room, bjlcons.RoomState.OPENING(), bjlcons.RoomStateInterval.OPENING());
    }

    enter() {
        super.enter();

        let stateMgr = this.room.getComp('state');
        let openCards = stateMgr.getOpenCards();
        let roadList = stateMgr.getRoadList();
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_DEAL(), { cards: openCards, road: roadList[0] });
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(bjlcons.RoomState.RESULT());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = OpeningState;