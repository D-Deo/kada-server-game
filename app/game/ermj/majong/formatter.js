
const utils = require('./utils');
const _ = require('underscore');
const card = require('./card');
const Bar = require('../majong/bar');
const mjcons = require('../majong/majongConstants');
const Rules = require('./rules');

class Formatter {
    constructor(room, ...cards) {
        this.room = room;
        this.cards = [];
        this.isShot = false; // 是否点炮
        this.ronCard = undefined; // 胡牌
        this.fourRonCard = false; // 手里是否有另外三张胡牌，牵涉到暗刻的判断，如果有另外三张胡牌，那么可以算胡牌的暗刻
        this.pushCards(...cards);
    }

    pushCards(...cards) {
        this.cards.push(...cards);
        utils.sortCards(this.cards);
    }

    removeCard(card) {
        let index = _.findIndex(this.cards, c => c.getValue() == card.getValue())
        if (index != -1) {
            this.cards.splice(index, 1);
        }
    }

    getIndex(suit, point) {
        return _.findIndex(this.cards, c => c.suit == suit && c.point == point);
    }

    // 算番 seqArr 吃牌 triArr 碰牌
    calculate(seqArray = [], triArray = []) {
        this.fourRonCard = _.filter(this.cards, c => c.getValue() == this.ronCard.getValue()).length == 4;

        let r = new Rules();

        // 判断是否是七对子
        r.is7Pair(this, [], seqArray, triArray);

        // 判断是否是九莲宝灯
        r.checkRuleByName("九莲宝灯", this, [], seqArray, triArray);

        let array = [];
        this.getAllRon(array);

        array.forEach(v => {
            let seqNewArray = [...seqArray];
            let triNewArray = [...triArray];

            _.each(v.bars, bar => {
                if (bar.type == mjcons.barType.SEQ()) {
                    seqNewArray.push(bar);
                }
                else {
                    triNewArray.push(bar);
                }
            });

            let rules = Rules.createRules(this, v.jiang, seqNewArray, triNewArray);
            if (!r.isRon()) {
                r = rules;
            }
            else {
                r = Rules.getBetter(r, rules);
            }
        });

        r.ronCard = this.ronCard;

        return r;
    }

    getAllRon(array) {
        let c0 = undefined;
        let c1 = this.cards[0];

        for (let i = 1; i < this.cards.length; i++) {
            let c2 = this.cards[i];
            if (utils.isEqual(c1, c2) && (c0 == undefined || !utils.isEqual(c0, c1))) {
                let jiang = this.cards.splice(i - 1, 2);
                let bars = [];
                if (this.checkAllBar(false, bars)) {
                    if (bars.length == 0) {
                        array.push({
                            jiang,
                            bars
                        });
                    }
                    else {
                        _.each(bars, v => {
                            array.push({
                                jiang,
                                bars: v
                            });
                        });
                    }
                }
                this.cards.splice(i - 1, 0, ...jiang);
                c0 = c1;
            }

            c1 = c2;
        }
    }

    // jiang 将牌
    checkRon(jiang = []) {
        if (jiang.length == 0) {
            // 2 5 8 11 14
            if (this.cards.length % 3 != 2) {
                return false;
            }
        }

        if (jiang.length > 0) {
            return this.checkAllBar();
        }

        if (this.cards.length == 14 && utils.getPairCount(this.cards) == 7) {
            return true;
        }

        let r = false;

        let c1 = this.cards.shift();
        let c2 = this.cards[0];
        let c3 = {};

        if (utils.isEqual(c1, c2)) {
            this.cards.shift();
            // 当将牌 (A, A)
            r = this.checkRon([c1, c2]);

            if (!r && this.cards.length > 0) {
                c3 = this.cards[0];
                if (utils.isEqual(c1, c3)) {
                    // 组成刻子 A A A
                    this.cards.shift();
                    r = this.checkRon(jiang);
                    this.insertCard(0, c3);
                }
            }

            this.insertCard(0, c2);
        }

        if (!r && !c1.isWind() && c1.point < 8) {
            let index2 = this.getIndex(c1.suit, c1.point + 1);
            if (index2 != -1) {
                let index3 = this.getIndex(c1.suit, c1.point + 2);
                if (index3 != -1) {
                    // 组成顺子 A B C
                    c2 = this.cards.splice(index2, 1)[0];
                    c3 = this.cards.splice(index3 - 1, 1)[0];
                    r = this.checkRon(jiang);
                    this.insertCard(index3 - 1, c3);
                    this.insertCard(index2, c2);
                }
            }
        }

        this.insertCard(0, c1);

        return r;
    }

    getTin() {
        let tin = [];
        let c1 = {};
        for (let i = 0; i < this.cards.length; i++) {
            // 减去牌中一张，判断是否听牌
            let c2 = this.cards.splice(i, 1)[0];

            if (i == 0 || !utils.isEqual(c1, c2)) {
                let ron = [];
                this.checkTin(ron);
                if (ron.length > 0) {
                    // 去除重复胡牌
                    ron = _.uniq(_.map(ron, c => Math.floor(c.getValue() / 10) * 10)).sort();
                    tin.push(
                        {
                            card: c2.getValue(),
                            ron: ron
                        }
                    );
                }
            }

            c1 = c2;

            this.insertCard(i, c2);
        }

        return tin;
    }

    // jiang 将牌
    // unseq 待补牌
    checkTin(ron, jiang = [], unseq = []) {
        // 1 4 7 10 13
        if ((this.cards.length + jiang.length + unseq.length) % 3 != 1) {
            return false;
        }

        if (this.cards.length == 13 && utils.getPairCount(this.cards) == 6) {
            ron.push(utils.getFirstSingleCard(this.cards));
        }

        if (jiang.length > 0 && unseq.length > 0) {
            if (this.checkAllBar()) {
                // 待补牌找到胡牌
                if (unseq[0].point == unseq[1].point) {
                    // 两副将牌，对倒
                    ron.push(jiang[0], unseq[0]);
                }
                else if (unseq[0].point == unseq[1].point - 1) {
                    if (unseq[0].point > 1) { // 2 3 4
                        ron.push(new card(unseq[0].suit, unseq[0].point - 1)); // 左
                        if (unseq[1].point == 9) {
                            ron.type = "边张";
                        }
                    }

                    if (unseq[1].point < 9) { // 7 8 9
                        ron.push(new card(unseq[1].suit, unseq[1].point + 1)); // 右
                        if (unseq[0].point == 1) {
                            ron.type = "边张";
                        }
                    }
                }
                else if (unseq[0].point == unseq[1].point - 2) {
                    ron.push(new card(unseq[0].suit, unseq[0].point + 1)); // 单夹
                    ron.type = "坎张";
                }

                return true;
            }

            return false;
        }

        let c1 = this.cards.shift();
        if (jiang.length == 0 && unseq.length == 0) {
            if (this.cards.length == 0) {
                ron.push(c1); // 单调
                ron.type = "单钓将";
                this.insertCard(0, c1);
                return true;
            }
            else if (!utils.isEqual(c1, this.cards[0], this.cards[1], this.cards[2])
                && this.checkAllBar()) {
                ron.push(c1); // 单调
                ron.type = "单钓将";
            }
        }

        let c2 = this.cards[0];
        let c3 = {};

        if (utils.isEqual(c1, c2)) {
            this.cards.shift();
            if (jiang.length == 0) {
                // 当将牌 (A, A) ()
                this.checkTin(ron, [c1, c2], unseq);
            }
            else if (unseq.length == 0) {
                // 两组将牌不能相同
                if (!utils.isEqual(jiang[0], c1)) {
                    // 当补牌 (A, A) (B, B)
                    this.checkTin(ron, jiang, [c1, c2]);
                }
            }

            if (this.cards.length > 0) {
                c3 = this.cards[0];
                if (utils.isEqual(c1, c3)) {
                    // 组成刻子 A A A
                    this.cards.shift();
                    this.checkTin(ron, jiang, unseq);
                    this.insertCard(0, c3);
                }
            }

            this.insertCard(0, c2);
        }

        if (!c1.isWind()) {
            let index2 = -1;
            let index3 = -1;
            if (c1.point < 9) {
                index2 = this.getIndex(c1.suit, c1.point + 1);
                if (unseq.length == 0 && index2 != -1) {
                    // 判断 (A) B C (D) 类型顺子
                    c2 = this.cards.splice(index2, 1)[0];
                    this.checkTin(ron, jiang, [c1, c2]);
                    this.insertCard(index2, c2);
                }
            }

            if (c1.point < 8) {
                index3 = this.getIndex(c1.suit, c1.point + 2);
                if (unseq.length == 0 && index3 != -1) {
                    // 判断 A (B) C 类型顺子
                    c3 = this.cards.splice(index3, 1)[0];
                    this.checkTin(ron, jiang, [c1, c3]);
                    this.insertCard(index3, c3);
                }
            }

            if (index2 != -1 && index3 != -1) {
                // 组成顺子 A B C
                c2 = this.cards.splice(index2, 1)[0];
                c3 = this.cards.splice(index3 - 1, 1)[0];
                this.checkTin(ron, jiang, unseq);
                this.insertCard(index3 - 1, c3);
                this.insertCard(index2, c2);
            }
        }

        this.insertCard(0, c1);
    }

    // 都是3个一组
    checkAllBar(once = true, bars = []) {
        if (this.cards.length == 0) {
            return true;
        }

        if (this.cards.length % 3 != 0) {
            return false;
        }

        let r1 = false;
        let cards = [];
        if (utils.isEqual(this.cards[0], this.cards[1], this.cards[2])) {
            cards = this.cards.splice(0, 3);
            let newBars = [];
            r1 = this.checkAllBar(once, newBars);
            this.cards.unshift(...cards);
            if (r1 && !once) {
                let bar = new Bar(-1, mjcons.barType.TRI(), cards);
                if (this.isShot && !this.fourRonCard && utils.isEqual(bar.getFirst(), this.ronCard)) {
                    bar.id = 999; // 炮牌，不能算暗刻
                }

                if (newBars.length == 0) {
                    newBars.push([bar]);
                }
                else {
                    _.each(newBars, v =>
                        v.unshift(bar));
                }

                bars.push(...newBars);
            }
        }

        if (r1 && once) {
            return true;
        }

        let r2 = false;
        let c1 = {};
        let c2 = {};
        let c3 = {};

        if (!this.cards[0].isWind() && this.cards[0].point <= 7) {
            c1 = this.cards.shift();
            let index2 = this.getIndex(c1.suit, c1.point + 1);
            if (index2 != -1) {
                c2 = this.cards.splice(index2, 1)[0];
                let index3 = this.getIndex(c1.suit, c1.point + 2);
                if (index3 != -1) {
                    c3 = this.cards.splice(index3, 1)[0];
                    let newBars = [];
                    r2 = this.checkAllBar(once, newBars);
                    if (r2 && !once) {
                        let bar = new Bar(-1, mjcons.barType.SEQ(), [c1, c2, c3]);
                        if (newBars.length == 0) {
                            newBars.push([bar]);
                        }
                        else {
                            _.each(newBars, v =>
                                v.unshift(bar));
                        }

                        bars.push(...newBars);
                    }

                    this.insertCard(index3, c3);
                }
                this.insertCard(index2, c2);
            }
            this.insertCard(0, c1);
        }

        return r1 || r2;
    }

    insertCard(index, c) {
        if (index == this.cards.length + 1) {
            this.cards.push(c);
        }
        else {
            this.cards.splice(index, 0, c);
        }
    }
}

module.exports = Formatter;