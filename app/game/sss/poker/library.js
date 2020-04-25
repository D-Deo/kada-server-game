const Card = require('./card');
const Hand = require('../room/hand.js');
const ssscons = require('../common/constants');
const cons = require('../../../common/constants');
const logger = require('pomelo-logger').getLogger('game-sss', __filename);
const _ = require('underscore');
// const Formatter = require('./formatter');
const fs = require('fs'); //文件模块

class Library {
    constructor(room) {
        this.room = room;
        this.cards = [];
        this.seatHands = [];
        this.whiteHand = null;
        this.blackHand = null;

        this.testIndex = 1;
    }

    wash() {
        this.cards = [];
        this.seatHands = [];
        this.whiteHand = null;
        this.blackHand = null;

        for (let i = 0; i < this.room.getAttr('kings'); i++) {
            this.cards.push(new Card(cons.Poker.CardSuit.JOKER(), cons.Poker.CardPoint.MAIN_JOKER(), i));
        }

        _.times(cons.Poker.CardSuit.SPADE(), (s) => {
            _.times(cons.Poker.CardPoint.KING(), (p) => {
                this.cards.push(new Card(s + 1, p + 1, 0));
            });
        });

        if (this.room.getAttr('addSuits') >= 1) {
            _.times(cons.Poker.CardPoint.KING(), (p) => {
                this.cards.push(new Card(cons.Poker.CardSuit.SPADE(), p + 1, 1));
            });

            if (this.room.getAttr('addSuits') >= 2) {
                _.times(cons.Poker.CardPoint.KING(), (p) => {
                    this.cards.push(new Card(cons.Poker.CardSuit.HEART(), p + 1, 2));
                });
            }
        }

        this.cards = _.shuffle(this.cards);

        let len = Math.floor(this.cards.length / ssscons.PLAYER_CARD_SIZE());
        let array = [];

        let json = JSON.parse(fs.readFileSync('./app/game/sss/test/data.json'));
        if (json.current > 0) {
            let initCards = { cards: [] };
            json.current = this.testIndex < (json.max || 1) ? this.testIndex : 1;
            let d = fs.readFileSync('./app/game/sss/test/' + json.current + '.json');
            console.log(json, d);
            try {
                initCards = JSON.parse(fs.readFileSync('./app/game/sss/test/' + json.current + '.json'));
            } catch (e) {
                console.error(e);
            }

            if (json.repeat) {
                this.testIndex += 1;
            }

            _.each(initCards.cards, cards => {
                let child = [];
                _.each(cards, c => {
                    let item = this.drawCard(c);
                    if (item != null) {
                        child.push(item);
                    }
                });

                array.push(child);
            });
        }

        let seatMgr = this.room.getComp('seat');

        if (seatMgr.isWhiteList()) {
            logger.info('开启白名单', seatMgr.isWhiteList());
            //随机王的数量
            // let kings = _.random(this.room.getAttr('kings'));
            let kings = _.random(1);
            logger.info('随机王的数量', kings);
            let formation = 0;
            if (kings == 4) {
                //如果是4张王，直接4张王牌型
                formation = ssscons.SSS.Formation.SZW;
            } else {
                //否则随机尾道类型 炸弹 同花 五炸
                let formations = [ssscons.SSS.Formation.ZD, ssscons.SSS.Formation.THS, ssscons.SSS.Formation.WZZ];
                formation = formations[_.random(formations.length - 1)];
            }
            logger.info('最终牌型', formation.name());
            let cards = [];
            for (let i = 0; i < kings; i++) {
                cards.push(this.drawCard(null, cons.Poker.CardPoint.MAIN_JOKER()));
            }
            //如果是炸弹，判断炸弹数字，随机单牌
            if (formation.type() == ssscons.SSS.Formation.ZD.type()) {
                let n = _.random(1, 13);
                for (let i = 0; i < 4; i++) {
                    let c = this.drawCard(null, n);
                    if (c) cards.push(c);
                }
                let d = _.random(1, 13);
                while (d == n) {
                    d = _.random(1, 13);
                }
                let c = this.drawCard(null, d);
                if (c) cards.push(c);
            }
            //如果是同花，判断最大的单牌和花色
            if (formation.type() == ssscons.SSS.Formation.THS.type()) {
                let n = _.random(5, 14);
                let s = _.random(1, 4);
                for (let i = 0; i < 5; i++) {
                    if (n == 14) {
                        n = 13;
                        let c = this.drawCard(null, 1, s);
                        if (c) cards.push(c);
                        continue;
                    }
                    let c = this.drawCard(null, n - i, s);
                    if (c) cards.push(c);
                }
            }
            //如果是五张炸，判断炸弹数字
            if (formation.type() == ssscons.SSS.Formation.WZZ.type()) {
                let n = _.random(1, 13);
                for (let i = 0; i < 5; i++) {
                    let c = this.drawCard(null, n);
                    if (c) cards.push(c);
                }
            }
            //剩下随机牌凑满13张
            let remains = this.draw(13 - cards.length);
            cards.push(...remains);
            this.whiteHand = new Hand(cards);
            //去除1个玩家
            len -= 1;

            logger.info('最终手牌', len, this.whiteHand.toJson());
        }

        if (seatMgr.isBlackList()) {
            logger.info('开启黑名单', seatMgr.isBlackList());
            //随机发牌，重复数字不出现4次，不出现连顺，不出现同色超过4次，能没王就没王
            let ctrl = { point: {}, suit: {} };
            let cards = [];
            let allCardsLen = this.cards.length;
            for (let i = 0; i < allCardsLen; i++) {
                logger.info('当前组合', ctrl);

                let c = this.draw(1)[0];
                if (c.suit == cons.Poker.CardSuit.JOKER()) {
                    this.cards.push(c);
                    continue;
                }
                if (ctrl.point[c.point] >= 3) {
                    this.cards.push(c);
                    continue;
                }
                if (ctrl.suit[c.suit] >= 4) {
                    this.cards.push(c);
                    continue;
                }

                if (!ctrl.point[c.point]) {
                    ctrl.point[c.point] = 0;
                }
                ctrl.point[c.point] += 1;
                if (!ctrl.suit[c.suit]) {
                    ctrl.suit[c.suit] = 0;
                }
                ctrl.suit[c.suit] += 1;

                cards.push(c);
                if (cards.length >= 13) break;
            }

            let cs = this.draw(13 - cards.length);
            cards.push(...cs);
            this.blackHand = new Hand(cards);
            //去除1个玩家
            len -= 1;

            logger.info('最终手牌', len, this.blackHand.toJson());
        }

        for (let i = 0; i < len; i++) {
            let cnt = array.length > i ? array[i].length : 0;
            if (cnt == 0) {
                let cards = this.draw(ssscons.PLAYER_CARD_SIZE());
                this.seatHands.push(new Hand(cards));
            } else if (cnt == ssscons.PLAYER_CARD_SIZE()) {
                this.seatHands.push(new Hand(array[i]));
            } else {
                let cards = this.draw(ssscons.PLAYER_CARD_SIZE() - cnt);
                array[i].push(...cards);
                this.seatHands.push(new Hand(array[i]));
            }
        };

        _.each(this.seatHands, o => logger.debug('洗牌结果', o.cards));
    }

    draw(count) {
        let cards = this.cards.splice(0, count);
        return cards;
    }

    drawCard(name, point, suit) {
        let index = _.findIndex(this.cards, c => {
            return (!name || c.name == name)
                && (!point || c.point == point)
                && (!suit || c.suit == suit);
        });
        if (index == -1) {
            return null;
        }
        return this.cards.splice(index, 1)[0];
    }

    haveEnoughCard(count) {
        return _.size(this.cards) >= count;
    }

    getCardsWhite() {
        return this.whiteHand.cards;
    }

    getCardsBlack() {
        return this.blackHand.cards;
    }

    getCardsByIndex(index) {
        let hand = this.seatHands.splice(index, 1)[0];
        if (!hand) {
            hand = this.blackHand;
        }
        if (!hand) {
            hand = this.whiteHand;
        }
        if (!hand) {
            logger.error('no hand', index);
            return [];
        }
        return hand.cards;
    }

    getCardsRemain() {
        let cards = [];
        _.each(this.seatHands, o => {
            cards = cards.concat(o.cards)
        });
        return cards.concat(this.cards);
    }

    toJson() {
        return _.size(this.cards);
    }

}

module.exports = Library;