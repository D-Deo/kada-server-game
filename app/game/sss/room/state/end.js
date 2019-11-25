const ssscons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');

class EndState extends Super {
    constructor(room) {
        super(room, ssscons.RoomState.END()); //ssscons.RoomStateInterval.END()
    }

    enter() {
        // super.enter();
        this.room.getComp('round').end(false);
    }

    // end() {
    //     super.end();
    // }

    toJson() {
        let json = super.toJson();
        json.results = this.room.getComp('state').getResults();
        return json;
    }
}

module.exports = EndState;