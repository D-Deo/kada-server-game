const Super = require('../../../room/jackpotManager');
const ddzcons = require('../common/constants');
const utils = require('../poker/utils');
const _ = require('underscore');

class JackpotManager extends Super {
    constructor(room) {
        super(room);

        this.logger = this.room.getComp('logger');
    }

    balance() {
        this.logger = this.room.getComp('logger');
        let stateManager = this.room.getComp('state');
        stateManager.setLastCards('');

        let library = stateManager.getLibrary();
        let seatsMgr = this.room.getComp('seat');
        if (seatsMgr.isBlackList()) {
            this.logger.warn('房间出现黑名单，强制洗牌！！！');

            library.washBlackList();
            let cards = [];
            let robotIndex = seatsMgr.onlyRobotIndex();
            cards[(robotIndex + 1) % 3] = library.deal(ddzcons.PLAYER_CARD_SIZE());
            cards[(robotIndex + 2) % 3] = library.deal(ddzcons.PLAYER_CARD_SIZE());
            cards[robotIndex] = library.deal(ddzcons.PLAYER_CARD_SIZE());
            let result = [];
            for (let i = 0; i < 3; i++) {
                result.push(...cards[i]);
            }
            result.push(...library.getBottomCards());
            return result;
        }

        // let jackpot = await redis.async.get(`UpGame:DDZ:AREA_${this.room.getAttr('area')}:jackpot`);
        // jackpot = parseInt(jackpot) || 0;

        let jackpot = this.getJackpot();

        // 给每个席位发牌
        let cards = [];
        let cardsScore = [];
        let mycardsScore = [];
        for (let i = 0; i < 3; i++) {
            cards.push(library.deal(ddzcons.PLAYER_CARD_SIZE()));
        }

        let r = _.random(0, 100);
        if (!this.getEnabled() || (jackpot >= this.getMinJackpot() && jackpot <= this.getMaxJackpot())) {
            // 不用控
            let result = [];
            for (let i = 0; i < 3; i++) {
                result.push(...cards[i]);
            }
            result.push(...library.getBottomCards())
            return result;
        }

        let minIndex = null;
        let maxIndex = null;
        let minScore = Infinity;
        let maxScore = -Infinity;

        let whiletime = 0;
        let minmyScore = 0;

        let tempCards = [];
        let tempBotCards = [];
        let tempminIndex = null;
        let tempmaxIndex = null;
        let tempminScore = Infinity;
        let tempmyScore = Infinity;

        let boarder = jackpot - this.getMinJackpot() < 0 ? -10 : jackpot;

        while (true) {
            whiletime++;
            let able = false;
            for (let i = 0; i < 3; i++) {
                mycardsScore[i] = utils.calculateRemainScore(utils.InfoToCount(cards[i]));
                let newCards = cards[i].concat(library.getBottomCards());
                cardsScore[i] = utils.calculateRemainScore(utils.InfoToCount(newCards));
                if (cardsScore[i] <= minScore) {
                    minIndex = i;
                    minScore = cardsScore[i];
                    minmyScore = mycardsScore[i];
                    if (minScore < tempminScore && minmyScore < tempmyScore) {
                        tempminScore = minScore;
                        tempmyScore = minmyScore;
                        tempCards = cards;
                        tempBotCards = library.getBottomCards();
                        tempminIndex = minIndex;
                        tempmaxIndex = maxIndex;
                        able = true;
                    }
                }

                if (cardsScore[i] > maxScore) {
                    maxIndex = i;
                    maxScore = cardsScore[i];
                    if (able) {
                        tempmaxIndex = maxIndex;
                    }
                }
            }

            if (minScore < boarder && minmyScore < boarder) {
                break;
            }

            if (whiletime >= 3000) {
                whiletime = 0;
                cards = tempCards;
                library.setBottomCards(tempBotCards);
                minIndex = tempminIndex;
                maxIndex = tempmaxIndex;
                minScore = Infinity;
                maxScore = -Infinity;
                break;
            }

            library.wash();
            cards = [];
            for (let i = 0; i < 3; i++) {
                cards.push(library.deal(ddzcons.PLAYER_CARD_SIZE()));
            }
            minIndex = null;
            maxIndex = null;
            minScore = Infinity;
            maxScore = -Infinity;
        }
        if (minIndex == maxIndex) {
            maxIndex = (minIndex + 1) % 3;
        }
        let middleIndex = ((maxIndex + 1) % 3) != minIndex ? (maxIndex + 1) % 3 : (maxIndex + 2) % 3;
        //直接把所有牌拿出来
        for (let i = 0; i < 3; i++) {
            cards[i] = _.sortBy(cards[i], (c) => c.getValue());
        }
        let cardMax = cards[maxIndex];
        let cardMin = cards[minIndex];
        let cardMiddle = cards[middleIndex]
        this.logger.debug('洗牌坐标', maxIndex, minIndex, middleIndex);

        //计算牌型
        //奖池过低，给真人差牌,给机器人好牌
        let rdm = _.random(0, 100);
        if (r <= this.getKillRate() && jackpot < this.getMinJackpot() * 10) {
            if (seatsMgr.immortalCnt() == 1) {
                //真人数量为1，并获取下标值
                let immortalIndex = seatsMgr.OnlyImmortalIndex();
                cards[immortalIndex] = cardMin;
                if (rdm <= 50) {
                    cards[(immortalIndex + 1) % 3] = cardMax;
                    cards[(immortalIndex + 2) % 3] = cardMiddle;
                }
                else {
                    cards[(immortalIndex + 1) % 3] = cardMiddle;
                    cards[(immortalIndex + 2) % 3] = cardMax;
                }
            }
            else if (seatsMgr.robotCnt() == 1) {
                //机器人数量为1，并获取下标值
                let robotIndex = seatsMgr.onlyRobotIndex();
                cards[robotIndex] = cardMax;
                if (rdm <= 50) {
                    cards[(robotIndex + 1) % 3] = cardMin;
                    cards[(robotIndex + 2) % 3] = cardMiddle;
                }
                else {
                    cards[(robotIndex + 1) % 3] = cardMiddle;
                    cards[(robotIndex + 2) % 3] = cardMin;
                }
            }
        }

        //奖池过高，给真人好牌,给机器人差评
        if (r <= this.getWinRate() && jackpot > this.getMaxJackpot()) {
            if (seatsMgr.immortalCnt() == 1) {
                //真人数量为1，并获取下标值
                let immortalIndex = seatsMgr.OnlyImmortalIndex();
                cards[immortalIndex] = cardMax;
                if (rdm <= 50) {
                    cards[(immortalIndex + 1) % 3] = cardMin;
                    cards[(immortalIndex + 2) % 3] = cardMiddle;
                }
                else {
                    cards[(immortalIndex + 1) % 3] = cardMiddle;
                    cards[(immortalIndex + 2) % 3] = cardMin;
                }
            }
            else if (seatsMgr.robotCnt() == 1) {
                //机器人数量为1，并获取下标值
                let robotIndex = seatsMgr.onlyRobotIndex();
                cards[robotIndex] = cardMin;
                if (rdm <= 50) {
                    cards[(robotIndex + 1) % 3] = cardMax;
                    cards[(robotIndex + 2) % 3] = cardMiddle;
                }
                else {
                    cards[(robotIndex + 1) % 3] = cardMiddle;
                    cards[(robotIndex + 2) % 3] = cardMax;
                }
            }
        }

        let result = [];
        for (let i = 0; i < 3; i++) {
            result.push(...cards[i]);
        }
        result.push(...library.getBottomCards())
        return result;
    }

}

module.exports = JackpotManager;