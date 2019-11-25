const constants = require('../common/constants');
const utils = require('../utils');
const _ = require('underscore');


/**
 * @api {json} Card 麻将牌
 * @apiGroup Mahjong
 * @apiParam {enum{1-7}} suit 麻将牌类别
 * @apiParam {enum{1-9}} point 麻将牌点数
 * @apiParam {number{0-3}} index 同张麻将内的索引
 * @apiParamExample {json} 第一张1万:
 * {
 *   "suit": 1,
 *   "point": 1,
 *   "index": 0,
 * }
 * @apiParamExample {json} 第二张1万:
 * {
 *   "suit": 1,
 *   "point": 1,
 *   "index": 1,
 * }
 */
class Card {
    static fromJson(json) {
        if(!_.isObject(json)) {
            return null;
        }

        if(!_.has(json, 'suit') || !_.has(json, 'point')) {
            return null;
        }

        return new Card(json.suit, json.point, json.index || 0, json.extras);
    }

    static special(suit, point, index) {
        let card = new Card(suit || constants.Mahjong.CardSuit.SP(), point || 1, utils.isNumber(index) ? index : 0);
        card.enableExtra(constants.Mahjong.CardExtra.SPECIAL());
        return card;
    }

    static specialClone(c) {
        let clone = c.clone();
        clone.enableExtra(constants.Mahjong.CardExtra.SPECIAL());
        return clone;
    }

    static toJson(cards) {
        if(!cards) {
            return null;
        }

        if(utils.isArray(cards)) {
            return _.map(cards, (c) => c.toJson());
        }

        return cards.toJson();
    }

    constructor(suit, point, index, extras) {
        this.suit = suit;
        this.point = point;
        this.index = index;
        this.extras = extras || {};
    }

    clone() {
        return new Card(this.suit, this.point, this.index, _.clone(this.extras));
    }

    getSuit() {
        return this.suit;
    }

    getPoint() {
        return this.point;
    }

    getIndex() {
        return this.index;
    }

    getOrder() {
        return this.suit * 10000 + this.point * 100 + this.index;
    }

    enableExtra(key) {
        this.extras[key] = true;
    }

    disableExtra(key) {
        this.extras[key] = false;
    }

    getExtra(key) {
        return this.extras[key];
    }

    setExtra(key, value) {
        this.extras[key] = value;
    }

    haveExtra(key) {
        return _.has(this.extras, key);
    }

    isExtra(key) {
        return !!this.extras[key];
    }

    is(suit, point, index) {
        if(_.isObject(suit)) {
            point = suit.point;
            index = suit.index;
            suit = suit.suit;
        }

        return (this.suit === suit) && (this.point === point) && (this.index === index);
    }

    isSameWith(card, point) {
        let s = point ? card : card.getSuit();
        let p = point || card.getPoint();
        return (this.suit === s) && (this.point === p);
    }

    toJson() {
        return _.pick(this, ['suit', 'point', 'index', 'extras']);
    }
}


module.exports = Card;