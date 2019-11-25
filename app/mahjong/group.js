const constants = require('../common/constants');
const _ = require('underscore');


class Group {
    static take(cards) {
        return new Group(constants.Mahjong.Group.TAKE(), _.sortBy(cards, (c) => c.getOrder()));
    }

    static touch(cards) {
        return new Group(constants.Mahjong.Group.TOUCH(), cards);
    }

    static privateBar(cards) {
        return new Group(constants.Mahjong.Group.PRIVATE_BAR(), cards);
    }

    static publicBar(cards) {
        return new Group(constants.Mahjong.Group.PUBLIC_BAR(), cards);
    }

    static touchBar(cards) {
        return new Group(constants.Mahjong.Group.TOUCH_BAR(), cards);
    }

    constructor(type, cards) {
        this.type = type;
        this.cards = cards;
    }

    getType() {
        return this.type;
    }

    getSuit() {
        return _.first(this.cards).getSuit();
    }

    getPoint() {
        return _.first(this.cards).getPoint();
    }

    getCards() {
        return this.cards;
    }

    getSpecialCards() {
        return _.filter(this.cards, (c) => {
            return c.isExtra(constants.Mahjong.CardExtra.SPECIAL());
        });
    }

    haveCard(suit, point) {
        if(_.isObject(suit)) {
            suit = suit.getSuit();
            point = suit.getPoint();
        }
        return _.some(this.cards, (c) => c.isSameWith(suit, point));
    }

    haveSpecialCards() {
        return !_.isEmpty(this.getSpecialCards());
    }

    getOrder() {
        let card = _.first(this.cards);
        return card.getPoint() + card.getSuit() * 100 + this.type * 10000;
    }

    getTag() {
        return this.getOrder();
    }

    isSameWith(g) {
        return this.getTag() === g.getTag();
    }

    toTouchBar(card) {
        this.type = constants.Mahjong.Group.TOUCH_BAR();
        this.cards.push(card);
    }

    toJson() {
        let json = {};
        json.type = this.type;
        json.cards = _.map(this.cards, (c) => c.toJson());
        return json;
    }
}


module.exports = Group;