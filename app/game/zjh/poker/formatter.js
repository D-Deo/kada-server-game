const cons = require('../common/constants');
const Formation = require('./formation');
const Group = require('./group');
const utils = require('./utils');
const _ = require('underscore');


class Formatter {
    static format(cards) {
        let formatter = new Formatter(cards);
        return formatter.format();
    }

    constructor(cards) {
        this.cards = _.sortBy(cards, (c) => c.getValue());
        this.formation = null;
    }

    format() {
        let suitGroup = {};
        let valueGroup = {};

        _.each(this.cards, (c) => {
            suitGroup[c.getSuit()] = suitGroup[c.getSuit()] || [];
            suitGroup[c.getSuit()].push(c);

            valueGroup[c.getValue()] = valueGroup[c.getValue()] || [];
            valueGroup[c.getValue()].push(c);
        });

        this.suit(suitGroup)
            || this.bomb(valueGroup)
            // || this.triplePair(valueGroup)
            || this.sequence(valueGroup)
            // || this.triple(valueGroup)
            // || this.twoPair(valueGroup)
            || this.pair(valueGroup)
            || this.special(suitGroup)
            || this.none();

        return this.formation;
    }

    suit(group) {
        if (_.isEmpty(group)) {
            return false;
        }

        let max = _.max(group, g => g.length);
        if (max.length < cons.PLAYER_CARD_SIZE()) {
            return false;
        }

        max = _.sortBy(max, c => c.getValue());
        let seq = utils.toSequence_Value(max) || utils.toSequence_Point(max);
        let cards = seq || _.last(max, cons.PLAYER_CARD_SIZE());
        this.formation = Formation.create(seq ? cons.Formation.SUIT_SEQUENCE() : cons.Formation.SUIT(), Group.fromSingles(cards));
        return true;
    }

    bomb(group) {
        let bcards = _.find(group, g => g.length === 3);
        if (!bcards) {
            return false;
        }

        let groups = _.flatten([this.remainGroups(bcards, cons.PLAYER_CARD_SIZE() - 3), Group.create(bcards)]);
        this.formation = Formation.create(cons.Formation.BOMB(), groups);
        return true;
    }

    // triplePair(group) {
    //     let triples = _.filter(group, g => g.length >= 3);
    //     let triple = _.max(triples, t => _.first(t).getValue());
    //     if (triple === -Infinity) {
    //         return false;
    //     }

    //     group = _.omit(group, _.first(triple).getValue());
    //     let pairs = _.filter(group, g => g.length >= 2);
    //     let pair = _.max(pairs, p => _.first(p).getValue());
    //     if (pair === -Infinity) {
    //         return false;
    //     }

    //     triple = _.first(triple, 3);
    //     pair = _.first(pair, 2);
    //     this.formation = Formation.create(cons.Formation.TRIPLE_PAIR(), [Group.create(pair), Group.create(triple)]);
    //     return true;
    // }

    sequence(group) {
        let cards = _.map(group, g => _.first(g));
        cards = _.sortBy(cards, c => c.getValue());

        let seq = utils.toSequence_Value(cards) || utils.toSequence_Point(cards);
        if (!seq) {
            return false;
        }

        this.formation = Formation.create(cons.Formation.SEQUENCE(), Group.fromSingles(seq));
        return true;
    }

    // triple(group) {
    //     let triples = _.filter(group, g => g.length >= 3);
    //     let triple = _.max(triples, t => _.first(t).getValue());
    //     if (triple === -Infinity) {
    //         return false;
    //     }

    //     triple = _.first(triple, 3);
    //     this.formation = Formation.create(cons.Formation.TRIPLE(), _.flatten([this.remainGroups(triple, 2), Group.create(triple)]));
    //     return true;
    // }

    // twoPair(group) {
    //     let pairs = _.filter(group, g => g.length >= 2);
    //     if (pairs.length < 2) {
    //         return false;
    //     }

    //     pairs = _.sortBy(pairs, p => _.first(p).getValue());
    //     pairs = _.last(pairs, 2);
    //     pairs = _.map(pairs, p => _.first(p, 2));
    //     let single = this.remainGroups(_.flatten(pairs), 1);
    //     pairs = _.map(pairs, p => Group.create(p));
    //     this.formation = Formation.create(cons.Formation.TWO_PAIR(), _.flatten([single, pairs]));
    //     return true;
    // }

    pair(group) {
        let pairs = _.filter(group, g => g.length >= 2);
        let pair = _.max(pairs, p => _.first(p).getValue());
        if (pair === -Infinity) {
            return false;
        }

        pair = _.first(pair, 2);
        this.formation = Formation.create(cons.Formation.PAIR(), _.flatten([this.remainGroups(pair, cons.PLAYER_CARD_SIZE() - 2), Group.create(pair)]));
        return true;
    }

    none() {
        this.formation = Formation.create(cons.Formation.HIGH(), this.remainGroups([], cons.PLAYER_CARD_SIZE()));
        return true;
    }

    special(group) {
        if (this.cards.length != 3) {
            return false;
        }
        let value = (this.cards[0].getValue() == 2) && (this.cards[1].getValue() == 3) && (this.cards[2].getValue() == 5);
        if (!value) {
            return false;
        }

        let different = _.filter(group, g => g.length == 1);
        if (different.length != 3) {
            return false;
        }

        this.formation = Formation.create(cons.Formation.SPECIAL(), Group.fromSingles(this.cards));
        return true;
    }

    remainCards(cards, count) {
        return _.last(_.difference(this.cards, cards), count)
    }

    remainGroups(cards, count) {
        return Group.fromSingles(this.remainCards(cards, count));
    }
}


module.exports = Formatter;
