const constants = require('../common/constants');
const Formation = require('./formation');
const _ = require('underscore');


class Formatter {
    static create(cards) {
        let formatter = new Formatter(cards);
        return formatter.resolve();
    }

    constructor(cards) {
        this.cards = _.sortBy(cards, (c) => c.getPoint());
        this.formations = [];
    }

    getFormation(type, value) {
        return _.find(this.formations, (f) => f.is(type, value));
    }

    getDefaultFormation() {
        return _.last(this.formations);
    }

    resolve() {
        if(!_.isEmpty(this.formations)) {
            return;
        }

        this.formations.push(new Formation(constants.Poker.Formation.NONE(), 0, this.cards));
        if(_.size(this.cards) !== 5) {
            return;
        }

        this.resolveSuitAndSequence();
        this.resolveCombination();
        this.resolveSmallAndBig();
        this.resolveNiu();

        for(let i = 0; i < this.formations.length; ++i) {
            for(let j = i + 1; j < this.formations.length; ++j) {
                if(!this.formations[i].isGreaterThan(this.formations[j])) {
                    continue;
                }
                let temp = this.formations[i];
                this.formations[i] = this.formations[j];
                this.formations[j] = temp;
            }
        }

        return _.last(this.formations);
    }

    resolveSuitAndSequence() {
        let first = _.first(this.cards);
        let last = _.last(this.cards);
        let suit = _.every(this.cards, (c) => c.getSuit() === first.getSuit());
        suit && this.formations.push(new Formation(constants.Poker.Formation.SUIT(), last.getPoint(), this.cards));

        let sequence = _.every(this.cards, (c, i) => c.getPoint() - first.getPoint() === i);
        if(!sequence) {
            let cards = _.sortBy(this.cards, (c) => c.getValue());
            first = _.first(cards);
            last = _.last(cards);
            sequence = last.getValue() < constants.Poker.CardValue.TWO() && _.every(cards, (c, i) => c.getValue() - first.getValue() === i);
        }

        sequence && this.formations.push(new Formation(constants.Poker.Formation.SEQUENCE(), last.getValue(), this.cards));
        suit && sequence && this.formations.push(new Formation(constants.Poker.Formation.SUIT_SEQUENCE(), last.getValue(), this.cards));
    }

    resolveCombination() {
        let groupedCards = _.groupBy(this.cards, (c) => c.getPoint());
        if(_.size(groupedCards) > 2) {
            return;
        }

        let maxGroup = _.max(groupedCards, (g) => _.size(g));
        if(_.size(maxGroup) === 3) {
            this.formations.push(new Formation(constants.Poker.Formation.TRIPLE_PAIR(), _.first(maxGroup).getPoint(), this.cards));
            return;
        }
        this.formations.push(new Formation(constants.Poker.Formation.BOMB(), _.first(maxGroup).getPoint(), this.cards));
    }

    resolveSmallAndBig() {
        let big = _.every(this.cards, (c) => c.getPoint() > constants.Poker.CardPoint.TEN());
        if(big) {
            this.formations.push(new Formation(constants.Poker.Formation.FIVE_BIG(), _.last(this.cards).getPoint(), this.cards));
            return;
        }
        let small = _.reduce(this.cards, (m, c) => m + c.getPoint(), 0) <= 10;
        small && this.formations.push(new Formation(constants.Poker.Formation.FIVE_SMALL(), _.last(this.cards).getPoint(), this.cards));
    }

    resolveNiu() {
        for(let i1 = 0; i1 < this.cards.length; ++i1) {
            for(let i2 = i1 + 1; i2 < this.cards.length; ++i2) {
                let partition = _.partition(this.cards, (v, i) => i !== i1 && i !== i2);
                let head = _.reduce(partition[0], (m, c) => m + (c.getPoint() >= constants.Poker.CardPoint.TEN() ? 10 : c.getPoint()), 0) % 10;
                let body = _.reduce(partition[1], (m, c) => m + (c.getPoint() >= constants.Poker.CardPoint.TEN() ? 10 : c.getPoint()), 0) % 10;
                if(head !== 0) {
                    continue;
                }
                this.formations.push(new Formation(
                    body === 0 ? constants.Poker.Formation.NIUNIU() : constants.Poker.Formation.NIU(),
                    body,
                    _.flatten(partition)
                ));
            }
        }
    }
}


module.exports = Formatter;