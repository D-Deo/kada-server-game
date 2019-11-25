const _ = require('underscore');
const mjcons = require('../majong/majongConstants');
const mjutils = require('../majong/utils');

global.rulesArray = {};
let rule = {};

class Rule {
    constructor(type, fan) {
        this.type = type;
        this.fan = fan;
        this.ignore = [];
    }

    contain(arr1, arr2, strict = false) {
        if (arr1.length < arr1.length) {
            return false;
        }

        if (!strict) {
            arr1 = _.uniq(arr1);
            arr2 = _.uniq(arr2);

            return _.union(arr1, arr2).length == arr1.length;
        }

        if (arr1.length < arr2.length) {
            return false;
        }

        let newArr1 = [...arr1];

        for (let i = 0; i < arr2.length; i++) {
            let index = newArr1.findIndex(o => o == arr2[i]);
            if (index == -1) {
                return false;
            }

            newArr1.splice(index, 1);
        }

        return true;
    }

    toJson() {
        let json = {};
        json.type = this.type;
        json.fan = this.fan;

        return json;
    }
}

// 1、
class DsxRule extends Rule {
    constructor() {
        super('大四喜', 88);
        this.ignore = ['碰碰胡', '大三风', '小三风', '四字刻', '混一色'];
    }

    check(fmt, jiang, seqArray, triArray) {
        if (jiang.length == 0 || triArray.length < 4) {
            return 0;
        }

        return _.filter(triArray, tri => tri.getFirst().isWind() && !tri.getFirst().isArrow()).length == 4 ? 1 : 0;
    }
}

rule = new DsxRule();
global.rulesArray[rule.type] = rule;

// 2、
class DsyRule extends Rule {
    constructor() {
        super('大三元', 88);
        this.ignore = ['双箭刻', '箭刻'];
    }

    check(fmt, jiang, seqArray, triArray) {
        if (jiang.length == 0 || triArray.length < 3) {
            return 0;
        }

        return _.filter(triArray, tri => tri.getFirst().isArrow()).length == 3 ? 1 : 0;
    }
}

rule = new DsyRule();
global.rulesArray[rule.type] = rule;

// 3、
class JlbdRule extends Rule {
    constructor() {
        super('九莲宝灯', 88);
        this.ignore = ['清一色', '门前清', '自摸'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length > 0 || cards[0].isWind()) {
            return 0;
        }

        if (!mjutils.sameSuit(...cards)) {
            return 0;
        }

        let array = _.map(cards, v => v.getCH()[0]);
        return this.contain(array, ['一', '一', '一', '二', '三', '四', '五', '六', '七', '八', '九', '九', '九'], true) ? 1 : 0;
    }
}

rule = new JlbdRule();
global.rulesArray[rule.type] = rule;

// 4、
class SgzRule extends Rule {
    constructor() {
        super('四杠子', 88);
        this.ignore = ['三杠', '双暗杠', '暗杠', '双明杠', '明杠', '单钓将', '碰碰胡'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return _.filter(triArray, v => v.type == mjcons.barType.QUAD() || v.type == mjcons.barType.MINGQUAD()).length == 4 ? 1 : 0;
    }
}

rule = new SgzRule();
global.rulesArray[rule.type] = rule;

// 5、
class LqdRule extends Rule {
    constructor() {
        super('连七对', 88);
        this.ignore = ['七对', '单钓将', '门前清', '清一色'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.count > 0 || cards.length != 14 || mjutils.getPairCount(cards) != 7) {
            return 0;
        }

        if (cards[0].isWind() || !mjutils.sameSuit(...cards)) {
            return 0;
        }

        let array = [...cards];
        mjutils.sortCards(array);

        // 判断是否连对
        return mjutils.isStraight(array[0], array[2], array[4], array[6], array[8], array[10], array[12]) ? 1 : 0;
    }
}

rule = new LqdRule();
global.rulesArray[rule.type] = rule;

// 6、
class TianHuRule extends Rule {
    constructor() {
        super('天胡', 88);
        this.ignore = ['边张', '坎张', '单钓将', '不求人', '门前清', '自摸'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new TianHuRule();
global.rulesArray[rule.type] = rule;

// 7、
class DiHuRule extends Rule {
    constructor() {
        super('地胡', 88);
        this.ignore = ['单钓将', '边张', '坎张', '门前清'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new DiHuRule();
global.rulesArray[rule.type] = rule;

// 8、
class XsxRule extends Rule {
    constructor() {
        super('小四喜', 64);
        this.ignore = ['大三风', '小三风', '混一色', '幺九刻'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0 || triArray.length < 3) {
            return 0;
        }

        if (!jiang[0].isWind() || jiang[0].isArrow()) {
            return 0;
        }

        let cnt = _.reduce(triArray, (count, v) => {
            if (v.getFirst().isWind() && !v.getFirst().isArrow()) {
                return count + 1;
            }

            return count;
        }, 0);

        return cnt == 3 ? 1 : 0;
    }
}

rule = new XsxRule();
global.rulesArray[rule.type] = rule;

// 9、
class XsyRule extends Rule {
    constructor() {
        super('小三元', 64);
        this.ignore = ['双箭刻', '箭刻', '混一色', '幺九刻'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0 || triArray.length < 2) {
            return 0;
        }

        if (!jiang[0].isArrow()) {
            return 0;
        }

        let cnt = _.reduce(triArray, (count, v) => {
            if (v.getFirst().isArrow()) {
                return count + 1;
            }

            return count;
        }, 0);

        return cnt == 2 ? 1 : 0;
    }
}

rule = new XsyRule();
global.rulesArray[rule.type] = rule;

// 10
class SiAnKeHuRule extends Rule {
    constructor() {
        super('四暗刻', 64);
        this.ignore = ['三暗刻', '双暗刻', '门前清', '碰碰胡'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (triArray.length < 4) {
            return 0;
        }

        return _.filter(triArray, o => o.id == -1 || o.type == mjcons.barType.QUAD()).length == 4 ? 1 : 0;
    }
}

rule = new SiAnKeHuRule();
global.rulesArray[rule.type] = rule;


// 11、
class SlhRule extends Rule {
    constructor() {
        super('双龙会', 64);
        this.ignore = ['一般高', '七对', '清一色', '老少副', '平胡'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.count > 0 || cards.length != 14 || mjutils.getPairCount(cards) != 7) {
            return 0;
        }

        if (cards[0].isWind() || !mjutils.sameSuit(...cards)) {
            return 0;
        }

        let array = [...cards];
        mjutils.sortCards(array);

        // 判断是否连对
        return cards[0].point == 1
            && cards[2].point == 2
            && cards[4].point == 3
            && cards[6].point == 5
            && cards[8].point == 7
            && cards[10].point == 8
            && cards[12].point == 9;
    }
}

rule = new SlhRule();
global.rulesArray[rule.type] = rule;

// 12
class ZysRule extends Rule {
    constructor() {
        super('字一色', 64);
        this.ignore = ['碰碰胡', '全带幺', '幺九刻', '四字刻'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return _.every(cards, o => o.isWind());
        }

        if (!_.every(jiang, o => o.isWind())) {
            return 0;
        }

        if (seqArray.length > 0 && !_.every(seqArray, o => o.getFirst().isWind())) {
            return 0;
        }

        if (triArray.length > 0 && !_.every(triArray, o => o.getFirst().isWind())) {
            return 0;
        }

        return 1;
    }
}

rule = new ZysRule();
global.rulesArray[rule.type] = rule;

// 13
class RenHuRule extends Rule {
    constructor() {
        super('人胡', 64);
        this.ignore = ['单钓将', '边张', '坎张', '门前清'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new RenHuRule();
global.rulesArray[rule.type] = rule;

// 14
class StsRule extends Rule {
    constructor() {
        super('四同顺', 48);
        this.ignore = ['三连刻', '三同顺', '四归一', '一般高'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (seqArray.length < 4) {
            return 0;
        }

        if (!mjutils.sameSuit(seqArray[0].getFirst(), seqArray[1].getFirst(), seqArray[2].getFirst(), seqArray[3].getFirst())) {
            return 0;
        }

        if (seqArray[0].getFirst().point == seqArray[1].getFirst().point
            && seqArray[0].getFirst().point == seqArray[2].getFirst().point
            && seqArray[0].getFirst().point == seqArray[3].getFirst().point) {
            return 1;
        }
        return 0;
    }
}

rule = new StsRule();
global.rulesArray[rule.type] = rule;

// 15
class SyqdRule extends Rule {
    constructor() {
        super('三元七对', 48);
        this.ignore = ['七对', '门前清', '单钓将', '自摸'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.count > 0 || mjutils.getPairCount(cards) != 7) {
            return 0;
        }

        let array = _.uniq(cards, false, c => c.suit * 10 + c.point);;
        return _.filter(array, v => v.isArrow()).length == 3 ? 1 : 0;
    }
}

rule = new SyqdRule();
global.rulesArray[rule.type] = rule;

// 16
class SxqdRule extends Rule {
    constructor() {
        super('四喜七对', 48);
        this.ignore = ['七对', '门前清', '单钓将', '自摸'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.count > 0 || mjutils.getPairCount(cards) != 7) {
            return 0;
        }

        let array = _.uniq(cards, false, c => c.suit * 10 + c.point);
        return _.filter(array, v => v.isWind() && !v.isArrow()).length == 4 ? 1 : 0;
    }
}

rule = new SxqdRule();
global.rulesArray[rule.type] = rule;

// 17
class SlkRule extends Rule {
    constructor() {
        super('四连刻', 48);
        this.ignore = ['三连刻', '三同顺', '碰碰胡', '一般高'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0 || triArray.length < 4) {
            return 0;
        }

        return mjutils.isStraight(..._.map(triArray, o => o.getFirst())) ? 1 : 0;
    }
}

rule = new SlkRule();
global.rulesArray[rule.type] = rule;

// 18
class SbgRule extends Rule {
    constructor() {
        super('四步高', 32);
        this.ignore = ['三步高', '连六', '老少副'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (seqArray.length < 4) {
            return 0;
        }

        let array = _.map(seqArray, o => o.getFirst());
        mjutils.sortCards(array);
        let step = mjutils.getStep(array[0], array[1], array[2], array[3]);
        return step == 1 || step == 2 ? 1 : 0;
    }
}

rule = new SbgRule();
global.rulesArray[rule.type] = rule;

// 19
class HjyRule extends Rule {
    constructor() {
        super('混幺九', 32);
        this.ignore = ['碰碰胡', '幺九刻', '全带幺'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return 0;
        }

        if (!jiang[0].is19()) {
            return 0;
        }

        if (seqArray.length > 0) {
            return 0;
        }

        return _.every(triArray, (tri) => tri.getFirst().is19()) ? 1 : 0;
    }
}

rule = new HjyRule();
global.rulesArray[rule.type] = rule;

// 20
class SanGangRule extends Rule {
    constructor() {
        super('三杠', 32);
        this.ignore = ['碰碰胡', '幺九刻', '全带幺', '双暗杠', '暗杠', '双明杠', '明杠'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return _.filter(triArray, v => v.type == mjcons.barType.QUAD() || v.type == mjcons.barType.MINGQUAD()).length == 3 ? 1 : 0;
    }
}

rule = new SanGangRule();
global.rulesArray[rule.type] = rule;

// 21
class TianTingRule extends Rule {
    constructor() {
        super('天听', 32);
        this.ignore = [''];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new TianTingRule();
global.rulesArray[rule.type] = rule;

// 22
class SzkRule extends Rule {
    constructor() {
        super('四字刻', 24);
        this.ignore = ['碰碰胡'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (triArray.length == 4 &&
            triArray[0].getFirst().isWind() &&
            triArray[1].getFirst().isWind() &&
            triArray[2].getFirst().isWind() &&
            triArray[3].getFirst().isWind()) {
            return 1;
        }
        return 0;
    }
}

rule = new SzkRule();
global.rulesArray[rule.type] = rule;

// 23
class DsfRule extends Rule {
    constructor() {
        super('大三风', 24);
        this.ignore = ['小三风'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        let cnt = _.reduce(triArray, (count, v) => {
            if (v.getFirst().isWind() && !v.getFirst().isArrow()) {
                return count + 1;
            }

            return count;
        }, 0);

        return cnt == 3 ? 1 : 0;
    }
}

rule = new DsfRule();
global.rulesArray[rule.type] = rule;

// 24
class SanTongShunRule extends Rule {
    constructor() {
        super('三同顺', 24);
        this.ignore = ['三连刻', '一般高'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (seqArray.length < 3) {
            return 0;
        }

        let array = _.map(seqArray, o => o.getFirst());
        mjutils.sortCards(array);

        if (mjutils.isEqual(array[0], array[1], array[2])) {
            return 1;
        }

        if (array.length > 3 && mjutils.isEqual(array[1], array[2], array[3])) {
            return 1;
        }

        return 0;
    }
}

rule = new SanTongShunRule();
global.rulesArray[rule.type] = rule;


// 25
class QiDuiRule extends Rule {
    constructor() {
        super('七对', 24);
        this.ignore = ['门前清', '单钓将', '自摸'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length > 0 || cards.length != mjcons.cardsPerPlayer() + 1 || mjutils.getPairCount(cards) != 7) {
            return 0;
        }

        return 1;
    }
}

rule = new QiDuiRule();
global.rulesArray[rule.type] = rule;

// 26
class SanLianKeRule extends Rule {
    constructor() {
        super('三连刻', 24);
        this.ignore = ['三同顺', '一般高'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return 0;
        }

        if (triArray.length < 3) {
            return 0;
        }

        let array = _.map(triArray, o => o.getFirst());
        mjutils.sortCards(array);

        if (mjutils.isStraight(array[0], array[1], array[2])) {
            return 1;
        }

        if (array.length > 3 && mjutils.isStraight(array[1], array[2], array[3])) {
            return 1;
        }

        return 0;
    }
}

rule = new SanLianKeRule();
global.rulesArray[rule.type] = rule;

// 27
class QingLongRule extends Rule {
    constructor() {
        super('清龙', 16);
        this.ignore = ['连六', '老少副'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        let array = _.map(seqArray, o => o.getFirst().getCH());
        return this.contain(array, ['一万', '四万', '七万']) ? 1 : 0;
    }
}

rule = new QingLongRule();
global.rulesArray[rule.type] = rule;

// 28
class SanBuGaoRule extends Rule {
    constructor() {
        super('三步高', 16);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (seqArray.length < 3) {
            return 0;
        }

        let array = _.uniq(_.map(seqArray, o => o.getFirst(), false, c => c.suit * 10 + c.point));
        mjutils.sortCards(array);

        let step = mjutils.getStep(array[0], array[1], array[2]);
        if (step == 1 || step == 2) {
            return 1;
        }

        if (seqArray.length == 3) {
            return 0;
        }

        step = mjutils.getStep(array[1], array[2], array[3]);
        return step == 1 || step == 2 ? 1 : 0;
    }
}

rule = new SanBuGaoRule();
global.rulesArray[rule.type] = rule;

// 29
class SakRule extends Rule {
    constructor() {
        super('三暗刻', 16);
        this.ignore = ['双暗刻'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0 || triArray.length < 3) {
            return 0;
        }

        return _.filter(triArray, o => o.id == -1 || o.type == mjcons.barType.QUAD()).length == 3 ? 1 : 0;
    }
}

rule = new SakRule();
global.rulesArray[rule.type] = rule;

// 30
class QysRule extends Rule {
    constructor() {
        super('清一色', 16);
        this.ignore = ['无字', '缺一门'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang[0].isWind()) {
            return 0;
        }

        if (_.findIndex(seqArray, v => v.getFirst().isWind()) != -1) {
            return 0;
        }

        if (_.findIndex(triArray, v => v.getFirst().isWind()) != -1) {
            return 0;
        }

        return 1;
    }
}

rule = new QysRule();
global.rulesArray[rule.type] = rule;

// 31
class DywRule extends Rule {
    constructor() {
        super('大于五', 12);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return 0;
        }

        cards = mjutils.unionCards(jiang, seqArray, triArray);
        if (_.findIndex(cards, o => o.isWind()) != -1) {
            return 0;
        }

        return _.findIndex(cards, o => o.point <= 5) == -1 ? 1 : 0;
    }
}

rule = new DywRule();
global.rulesArray[rule.type] = rule;

// 32
class XywRule extends Rule {
    constructor() {
        super('小于五', 12);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return 0;
        }

        cards = mjutils.unionCards(jiang, seqArray, triArray);
        if (_.findIndex(cards, o => o.isWind()) != -1) {
            return 0;
        }

        return _.findIndex(cards, o => o.point >= 5) == -1 ? 1 : 0;
    }
}

rule = new XywRule();
global.rulesArray[rule.type] = rule;

// 33
class MshcRule extends Rule {
    constructor() {
        super('妙手回春', 8);
        this.ignore = ['自摸'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (!fmt.isShot && fmt.room.getComp('state').getLibrary().getCount() == 0) {
            return 1;
        }

        return 0;
    }
}

rule = new MshcRule();  
global.rulesArray[rule.type] = rule;

// 34
class GskhRule extends Rule {
    constructor() {
        super('杠上开花', 8);
        this.ignore = ['自摸'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new GskhRule();
global.rulesArray[rule.type] = rule;

// 35
class QkhRule extends Rule {
    constructor() {
        super('抢杠胡', 8);
        this.ignore = ['胡绝张'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return false;
    }
}

rule = new QkhRule();
global.rulesArray[rule.type] = rule;

// 36
class XsfRule extends Rule {
    constructor() {
        super('小三风', 6);
        this.ignore = [''];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return 0;
        }

        if (!jiang[0].isWind() || jiang[0].isArrow()) {
            return 0;
        }

        return _.filter(triArray, o => o.getFirst().isWind() && !o.getFirst().isArrow()).length == 2 ? 1 : 0;
    }
}

rule = new XsfRule();
global.rulesArray[rule.type] = rule;

// 36
class SjkRule extends Rule {
    constructor() {
        super('双箭刻', 6);
        this.ignore = ['箭刻'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return 0;
        }

        return _.filter(triArray, o => o.getFirst().isArrow()).length == 2 ? 1 : 0;
    }
}

rule = new SjkRule();
global.rulesArray[rule.type] = rule;

// 38
class ShuangAnGangRule extends Rule {
    constructor() {
        super('双暗杠', 6);
        this.ignore = ['暗杠'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return _.filter(triArray, v => v.type == mjcons.barType.QUAD()).length == 2 ? 1 : 0;
    }
}

rule = new ShuangAnGangRule();
global.rulesArray[rule.type] = rule;


// 39
class PphRule extends Rule {
    constructor() {
        super('碰碰胡', 6);
        this.ignore = [''];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return 0;
        }

        // 没有顺子
        return seqArray.length == 0 ? 1 : 0;
    }
}

rule = new PphRule();
global.rulesArray[rule.type] = rule;

// 39
class HysRule extends Rule {
    constructor() {
        super('混一色', 6);
        this.ignore = [''];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length != 0) {
            cards = mjutils.unionCards(jiang, seqArray, triArray);
        }

        let cnt = _.countBy(cards, c => c.suit);
        return Object.getOwnPropertyNames(cnt).length == 2 ? 1 : 0;
    }
}

rule = new HysRule();
global.rulesArray[rule.type] = rule;

// 40
class QqrRule extends Rule {
    constructor() {
        super('全求人', 6);
        this.ignore = ['单钓将'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (!fmt.isShot || cards.length != 2) {
            // 自摸，或者不是胡一张牌
            return 0;
        }

        if (_.findIndex(triArray, v => v.type == mjcons.barType.QUAD()) != -1) {
            // 存在暗杠
            return 0;
        }

        return 1;
    }
}

rule = new QqrRule();
global.rulesArray[rule.type] = rule;

// 41
class QdyRule extends Rule {
    constructor() {
        super('全带幺', 4);
        this.ignore = ['单钓将'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return 0;
        }

        if (!jiang[0].is19()) {
            return 0;
        }

        if (_.findIndex(triArray, v => !v.getFirst().is19()) != -1) {
            return 0;
        }

        if (_.findIndex(seqArray, v => v.getFirst().point != 1 && v.getFirst().point != 7) != -1) {
            return 0;
        }

        return 1;
    }
}

rule = new QdyRule();
global.rulesArray[rule.type] = rule;

// 42
class SmgRule extends Rule {
    constructor() {
        super('双明杠', 4);
        this.ignore = ['明杠'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return _.filter(triArray, v => v.type == mjcons.barType.MINGQUAD()).length == 2 ? 1 : 0;
    }
}

rule = new SmgRule();
global.rulesArray[rule.type] = rule;

// 43
class BqrRule extends Rule {
    constructor() {
        super('不求人', 4);
        this.ignore = ['自摸', '门前清'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (fmt.isShot) {
            // 别人点炮
            return 0;
        }

        if (seqArray.length > 0 && _.findIndex(seqArray, v => v.id != -1) != -1) {
            // 吃过
            return 0;
        }

        if (triArray.length > 0 && _.findIndex(triArray, v => v.id != -1 && v.type != mjcons.barType.QUAD()) != -1) {
            // 碰过，或者明杠
            return 0;
        }

        return 1;
    }
}

rule = new BqrRule();
global.rulesArray[rule.type] = rule;

// 44
class HjzRule extends Rule {
    constructor() {
        super('胡绝张', 4);
        this.ignore = ['抢杠胡'];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return false;
    }
}

rule = new HjzRule();
global.rulesArray[rule.type] = rule;

// 45
class JianKeRule extends Rule {
    constructor() {
        super('箭刻', 2);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (triArray.length == 0) {
            return 0;
        }

        return _.reduce(triArray, (count, tri) => {
            if (tri.getFirst().isArrow()) {
                return count + 1;
            }

            return count;
        }, 0);
    }
}

rule = new JianKeRule();
global.rulesArray[rule.type] = rule;

// 46
class PingHuRule extends Rule {
    constructor() {
        super('平胡', 2);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (triArray.length == 0 && jiang.length == 2 && !jiang[0].isWind()) {
            return 1
        }
        return 0;
    }
}

rule = new PingHuRule();
global.rulesArray[rule.type] = rule;

// 47
class SgyRule extends Rule {
    constructor() {
        super('四归一', 2);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length != 0) {
            triArray = _.filter(triArray, v => v.type == mjcons.barType.TRI());
            cards = mjutils.unionCards(jiang, seqArray, triArray);
        }

        let r = _.countBy(cards, v => v.suit * 10 + v.point);
        let cnt = 0;
        for (let x in r) {
            if (r[x] == 4) {
                cnt++;
            }
        }

        return cnt;
    }
}

rule = new SgyRule();
global.rulesArray[rule.type] = rule;

// 48
class DuanYaoRule extends Rule {
    constructor() {
        super('断幺九', 2);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length != 0) {
            cards = mjutils.unionCards(jiang, seqArray, triArray);
        }

        return _.findIndex(cards, c => c.is19()) == -1 ? 1 : 0;
    }
}

rule = new DuanYaoRule();
global.rulesArray[rule.type] = rule;

// 49
class ShuangAnKeRule extends Rule {
    constructor() {
        super('双暗刻', 2);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0 && triArray.length < 2) {
            return 0;
        }

        return _.filter(triArray, o => o.id == -1 || o.type == mjcons.barType.QUAD()).length == 2 ? 1 : 0;
    }
}

rule = new ShuangAnKeRule();
global.rulesArray[rule.type] = rule;

// 50
class AnGangRule extends Rule {
    constructor() {
        super('暗杠', 2);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return _.filter(triArray, v => v.type == mjcons.barType.QUAD()).length;
    }
}

rule = new AnGangRule();
global.rulesArray[rule.type] = rule;

// 51
class MqqRule extends Rule {
    constructor() {
        super('门前清', 2);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (jiang.length == 0) {
            return 1;
        }

        if (!_.every(seqArray, v => v.id == -1 || v.id == 999)) {
            return 0
        }

        if (!_.every(triArray, v => v.id == -1 || v.id == 999 || v.type == mjcons.barType.QUAD())) {
            return 0
        }

        return 1;
    }
}

rule = new MqqRule();
global.rulesArray[rule.type] = rule;

// 52
class YbgRule extends Rule {
    constructor() {
        super('一般高', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        let count = 0;
        let r = _.countBy(seqArray, v => v.getFirst().point);
        for (let x in r) {
            if (r[x] >= 2) {
                count++;
            }
        }

        return count;
    }
}

rule = new YbgRule();
global.rulesArray[rule.type] = rule;

// 53
class LianLiuRule extends Rule {
    constructor() {
        super('连六', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        for (let i = 0; i < seqArray.length; i++) {
            for (let j = i + 1; j < seqArray.length; j++) {
                if (mjutils.sameSuit(seqArray[i].getFirst(), seqArray[j].getFirst())
                    && Math.abs(seqArray[j].getFirst().point - seqArray[i].getFirst().point) == 3) {
                    return 1;
                }
            }
        }
        return 0;
    }
}

rule = new LianLiuRule();
global.rulesArray[rule.type] = rule;

// 54
class LsfRule extends Rule {
    constructor() {
        super('老少副', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        let hasOne = false;
        let hasNine = false;
        for (let i = 0; i < seqArray.length; i++) {
            if (seqArray[i].getFirst().point == 1) {
                hasOne = true;
            }
            if (seqArray[i].getFirst().point == 7) {
                hasNine = true;
            }
        }
        return hasOne && hasNine ? 1 : 0;
    }
}

rule = new LsfRule();
global.rulesArray[rule.type] = rule;

// 55
class YjkRule extends Rule {
    constructor() {
        super('幺九刻', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (triArray.length == 0) {
            return 0;
        }

        return _.reduce(triArray, (count, tri) => {
            if (tri.getFirst().is19() && !tri.getFirst().isArrow()) {
                return count + 1;
            }

            return count;
        }, 0);
    }
}

rule = new YjkRule();
global.rulesArray[rule.type] = rule;

// 56
class MingGangRule extends Rule {
    constructor() {
        super('明杠', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        if (triArray.length == 0) {
            return 0;
        }

        return _.filter(triArray, v => v.type == mjcons.barType.MINGQUAD()).length;
    }
}

rule = new MingGangRule();
global.rulesArray[rule.type] = rule;

// 57
class BianZhangRule extends Rule {
    constructor() {
        super('边张', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new BianZhangRule();
global.rulesArray[rule.type] = rule;

// 58
class KanZhangRule extends Rule {
    constructor() {
        super('坎张', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new KanZhangRule();
global.rulesArray[rule.type] = rule;

// 59
class DdjRule extends Rule {
    constructor() {
        super('单钓将', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new DdjRule();
global.rulesArray[rule.type] = rule;

// 60
class BaoTingRule extends Rule {
    constructor() {
        super('报听', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new BaoTingRule();
global.rulesArray[rule.type] = rule;

// 61
class ZiMoRule extends Rule {
    constructor() {
        super('自摸', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new ZiMoRule();
global.rulesArray[rule.type] = rule;

// 62
class HuaPaiRule extends Rule {
    constructor() {
        super('花牌', 1);
        this.ignore = [];
    }

    check(fmt, jiang, seqArray, triArray) {
        let cards = fmt.cards;
        return 0;
    }
}

rule = new HuaPaiRule();
global.rulesArray[rule.type] = rule;

module.exports = Rule;