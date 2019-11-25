const Fish = require('./fish');
const cons = require('../../../common/constants');
const lkpycons = require('../common/constants');
const _ = require('underscore');
const fs = require('fs');
const uuid = require('uuid/v4');

class Library {
    constructor() {
        this.vPath = {};
    }

    getPathLength(path) {
        let key = path.kind;

        if (this.vPath[key] != null && this.vPath[key][path.id] != null) {
            return this.vPath[key][path.id];
        }

        let isShoal = false;

        let file = '';
        if (path.kind == lkpycons.PathKind.SPECIAL()) {
            file = './app/game/lkpy/path/special/' + path.id + '_new.json';
        }
        else if (path.kind == lkpycons.PathKind.SMALL()) {
            file = './app/game/lkpy/path/small/' + path.id + '_new.json';
        }
        else if (path.kind == lkpycons.PathKind.BIG()) {
            file = './app/game/lkpy/path/big/' + path.id + '_new.json';
        }
        else if (path.kind == lkpycons.PathKind.HUGE()) {
            file = './app/game/lkpy/path/huge/' + path.id + '_new.json';
        }
        else if (path.kind == lkpycons.PathKind.SHOAL_1()) {
            file = './app/game/lkpy/path/scene/scene_kind_1_trace_new.json';
            isShoal = true;
        }
        else if (path.kind == lkpycons.PathKind.SHOAL_2()) {
            file = './app/game/lkpy/path/scene/scene_kind_2_trace_new.json';
            isShoal = true;
        }
        else if (path.kind == lkpycons.PathKind.SHOAL_3()) {
            file = './app/game/lkpy/path/scene/scene_kind_3_trace_new.json';
            isShoal = true;
        }
        else if (path.kind == lkpycons.PathKind.SHOAL_4()) {
            file = './app/game/lkpy/path/scene/scene_kind_4_trace_new.json';
            isShoal = true;
        }
        else if (path.kind == lkpycons.PathKind.SHOAL_5()) {
            file = './app/game/lkpy/path/scene/scene_kind_5_trace_new.json';
            isShoal = true;
        }

        if (this.vPath[key] == null) {
            this.vPath[key] = {};
        }

        let result = JSON.parse(fs.readFileSync(file));

        if (!isShoal) {
            this.vPath[key][path.id] = result.x.length;
        }
        else {
            this.vPath[key] = _.map(result, r => {
                return r.x.length;
            });
        }

        return this.vPath[key][path.id];
    }

    getFishScore(fishKind) {
        switch (fishKind) {
            case lkpycons.FISH_KIND_1():
                return lkpycons.FISH_SCORE_1();
            case lkpycons.FISH_KIND_2():
                return lkpycons.FISH_SCORE_2();
            case lkpycons.FISH_KIND_3():
                return lkpycons.FISH_SCORE_3();
            case lkpycons.FISH_KIND_4():
                return lkpycons.FISH_SCORE_4();
            case lkpycons.FISH_KIND_5():
                return lkpycons.FISH_SCORE_5();
            case lkpycons.FISH_KIND_6():
                return lkpycons.FISH_SCORE_6();
            case lkpycons.FISH_KIND_7():
                return lkpycons.FISH_SCORE_7();
            case lkpycons.FISH_KIND_8():
                return lkpycons.FISH_SCORE_8();
            case lkpycons.FISH_KIND_9():
                return lkpycons.FISH_SCORE_9();
            case lkpycons.FISH_KIND_10():
                return lkpycons.FISH_SCORE_10();
            case lkpycons.FISH_KIND_11():
                return lkpycons.FISH_SCORE_11();
            case lkpycons.FISH_KIND_12():
                return lkpycons.FISH_SCORE_12();
            case lkpycons.FISH_KIND_13():
                return lkpycons.FISH_SCORE_13();
            case lkpycons.FISH_KIND_14():
                return lkpycons.FISH_SCORE_14();
            case lkpycons.FISH_KIND_15():
                return lkpycons.FISH_SCORE_15();
            case lkpycons.FISH_KIND_16():
                return lkpycons.FISH_SCORE_16();
            case lkpycons.FISH_KIND_17():
                return lkpycons.FISH_SCORE_17();
            case lkpycons.FISH_KIND_18():
                return _.random(lkpycons.FISH_SCORE_18(), lkpycons.FISH_SCORE_18_MAX());
            case lkpycons.FISH_KIND_19():
                return _.random(lkpycons.FISH_SCORE_19(), lkpycons.FISH_SCORE_19_MAX());
            case lkpycons.FISH_KIND_20():
                return lkpycons.FISH_SCORE_20();
            case lkpycons.FISH_KIND_21():
                return _.random(lkpycons.FISH_SCORE_21(), lkpycons.FISH_SCORE_21_MAX());
            case lkpycons.FISH_KIND_22():
                return lkpycons.FISH_SCORE_22();
            case lkpycons.FISH_KIND_23():
                return lkpycons.FISH_SCORE_23();
            case lkpycons.FISH_KIND_24():
                return lkpycons.FISH_SCORE_24();
            case lkpycons.FISH_KIND_25():
                return lkpycons.FISH_SCORE_25();
            case lkpycons.FISH_KIND_26():
                return lkpycons.FISH_SCORE_26();
            case lkpycons.FISH_KIND_27():
                return lkpycons.FISH_SCORE_27();
            case lkpycons.FISH_KIND_28():
                return lkpycons.FISH_SCORE_28();
            case lkpycons.FISH_KIND_29():
                return lkpycons.FISH_SCORE_29();
            case lkpycons.FISH_KIND_30():
                return lkpycons.FISH_SCORE_30();
            case lkpycons.FISH_KIND_31():
                return lkpycons.FISH_SCORE_31();
            case lkpycons.FISH_KIND_32():
                return lkpycons.FISH_SCORE_32();
            case lkpycons.FISH_KIND_33():
                return lkpycons.FISH_SCORE_33();
            case lkpycons.FISH_KIND_34():
                return lkpycons.FISH_SCORE_34();
            case lkpycons.FISH_KIND_35():
                return lkpycons.FISH_SCORE_35();
            case lkpycons.FISH_KIND_36():
                return lkpycons.FISH_SCORE_36();
            case lkpycons.FISH_KIND_37():
                return lkpycons.FISH_SCORE_37();
            case lkpycons.FISH_KIND_38():
                return lkpycons.FISH_SCORE_38();
            case lkpycons.FISH_KIND_39():
                return lkpycons.FISH_SCORE_39();
            case lkpycons.FISH_KIND_40():
                return lkpycons.FISH_SCORE_40();
        }

        return 0;
    }

    setRoomUUID(room) {
        room.setAttr('gameId', uuid());
    }
}

module.exports = Library;