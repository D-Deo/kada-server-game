const dzcons = require("../common/constants");
const _ = require('underscore');


class Formation {
    static create(type, groups) {
        return new Formation(type, groups);
    }

    static max(formations) {
        if (_.isEmpty(formations)) {
            return null;
        }

        let index = 0;
        let iterator = _.first(formations);
        for (let i = 1; i < formations.length; ++i) {
            if (formations[i].compare(iterator) <= 0) {
                continue;
            }

            index = i;
            iterator = formations[i];
        }
        return index;
    }

    static winners(formations) {
        let max = Formation.max(formations);
        if (max === null) {
            return [];
        }

        let winners = _.map(formations, (f, i) => (f.compare(formations[max]) === 0) ? i : -1);
        //reject返回不满足 函数筛选条件 的值 即 w > 0
        return _.reject(winners, w => w < 0);
    }

    constructor(type, groups) {
        this.type = type;
        this.groups = groups;
    }

    getType() {
        return this.type;
    }

    getValue() {
        return _.first(this.groups).getValue();
    }

    getGroups() {
        return this.groups;
    }

    compare(f) {
        if (this.type > f.getType()) {
            return 1;
        }

        if (this.type < f.getType()) {
            return -1;
        }

        for (let i = this.groups.length - 1; i >= 0; --i) {
            let v1 = this.groups[i].getValue();
            let v2 = f.groups[i].getValue();
            if (v1 > v2) {
                return 1;
            }

            if (v1 < v2) {
                return -1;
            }
        }

        return 0;
    }

    toJson() {
        let json = {};
        json.type = this.type;
        json.groups = _.map(this.groups, g => g.toJson());
        return json;
    }

    /**
     * 打印卡组类型
     */
    __print() {
        let s = '垃圾';
        switch (this.type) {
            case dzcons.Formation.NONE():
                s = '高牌';
                break;
            case dzcons.Formation.HIGH():
                s = '高牌';
                break;
            case dzcons.Formation.PAIR():
                s = '对子';
                break;
            case dzcons.Formation.TWO_PAIR():
                s = '两队';
                break;
            case dzcons.Formation.TRIPLE():
                s = '三条';
                break;
            case dzcons.Formation.SEQUENCE():
                s = '顺子';
                break;
            case dzcons.Formation.SUIT():
                s = '同花';
                break;
            case dzcons.Formation.TRIPLE_PAIR():
                s = '三条';
                break;
            case dzcons.Formation.BOMB():
                s = '四条';
                break;
            case dzcons.Formation.SUIT_SEQUENCE():
                s = '同花顺';
                break;
            case dzcons.Formation.SUIT_SEQUENCE_ACE():
                s = '同花大顺';
                break;
        }
        return s;
    }
}


module.exports = Formation;