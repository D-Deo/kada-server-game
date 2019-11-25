const lkpycons = require('../common/constants');
const Library = require('./library');
const _ = require('underscore');

class Fish {
    constructor(room, kind, path, shoal = false) {
        this.room = room;
        let stateManager = this.room.getComp('state');
        this.id = stateManager.getNextFishId();
        this.kind = kind;
        this.path = path;
        this.life = stateManager.library.getPathLength(this.path);
        this.score = stateManager.library.getFishScore(this.kind);
        this.birth = Date.now();
        this.dead = false;
        this.freezeCnt = 0; // 定身次数
        this.isFrozen = false;
        this.freezeMilliseconds = 0; // 冰冻时间(微秒)
        // 是否鱼阵
        this.shoal = shoal;
    }

    getId() {
        return this.id;
    }

    getKind() {
        return this.kind;
    }

    getPath() {
        return this.path;
    }

    getLife() {
        return this.life;
    }

    getBirth() {
        return this.birth;
    }

    getScore() {
        return this.score;
    }

    canChangeScore() {
        return this.kind == lkpycons.FISH_KIND_21();
    }

    addScore() {
        if (this.kind == lkpycons.FISH_KIND_21() && this.score < lkpycons.FISH_SCORE_21_MAX()) {
            return ++this.score;
        }

        return 0;
    }

    isDead() {
        if (this.dead) {
            return this.dead;
        }

        if (this.isFrozen) {
            return false;
        }

        if (!this.shoal && this.getAge() > this.life) {
            // 鱼阵不用判断生命周期
            this.dead = true;
        }

        return this.dead;
    }

    freeze() {
        if (!this.isFrozen) {
            this.freezeBegin = Date.now();
            this.isFrozen = true;
        }
    }

    unfreeze() {
        if (this.isFrozen) {
            this.freezeMilliseconds += (Date.now() - this.freezeBegin);
            this.isFrozen = false;
        }
    }

    getAge() {
        if (this.isFrozen) {
            return Math.ceil((this.freezeBegin - this.birth - this.freezeMilliseconds) / 1000 * 30);
        }
        return Math.ceil((Date.now() - this.birth - this.freezeMilliseconds) / 1000 * 30);
    }

    toJson() {
        let json = {};
        json.id = this.id;
        json.kind = this.kind;
        json.path = this.path.toJson();
        json.age = this.getAge();
        json.score = this.score;
        json.isFrozen = this.isFrozen;
        json.canChangeScore = this.canChangeScore();
        return json;
    }
}

module.exports = Fish;