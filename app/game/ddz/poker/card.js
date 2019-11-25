const Super = require('../../../poker/card');
const cons = require('../../../common/constants');
const ddzcons = require('../common/constants');
const utils = require('./utils');
const _ = require('underscore');
// const Formatter = require('../poker/formatter');

class Card extends Super {
    static fake() {
        // let card = new Card(cons.Poker.CardSuit.JOKER(), cons.Poker.CardPoint.MAIN_JOKER(), 0);
        // card.enableExtra(cons.Poker.CardExtra.FAKE());
        // return card;
        return 0;
    }

    /**
     * 比较牌型
     * @param {{cards, formation}} group 要检验的牌型
     * @param {{cards, formation}} otherGroup 要检验的牌型与此组牌型的大小比较
     */
    static compare(group, otherGroup) {
        let ret = false;
        if (group.formation == ddzcons.Formation.ONE() && utils.isOne(group.cards)) {
            ret = true;
        } else if (group.formation == ddzcons.Formation.PAIR() && utils.isPair(group.cards)) {
            ret = true;
        } else if (group.formation == ddzcons.Formation.TRIPLE() && utils.isTriple(group.cards)) {
            ret = true;
        } else if (group.formation == ddzcons.Formation.TRIPLE_1() && utils.isTripleOne(group.cards)) {
            ret = true;
        } else if (group.formation == ddzcons.Formation.TRIPLE_2() && utils.isTriplePair(group.cards)) {           // 三张带对子
            ret = true;
        } else if (group.formation == ddzcons.Formation.QUAD_2() && utils.isQuadTwo(group.cards)) {             // 四张带两张
            ret = true;
        } else if (group.formation == ddzcons.Formation.SEQUENCE() && utils.isSequence(group.cards)) {           // 顺子
            ret = true;
        } else if (group.formation == ddzcons.Formation.SEQUENCE_PAIR() && utils.isSequencePair(group.cards)) {      // 连对
            ret = true;
        } else if (group.formation == ddzcons.Formation.PLANE() && utils.isPlane(group.cards)) {              // 飞机
            ret = true;
        } else if (group.formation == ddzcons.Formation.PLANE_1() && utils.isPlaneOne(group.cards)) {            // 飞机带单张
            ret = true;
        } else if (group.formation == ddzcons.Formation.PLANE_2() && utils.isPlanePair(group.cards)) {            // 飞机带对子
            ret = true;
        } else if (group.formation == ddzcons.Formation.SEQUENCE_PLANE() && utils.isSequenceTriple(group.cards)) {     // 三顺
            ret = true;
        } else if (group.formation == ddzcons.Formation.SEQUENCE_PLANE_1() && utils.isSequencePlaneOne(group.cards)) {   // 飞机带单顺
            ret = true;
        } else if (group.formation == ddzcons.Formation.SEQUENCE_PLANE_2() && utils.isSequencePlanePair(group.cards)) {   // 飞机带对顺
            ret = true;
        } else if (group.formation == ddzcons.Formation.BOMB() && utils.isBomb(group.cards)) {
            ret = true;
        } else if (group.formation == ddzcons.Formation.ROCKET() && utils.isRocket(group.cards)) {
            ret = true;
        }
    }

    constructor(suit, point, index, extras) {
        super(suit, point, index, extras);
    }

    getPoint() {
        return this.point;
    }

    getSuit() {
        return this.suit;
    }

    getValue() {
        if (this.point == cons.Poker.CardPoint.ACE()) {
            return cons.Poker.CardPoint.QUEEN();
        } else if (this.point == cons.Poker.CardPoint.TWO()) {
            return cons.Poker.CardPoint.KING();
        } else if (this.point >= cons.Poker.CardPoint.SUB_JOKER()) {
            return this.point;
        } else {
            return this.point - 2;
        }
    }
}


module.exports = Card;