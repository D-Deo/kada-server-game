const lkpycons = require('../common/constants');
const Library = require('./library');
const _ = require('underscore');

class Bullet {
    constructor(seat, id, kind, mulriple, angle, lockFishId) {
        this.seat = seat;
        this.id = id;
        this.kind = kind;
        this.mulriple = mulriple;
        this.angle = angle;
        this.lockFishId = lockFishId;
    }

    getId() {
        return this.id;
    }

    getKind() {
        return this.kind;
    }

    getAngle() {
        return this.angle;
    }

    getMulriple() {
        return this.mulriple;
    }

    isCannon() {
        return this.kind == lkpycons.BULLET_CANNON();
    }

    toJson() {
        let json = {};
        json.seat = this.seat.index;
        json.id = this.id;
        json.kind = this.kind;
        json.mulriple = this.mulriple;
        json.angle = this.angle;
        json.lockFishId = this.lockFishId;
        return json;
    }
}

module.exports = Bullet;