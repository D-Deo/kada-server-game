const RobotManager = require('../../../robot/manager');
const utils = require('../../../utils');
const _ = require('underscore');

function Remote(app) {
    this.app = app;
}

Remote.prototype.requireRobot = function(room, score, cb) {
    let robot = RobotManager.getInstance().requireRobot();
    if(!robot) {
        utils.cbOK(cb);
        return;
    }

    robot.require();
    robot.getComp('bag').resetItems(score, room)
    .then(() => robot.getComp('zone').enterRoom(room.game, room.id))
    .catch(() => robot.release());
    utils.cbOK(cb);
};

Remote.prototype.releaseRobot = (id, cb) => {
    let robot = RobotManager.getInstance().getRobot(id);
    robot.release();
    utils.cbOK(cb);
};

module.exports = (app) => new Remote(app);