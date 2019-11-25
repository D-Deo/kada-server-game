const pomelo = require('pomelo');
const UserSession = require('../session/userSession');


class Zone {
    constructor(robot) {
        this.robot = robot;
    }

    enterRoom(game, roomId) {
        return new Promise((rs, rj) => {
            pomelo.app.rpc.zone.roomRemote.enterRoom(
                game,
                game,
                roomId,
                UserSession.createRobot(this.robot.getId(), game),
                (err) => err ? rj(err) : rs()
            );
        });
    }
}


module.exports = Zone;