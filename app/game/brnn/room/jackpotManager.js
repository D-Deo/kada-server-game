const Super = require('../../../room/jackpotManager');
const _ = require('underscore');
const Formatter = require('../poker/formatter');

class JackpotManager extends Super {
    constructor(room) {
        super(room);
        this.logger = this.room.getComp('logger');
    }

    balance() {
        let jackpot = this.getJackpot();

        let stateMgr = this.room.getComp('state');
        let seatMgr = this.room.getComp('seat');

        let library = stateMgr.getLibrary();
        let cards = stateMgr.getAllCard();

        let goods = [];     // 最优开奖结果集
        let opens = [];     // 全部开奖结果集

        // 无需奖池控制
        let r = _.random(100);
        if ((jackpot >= this.getMinJackpot() && jackpot <= this.getMaxJackpot())
            || !this.getEnabled()) {
            // 不用控
            return cards;
        }

        for (let i = 0; i < 5; i++) {
            for (let j = i + 1; j < 5; j++) {
                let compareCards = [];
                for (let c of cards) {
                    compareCards.push(_.clone(c));
                }

                compareCards[i] = cards[i].slice(0, 3).concat(cards[j].slice(3));
                compareCards[j] = cards[j].slice(0, 3).concat(cards[i].slice(3));

                let printStr = '';
                for (let c of compareCards) {
                    printStr += '\n';
                    printStr += Formatter.__print(c);
                }
                this.logger.debug('当前牌型：', i, printStr);

                let openAreas = library.open(compareCards);

                //计算玩家输赢成绩 allScore
                let allScore = _.reduce(seatMgr.getSeats(), (allScore, seat) => {
                    if (!seat || !seat.getUser() || seat.isRobot()) {
                        return allScore;
                    }

                    //输赢得分
                    let score = _.reduce(seat.getBetChips(), (score, num, area) => {
                        if (num > 0) {
                            score += openAreas.result.r_array[area] * num; //openAreas[area] == 1 ? num : -num;
                        }
                        return score;
                    }, 0);

                    allScore -= score;
                    return allScore;
                }, 0);

                this.logger.debug('当前情况', i, allScore);

                if (r <= this.getKillRate() && jackpot < this.getMinJackpot()) {
                    if (allScore > 0) {
                        goods.push({ score: allScore, cards: compareCards });
                    }
                }

                if (r <= this.getWinRate() && jackpot > this.getMaxJackpot()) {
                    if (allScore <= 0) {
                        goods.push({ score: allScore, cards: compareCards });
                    }
                }

                opens.push({ score: allScore, cards: compareCards });
            }
        }

        // 如果最优开奖集有开奖结果，就优先走最优，最优可以随机选择，否则就在全部开奖集中选择一个最优

        if (goods.length > 0) {
            let cards = goods[_.random(goods.length - 1)].cards;
            let printStr = '';
            for (let c of cards) {
                printStr += '\n';
                printStr += Formatter.__print(c);
            }
            this.logger.info('随机最优开奖结果', printStr);
            return cards;
        }

        if (opens.length == 0) {
            this.logger.warn('不可能开奖集不存在结果');
            return cards;
        }

        opens = _.sortBy(opens, open => { return open.score; });
        let result = opens.pop().cards;
        let printStr = '';
        for (let c of result) {
            printStr += '\n';
            printStr += Formatter.__print(c);
        }
        this.logger.info('没办法，选择一个最优结果', printStr);
        return result;
    }

}

module.exports = JackpotManager;
