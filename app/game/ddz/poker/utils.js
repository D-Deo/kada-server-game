const cons = require('../../../common/constants');
const ddzcons = require('../common/constants');
const numberUtil = require('../../../utils/number');
const _ = require('underscore');

//牌型分析结构
class CardAnalyseResult {
    constructor() {
        this.cbFourCount = 0;           //四张数目
        this.cbThreeCount = 0;          //三张数目
        this.cbDoubleCount = 0;         //两张数目
        this.cbSignedCount = 0;         //单张数目
        this.cbFourCardData = [];       //四张扑克
        this.cbThreeCardData = [];      //三张扑克
        this.cbDoubleCardData = [];     //两张扑克
        this.cbSignedCardData = [];     //单张扑克
    }
}

//提示出牌结果
class OutCardAnalyseResult {
    constructor() {
        this.cbCardCount = 0;           //扑克数目
        this.cbResultCard = [];         //结果扑克
    }
}

let utils = module.exports = {};

utils.getType = (cards) => {
    if (utils.isOne(cards)) {
        return ddzcons.Formation.ONE();
    }
    if (utils.isPair(cards)) {
        return ddzcons.Formation.PAIR();
    }
    if (utils.isTriple(cards)) {
        return ddzcons.Formation.TRIPLE();
    }
    if (utils.isTripleOne(cards)) {
        return ddzcons.Formation.TRIPLE_1();
    }
    if (utils.isTriplePair(cards)) {
        return ddzcons.Formation.TRIPLE_2();
    }
    if (utils.isBomb(cards)) {
        return ddzcons.Formation.BOMB();
    }
    if (utils.isPlane(cards)) {
        return ddzcons.Formation.PLANE();
    }
    if (utils.isPlaneOne(cards)) {
        return ddzcons.Formation.PLANE_1();
    }
    if (utils.isPlanePair(cards)) {
        return ddzcons.Formation.PLANE_2();
    }
    if (utils.isSequence(cards)) {
        return ddzcons.Formation.SEQUENCE();
    }
    if (utils.isSequencePair(cards)) {
        return ddzcons.Formation.SEQUENCE_PAIR();
    }
    if (utils.isQuadTwo(cards)) {
        return ddzcons.Formation.QUAD_2();
    }
    if (utils.isRocket(cards)) {
        return ddzcons.Formation.ROCKET();
    }
}

// 单张
utils.isOne = (cards) => {
    return cards && cards.length == 1;
}

// 对子
utils.isPair = (cards) => {
    return cards && cards.length == 2 && cards[0].getPoint() == cards[1].getPoint();
}

// 三张
utils.isTriple = (cards) => {
    return cards && cards.length == 3 && cards[0].getPoint() == cards[1].getPoint() && cards[0].getPoint() == cards[2].getPoint();
}

// 三张带单
utils.isTripleOne = (cards) => {
    if (!cards) {
        return false;
    }
    let ret = _.groupBy(cards, (c) => {
        return c.getValue();
    });
    ret = _.sortBy(ret, r => r.length);
    return cards.length == 4 && ret.length == 2 && ret[0].length == 1 && ret[1].length == 3;
}


// 三张带对
utils.isTriplePair = (cards) => {
    if (!cards) {
        return false;
    }
    let ret = _.groupBy(cards, (c) => {
        return c.getValue();
    });
    ret = _.sortBy(ret, r => r.length);
    return cards.length == 5 && ret.length == 2 && ret[0].length == 2 && ret[1].length == 3;
}

// 四张带两张
utils.isQuadTwo = (cards) => {
    if (!cards) {
        return false;
    }
    let ret = _.groupBy(cards, (c) => {
        return c.getValue();
    });
    ret = _.sortBy(ret, r => r.length);
    return cards.length == 6 && ret.length == 3 && ret[ret.length - 1].length == 4;
}

// 顺子
utils.isSequence = (cards) => {
    if (!cards) {
        return false;
    }
    let ret = _.map(cards, c => c.getValue());
    return cards.length >= 5 && numberUtil.toSequence(ret, ret.length);
}

// 连对
utils.isSequencePair = (cards) => {
    if (!cards) {
        return false;
    }
    let ret = _.groupBy(cards, (c) => {
        return c.getValue();
    });
    ret = _.map(ret, (r, arr, key) => {
        if (r.length != 2) {
            return 0;
        }
        return key;
    });
    return cards.length % 2 == 0 && cards.length / 2 >= 5 && numberUtil.toSequence(ret, ret.length);
}

// 飞机
utils.isPlane = (cards) => {
    if (!cards) {
        return false;
    }
    let ret = _.groupBy(cards, (c) => {
        return c.getValue();
    });
    ret = _.map(ret, (r, arr, key) => {
        if (r.length != 3) {
            return 0;
        }
        return key;
    });
    return cards.length % 3 == 0 && cards.length / 3 >= 5 && numberUtil.toSequence(ret, ret.length);
}

// 飞机带单张
utils.isPlaneOne = (cards) => {
    if (!cards) {
        return false;
    }
    let ret = _.groupBy(cards, (c) => {
        return c.getValue();
    });

    let n3 = 0;
    let n1 = 0;
    ret = _.map(ret, (r, arr, key) => {
        if (r.length == 3) {
            n3 += 1;
            return key;
        }
        if (r.length == 1) {
            n1 += 1;
        }
        return 0;
    });

    if (n3 != n1) return false;

    ret = _.filter(ret, (r) => r != 0);
    return cards.length % 4 == 0 && cards.length / 4 >= 2 && numberUtil.toSequence(ret, ret.length);
}

// 飞机带对子
utils.isPlanePair = (cards) => {
    if (!cards) {
        return false;
    }
    let ret = _.groupBy(cards, (c) => {
        return c.getValue();
    });

    let n3 = 0;
    let n2 = 0;
    ret = _.map(ret, (r, arr, key) => {
        if (r.length == 3) {
            n3 += 1;
            return key;
        }
        if (r.length == 2) {
            n2 += 1;
        }
        return 0;
    });

    if (n3 != n2) return false;

    ret = _.filter(ret, (r) => r != 0);
    return cards.length % 5 == 0 && cards.length / 5 >= 2 && numberUtil.toSequence(ret, ret.length);
}

// 炸弹
utils.isBomb = (cards) => {
    if (!cards) {
        return false;
    }
    return cards.length == 4
        && cards[0].getPoint() == cards[1].getPoint()
        && cards[0].getPoint() == cards[2].getPoint()
        && cards[0].getPoint() == cards[3].getPoint();
}

// 火箭
utils.isRocket = (cards) => {
    if (!cards) {
        return false;
    }
    return cards.length == 2
        && cards[0].getPoint() >= ddzcons.CardPoint.SUB_JOKER()
        && cards[1].getPoint() >= ddzcons.CardPoint.SUB_JOKER();
}

// 顺子
utils.botIsSequence = (cards) => {
    if (!cards) {
        return false;
    }
    let ret = _.map(cards, c => c.getValue());
    return cards.length >= 3 && numberUtil.toSequence(ret, ret.length);
}
//有大小王翻倍
utils.hasKing = (cards) => {
    let count = 0;
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].getPoint() >= cons.Poker.CardPoint.SUB_JOKER()) {
            count++;
        }
    }
    return count;
}
// 炸弹
utils.botisBomb = (cards) => {
    if (!cards) {
        return false;
    }
    return cards.length == 3
        && cards[0].getPoint() == cards[1].getPoint()
        && cards[0].getPoint() == cards[2].getPoint()
}
// 同花
utils.botisSuit = (cards) => {
    if (!cards) {
        return false;
    }
    return cards.length == 3
        && cards[0].getSuit() == cards[1].getSuit()
        && cards[0].getSuit() == cards[2].getSuit()
}
//--------------------------------------------------------------

/**
 * 获取类型
 */
utils.getCardType = (cbCardData, cbCardCount) => {
    if (!cbCardData) return 0;

    cbCardData = utils.sortCard(cbCardData);
    cbCardCount = cbCardCount || cbCardData.length;

    // 简单牌型
    switch (cbCardCount) {
        case 0:	    //空牌
            return 0;
        case 1:     //单牌
            return ddzcons.Formation.ONE();
        case 2:	    //对牌或火箭
            //火箭
            if ((cbCardData[0].point == cons.Poker.CardPoint.MAIN_JOKER()) &&
                (cbCardData[1].point == cons.Poker.CardPoint.SUB_JOKER()))
                return ddzcons.Formation.ROCKET();

            //对子
            if (cbCardData[0].point == cbCardData[1].point)
                return ddzcons.Formation.PAIR();

            //无效
            return 0;
    }

    //分析扑克
    let analyseResult = utils.analyseCardData(cbCardData, cbCardCount);

    //四牌判断
    if (analyseResult.cbFourCount > 0) {
        //牌型判断
        if ((analyseResult.cbFourCount == 1) && (cbCardCount == 4)) return ddzcons.Formation.BOMB();
        if ((analyseResult.cbFourCount == 1) && (cbCardCount == 6)) return ddzcons.Formation.QUAD_2();

        return 0;
    }

    //三牌判断
    if (analyseResult.cbThreeCount > 0) {
        //三条类型
        if (analyseResult.cbThreeCount == 1 && cbCardCount == 3) return ddzcons.Formation.TRIPLE();

        //连牌判断
        if (analyseResult.cbThreeCount > 1) {
            //变量定义
            let cbCardData = analyseResult.cbThreeCardData[0];
            let cbLogicValue1 = utils.getObjectCardLogicValue(cbCardData);

            //错误过虑
            if (cbLogicValue1 >= 15) return 0;

            //连牌判断
            for (let i = 1; i < analyseResult.cbThreeCount; i++) {
                let cbCardData = analyseResult.cbThreeCardData[i * 3];
                if (cbLogicValue1 != (utils.getObjectCardLogicValue(cbCardData) + i)) return 0;
            }
        }

        //牌形判断
        if (analyseResult.cbThreeCount * 3 == cbCardCount) return ddzcons.Formation.SEQUENCE_PLANE();
        if (analyseResult.cbThreeCount * 4 == cbCardCount) return ddzcons.Formation.TRIPLE_1();
        if ((analyseResult.cbThreeCount * 5 == cbCardCount) && (analyseResult.cbDoubleCount == analyseResult.cbThreeCount)) return ddzcons.Formation.TRIPLE_2();

        return 0;
    }

    //两张类型
    if (analyseResult.cbDoubleCount >= 3) {
        //变量定义
        let cbCardData = analyseResult.cbDoubleCardData[0];
        let cbLogicValue1 = utils.getObjectCardLogicValue(cbCardData);

        //错误过虑
        if (cbLogicValue1 >= 15) return 0;

        //连牌判断
        for (let i = 1; i < analyseResult.cbDoubleCount; i++) {
            let cbCardData = analyseResult.cbDoubleCardData[i * 2];
            if (cbLogicValue1 != (utils.getObjectCardLogicValue(cbCardData) + i)) return 0;
        }

        //二连判断
        if ((analyseResult.cbDoubleCount * 2) == cbCardCount) return ddzcons.Formation.SEQUENCE_PAIR();

        return 0;
    }

    //单张判断
    if ((analyseResult.cbSignedCount >= 5) && (analyseResult.cbSignedCount == cbCardCount)) {
        //变量定义
        let cbCardData = analyseResult.cbSignedCardData[0];
        let cbLogicValue1 = utils.getObjectCardLogicValue(cbCardData);

        //错误过虑
        if (cbLogicValue1 >= 15) return 0;

        //连牌判断
        for (let i = 1; i < analyseResult.cbSignedCount; i++) {
            let cbCardData = analyseResult.cbSignedCardData[i];
            if (cbLogicValue1 != (utils.getObjectCardLogicValue(cbCardData) + i)) return 0;
        }

        return ddzcons.Formation.SEQUENCE();
    }

    return 0;
}

/**
 * 玩家手牌是否包含目标牌
 */
utils.contains = (mycards, cards) => {
    return _.every(cards, card1 => {
        return _.some(mycards, card2 => {
            return card2.getIndex() == card1.index;
        });
    });
}

//深拷贝
utils.deepCopy = (cards) => {
    return _.clone(cards);
    // if (!cards || cards.length == 0) return null;
    // let deepCards = [];
    // for (let i = 0; i < cards.length; i++) {
    //     deepCards.push(cards[i]);
    // }
    // return deepCards;
}
/**
 * 对比扑克
 * @param {array} cards1 第一组牌
 * @param {array} cards2 第二组牌
 */
utils.compareCard = (cards1, cards2) => {
    //获取类型
    let type1 = utils.getCardType(cards1, cards1.length);
    let type2 = utils.getCardType(cards2, cards2.length);

    let count1 = _.size(cards1);
    let count2 = _.size(cards2);

    let cbCardData1 = utils.sortCard(cards1);
    let cbCardData2 = utils.sortCard(cards2);

    if (type1 == ddzcons.Formation.ROCKET()) return false;
    if (type2 == ddzcons.Formation.ROCKET()) return true;

    //炸弹判断
    if ((type1 != ddzcons.Formation.BOMB()) && (type2 == ddzcons.Formation.BOMB())) return true;
    if ((type1 == ddzcons.Formation.BOMB()) && (type2 != ddzcons.Formation.BOMB())) return false;

    //规则判断
    if ((type1 != type2) || (count1 != count2)) return false;

    //开始对比
    switch (type2) {
        case ddzcons.Formation.ONE():
        case ddzcons.Formation.PAIR():
        case ddzcons.Formation.TRIPLE():
        case ddzcons.Formation.SEQUENCE():
        case ddzcons.Formation.SEQUENCE_PAIR():
        case ddzcons.Formation.SEQUENCE_PLANE():
        case ddzcons.Formation.BOMB():
            {
                //获取数值
                let cbLogicValue1 = utils.getObjectCardLogicValue(cbCardData1[0]);
                let cbLogicValue2 = utils.getObjectCardLogicValue(cbCardData2[0]);
                //对比扑克
                return cbLogicValue2 > cbLogicValue1;
            }
        case ddzcons.Formation.TRIPLE_1():
        case ddzcons.Formation.TRIPLE_2():
            {
                //分析扑克
                let result1 = utils.analyseCardData(cbCardData1, count1);
                let result2 = utils.analyseCardData(cbCardData2, count2);

                //获取数值
                let cbLogicValue1 = utils.getObjectCardLogicValue(result1.cbThreeCardData[0]);
                let cbLogicValue2 = utils.getObjectCardLogicValue(result2.cbThreeCardData[0]);

                //对比扑克
                return cbLogicValue2 > cbLogicValue1;
            }
        case ddzcons.Formation.QUAD_2():
            {
                //分析扑克
                let result1 = utils.analyseCardData(cbCardData1, count1);
                let result2 = utils.analyseCardData(cbCardData2, count2);

                //获取数值
                let cbLogicValue1 = utils.getObjectCardLogicValue(result1.cbFourCardData[0]);
                let cbLogicValue2 = utils.getObjectCardLogicValue(result2.cbFourCardData[0]);

                //对比扑克
                return cbLogicValue2 > cbLogicValue1;
            }
    }

    return false;
}

/**
 * 从源牌组中移除目标牌组并返回一个新的数组，操作不会影响源数组
 * @param {array} source 
 * @param {array} cards 
 * @return {array} 移除后的牌组
 */
utils.removeCards = (source, cards) => {
    for (let i = 0; i < cards.length; i++) {
        for (let j = 0; j < source.length; j++) {
            if (cards[i].index == source[j].index) {
                source.splice(j, 1);
                break;
            }
        }
    }
    return source;
};

//
/**
 * 从源牌组中移除目标牌组并返回一个新的数组，操作不会影响源数组
 * @param {array} source 
 * @param {array} cards 
 * @return {array} 移除后的牌组
 */
utils.removeCardsbyPoint = (source, cards) => {
    for (let i = 0; i < cards.length; i++) {
        for (let j = 0; j < source.length; j++) {
            if (cards[i].point == source[j].point) {
                source.splice(j, 1);
                break;
            }
        }
    }
    return source;
};


//出牌搜索
utils.searchOutCard = (cbHandCardData, cbHandCardCount, cbTurnCardData, cbTurnCardCount) => {
    //设置结果
    let OutCardResult = new OutCardAnalyseResult();
    //构造扑克
    let cbCardData = cbHandCardData;
    let cbCardCount = cbHandCardCount;

    //排列扑克
    cbCardData = utils.sortCard(cbCardData);

    //获取类型
    let cbTurnOutType = utils.getCardType(cbTurnCardData, cbTurnCardCount);

    //出牌分析
    switch (cbTurnOutType) {
        case 0:					//错误类型  自己出牌
            {
                //获取数值
                let cbLogicValue = utils.getObjectCardLogicValue(cbCardData[cbCardCount - 1]);

                //多牌判断
                let cbSameCount = 1;
                for (let i = 1; i < cbCardCount; i++) {
                    if (utils.getObjectCardLogicValue(cbCardData[cbCardCount - i - 1]) == cbLogicValue) cbSameCount++;
                    else break;
                }

                //完成处理
                if (cbSameCount > 1) {
                    OutCardResult.cbCardCount = cbSameCount;
                    for (let j = 0; j < cbSameCount; j++) OutCardResult.cbResultCard[j] = cbCardData[cbCardCount - 1 - j];
                    return OutCardResult;
                }

                //单牌处理
                OutCardResult.cbCardCount = 1;
                OutCardResult.cbResultCard[0] = cbCardData[cbCardCount - 1];

                return OutCardResult;

            }
        case ddzcons.Formation.ONE():					//单牌类型
        case ddzcons.Formation.PAIR():					//对牌类型
        case ddzcons.Formation.TRIPLE():					//三条类型
            {
                //获取数值
                let cbLogicValue = utils.getObjectCardLogicValue(cbTurnCardData[0]);

                //分析扑克
                let analyseResult = utils.analyseCardData(cbCardData, cbCardCount);

                //寻找单牌
                if (cbTurnCardCount <= 1) {
                    for (let i = 0; i < analyseResult.cbSignedCount; i++) {
                        let cbIndex = analyseResult.cbSignedCount - i - 1;
                        if (utils.getObjectCardLogicValue(analyseResult.cbSignedCardData[cbIndex]) > cbLogicValue) {
                            //设置结果
                            OutCardResult.cbCardCount = cbTurnCardCount;
                            //OutCardResult.cbResultCard = analyseResult.cbSignedCardData.OffsetArray(cbIndex).SetSize(cbTurnCardCount);
                            OutCardResult.cbResultCard = utils.pagination(cbIndex, cbTurnCardCount, analyseResult.cbSignedCardData);


                            return OutCardResult;
                        }
                    }
                }

                //寻找对牌
                if (cbTurnCardCount <= 2) {
                    for (let i = 0; i < analyseResult.cbDoubleCount; i++) {
                        let cbIndex = (analyseResult.cbDoubleCount - i - 1) * 2;
                        if (utils.getObjectCardLogicValue(analyseResult.cbDoubleCardData[cbIndex]) > cbLogicValue) {
                            //设置结果
                            OutCardResult.cbCardCount = cbTurnCardCount;
                            //OutCardResult.cbResultCard = analyseResult.cbDoubleCardData.OffsetArray(cbIndex).SetSize(cbTurnCardCount);
                            OutCardResult.cbResultCard = utils.pagination(cbIndex, cbTurnCardCount, analyseResult.cbDoubleCardData);
                            return OutCardResult;
                        }
                    }
                }

                //寻找三牌
                if (cbTurnCardCount <= 3) {
                    for (let i = 0; i < analyseResult.cbThreeCount; i++) {
                        let cbIndex = (analyseResult.cbThreeCount - i - 1) * 3;
                        if (utils.getObjectCardLogicValue(analyseResult.cbThreeCardData[cbIndex]) > cbLogicValue) {
                            //设置结果
                            OutCardResult.cbCardCount = cbTurnCardCount;
                            //OutCardResult.cbResultCard = analyseResult.cbThreeCardData.OffsetArray(cbIndex).SetSize(cbTurnCardCount);
                            OutCardResult.cbResultCard = utils.pagination(cbIndex, cbTurnCardCount, analyseResult.cbThreeCardData);
                            return OutCardResult;
                        }
                    }
                }

                break;

            }
        case ddzcons.Formation.SEQUENCE():		//单连类型
            {
                //长度判断
                if (cbCardCount < cbTurnCardCount) break;

                //获取数值
                let cbLogicValue = utils.getObjectCardLogicValue(cbTurnCardData[0]);

                //搜索连牌
                for (let i = (cbTurnCardCount - 1); i < cbCardCount; i++) {
                    //获取数值
                    let cbHandLogicValue = utils.getObjectCardLogicValue(cbCardData[cbCardCount - i - 1]);

                    //构造判断
                    if (cbHandLogicValue >= 15) break;
                    if (cbHandLogicValue <= cbLogicValue) continue;

                    //搜索连牌
                    let cbLineCount = 0;
                    for (let j = (cbCardCount - i - 1); j < cbCardCount; j++) {
                        if ((utils.getObjectCardLogicValue(cbCardData[j]) + cbLineCount) == cbHandLogicValue) {
                            //增加连数
                            OutCardResult.cbResultCard[cbLineCount++] = cbCardData[j];

                            //完成判断
                            if (cbLineCount == cbTurnCardCount) {
                                OutCardResult.cbCardCount = cbTurnCardCount;
                                return OutCardResult;
                            }
                        }
                    }
                }

                break;
            }
        case ddzcons.Formation.SEQUENCE_PAIR():		//对连类型
            {
                //长度判断
                if (cbCardCount < cbTurnCardCount) break;

                //获取数值
                let cbLogicValue = utils.getObjectCardLogicValue(cbTurnCardData[0]);

                //搜索连牌
                for (let i = (cbTurnCardCount - 1); i < cbCardCount; i++) {
                    //获取数值
                    let cbHandLogicValue = utils.getObjectCardLogicValue(cbCardData[cbCardCount - i - 1]);

                    //构造判断
                    if (cbHandLogicValue <= cbLogicValue) continue;
                    if ((cbTurnCardCount > 1) && (cbHandLogicValue >= 15)) break;

                    //搜索连牌
                    let cbLineCount = 0;
                    for (let j = (cbCardCount - i - 1); j < (cbCardCount - 1); j++) {
                        if (((utils.getObjectCardLogicValue(cbCardData[j]) + cbLineCount) == cbHandLogicValue)
                            && ((utils.getObjectCardLogicValue(cbCardData[j + 1]) + cbLineCount) == cbHandLogicValue)) {
                            //增加连数
                            OutCardResult.cbResultCard[cbLineCount * 2] = cbCardData[j];
                            OutCardResult.cbResultCard[(cbLineCount++) * 2 + 1] = cbCardData[j + 1];

                            //完成判断
                            if (cbLineCount * 2 == cbTurnCardCount) {
                                OutCardResult.cbCardCount = cbTurnCardCount;
                                return OutCardResult;
                            }
                        }
                    }
                }

                break;

            }
        case ddzcons.Formation.SEQUENCE_PLANE():				//三连类型
        case ddzcons.Formation.TRIPLE_1():	//三带一单
        case ddzcons.Formation.TRIPLE_2():	//三带一对
            {
                //长度判断
                if (cbCardCount < cbTurnCardCount) break;
                //获取数值
                let cbLogicValue = 0;
                for (let i = 0; i < cbTurnCardCount - 2; i++) {
                    cbLogicValue = utils.getObjectCardLogicValue(cbTurnCardData[i]);
                    if (utils.getObjectCardLogicValue(cbTurnCardData[i + 1]) != cbLogicValue) continue;
                    if (utils.getObjectCardLogicValue(cbTurnCardData[i + 2]) != cbLogicValue) continue;
                    break;
                }

                //属性数值
                let cbTurnLineCount = 0;
                if (cbTurnOutType == ddzcons.Formation.TRIPLE_1()) cbTurnLineCount = cbTurnCardCount / 4;
                else if (cbTurnOutType == ddzcons.Formation.TRIPLE_2()) cbTurnLineCount = cbTurnCardCount / 5;
                else cbTurnLineCount = cbTurnCardCount / 3;

                //搜索连牌
                for (let i = cbTurnLineCount * 3 - 1; i < cbCardCount; i++) {
                    //获取数值
                    let cbHandLogicValue = utils.getObjectCardLogicValue(cbCardData[cbCardCount - i - 1]);

                    //构造判断
                    if (cbHandLogicValue <= cbLogicValue) continue;
                    if ((cbTurnLineCount > 1) && (cbHandLogicValue >= 15)) break;

                    //搜索连牌
                    let cbLineCount = 0;
                    for (let j = (cbCardCount - i - 1); j < (cbCardCount - 2); j++) {
                        //设置变量
                        OutCardResult.cbCardCount = 0;

                        //三牌判断
                        if ((utils.getObjectCardLogicValue(cbCardData[j]) + cbLineCount) != cbHandLogicValue) continue;
                        if ((utils.getObjectCardLogicValue(cbCardData[j + 1]) + cbLineCount) != cbHandLogicValue) continue;
                        if ((utils.getObjectCardLogicValue(cbCardData[j + 2]) + cbLineCount) != cbHandLogicValue) continue;

                        //增加连数
                        OutCardResult.cbResultCard[cbLineCount * 3] = cbCardData[j];
                        OutCardResult.cbResultCard[cbLineCount * 3 + 1] = cbCardData[j + 1];
                        OutCardResult.cbResultCard[(cbLineCount++) * 3 + 2] = cbCardData[j + 2];

                        //完成判断
                        if (cbLineCount == cbTurnLineCount) {
                            //连牌设置
                            OutCardResult.cbCardCount = cbLineCount * 3;

                            //构造扑克
                            let cbLeftCardData = [];
                            let cbLeftCount = cbCardCount - OutCardResult.cbCardCount;
                            //cbLeftCardData = cbCardData.OffsetArray(0).SetSize(cbCardCount);
                            cbLeftCardData = utils.pagination(0, cbCardCount, cbCardData);

                            cbLeftCardData = utils._RemoveCard(OutCardResult.cbResultCard, OutCardResult.cbCardCount, cbLeftCardData, cbCardCount);

                            //分析扑克
                            let analyseResultLeft = utils.analyseCardData(cbLeftCardData, cbLeftCount);

                            //单牌处理
                            if (cbTurnOutType == ddzcons.Formation.TRIPLE_1()) {
                                //提取单牌
                                for (let k = 0; k < analyseResultLeft.cbSignedCount; k++) {
                                    //中止判断
                                    if (OutCardResult.cbCardCount == cbTurnCardCount) break;

                                    //设置扑克
                                    let cbIndex = analyseResultLeft.cbSignedCount - k - 1;
                                    let cbSignedCard = analyseResultLeft.cbSignedCardData[cbIndex];
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbSignedCard;
                                }

                                //提取对牌
                                for (let k = 0; k < analyseResultLeft.cbDoubleCount * 2; k++) {
                                    //中止判断
                                    if (OutCardResult.cbCardCount == cbTurnCardCount) break;

                                    //设置扑克
                                    let cbIndex = (analyseResultLeft.cbDoubleCount * 2 - k - 1);
                                    let cbSignedCard = analyseResultLeft.cbDoubleCardData[cbIndex];
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbSignedCard;
                                }

                                //提取三牌
                                for (let k = 0; k < analyseResultLeft.cbThreeCount * 3; k++) {
                                    //中止判断
                                    if (OutCardResult.cbCardCount == cbTurnCardCount) break;

                                    //设置扑克
                                    let cbIndex = (analyseResultLeft.cbThreeCount * 3 - k - 1);
                                    let cbSignedCard = analyseResultLeft.cbThreeCardData[cbIndex];
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbSignedCard;
                                }

                                //提取四牌
                                for (let k = 0; k < analyseResultLeft.cbFourCount * 4; k++) {
                                    //中止判断
                                    if (OutCardResult.cbCardCount == cbTurnCardCount) break;

                                    //设置扑克
                                    let cbIndex = (analyseResultLeft.cbFourCount * 4 - k - 1);
                                    let cbSignedCard = analyseResultLeft.cbFourCardData[cbIndex];
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbSignedCard;
                                }
                            }

                            //对牌处理
                            if (cbTurnOutType == ddzcons.Formation.TRIPLE_2()) {
                                //提取对牌
                                for (let k = 0; k < analyseResultLeft.cbDoubleCount; k++) {
                                    //中止判断
                                    if (OutCardResult.cbCardCount == cbTurnCardCount) break;

                                    //设置扑克
                                    let cbIndex = (analyseResultLeft.cbDoubleCount - k - 1) * 2;
                                    let cbCardData1 = analyseResultLeft.cbDoubleCardData[cbIndex];
                                    let cbCardData2 = analyseResultLeft.cbDoubleCardData[cbIndex + 1];
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbCardData1;
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbCardData2;
                                }

                                //提取三牌
                                for (let k = 0; k < analyseResultLeft.cbThreeCount; k++) {
                                    //中止判断
                                    if (OutCardResult.cbCardCount == cbTurnCardCount) break;

                                    //设置扑克
                                    let cbIndex = (analyseResultLeft.cbThreeCount - k - 1) * 3;
                                    let cbCardData1 = analyseResultLeft.cbThreeCardData[cbIndex];
                                    let cbCardData2 = analyseResultLeft.cbThreeCardData[cbIndex + 1];
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbCardData1;
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbCardData2;
                                }

                                //提取四牌
                                for (let k = 0; k < analyseResultLeft.cbFourCount; k++) {
                                    //中止判断
                                    if (OutCardResult.cbCardCount == cbTurnCardCount) break;

                                    //设置扑克
                                    let cbIndex = (analyseResultLeft.cbFourCount - k - 1) * 4;
                                    let cbCardData1 = analyseResultLeft.cbFourCardData[cbIndex];
                                    let cbCardData2 = analyseResultLeft.cbFourCardData[cbIndex + 1];
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbCardData1;
                                    OutCardResult.cbResultCard[OutCardResult.cbCardCount++] = cbCardData2;
                                }
                            }

                            //完成判断
                            if (OutCardResult.cbCardCount == cbTurnCardCount) return OutCardResult;
                        }
                    }
                }

                break;
            }
    }

    //搜索炸弹
    if ((cbCardCount >= 4) && (cbTurnOutType != ddzcons.Formation.ROCKET())) {
        //变量定义
        let cbLogicValue = 0;
        if (cbTurnOutType == ddzcons.Formation.BOMB()) cbLogicValue = utils.getObjectCardLogicValue(cbTurnCardData[0]);

        //搜索炸弹
        for (let i = 3; i < cbCardCount; i++) {
            //获取数值
            let cbHandLogicValue = utils.getObjectCardLogicValue(cbCardData[cbCardCount - i - 1]);

            //构造判断
            if (cbHandLogicValue <= cbLogicValue) continue;

            //炸弹判断
            let cbTempLogicValue = utils.getObjectCardLogicValue(cbCardData[cbCardCount - i - 1]);
            let j = 1;
            for (; j < 4; j++) {
                if (utils.getObjectCardLogicValue(cbCardData[cbCardCount + j - i - 1]) != cbTempLogicValue) break;
            }
            if (j != 4) continue;

            //设置结果
            OutCardResult.cbCardCount = 4;
            OutCardResult.cbResultCard[0] = cbCardData[cbCardCount - i - 1];
            OutCardResult.cbResultCard[1] = cbCardData[cbCardCount - i];
            OutCardResult.cbResultCard[2] = cbCardData[cbCardCount - i + 1];
            OutCardResult.cbResultCard[3] = cbCardData[cbCardCount - i + 2];

            return OutCardResult;
        }
    }

    //搜索火箭
    if ((cbCardCount >= 2) && (cbCardData[0].point == 15) && (cbCardData[1].point == 14)) {
        //设置结果
        OutCardResult.cbCardCount = 2;
        OutCardResult.cbResultCard[0] = cbCardData[0];
        OutCardResult.cbResultCard[1] = cbCardData[1];

        return OutCardResult;
    }

    return OutCardResult;
}

utils.pagination = (beginIdx, size, array) => {

    return array.slice(beginIdx, beginIdx + size);
}

//删除扑克
utils._RemoveCard = (cbRemoveCard, cbRemoveCount, cbCardData, cbCardCount) => {
    //检验数据
    //ASSERT(cbRemoveCount<=cbCardCount);

    //定义变量
    let cbDeleteCount = 0, cbTempCardData = cbCardData;
    if (cbCardCount > (cbTempCardData.length)) return cbCardData;
    //置零扑克
    for (let i = 0; i < cbRemoveCount; i++) {
        for (let j = 0; j < cbCardCount; j++) {
            if (cbRemoveCard[i] == cbTempCardData[j]) {
                cbDeleteCount++;
                cbTempCardData[j] = 0;
                break;
            }
        }
    }
    if (cbDeleteCount != cbRemoveCount) return cbCardData;

    //清理扑克
    let cbCardPos = 0;
    for (let i = 0; i < cbCardCount; i++) {
        if (cbTempCardData[i] != 0) cbCardData[cbCardPos++] = cbTempCardData[i];
    }

    return cbCardData;
}

utils.sortCard = (cbCardData) => {
    let cbCardCount = _.size(cbCardData);

    //数目过虑
    if (cbCardCount == 0) return cbCardData;

    //转换数值
    let cbSortValue = [];
    for (let i = 0; i < cbCardCount; i++) cbSortValue[i] = utils.getObjectCardLogicValue(cbCardData[i]);

    //排序操作
    let bSorted = true;
    let cbThreeCount, cbLast = cbCardCount - 1;
    do {
        bSorted = true;
        for (let i = 0; i < cbLast; i++) {
            if ((cbSortValue[i] < cbSortValue[i + 1]) ||
                ((cbSortValue[i] == cbSortValue[i + 1]) && (cbCardData[i].index < cbCardData[i + 1].index))) {
                //交换位置
                cbThreeCount = cbCardData[i];
                cbCardData[i] = cbCardData[i + 1];
                cbCardData[i + 1] = cbThreeCount;
                cbThreeCount = cbSortValue[i];
                cbSortValue[i] = cbSortValue[i + 1];
                cbSortValue[i + 1] = cbThreeCount;
                bSorted = false;
            }
        }
        cbLast--;
    } while (bSorted == false);

    return cbCardData;
}

utils.getObjectCardLogicValue = (cbCardData) => {
    let cbCardColor = cbCardData.suit;
    let cbCardValue = cbCardData.point;

    //转换数值
    // if (cbCardColor == 5) return cbCardValue + 2;
    // return (cbCardValue <= 2) ? (cbCardValue + 13) : cbCardValue;

    if (cbCardColor == cons.Poker.CardSuit.JOKER()) return cbCardValue + 2;
    return (cbCardValue <= cons.Poker.CardPoint.TWO()) ? (cbCardValue + cons.Poker.CardPoint.KING()) : cbCardValue;
}

/**
 * 分析扑克
 */
utils.analyseCardData = (cbCardData, cbCardCount) => {

    let analyseResult = new CardAnalyseResult();

    //扑克分析
    for (let i = 0; i < cbCardCount; i++) {
        //变量定义
        let cbSameCount = 1, cbCardValueTemp = 0;
        let cbLogicValue = utils.getObjectCardLogicValue(cbCardData[i]);

        //搜索同牌
        for (let j = i + 1; j < cbCardCount; j++) {
            //获取扑克
            if (utils.getObjectCardLogicValue(cbCardData[j]) != cbLogicValue) break;
            //设置变量
            cbSameCount++;
        }

        //设置结果
        switch (cbSameCount) {
            case 1:		//单张
                {
                    let cbIndex = analyseResult.cbSignedCount++;
                    analyseResult.cbSignedCardData[cbIndex * cbSameCount] = cbCardData[i];
                    break;
                }
            case 2:		//两张
                {
                    let cbIndex = analyseResult.cbDoubleCount++;
                    analyseResult.cbDoubleCardData[cbIndex * cbSameCount] = cbCardData[i];
                    analyseResult.cbDoubleCardData[cbIndex * cbSameCount + 1] = cbCardData[i + 1];
                    break;
                }
            case 3:		//三张
                {
                    let cbIndex = analyseResult.cbThreeCount++;
                    analyseResult.cbThreeCardData[cbIndex * cbSameCount] = cbCardData[i];
                    analyseResult.cbThreeCardData[cbIndex * cbSameCount + 1] = cbCardData[i + 1];
                    analyseResult.cbThreeCardData[cbIndex * cbSameCount + 2] = cbCardData[i + 2];
                    break;
                }
            case 4:		//四张
                {
                    let cbIndex = analyseResult.cbFourCount++;
                    analyseResult.cbFourCardData[cbIndex * cbSameCount] = cbCardData[i];
                    analyseResult.cbFourCardData[cbIndex * cbSameCount + 1] = cbCardData[i + 1];
                    analyseResult.cbFourCardData[cbIndex * cbSameCount + 2] = cbCardData[i + 2];
                    analyseResult.cbFourCardData[cbIndex * cbSameCount + 3] = cbCardData[i + 3];
                    break;
                }
        }

        //设置索引
        i += cbSameCount - 1;
    }

    return analyseResult;
}

/**
 * 打印一组扑克牌的信息
 * @param {array} cards Card的数组
 */
utils.printCards = (cards) => {
    let rs = '';
    _.each(cards, (c) => {
        let s = '';
        switch (c.suit) {
            case cons.Poker.CardSuit.DIAMOND():
                s += '方片';
                break;
            case cons.Poker.CardSuit.CLUB():
                s += '草花';
                break;
            case cons.Poker.CardSuit.HEART():
                s += '红桃';
                break;
            case cons.Poker.CardSuit.SPADE():
                s += '黑桃';
                break;
        }
        switch (c.point) {
            case cons.Poker.CardPoint.ACE():
                s += 'A';
                break;
            case cons.Poker.CardPoint.JACK():
                s += 'J';
                break;
            case cons.Poker.CardPoint.QUEEN():
                s += 'Q';
                break;
            case cons.Poker.CardPoint.KING():
                s += 'K';
                break;
            default:
                s += '' + c.point;
                break;
        }
        rs += rs.length > 0 ? ',' + s : s;
    });
    return '<' + rs + '>';
};

utils.calculateRemainScore = (cards, outcards) => {
    let mycards = cards.concat();
    if (outcards) {
        for (let i = 0; i < outcards.length; i++) {
            if (!outcards[i]) continue;
            mycards[outcards[i].key]--;
        }
    }
    let classifyCards = utils.classify(mycards);
    let sumScore = 0;
    let BigScore = 0;
    let sumtemp = 0;
    //计算各种情况，分数最大值
    BigScore += 6 * mycards[ddzcons.CardPoint.TWO()];
    BigScore += 4 * mycards[ddzcons.CardPoint.ACE()];
    BigScore += 10 * mycards[ddzcons.CardPoint.SUB_JOKER()];
    BigScore += 12 * mycards[ddzcons.CardPoint.MAIN_JOKER()];
    BigScore += 12 * utils.getLength(classifyCards.BombCards);
    if (BigScore > 27) {
        return Infinity;
    }

    //计算第一个顺子，并减去该牌后再次计算
    let SeqCards = classifyCards.SeqCards;
    if (utils.getLength(SeqCards) > 0) {
        let MinIndex = utils.MinCardIndex(SeqCards);

        let SeqFirstScore = 0;
        //根据顺子最大值，以及张数进行判断
        //SeqFirstScore -= SeqCards[MinIndex].key + SeqCards[MinIndex].count - 1 < 8 ? 8 - SeqCards[MinIndex].key + SeqCards[MinIndex].count - 1 : 0;
        SeqFirstScore += SeqCards[MinIndex].key + SeqCards[MinIndex].count - 1 < 10 ? (9 - SeqCards[MinIndex].key + SeqCards[MinIndex].count) * 3 : 0;

        //SeqFirstScore -= SeqCards[MinIndex].count < 6 ? 6 - SeqCards[MinIndex].count : 0;
        SeqFirstScore += SeqCards[MinIndex].count > 4 ? (SeqCards[MinIndex].count - 4) * 2 : 0;

        for (let j = 0; j < SeqCards.SeqCnt; j++) {
            mycards[SeqCards[MinIndex].key + j]--;
        }
        BigScore += SeqFirstScore;
        classifyCards = utils.classify(mycards);
    }


    let TripleLength = utils.getLength(classifyCards.TripleCards);
    //出单牌的情况，减少三带一的个数
    let SingleOutScore = 0;
    for (let i = 1; i < classifyCards.SingleCards.length; i++) {
        if (!classifyCards.SingleCards[i]) continue;
        if (TripleLength != 0) {
            TripleLength--;
            continue;
        }
        SingleOutScore -= classifyCards.SingleCards[i].key < 12 ? (10 - classifyCards.SingleCards[i].key > 0 ? (10 - classifyCards.SingleCards[i].key) * 2 : -2) : 0;
        //SingleOutScore -= classifyCards.SingleCards[i].key < 8 ? -2 : 0;;
    }
    //计算对子分数
    let PairOutScore = 0;
    for (let i = 1; i < classifyCards.PairCards.length; i++) {
        if (!classifyCards.PairCards[i]) continue;
        if (TripleLength != 0) {
            TripleLength--;
            continue;
        }
        PairOutScore -= classifyCards.PairCards[i].key < 8 ? 8 - classifyCards.PairCards[i].key - 1 : 0;
    }
    let PairSeqScore = 0;
    let cnt = 0;
    for (let i = 1; i <= classifyCards.PairCards.length; i++) {
        if (!classifyCards.PairCards[i] && !classifyCards.TripleCards[i]) {
            if (cnt >= 3 && i > 1) {
                let numScore = 0;
                if (classifyCards.PairCards[i - 1]) {
                    numScore = parseInt(classifyCards.PairCards[i - 1].key / 3);
                }
                else if (classifyCards.TripleCards[i - 1]) {
                    numScore = parseInt(classifyCards.TripleCards[i - 1].key / 3);
                }
                PairSeqScore = PairSeqScore + numScore + cnt * 3;
                cnt = 0;
            }
            continue;
        }
        cnt++;
        if (!classifyCards.PairCards[i] && classifyCards.TripleCards[i]) {
            SingleOutScore -= classifyCards.TripleCards[i].key < 12 ? (10 - classifyCards.TripleCards[i].key > 0 ? (10 - classifyCards.TripleCards[i].key) * 2 : -2) : 0;
        }
        //PairSeqScore += classifyCards.PairCards[i].key < 8 ? 8 - classifyCards.PairCards[i].key - 1 : 0;
    }
    //计算三张分数
    let TripleOutScore = 0;
    for (let i = classifyCards.TripleCards.length - 1; i > 0 ; i--) {
        if (!classifyCards.TripleCards[i]) continue;
        if (TripleLength != 0) {
            TripleLength--;
            continue;
        }
        numScore = parseInt(classifyCards.TripleCards[i].key / 3);
        TripleOutScore = TripleOutScore + numScore + 3;
        //TripleOutScore -= classifyCards.TripleCards[i].key < 5 ? 5 - classifyCards.TripleCards[i].key  : 0;
        //TripleOutScore = TripleOutScore +(classifyCards.TripleCards[i].key > 5 && classifyCards.TripleCards[i].key < 13) ? (classifyCards.TripleCards[i].key - 5) * 2 : 0;
        //SingleOutScore -= classifyCards.SingleCards[i].key < 8 ? -2 : 0;;
    }
    let TriSeqScore = 0;
    let tripCnt = 0;
    for (let i = 1; i <= classifyCards.TripleCards.length; i++) {
        if (!classifyCards.TripleCards[i]) {
            if (tripCnt >= 2 && i > 1) {
                let numScore = 0;
                if (classifyCards.TripleCards[i - 1]) {
                    numScore = parseInt(classifyCards.TripleCards[i - 1].key / 3);
                }
                TriSeqScore = TriSeqScore + numScore + tripCnt * 5;
                tripCnt = 0;
            }
            continue;
        }
        tripCnt++;
    }
    sumtemp += BigScore + SingleOutScore + PairOutScore + TripleOutScore + PairSeqScore + TriSeqScore;
    sumScore = sumtemp;

    //出顺子的情况
    let biggestClassify = null;
    let SeqTwoSingleScore = 0;
    SeqCards = utils.getTypeCard(cards, ddzcons.Formation.SEQUENCE());
    for (let i = 0; i < SeqCards.length; i++) {
        if (!SeqCards[i]) continue;
        let SeqSingleScore = 0;
        let SeqFirstScore = 0;
        //根据顺子最大值，以及张数进行判断
        // SeqFirstScore -= SeqCards[i].key + SeqCards[i].count - 1 < 8 ? 8 - SeqCards[i].key + SeqCards[i].count - 1 : 0;
        SeqFirstScore += SeqCards[i].key + SeqCards[i].count - 1 < 9 ? (9 - SeqCards[i].key + SeqCards[i].count) * 3 : 0;

        //SeqFirstScore -= SeqCards[i].count < 6 ? 6 - SeqCards[i].count : 0;
        SeqFirstScore += SeqCards[i].count > 4 ? SeqCards[i].count - 4 : 0;
        let SeqScoreCards = mycards.concat();
        for (let j = 0; j < SeqCards.SeqCnt; j++) {
            SeqScoreCards[SeqCards[i].key + j]--;
        }
        //计算两种情况
        //出掉一把顺子后出单牌
        classifyCards = utils.classify(SeqScoreCards);
        let TripleLG2 = utils.getLength(classifyCards.TripleCards);
        for (let i = 1; i < classifyCards.SingleCards.length; i++) {
            if (!classifyCards.SingleCards[i]) continue;
            if (TripleLG2 != 0) {
                TripleLG2--;
                continue;
            }
            SeqSingleScore -= classifyCards.SingleCards[i].key < 12 ? (10 - classifyCards.SingleCards[i].key > 0 ? (10 - classifyCards.SingleCards[i].key) * 2 : -2) : 0;
            //   SeqSingleScore -= classifyCards.SingleCards[i].key < 8 ? 8 - classifyCards.SingleCards[i].key : 0;;
        }
        sumtemp = BigScore + SeqFirstScore + SeqSingleScore;
        if (sumtemp > sumScore) {
            sumScore = sumtemp;
            sumScore = sumtemp;

        }

        //出掉顺子后再出一把顺子
        let SeqTwoCards = utils.getTypeCard(cards, ddzcons.Formation.SEQUENCE());
        if (utils.getLength(SeqTwoCards) == 0) break;
        for (let i = 0; i < SeqTwoCards.length; i++) {
            if (!SeqTwoCards[i]) continue;
            let SeqTwoScore = 0;
            let SeqTwoSingleScore = 0
            //SeqTwoScore -= SeqTwoCards[i].key + SeqTwoCards.count - 1 < 8 ? 8 - SeqTwoCards[i].key + SeqTwoCards.count - 1 : 0;
            SeqTwoScore += SeqTwoCards[i].key + SeqTwoCards[i].count - 1 > 9 ? SeqTwoCards[i].key + SeqTwoCards[i].count - 9 : 0;

            //SeqTwoScore -= SeqTwoCards.count < 6 ? 6 - SeqTwoCards.count : 0;
            SeqTwoScore += SeqTwoCards[i].count > 5 ? SeqTwoCards[i].count - 5 : 0;
            for (let j = 0; j < SeqTwoCards.SeqCnt; j++) {
                SeqScoreCards[SeqTwoCards[i].key + j]--;
            }
            classifyCards = utils.classify(SeqScoreCards);
            let TripleLG3 = utils.getLength(classifyCards.TripleCards);
            for (let i = 1; i < classifyCards.SingleCards.length; i++) {
                if (!classifyCards.SingleCards[i]) continue;
                if (TripleLG3 != 0) {
                    TripleLG3--;
                    continue;
                }
                SeqTwoSingleScore -= classifyCards.SingleCards[i].key < 8 ? 8 - classifyCards.SingleCards[i].key : 0;;
            }
            sumtemp = BigScore + SeqFirstScore + SeqTwoScore + SeqTwoSingleScore;
            if (sumtemp > sumScore) {
                sumScore = sumtemp;
                sumScore = sumtemp;

            }
        }
    }
    return sumScore;
}


utils.getLength = (cards) => {
    if (!cards) {
        return 0;
    }
    let length = 0;
    for (let i = 0; i < cards.length; i++) {
        if (cards[i]) {
            length++;
        }
    }
    return length;
}

utils.classify = (cards) => {
    let classifyCards = [];
    classifyCards.SequenceCard = utils.getTypeCard(cards, ddzcons.Formation.SEQUENCE());
    classifyCards.BombCards = utils.getTypeCard(cards, ddzcons.Formation.BOMB());
    classifyCards.TripleCards = utils.getTypeCard(cards, ddzcons.Formation.TRIPLE());
    classifyCards.PairCards = utils.getTypeCard(cards, ddzcons.Formation.PAIR());
    classifyCards.SingleCards = utils.getTypeCard(cards, ddzcons.Formation.ONE());

    return classifyCards;
}

utils.getTypeCard = (cards, type) => {
    let result = [];

    if (type == ddzcons.Formation.ONE()) {
        result = _.map(cards, (num, key) => {
            if (num == 1) {
                return { key: key };
            }
        });
    }
    if (type == ddzcons.Formation.PAIR()) {
        result = _.map(cards, (num, key) => {
            if (num == 2) {
                return { key: key };
            }
        });
    }
    if (type == ddzcons.Formation.TRIPLE()) {
        result = _.map(cards, (num, key) => {
            if (num == 3) {
                return { key: key };
            }
        });
    }
    if (type == ddzcons.Formation.BOMB()) {
        result = _.map(cards, (num, key) => {
            if (num == 4) {
                return { key: key };
            }
        });
    }

    if (type == ddzcons.Formation.SEQUENCE()) {
        result = _.map(cards, (num, key) => {
            if (!cards[key]) return null;
            let SeqCnt = 0;
            for (let i = key; i <= ddzcons.CardPoint.ACE(); i++) {
                if (cards[i]) {
                    SeqCnt++;
                }
                else {
                    if (SeqCnt >= 5) {
                        return { key: key, count: SeqCnt };
                    }
                    SeqCnt = 0;
                    return null;
                }
            }
            if (SeqCnt >= 5) {
                return { key: key, count: SeqCnt };
            }
            return null;
        });
    }
    return result;
}

utils.MinCardIndex = (cards) => {
    if (!cards || cards.length == 0) {
        return null;
    }
    let index = -1;
    for (let i = 0; i < cards.length; i++) {
        if (!cards[i]) continue;
        index = cards[i].key;
        break;
    }

    if (index == -1) {
        return null;
    }
    return index;
}


utils.InfoToCount = (cards) => {
    if (!cards || cards.length == 0) {
        return null;
    }

    let cardsInfo = [];
    for (let i = 1; i < 16; i++) {
        cardsInfo[i] = 0;
    }

    for (let i = 0; i < cards.length; i++) {
        cardsInfo[utils.getValue(cards[i].point)]++;
    }

    return cardsInfo;
}

utils.getValue = (point) => {
    if (point == cons.Poker.CardPoint.ACE()) {
        return cons.Poker.CardPoint.QUEEN();
    } else if (point == cons.Poker.CardPoint.TWO()) {
        return cons.Poker.CardPoint.KING();
    } else if (point >= cons.Poker.CardPoint.SUB_JOKER()) {
        return point;
    } else {
        return point - 2;
    }
}