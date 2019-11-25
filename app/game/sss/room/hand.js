const constants = require('../../../common/constants');
const Formatter = require('../poker/formatter');
const Rule = require('../poker/rule');
const cons = require('../../../common/constants');
const ssscons = require('../common/constants');
const _ = require('underscore');

class Hand {

    constructor(cards, seat = null, jackpot = 0) {
        this.formatter = null;

        if (cards.length > 0) {
            this.cards = cards;
        } else {
            this.seat = seat;
            this.cards = this.getLibraryCards(jackpot);
        }

        this.rule0 = Rule.create(...this.cards);
        this.playedSpecial = false; // 特殊牌型
        this.allGuns = false;

        if (this.seat) {
            // 计算苍蝇牌张数
            this.flyCardNum = 0;
            let flyCard = this.seat.room.getAttr('flyCard');
            if (flyCard == 1) {
                this.flyCardNum = _.reduce(this.cards, (cnt, c) => {
                    return c.getSuit() == constants.Poker.CardSuit.SPADE() && c.getPoint() == constants.Poker.CardPoint.ACE() ? cnt + 1 : cnt;
                }, 0);
            } else if (flyCard == 2) {
                this.flyCardNum = _.reduce(this.cards, (cnt, c) => {
                    return c.getSuit() == constants.Poker.CardSuit.HEART() && c.getPoint() == constants.Poker.CardPoint.ACE() ? cnt + 1 : cnt;
                }, 0);
            }
        }
    }

    // 倍数
    getMulti() {
        return this.flyCardNum * 2 || 1;
    }

    getFormatter() {
        return this.formatter;
    }

    deal() {
        this.seat.sendAction(constants.RoomAction.PLAYER_ADD_CARDS(), this.toJson(true));
    }

    getLibraryCards(jackpot) {
        let stateMgr = this.seat.room.getComp('state');
        if (this.seat.isWhite()) {
            return stateMgr.getLibrary().getCardsWhite();
        }
        if (this.seat.isBlack()) {
            return stateMgr.getLibrary().getCardsBlack();
        }
        return stateMgr.getLibrary().getCardsByIndex(0); // .getCardsRandom();
    }

    arrange(cards) {
        if (this.playedSpecial) {
            return;
        }

        if (cards) {
            for (let i = 0; i < cards.length; i++) {
                let index = _.findIndex(this.cards, c => c.suit == cards[i].suit && c.point == cards[i].point && c.index == cards[i].index);
                if (index != -1) {
                    let o = this.cards.splice(index, 1)[0];
                    this.cards.push(o);
                }
            }
        } else {
            let bot = null;
            let last = null;
            let len = this.cards.length;
            for (let a = 0; a < len - 4; a++) {
                for (let b = a + 1; b < len - 3; b++) {
                    for (let c = b + 1; c < len - 2; c++) {
                        for (let d = c + 1; d < len - 1; d++) {
                            for (let e = d + 1; e < len; e++) {
                                let g = [this.cards[a], this.cards[b], this.cards[c], this.cards[d], this.cards[e]];
                                let rule = Rule.create(...g);
                                if (!last) {
                                    last = rule;
                                    bot = g;
                                    continue;
                                }
                                let r = last.compare(rule);
                                if (r < 0) {
                                    last = rule;
                                    bot = g;
                                }
                            }
                        }
                    }
                }
            }

            this.cards = _.difference(this.cards, bot);

            let mid = null;
            last = null;
            len = this.cards.length;
            for (let a = 0; a < len - 4; a++) {
                for (let b = a + 1; b < len - 3; b++) {
                    for (let c = b + 1; c < len - 2; c++) {
                        for (let d = c + 1; d < len - 1; d++) {
                            for (let e = d + 1; e < len; e++) {
                                let g = [this.cards[a], this.cards[b], this.cards[c], this.cards[d], this.cards[e]];
                                let rule = Rule.create(...g);
                                if (!last) {
                                    last = rule;
                                    mid = g;
                                    continue;
                                }
                                let r = last.compare(rule);
                                if (r < 0) {
                                    last = rule;
                                    mid = g;
                                }
                            }
                        }
                    }
                }
            }

            let top = _.difference(this.cards, mid);

            this.cards = top.concat(mid).concat(bot);
        }

        this.formatter = Formatter.create(...this.cards, !cards ? true : false);
    }

    setSpecial() {
        if (this.rule0.getType() != ssscons.SSS.Formation.SP.type()) {
            this.playedSpecial = true; // 特殊牌型
        }
    }

    isValid() {
        if (this.playedSpecial) {
            return true;
        }

        if (this.formatter) {
            return this.formatter.isValid();
        }

        return false;
    }

    fireGun(hand) {
        if (this.playedSpecial || hand.playedSpecial || this.formatter == undefined || hand.formatter == undefined) {
            return 0;
        }

        return this.formatter.fireGun(hand.formatter);
    }

    toJson(show) {
        let json = {};

        json.playedSpecial = this.playedSpecial;
        json.cards = _.map(this.cards, (c) => c.toJson(show));
        if (show) {
            json.rule0 = this.rule0.toJson();
            if (this.formatter) {
                json.formatter = this.formatter.toJson();
            }
        }

        return json;
    }
}

module.exports = Hand;