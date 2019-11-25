const dzcons = require('../common/constants');
const logger = require('pomelo-logger').getLogger('game-dz-robot', __filename);
const Formatter = require('../poker/formatter');
const FormatterHand = require('../poker/formatterHand');
const Formation = require('../poker/formation').default;
const utils = require('../poker/utils');
const Level1 = require("./level1");
const _ = require('underscore');


// level2 的思路就是，在level1的基础上，会根据位置学，自己和别人的下注情况去衡量
// level3 的思路就是，加入自己的牌库体系，根据手牌和公牌进行判断
class Level2 extends Level1 {
    constructor() {
        super();
    }

    init() {
        super.init();
        this.myPos = 0;           //自己的出牌位置 dzcons.SeatPos
    }

    bid(room, index) {
        logger.info('[AI2]', index, '开始思考...');
        return super.bid(room, index);
    }

    pos() {
        this.myPos = 0;
        let roomState = this.room.getComp('state');

        let seat = null;

        let currentPublicCards = this.room.getComp('state').getPublicCards();
        if (currentPublicCards.length == 0) {       // 翻牌圈，大盲是最后一个出手
            seat = roomState.getBblindSeat();
        } else {                                    // 其他圈，庄家是最后一个出手
            seat = roomState.getBankerSeat();
        }

        if (seat.isPlaying() && seat.getIndex() == this.index) {
            this.myPos = dzcons.SeatPos.BTN();
            return;
        }

        let seats = seat.nexts();
        seats = _.filter(seats, s => s.isPlaying());
        this.myPos = _.findIndex(seats, s => s.getIndex() == this.index) + 1;
        if (this.myPos >= (seats.length + 1) / 2) {
            this.myPos = dzcons.SeatPos.BTN();
        } else {
            this.myPos = dzcons.SeatPos.UTG();
        }

        logger.info('[AI2]', this.index, '自己的位置', this.myPos);
    }

    preflop() {
        logger.info('[AI2]', this.index, this.rdm, '第一轮下注，翻牌前 Pre-flop');

        this.rdm = 0;

        // 位置因素
        if (this.myPos < dzcons.SeatPos.MP()) {
            logger.info('[AI2]', this.index, this.rdm, '位置靠前');

            if (this.formatterHand.isHigh()) {
                if (this.formatterHand.isSequence()) {
                    this.rdm += 50;
                    logger.info('[AI2]', this.index, this.rdm, '手牌是高位，顺子，比如AK,KQ');
                }
                if (this.formatterHand.isPair()) {
                    this.rdm += 80;
                    logger.info('[AI2]', this.index, this.rdm, '手牌是高位，对子，比如AA, KK');
                }
            }

            if (this.formatterHand.isPair()) {
                this.rdm += 30;
                logger.info('[AI2]', this.index, this.rdm, '手牌是对子');
            }

            if (this.formatterHand.isSuit()) {
                this.rdm += 20;
                logger.info('[AI2]', this.index, this.rdm, '手牌是同花');
            }

            logger.info('[AI2]', this.index, this.rdm, '位置靠前，手牌策略结束');
        } else {
            logger.info('[AI2]', this.index, this.rdm, '位置靠后');

            this.rdm += 20;

            if (this.formatterHand.isPair()) this.rdm += 50;
            if (this.formatterHand.isSuit()) this.rdm += 50;
            if (this.formatterHand.isHigh()) this.rdm += 30;
            if (this.formatterHand.isSequence()) this.rdm += 20;

            logger.info('[AI2]', this.index, this.rdm, '位置靠后，手牌策略结束');
        }

        // 是否有人加注因素
        let baseScore = this.room.getAttr('baseScore');
        let roomState = this.room.getComp('state');
        let maxSeat = roomState.getBidSeat();
        let maxBid = roomState.getBid();
        if (maxBid > baseScore) {
            logger.info('[AI2]', this.index, this.rdm, '有玩家开始加注了', maxSeat.getIndex(), maxBid);

            for (let winner of this.winners) {
                if (winner.seat.getIndex() == maxSeat.getIndex()) {
                    logger.info('[AI2]', this.index, this.rdm, '加注玩家的牌型最终能赢自己', maxSeat.getIndex());
                    if (maxBid >= baseScore * 2) {
                        this.rdm -= 20;
                    } else {
                        this.rdm -= 10;
                    }
                    break;
                }
            }
        } else {
            if (this.myPos >= dzcons.SeatPos.MP()) {
                logger.info('[AI2]', this.index, this.rdm, '当前无人下注，但自己位置靠后');
                this.rdm += 20;
            }
        }

        logger.info('[AI2]', this.index, this.rdm, '第一轮下注，判定结束');
    }

    flop() {
        // super.flop();

        logger.info('[AI2]', this.index, this.rdm, '第二轮下注，翻牌圈 flop');

        this.rdm = 0;

        let currentPublicCards = this.room.getComp('state').getPublicCards();
        let currentCards = currentPublicCards.concat(this.seat.getHand());
        let currentFormation = Formatter.format(currentCards);
        logger.info('[AI2]', this.index, this.rdm, '当前自己的牌型', utils.printCards(currentCards), currentFormation.__print());

        // 位置因素
        if (this.myPos < dzcons.SeatPos.MP()) {
            logger.info('[AI2]', this.index, this.rdm, '位置靠前，当前牌策略');
            if (currentFormation.getType() >= dzcons.Formation.TWO_PAIR()) {
                this.rdm += 20;
            }
            if (currentFormation.getType() >= dzcons.Formation.SEQUENCE()) {
                this.rdm += 70;
            }
            logger.info('[AI2]', this.index, this.rdm, '位置靠前，当前牌策略结束');
        } else {
            logger.info('[AI2]', this.index, this.rdm, '位置靠后');
            this.rdm += 20;

            if (currentFormation.getType() >= dzcons.Formation.TWO_PAIR()) {
                this.rdm += 80;
            }
            if (currentFormation.getType() >= dzcons.Formation.SEQUENCE()) {
                if (this.formatterHand.isHigh()) {
                    this.rdm += 100;
                }
                if (this.formatterHand.isSuit()) {
                    this.rdm += 100;
                }
            }
            logger.info('[AI2]', this.index, this.rdm, '位置靠后，当前牌策略结束');
        }

        if (this.winners.length > 0) {
            // 是否有人加注因素
            let baseScore = this.room.getAttr('baseScore');
            let roomState = this.room.getComp('state');
            let maxSeat = roomState.getBidSeat();
            let maxBid = roomState.getBid();
            if (maxBid > 0) {
                logger.info('[AI2]', this.index, this.rdm, '翻牌圈，玩家开始加注了', maxSeat.getIndex(), maxBid);

                for (let winner of this.winners) {
                    if (winner.seat.getIndex() == maxSeat.getIndex()) {
                        logger.info('[AI2]', this.index, this.rdm, '翻牌圈，加注玩家的牌型最终能赢自己', maxSeat.getIndex());

                        if (maxBid >= baseScore * 5) {
                            this.rdm -= 50;
                        } else {
                            this.rdm -= 100;
                        }
                        break;
                    }
                }
            } else {
                logger.info('[AI2]', this.index, this.rdm, '翻牌圈，没有玩家加注，但是仍有玩家可以赢自己');
                for (let winner of this.winners) {
                    let cards = currentPublicCards.concat(this.seat.getHand());
                    let formation = Formatter.format(cards);
                    logger.info('[AI2]', winner.seat.getIndex(), this.rdm, '当前别人的牌型', utils.printCards(cards), formation.__print());

                    if (formation.getType() >= dzcons.Formation.TWO_PAIR()) {   // 别人已成型，两队以上
                        this.rdm -= 100;
                    } else {                                                    // 别人尚未成型，在最终牌型下会赢自己
                        if (winner.formation.getType() >= dzcons.Formation.SUIT()) {    // 别人的最终牌型在同花之上，说明目前已经能看出部分结果
                            this.rdm -= 100;
                        }
                    }
                }
            }
        } else {
            logger.info('[AI2]', this.index, this.rdm, '翻牌圈，没有玩家能赢我');
            this.rdm += 60;
        }

        logger.info('[AI2]', this.index, this.rdm, '第二轮下注，翻牌圈，判定结束');
    }

    // trun() {
    //     logger.info('[AI2]', this.index, this.rdm, '第三轮下注，转牌圈 trun');

    //     this.rdm = 0;

    //     let currentPublicCards = this.room.getComp('state').getPublicCards();
    //     let currentCards = currentPublicCards.concat(this.seat.getHand());
    //     let currentFormation = Formatter.format(currentCards);
    //     logger.info('[AI2]', this.index, this.rdm, '当前自己的牌型', utils.printCards(currentCards), currentFormation.__print());

    //     // 是否有人加注因素
    //     let baseScore = this.room.getAttr('baseScore');
    //     let roomState = this.room.getComp('state');
    //     let maxSeat = roomState.getBidSeat();
    //     let maxBid = roomState.getBid();

    //     // 位置因素
    //     if (this.myPos < dzcons.SeatPos.MP()) {
    //         logger.info('[AI2]', this.index, this.rdm, '转牌圈，位置靠前，当前牌策略');

    //         if (this.winners.length > 0) {
    //             logger.info('[AI2]', this.index, this.rdm, '转牌圈，玩家能赢自己');

    //             if (maxBid > 0) {
    //                 logger.info('[AI2]', this.index, this.rdm, '转牌圈，玩家开始加注了', maxSeat.getIndex(), maxBid);
    //                 for (let winner of this.winners) {
    //                     if (winner.seat.getIndex() == maxSeat.getIndex()) {
    //                         logger.info('[AI2]', this.index, this.rdm, '转牌圈，加注玩家的牌型最终能赢自己', maxSeat.getIndex());
    //                         this.rdm -= 100;
    //                         break;
    //                     }
    //                 }
    //             } else {
    //                 logger.info('[AI2]', this.index, this.rdm, '转牌圈，暂时没有玩家加注');
    //                 this.rdm += 50;

    //                 for (let winner of this.winners) {
    //                     if (!winner.seat.isRobot()) {
    //                         logger.info('[AI2]', this.index, this.rdm, '转牌圈，有非电脑玩家能赢自己');

    //                         let cards = currentPublicCards.concat(winner.seat.getHand());
    //                         let formation = Formatter.format(cards);
    //                         logger.info('[AI2]', winner.seat.getIndex(), this.rdm, '当前别人的牌型', utils.printCards(cards), formation.__print());

    //                         this.rdm -= 100;
    //                         // if (formation.getType() >= dzcons.Formation.TWO_PAIR()) {   // 别人已成型，两队以上
    //                         //     this.rdm -= 100;
    //                         // } else {
    //                         //     // this.rdm += 150;        // 诈牌逻辑
    //                         // }
    //                         break;
    //                     }
    //                 }
    //             }
    //         } else {
    //             logger.info('[AI2]', this.index, this.rdm, '转牌圈，没有玩家能赢自己');
    //             this.rdm += 50;

    //             if (maxBid > 0) {
    //                 if (currentFormation.getType() >= dzcons.Formation.SEQUENCE()) {
    //                     this.rdm += 150;
    //                 } else if (currentFormation.getType() >= dzcons.Formation.TWO_PAIR()) {
    //                     this.rdm += 50;
    //                 } else {
    //                     this.rdm += 150;
    //                 }
    //             } else {
    //                 if (this.formation.getType() >= dzcons.Formation.TWO_PAIR()) {
    //                     this.rdm += 30;
    //                 } else {
    //                     this.rmd += 150;
    //                 }
    //             }
    //         }
    //         logger.info('[AI2]', this.index, this.rdm, '转牌圈，位置靠前，策略结束');
    //     } else {
    //         logger.info('[AI2]', this.index, this.rdm, '转牌圈，位置靠后');
    //         this.rdm += 20;

    //         if (maxBid > 0) {
    //             for (let winner of this.winners) {
    //                 if (winner.seat.getIndex() == maxSeat.getIndex()) {
    //                     logger.info('[AI2]', this.index, this.rdm, '转牌圈，玩家加注，能赢自己', maxSeat.getIndex(), maxBid);

    //                     let cards = currentPublicCards.concat(winner.seat.getHand());
    //                     let formation = Formatter.format(cards);
    //                     logger.info('[AI2]', winner.seat.getIndex(), this.rdm, '当前别人的牌型', utils.printCards(cards), formation.__print());

    //                     // if (formation.getType() >= dzcons.Formation.TWO_PAIR()) {   // 别人已成型，两队以上
    //                         this.rdm -= 100;
    //                     // } else {
    //                     //     if (winner.formation.getType() >= dzcons.Formation.SEQUENCE()) {    // 别人的最终牌型在顺子之上，说明目前已经能看出部分结果
    //                     //         this.rdm += 200;
    //                     //     }
    //                     // }
    //                 }

    //                 logger.info('[AI2]', this.index, this.rdm, '转牌圈，加注玩家的牌型最终能赢自己', maxSeat.getIndex());
    //             }
    //         } else {
    //             logger.info('[AI2]', this.index, this.rdm, '转牌圈，没有玩家加注');

    //             if (this.winners.length > 0) {
    //                 this.rdm += 80;
    //             } else {
    //                 this.rdm += 150;
    //             }
    //         }
    //         logger.info('[AI2]', this.index, this.rdm, '转牌圈，位置靠后，策略结束');
    //     }

    //     logger.info('[AI2]', this.index, this.rdm, '第三轮下注，转牌圈，判定结束');
    // }

    river() {
        super.river();
    }

}

module.exports = Level2;
