const cons = require('../common/constants');
const Component = require('./component');
const GameManager = require('../game/manager');
const pomelo = require('pomelo');
const RobotReleaser = require('./robotReleaser');
const RobotRequirer = require('./robotRequirer');
const _ = require('underscore');


class RobotManager extends Component {
    constructor(room) {
        super(room);

        this.robots = {};
        this.releasers = [];
        this.requirers = [];
    }

    clear() {
        super.clear();

        _.each(this.robots, r => r.clear());
        _.each(this.releasers, r => r.clear());
        _.each(this.requirers, r => r.clear());
        this.robots = {};
        this.releasers = [];
        this.requirers = [];
    }

    init() {
        super.init();

        this.room.on(cons.RoomEvent.ROOM_ACTION(), this.onAction.bind(this));
        this.room.on(cons.RoomEvent.SEAT_ADD_PLAYER(), this.onSeatAddPlayer.bind(this));
        this.room.on(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer.bind(this));
    }

    addRobot(r) {
        this.robots[r.getId()] = r;
    }

    clearRobots() {
        _.each(this.robots, r => r.leave());
    }

    getRobot(id) {
        return this.robots[id];
    }

    getRobots() {
        return this.robots;
    }

    requireRobot(score) {
        pomelo.app.rpc.robot.robotRemote.requireRobot(
            this.room.getGame(),
            this.room.toJson_Robot(),
            // this.room.getGame(),
            // this.room.getAttr('id'),
            score,
            () => { }
        );
    }

    removeRobot(id) {
        let robot = this.robots[id];
        robot.clear();
        delete this.robots[id];
    }

    scheduleRelease(id, delay) {
        this.releasers.push(RobotReleaser.create(this.room, id, delay));
    }

    unscheduleRelease(r) {
        this.releasers = _.without(this.releasers, r);
    }

    scheduleRequire(score, delay) {
        this.requirers.push(RobotRequirer.create(this.room, score, delay));
    }

    unscheduleRequire(r) {
        this.requirers = _.without(this.requirers, r);
    }

    onAction(name, msg) {
        _.each(this.robots, r => r.onAction(name, msg));
    }

    onSeatAddPlayer(seat, user) {
        if (!user.isRobot()) {
            return;
        }

        let robot = GameManager.getInstance().new3(this.room.getGame(), 'room.robot', this.room, seat, user);
        this.addRobot(robot);
    }

    onSeatRemovePlayer(seat, user) {
        if (!user.isRobot()) {
            return;
        }

        this.removeRobot(user.getId());
    }
}


module.exports = RobotManager;