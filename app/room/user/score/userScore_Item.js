const cons = require('../../../common/constants');
const pomelo = require('pomelo');
const Super = require('./userScore');


class UserScore_Item extends Super {
    static create(room, user, id, count) {
        return new UserScore_Item(room, user, id, count);
    }

    constructor(room, user, id, count) {
        super(room, user, count);

        this.id = id;
    }

    change(value, reason = null) {
        if ((value < 0) && !this.have(-value)) {
            value = -this.count;
        }

        if (!this.user.isRobot()) {
            let exts = { game: this.room.getAttr('game'), from: this.room.getAttr('gameId'), reason: reason || cons.ItemChangeReason.PLAY() };
            pomelo.app.rpc.user.roomRemote.changeScore(
                this.user.getId(),
                this.user.getId(),
                value,
                exts,
                () => { }
            );
        }

        return super.change(value);
    }

    have(count) {
        return this.get() >= count;
    }
}


module.exports = UserScore_Item;