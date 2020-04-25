const cons = require('../../../common/constants');
const ssscons = require('../common/constants');
const Card = require('../poker/card');
const _ = require('underscore');
const logger = require('pomelo-logger').getLogger('game-sss', __filename);

class Rule {
    static create(...cards) {
        // cards.sort((a, b) => a.getOrder() - b.getOrder());

        let jokerCnt = _.filter(cards, c => c.getSuit() == cons.Poker.CardSuit.JOKER()).length;
        if (jokerCnt > 0) {
            cards = _.filter(cards, c => c.getSuit() != cons.Poker.CardSuit.JOKER());
        }

        let rule = null;

        switch (cards.length + jokerCnt) {
            case 13:
                if (jokerCnt > 0) {
                    break;
                }
                // rule = Rule.checkRule(ZzqlRule, jokerCnt, cards)
                rule = Rule.checkRule(QHORule, jokerCnt, cards)
                    || Rule.checkRule(QHERule, jokerCnt, cards)
                    || Rule.checkRule(QHOYDHRule, jokerCnt, cards)
                    || Rule.checkRule(QHEYDHRule, jokerCnt, cards)
                    || Rule.checkRule(YtlRule, jokerCnt, cards)
                    // || Rule.checkRule(SehzRule, jokerCnt, cards)
                    // || Rule.checkRule(ShtsRule, jokerCnt, cards)
                    // || Rule.checkRule(SftxRule, jokerCnt, cards)
                    || Rule.checkRule(QdRule, jokerCnt, cards)
                    || Rule.checkRule(QxRule, jokerCnt, cards)
                    // || Rule.checkRule(CysRule, jokerCnt, cards)
                    // || Rule.checkRule(StstRule, jokerCnt, cards)
                    || Rule.checkRule(WdstRule, jokerCnt, cards)
                    || Rule.checkRule(LdbRule, jokerCnt, cards)
                    || Rule.checkRule(SszRule, jokerCnt, cards)
                    || Rule.checkRule(SthRule, jokerCnt, cards)
                    || Rule.checkRule(BdRule, jokerCnt, cards)
                    || Rule.checkRule(BxRule, jokerCnt, cards);
                break;
            case 5:
                rule = Rule.checkRule(SzwRule, jokerCnt, cards)
                    || Rule.checkRule(WzzRule, jokerCnt, cards)
                    || Rule.checkRule(ThsRule, jokerCnt, cards)
                    || Rule.checkRule(ZdRule, jokerCnt, cards)
                    || Rule.checkRule(HlRule, jokerCnt, cards)
                    || Rule.checkRule(ThRule, jokerCnt, cards)
                    || Rule.checkRule(SzRule, jokerCnt, cards)
                    || Rule.checkRule(StRule, jokerCnt, cards)
                    || Rule.checkRule(LdRule, jokerCnt, cards)
                    || Rule.checkRule(DzRule, jokerCnt, cards);
                break;
            case 3:
                rule = Rule.checkRule(StRule, jokerCnt, cards)
                    || Rule.checkRule(DzRule, jokerCnt, cards);
                break;
            default:
                return null;
        }

        return rule || Rule.checkRule(SpRule, jokerCnt, cards);
    }

    static checkRule(cls, jokerCnt, cards) {
        let rule = new cls();
        rule.jokerCnt = jokerCnt;

        if (!rule.check(_.sortBy(cards, (c) => c.getOrder()))) {
            return null;
        }

        logger.debug('当前牌型：>>>>>>>>>>>>>>>>>>', rule.fmt.name);
        return rule;
    }

    constructor(fmt) {
        this.fmt = {
            anim: fmt.anim(),
            name: fmt.name(),
            type: fmt.type(),
            score: fmt.score()
        };
    }

    // 是不是一色
    isSameSuit(cards) {
        return _.every(cards, c => c.getSuit() == cards[0].getSuit());
    }

    /**
     * 比较大小
     * @param {*} rule
     * @return  
     */
    compare(rule) {
        if (this.fmt.type != rule.fmt.type) {
            return this.fmt.type - rule.fmt.type;
        }

        return this.compareSame(rule);
    }

    compareSame(rule) {
        if (this.jokerCnt == rule.jokerCnt) {
            return 0;
        }
        return this.jokerCnt < rule.jokerCnt ? -1 : 1;
        // if (this.jokerCnt > 0 && rule.jokerCnt > 0) {
        //     return 0;
        // }
        // else if (this.jokerCnt > 0) {
        //     return -1;
        // }
        // else if (rule.jokerCnt > 0) {
        //     return 1;
        // }

        // return 0;
    }

    getScore(position = 0) {
        return this.fmt.score;
    }

    getType() {
        return this.fmt.type;
    }

    toJson() {
        let json = {};
        json.type = this.fmt.type;
        json.name = this.fmt.name;
        json.anim = this.fmt.anim;
        return json;
    }
}

// 至尊青龙
class ZzqlRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.ZZQL);
    }

    check(cards) {
        // 是不是一色
        if (!this.isSameSuit(cards)) {
            return false;
        }

        let rule = new YtlRule();
        rule.jokerCnt = this.jokerCnt;

        return rule.check(cards);
    }
}

// 一条龙
class YtlRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.YTL);
    }

    check(cards) {
        return _.uniq(cards, c => c.getPoint()).length + this.jokerCnt == 13;
    }
}

// 十二皇族
class SehzRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.SEHZ);
    }

    check(cards) {
        // J - A
        return _.every(cards, c => c.getPoint() == cons.Poker.CardPoint.ACE() || (c.getPoint() >= 11));
    }
}

// 三花同顺
class ShtsRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.SHTS);
    }

    check(cards) {
        let rule = new SszRule();
        rule.jokerCnt = this.jokerCnt;
        return rule.check(cards, true);
    }
}

// 三分天下
class SftxRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.SFTX);
    }

    check(cards) {
        let array = _.countBy(cards, c => c.getPoint());
        let values = _.values(array).sort();
        let v = _.reduce(values, (sum, v) => sum * 10 + v, 0);

        if (this.jokerCnt == 1) {
            return v == 444 || v == 1344;
        }

        if (this.jokerCnt == 2) {
            return v == 344 || v == 1244 || v == 1334;
        }

        return v == 1444;
    }
}

// 全大
class QdRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.QD);
    }

    // 6 up, no A
    check(cards) {
        // return _.every(cards, c => c.getPoint() == cons.Poker.CardPoint.ACE() || (c.getPoint() >= 8));
        return _.every(cards, c => c.getPoint() >= 6);
    }
}

// 全小
class QxRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.QX);
    }

    // 10 down, no A
    check(cards) {
        return _.every(cards, c => c.getPoint() >= 2 && c.getPoint() <= cons.Poker.CardPoint.TEN());
    }
}

// 半大
class BdRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.BD);
    }

    // 6 up, and A
    check(cards) {
        return _.every(cards, c => c.getPoint() >= 6 || c.getPoint() == cons.Poker.CardPoint.ACE());
        // let ret = _.countBy(cards, c => {
        //     if (c.getPoint() == cons.Poker.CardPoint.ACE() || c.getPoint() >= 8) {
        //         return 'big';
        //     } else if (c.getPoint() >= 2 && c.getPoint() <= 8) {
        //         return 'small';
        //     }
        // });
        // return ret['big'] >= 7;
    }
}

// 半小
class BxRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.BX);
    }

    // 10 down, and A
    check(cards) {
        return _.every(cards, c => c.getPoint() <= cons.Poker.CardPoint.TEN());
        // let ret = _.countBy(cards, c => {
        //     if (c.getPoint() == cons.Poker.CardPoint.ACE() || c.getPoint() >= 8) {
        //         return 'big';
        //     } else if (c.getPoint() >= 2 && c.getPoint() <= 8) {
        //         return 'small';
        //     }
        // });
        // return ret['small'] >= 7;
    }
}

// 凑一色
class CysRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.CYS);
    }

    check(cards) {
        // 全黑或者全红
        return _.every(cards, c => c.getSuit() == cons.Poker.CardSuit.SPADE() || c.getSuit() == cons.Poker.CardSuit.CLUB())
            || _.every(cards, c => c.getSuit() == cons.Poker.CardSuit.HEART() || c.getSuit() == cons.Poker.CardSuit.DIAMOND());
    }
}

// 全黑
class QHERule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.QHE);
    }

    check(cards) {
        return _.every(cards, c => c.getSuit() == cons.Poker.CardSuit.SPADE() || c.getSuit() == cons.Poker.CardSuit.CLUB());
    }
}

// 全红
class QHORule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.QHO);
    }

    check(cards) {
        return _.every(cards, c => c.getSuit() == cons.Poker.CardSuit.HEART() || c.getSuit() == cons.Poker.CardSuit.DIAMOND());
    }
}

// 全黑一点红
class QHEYDHRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.QHEYDH);
    }

    check(cards) {
        let ret = _.countBy(cards, c => {
            if (c.getSuit() == cons.Poker.CardSuit.SPADE() || c.getSuit() == cons.Poker.CardSuit.CLUB()) {
                return 'black';
            } else if (c.getSuit() == cons.Poker.CardSuit.HEART() || c.getSuit() == cons.Poker.CardSuit.DIAMOND()) {
                return 'red';
            }
        });
        return ret['black'] == 12 && ret['red'] == 1;
    }
}

// 全红一点黑
class QHOYDHRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.QHOYDH);
    }

    check(cards) {
        let ret = _.countBy(cards, c => {
            if (c.getSuit() == cons.Poker.CardSuit.SPADE() || c.getSuit() == cons.Poker.CardSuit.CLUB()) {
                return 'black';
            } else if (c.getSuit() == cons.Poker.CardSuit.HEART() || c.getSuit() == cons.Poker.CardSuit.DIAMOND()) {
                return 'red';
            }
        });
        return ret['black'] == 1 && ret['red'] == 12;
    }
}

// 四套三条
class StstRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.STST);
    }

    check(cards) {
        let array = _.countBy(cards, c => c.getPoint());
        let values = _.values(array).sort();
        let v = _.reduce(values, (sum, v) => sum * 10 + v, 0);

        if (this.jokerCnt == 1) {
            return v == 3333 || v == 12333;
        }

        if (this.jokerCnt == 2) {
            return v == 2333 || v == 11333 || v == 12233;
        }

        return v == 13333;
    }
}

// 五对三条
class WdstRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.WDST);
    }

    check(cards) {
        let array = _.countBy(cards, c => c.getPoint());
        let values = _.values(array).sort();
        let v = _.reduce(values, (sum, v) => sum * 10 + v, 0);

        if (this.jokerCnt == 1) {
            return v == 122223 || v == 222222;
        }

        if (this.jokerCnt == 2) {
            return v == 22223 || v == 112223 || v == 122222;
        }

        return v == 222223;
    }
}

// 六对半
class LdbRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.LDB);
    }

    check(cards) {
        let array = _.countBy(cards, c => c.getPoint());
        let values = _.values(array).sort();
        let v = _.reduce(values, (sum, v) => sum * 10 + v, 0);

        if (this.jokerCnt == 1) {
            return v == 222222 || v == 1122222;
        }

        if (this.jokerCnt == 2) {
            return v == 122222 || v == 111222;
        }

        return v == 1222222;
    }
}

// 三顺子
class SszRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.SSZ);
    }

    check(cards, sameColor = false) {
        return this.checkInternal([...cards], { jokerCnt: this.jokerCnt, has3: false, sameColor });
    }

    checkInternal(cards, info) {
        if (cards.length + info.jokerCnt == 3 || cards.length + info.jokerCnt == 5) {
            return this.IsSequence(cards, info.jokerCnt, info.sameColor);
        }

        if (_.last(cards).getPoint() == cons.Poker.CardPoint.ACE()) {
            let info2 = {
                jokerCnt: info.jokerCnt,
                has3: info.has3,
                sameColor: info.sameColor
            };

            let cards2 = [...cards];
            if (this.checkFirstCard(cards2.pop(), cards2, info2)) {
                return true;
            }
        }

        return this.checkFirstCard(cards.shift(), cards, info);
    }

    checkFirstCard(card, cards, info) {
        if (!info.has3) {
            let info2 = {
                jokerCnt: info.jokerCnt,
                has3: true,
                sameColor: info.sameColor
            };

            let cards2 = [...cards];
            if (this.getSequence(card, cards2, 3, info2) && this.checkInternal(cards2, info2)) {
                return true;
            }
        }

        return this.getSequence(card, cards, 5, info) && this.checkInternal(cards, info);
    }

    getSequence(card, cards, n, info) {
        let findCnt = 0;
        let suit = card.getSuit();
        let nextPoint = card.getPoint() == cons.Poker.CardPoint.KING() ? cons.Poker.CardPoint.ACE() : card.getPoint() + 1;

        for (let i = 0; i < n - 1; i++) {
            let index = _.findIndex(cards, c => c.getPoint() == nextPoint && (!info.sameColor || c.getSuit() == suit));
            if (index != -1) {
                // 找到符合要求的牌
                findCnt++;
                cards.splice(index, 1);
            }
            else if (info.jokerCnt == 0) {
                return false;
            }
            else {
                info.jokerCnt--;
                findCnt++;
            }

            if (findCnt == n - 1) {
                return true;
            }

            if (nextPoint == cons.Poker.CardPoint.ACE()) {
                // 不能再搜索了
                if (info.jokerCnt >= n - 1 - findCnt) {
                    info.jokerCnt = info.jokerCnt - (n - 1 - findCnt);
                    return true;
                }

                return false;
            }

            nextPoint = nextPoint == cons.Poker.CardPoint.KING() ? cons.Poker.CardPoint.ACE() : nextPoint + 1;
        }

        return findCnt == n - 1;
    }

    IsSequence(cards, jokerCnt, sameColor) {
        let rule = sameColor ? new ThsRule() : new SzRule();
        rule.jokerCnt = jokerCnt;
        return rule.check(cards);
    }
}

// 三同花
class SthRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.STH);
    }

    check(cards) {
        let array = _.countBy(cards, c => c.getSuit());
        let values = _.values(array).sort();
        let v = _.reduce(values, (sum, v) => sum * 10 + v, 0);

        if (this.jokerCnt == 1) {
            return v == 12 // 13
                || v == 48 || v == 57 // 5 8
                || v == 39 || v == 30 // 3 10
                || v == 255 || v == 345; // 3 5 5
        }

        if (this.jokerCnt == 2) {
            return v == 11 // 13
                || v == 47 || v == 38 || v == 56  // 5 8
                || v == 29 || v == 38 || v == 20 // 3 10
                || v == 155 || v == 245 || v == 335 || v == 344; // 3 5 5
        }

        return v == 13 || v == 58 || v == 40 || v == 355;
    }
}

// 四张王
class SzwRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.SZW);
    }

    check(cards) {
        return this.jokerCnt >= 4;
    }
}

// 五张炸
class WzzRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.WZZ);
    }

    check(cards) {
        if (_.every(cards, c => c.getPoint() == cards[0].getPoint())) {
            this.value = cards[0];
            return true;
        }

        return false;
    }

    compareSame(rule) {
        return this.value.compare(rule.value);
    }

    getScore(position = 0) {
        if (position == 2) {
            return 2 * super.getScore(position);
        }

        return super.getScore(position);
    }
}

// 同花顺
class ThsRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.THS);
        // this.faked = false;
    }

    check(cards) {
        // 是不是一色
        if (!this.isSameSuit(cards)) {
            return false;
        }

        if (cards.length == 1) {
            this.value = cards[0];
            return true;
        }

        // 不都是单牌
        if (cards.length != _.uniq(cards, c => c.getPoint()).length) {
            return false;
        }

        let suit = _.first(cards).getSuit();

        let n = cards.length + this.jokerCnt; // 检查的数量
        if (_.last(cards).getPoint() == cons.Poker.CardPoint.ACE()) {          //手里有明A
            if (_.first(cards).getPoint() > 14 - n) {
                this.value = _.last(cards);
            } else {
                cards.unshift(cards.pop());
                if (_.last(cards).getPoint() < n) {
                    this.value = new Card(suit, cons.Poker.CardPoint.FIVE(), 0);
                } else if (_.last(cards).getPoint() == n) {
                    this.value = _.last(cards);
                }
            }
        } else if (_.last(cards).getPoint() - _.first(cards).getPoint() < n) {      // 手里没有A
            if (_.first(cards).getPoint() > 14 - n) {
                this.value = new Card(suit, cons.Poker.CardPoint.ACE(), 0);
            } else if (this.jokerCnt == 0) {
                this.value = _.last(cards);
            } else if (_.last(cards).getPoint() - _.first(cards).getPoint() == n - 1) {
                this.value = _.last(cards);
            } else {
                this.value = new Card(suit, _.first(cards).getPoint() + n - 1, 0);
            }
        }

        return !!this.value;

        // let rule = new SzRule();
        // rule.jokerCnt = this.jokerCnt;

        // if (rule.check(cards)) {
        //     this.faked = rule.faked;
        //     this.value = rule.value;
        //     return true;
        // }

        // return false;
    }

    compareSame(rule) {
        let r = this.value.compare(rule.value, false);
        if (r != 0) {
            return r;
        }
        return 0;

        // if (this.faked && rule.faked) {
        //     return this.value.getSuit() - rule.value.getSuit();
        // }
        // else if (this.faked) {
        //     return -1;
        // }
        // else if (rule.faked) {
        //     return 1;
        // }

        // if (this.jokerCnt > 0 && rule.jokerCnt > 0) {
        //     return this.value.getSuit() - rule.value.getSuit();
        // }
        // else if (this.jokerCnt > 0) {
        //     return -1;
        // }
        // else if (rule.jokerCnt > 0) {
        //     return 1;
        // }
        // return this.value.getSuit() - rule.value.getSuit();
    }

    getScore(position = 0) {
        if (position == 2) {
            return 2 * super.getScore(position);
        }

        return super.getScore(position);
    }
}

// 炸弹
class ZdRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.ZD);
    }

    check(cards) {
        let array = _.countBy(cards, c => c.getPoint());
        if (_.values(array).length == 2) {
            if (this.jokerCnt == 3) {
                let c1 = _.first(cards);
                let c2 = _.last(cards);
                if (c1.compare(c2)) {
                    this.value2 = c1;
                    this.value1 = c2;
                } else {
                    this.value1 = c1;
                    this.value2 = c2;
                }
            } else {
                for (let n in array) {
                    let c = array[n];
                    if (c > 1) {
                        if (_.first(cards).getPoint() == n) {
                            this.value1 = _.first(cards);
                        } else {
                            this.value1 = _.last(cards);
                        }
                    } else {
                        if (_.first(cards).getPoint() == n) {
                            this.value2 = _.first(cards);
                        } else {
                            this.value2 = _.last(cards);
                        }
                    }
                }
            }
        }
        return this.value1 && this.value2;
    }

    compareSame(rule) {
        let ret = this.value1.compare(rule.value1);
        if (ret == 0) {
            return this.value2.compare(rule.value2, false);
        }
        return ret;
    }

    getScore(position = 0) {
        if (position == 2) {
            return 2 * super.getScore(position);
        }

        return super.getScore(position);
    }
}

// 葫芦
class HlRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.HL);
        this.faked = false;
    }

    check(cards) {
        let array = _.countBy(cards, c => c.getPoint());
        let values = _.values(array);
        if (values.length == 2) {
            if (values[0] == 2 && values[1] == 2) {
                this.faked = true;
                this.value1 = _.max([_.first(cards), _.last(cards)], c => c.getValue());
                this.value2 = _.min([_.first(cards), _.last(cards)], c => c.getValue());
            }
            else if (values[0] == 3) {
                this.value1 = _.find(cards, c => c.getPoint() == _.keys(array)[0]);
                this.value2 = _.find(cards, c => c.getPoint() == _.keys(array)[1]);
            }
            else if (values[1] == 3) {
                this.value1 = _.find(cards, c => c.getPoint() == _.keys(array)[1]);
                this.value2 = _.find(cards, c => c.getPoint() == _.keys(array)[0]);
            }
        }

        return this.value1 != undefined;
    }

    compareSame(rule) {
        let r = this.value1.compare(rule.value1);
        if (r != 0) {
            return r;
        }

        r = this.value2.compare(rule.value2);
        if (r != 0) {
            return r;
        }

        // if (this.faked && rule.faked) {
        //     return 0;
        // }
        // else if (this.faked) {
        //     return -1;
        // }
        // else if (rule.faked) {
        //     return 1;
        // }

        return 0;
    }

    getScore(position = 0) {
        if (position == 2) {
            return 2 * super.getScore(position);
        }

        return super.getScore(position);
    }
}

// 同花
class ThRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.TH);
        this.faked = false;
    }

    check(cards) {
        // 是不是一色
        if (!this.isSameSuit(cards)) {
            return false;
        }

        for (let i = 0; i < this.jokerCnt; i++) {
            cards.push(new Card(cons.Poker.CardSuit.JOKER(), cons.Poker.CardPoint.ACE(), 0));
        }

        this.value = [...cards];
        this.value.sort((a, b) => b.getOrder() - a.getOrder());

        if (this.jokerCnt > 0) {
            this.faked = true;
        }

        return Boolean(this.value);
    }

    compareSame(rule) {
        for (let i = 0; i < this.value.length; i++) {
            let r = this.value[i].compare(rule.value[i]);
            if (r != 0) {
                return r;
            }
        }

        for (let i = 0; i < this.value.length; i++) {
            let r = this.value[i].compare(rule.value[i], false);
            if (r != 0) {
                return r;
            }
        }

        return 0;

        // if (this.faked && rule.faked) {
        //     return this.value[0].getSuit() - rule.value[0].getSuit();
        // } else if (this.faked) {
        //     return -1;
        // } else if (rule.faked) {
        //     return 1;
        // }

        // return this.value[0].getSuit() - rule.value[0].getSuit();
    }
}

// 顺子
class SzRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.SZ);
        this.faked = false;
    }

    check(cards) {
        if (cards.length == 1) {
            this.value = cards[0];
            return true;
        }

        if (cards.length != _.uniq(cards, c => c.getPoint()).length) {
            // 不都是单牌
            return false;
        }

        let n = cards.length + this.jokerCnt; // 检查的数量
        if (_.last(cards).getPoint() == cons.Poker.CardPoint.ACE()) {          //手里有明A
            if (_.first(cards).getPoint() > 14 - n) {
                this.value = _.last(cards);
            } else {
                cards.unshift(cards.pop());
                if (_.last(cards).getPoint() < n) {
                    this.value = new Card(cons.Poker.CardSuit.JOKER(), cons.Poker.CardPoint.FIVE(), 0);
                } else if (_.last(cards).getPoint() == n) {
                    this.value = _.last(cards);
                }
            }
        } else if (_.last(cards).getPoint() - _.first(cards).getPoint() < n) {      // 手里没有A
            if (_.first(cards).getPoint() > 14 - n) {
                this.faked = true;
                this.value = new Card(cons.Poker.CardSuit.JOKER(), cons.Poker.CardPoint.ACE(), 0);
            } else if (this.jokerCnt == 0) {
                this.value = _.last(cards);
            } else if (_.last(cards).getPoint() - _.first(cards).getPoint() == n - 1) {
                this.faked = true;
                this.value = _.last(cards);
            } else {
                this.faked = true;
                this.value = new Card(cons.Poker.CardSuit.JOKER(), _.first(cards).getPoint() + n - 1, 0);
            }
        }

        this.cards = cards;
        return this.value != undefined;
    }

    compareSame(rule) {
        let r = this.value.compare(rule.value, false);
        if (r != 0) {
            return r;
        }
        return rule.jokerCnt - this.jokerCnt;
    }
}

// 三条
class StRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.ST);
    }

    check(cards) {
        if (this.jokerCnt == 3) {
            this.value = new Card(cons.Poker.CardSuit.JOKER(), cons.Poker.CardPoint.MAIN_JOKER(), 0);
            return true;
        }

        if (cards.length + this.jokerCnt == 3) { // 三张
            if (_.every(cards, c => c.getPoint() == cards[0].getPoint())) {
                this.value = cards[0];
            }
        } else {
            let array = _.countBy(cards, c => c.getPoint());
            let keys = _.keys(array);
            let values = _.values(array);
            for (let i = 0; i < values.length; i++) {
                if (values[i] + this.jokerCnt == 3) {
                    let value = _.find(cards, c => c.getPoint() == keys[i]);
                    if (this.value == undefined) {
                        this.value = value;
                    }
                    else if (this.value.compare(value) < 0) {
                        this.value = value;
                    }

                    this.cards = _.filter(cards, c => c.getPoint() != keys[i]);
                    this.cards.reverse();
                }
            }
        }

        return this.value != undefined;
    }

    compareSame(rule) {
        let r = this.value.compare(rule.value);
        if (r != 0) {
            return r;
        }

        if (!this.cards) return 0;

        for (let i = 0; i < this.cards.length; i++) {
            let r = this.cards[i].compare(rule.cards[i]);
            if (r != 0) {
                return r;
            }
        }

        // 比较花色
        for (let i = 0; i < this.cards.length; i++) {
            let r = this.cards[i].compare(rule.cards[i], false);
            if (r != 0) {
                return r;
            }
        }

        if (this.jokerCnt != rule.jokerCnt) {
            return this.jokerCnt == 0 ? 1 : -1;
        }

        return 0;
    }

    getScore(position = 0) {
        if (position == 1 && this.touSan) {
            // A最大
            if (this.value.getPoint() == cons.Poker.CardPoint.ACE()) {
                return 14;
            }
            if (this.value.getSuit() == cons.Poker.CardSuit.JOKER()) {
                return 20;
            }
            return this.value.getPoint();
        }
        return 3;
        // return super.getScore(position);
    }
}

// 两对
class LdRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.LD);
        this.jokerCnt = 0;
    }

    check(cards) {
        if (this.jokerCnt > 0) {
            // 有王，必不是两对
            return false;
        }

        let array = _.countBy(cards, c => c.getPoint());
        let keys = _.keys(array);
        let values = _.values(array);
        for (let i = 0; i < values.length; i++) {
            if (values[i] == 2) {
                let card = _.find(cards, c => c.getPoint() == keys[i]);
                if (this.value1 == undefined) {
                    this.value1 = card;
                }
                else if (this.value1.compare(card) > 0) {
                    this.value2 = card;
                }
                else {
                    this.value2 = this.value1;
                    this.value1 = card;
                }
            }
        }

        if (this.value1 == undefined || this.value2 == undefined) {
            return false;
        }

        this.singleCard = _.find(cards, c => c.getPoint() != this.value1.getPoint() && c.getPoint() != this.value2.getPoint());
        return true;
    }

    compareSame(rule) {
        let r = this.value1.compare(rule.value1);
        if (r != 0) {
            return r;
        }

        r = this.value2.compare(rule.value2);
        if (r != 0) {
            return r;
        }

        return this.singleCard.compare(rule.singleCard, false);
    }
}

// 对子
class DzRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.DZ);
    }

    check(cards) {
        let array = _.countBy(cards, c => c.getPoint());
        if (_.size(array) != 2 && _.size(array) != 4) {
            return;
        }

        // 1 1 1 1 或者 2 1 1 1
        if (this.jokerCnt == 1) {
            // 全剩单张
            this.cards = [...cards];
            this.value = this.cards.pop();
            this.cards.reverse();
            return true;
        }

        let index = _.indexOf(_.values(array), 2);
        if (index == -1) {
            return false;
        }

        let keys = _.keys(array);
        this.value = _.find(cards, c => c.getPoint() == keys[index]);
        this.cards = _.filter(cards, c => c.getPoint() != keys[index]);
        this.cards.reverse();

        return true;
    }

    compareSame(rule) {
        let r = this.value.compare(rule.value);
        if (r != 0) {
            return r;
        }

        for (let i = 0; i < this.cards.length; i++) {
            let r = this.cards[i].compare(rule.cards[i]);
            if (r != 0) {
                return r;
            }
        }

        // 比较花色
        for (let i = 0; i < this.cards.length; i++) {
            let r = this.cards[i].compare(rule.cards[i], false);
            if (r != 0) {
                return r;
            }
        }

        if (this.jokerCnt != rule.jokerCnt) {
            return this.jokerCnt == 0 ? 1 : -1;
        }

        return 0;
        // return this.cards[0].compare(rule.cards[0], true);
    }
}

// 散牌
class SpRule extends Rule {
    constructor() {
        super(ssscons.SSS.Formation.SP);
    }

    check(cards) {
        this.cards = [...cards];
        this.cards.sort((a, b) => b.getOrder() - a.getOrder());

        return true;
    }

    compareSame(rule) {
        for (let i = 0; i < this.cards.length; i++) {
            let r = this.cards[i].compare(rule.cards[i]);
            if (r != 0) {
                return r;
            }
        }

        // 比较花色
        for (let i = 0; i < this.cards.length; i++) {
            let r = this.cards[i].compare(rule.cards[i], false);
            if (r != 0) {
                return r;
            }
        }

        return 0;
        // return this.cards[0].compare(rule.cards[0], true);
    }
}

module.exports = Rule;