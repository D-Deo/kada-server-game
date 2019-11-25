const cons = require('../common/constants');
const pomelo = require('pomelo');
const utils = require('../utils');


class Robot {
    static create(room, seat, user) {
        return new Robot(room, seat, user);
    }

    constructor(room, seat, user) {
        this.room = room;
        this.seat = seat;
        this.user = user;
        this.command = null;
    }

    action(msg) {
        this.room.getComp('controller').action(this.getId(), msg, (err, result) => {
            if (err) {
                console.error('Robot error:', this.room.getAttr('area'), this.room.getAttr('game'), this.room.getAttr('gameId'), this.room.getAttr('roomId'), err);
                return;
            }

            if (result.code != cons.ResultCode.OK().code) {
                console.error('Robot action:', this.room.getAttr('area'), this.room.getAttr('game'), this.room.getAttr('gameId'), this.room.getAttr('roomId'), msg, result);
            }
        });
    }

    clear() {
        pomelo.app.rpc.robot.robotRemote.releaseRobot(
            this.getId(),
            this.getId(),
            () => { }
        );

        this.room = null;
        this.seat = null;
        this.user = null;

        if (!this.command) {
            return;
        }
        this.command.clear();
        this.command = null;
    }

    leave() {
        this.room.getComp('seat').removeUser(this.getId(), cons.RoomClearReason.REQUEST());
    }

    getId() {
        return this.user.getId();
    }

    getSeat() {
        return this.seat;
    }

    getSeatIndex() {
        return this.seat ? this.seat.getIndex() : null;
    }

    onAction(name, msg) {
        let handler = 'onAction_' + name;
        if (!this[handler]) {
            return;
        }

        this[handler](msg);
    }

    runCommand(command) {
        if (this.command) {
            this.command.clear();
            this.command = null;
        }

        this.command = command;
        this.command.run();
    }
}


module.exports = Robot;