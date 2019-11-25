const cons = require('../common/constants');
const pomelo = require('pomelo');


class Bag {
    constructor(robot) {
        this.robot = robot;
    }

    resetItems(items, room) {
        let exts = {
            game: room.game,
            from: room.uuid,
            reason: cons.ItemChangeReason.ROBOT_RESET()
        };
        return new Promise((rs, rj) => {
            pomelo.app.rpc.user.itemRemote.resetItems(
                this.robot.getId(),
                this.robot.getId(),
                items,
                exts,
                (err) => err ? rj(err) : rs()
            );
        });
    }
}


module.exports = Bag;