const ermjcons = require('../common/constants');
const mjcons = require('../majong/majongConstants');
const logger = require('pomelo-logger').getLogger('game-brnn-robot', __filename);
const _ = require('underscore');
const cons = require('../../../common/constants');
const utils = require('../majong/utils');
const formatter = require('../majong/formatter');

class Level1 {
    constructor(robot) {
        this.robot = robot;
        this.alreadyBet = 0;
        this.seat = this.robot.seat;
    }

    reset() {
    }

    getOutCards() {
        let seat = this.robot.seat;
        let cards = utils.sortCards(_.clone(seat.handCards));
        let panel = seat.getPanel();
        if (panel.canRon) {
            return { cards: null, name: ermjcons.RoomAction.RON() };
        }
        if (panel.canTin) {
            let count = -1;
            let index = -1;
            for (let i = 0; i < panel.tin.length; i++) {
                if (count < panel.tin[i].ron.length) {
                    count = panel.tin[i].ron.length;
                    index = i;
                }
            }
            return { card: panel.tin[index].card, name: ermjcons.RoomAction.PLAY(), tin: true }
        }
        if (panel.canKan) {
            return { card: panel.kan[0], name: ermjcons.RoomAction.KAN() };
        }

        let outZiCards = [];
        let lastPoint = -1;
        let lastCard = null;
        let count = 0;
        for (let i = cards.length - 1; i >= 0; i--) {
            if (cards[i].suit != 3) {
                count == 0 && lastCard && outZiCards.push(lastCard);
                break;
            }
            if (lastPoint == -1) {
                lastPoint = cards[i].point;
                lastCard = cards[i];
                continue;
            }

            if (cards[i].point == lastPoint) {
                count++;
                continue;
            }

            count == 0 && lastCard && outZiCards.push(lastCard);
            lastPoint = cards[i].point;
            lastCard = cards[i];
            count = 0;
        }

        let outCards = [];
        outCards = this.allIsStruct(seat.handCards);
        if (outCards.length == 0) {
            lastPoint = -1;
            count = 0;
            for (let i = 0; i < cards.length;) {
                if (cards[i].suit == 3) break;
                let newCards = seat.getHandCardsLikeCard(cards[i].suit, cards[i].point);
                if (newCards.length == 3 || newCards.length == 2) {
                    utils.removeCards(cards, newCards);
                    continue;
                }

                let chiCards = this.refreshChi(cards[i]);
                if (chiCards.length == 3) {
                    utils.removeCards(cards, chiCards);
                    continue;
                }
                outCards.unshift(cards[i]);
                i++;
            }
        }

        let resultCards = {};
        if (outZiCards.length > 0) {
            resultCards = this.songCards(outZiCards);

            if (resultCards.length > 0) {
                return { card: resultCards[0].getValue(), name: ermjcons.RoomAction.PLAY() };
            }
        }

        if (outCards.length > 0) {
            resultCards = this.songCards(outCards);
            if (resultCards.length > 0) {
                return { card: resultCards[0].getValue(), name: ermjcons.RoomAction.PLAY() };
            }
        }

        return { card: seat.handCards[0].getValue(), name: ermjcons.RoomAction.PLAY() };
    }

    refreshChi(card) {
        let chi = [];
        chi.push(card);
        let lastPlayed = card;
        if (lastPlayed == null || lastPlayed.suit == mjcons.CardSuit.WIND()) {
            this.canChi = false;
            return;
        }

        // if (lastPlayed.point >= 3) {
        //     // 可以判断 -1 -2
        //     let first = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point - 2);
        //     if (first.length != 0) {
        //         let second = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point - 1);
        //         if (second.length != 0) {
        //             chi.push([first[0], second[0]]);
        //         }
        //     }
        // }

        // if (lastPlayed.point >= 2 && lastPlayed.point <= 8) {
        //     // 可以判断 -1 +1
        //     let first = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point - 1);
        //     if (first.length != 0) {
        //         let second = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point + 1);
        //         if (second.length != 0) {
        //             chi.push([first[0], second[0]]);
        //         }
        //     }
        // }

        if (lastPlayed.point <= 7) {
            // 可以判断 +1 +2
            let first = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point + 1);
            if (first.length != 0) {
                let second = this.seat.getHandCardsLikeCard(lastPlayed.suit, lastPlayed.point + 2);
                if (second.length != 0) {
                    chi.push(first[0]);
                    chi.push(second[0]);
                }
            }
        }

        return chi;
    }

    songCards(cards) {
        let resultCards = [];
        let enemySeat = this.room.getComp('seat').getSeat((this.seat.index + 1) % 2);
        for (let i = 0; i < cards.length; i++) {
            let fmt = new formatter(this.seat.room, ...enemySeat.handCards);
            fmt.pushCards(cards[i]);
            let canRon = fmt.checkRon();
            if (!canRon) {
                resultCards.push(cards[i]);
            }
        }
        return resultCards;
    }

    //判断出什么牌散牌最少， 胡牌最多
    allIsStruct(myCards) {
        let biggestCards = [];
        for (let i = 0; i < myCards.length; i++) {
            if (myCards[i].suit == 3) break;
            let newCards = this.seat.getHandCardsLikeCard(myCards[i].suit, myCards[i].point);
            if (newCards.length == 3 || newCards.length == 2) {
                biggestCards.push(newCards);
            }

            let chiCards = this.refreshChi(myCards[i]);
            if (chiCards.length == 3) {
                biggestCards.unshift(chiCards);
            }
        }

        for (let i = 0; i < biggestCards.length; i++) {
            let myCardsTemp1 = _.clone(myCards);
            if (!utils.contains(myCardsTemp1, biggestCards[i])) continue;
            myCardsTemp1 = utils.removeCardsbyPoint(myCardsTemp1, biggestCards[i]);
            if (myCardsTemp1.length <= 2) {
                return myCardsTemp1;
            }

            for (let j = i + 1; j < biggestCards.length; j++) {
                let myCardsTemp2 = _.clone(myCardsTemp1);
                if (!utils.contains(myCardsTemp2, biggestCards[j])) continue;
                myCardsTemp2 = utils.removeCardsbyPoint(myCardsTemp2, biggestCards[j]);
                if (myCardsTemp2.length <= 2) {
                    return myCardsTemp2;
                }

                for (let k = j + 1; k < biggestCards.length; k++) {
                    let myCardsTemp3 = _.clone(myCardsTemp2);
                    if (!utils.contains(myCardsTemp3, biggestCards[k])) continue;
                    myCardsTemp3 = utils.removeCardsbyPoint(myCardsTemp3, biggestCards[k]);
                    if (myCardsTemp3.length <= 2) {
                        return myCardsTemp3;
                    }

                    for (let m = k + 1; m < biggestCards.length; m++) {
                        let myCardsTemp4 = _.clone(myCardsTemp2);
                        if (!utils.contains(myCardsTemp3, biggestCards[m])) continue;
                        myCardsTemp4 = utils.removeCardsbyPoint(myCardsTemp3, biggestCards[m]);
                        if (myCardsTemp4.length <= 2) {
                            return myCardsTemp4;
                        }
                    }
                }
            }
        }
        return [];
    }

    operateCards() {
        let seat = this.robot.seat;
        let panel = seat.getPanel();
        let outCard = this.room.getComp('state').lastPlayed;
        let cards = [];
        if (panel.canRon) {
            return { cards: outCard, name: ermjcons.RoomAction.RON() }
        }
        if (panel.canChi) {
            return { cards: panel.chi[0], name: ermjcons.RoomAction.CHI() }
        }
        if (panel.canKan) {
            return { card: outCard.getValue(), name: ermjcons.RoomAction.KAN() }
        }
        if (panel.canPon) {
            return { card: null, name: ermjcons.RoomAction.PON() }
        }

        return { card: null, name: ermjcons.RoomAction.PASS() }
    }

    RoomInfo(room, seat) {
        if (!seat) return;
        this.seat = seat;
        this.room = room;
    }
}

module.exports = Level1;
