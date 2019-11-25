const ddzcons = require('../common/constants');
const cons = require('../../../common/constants');
// const Group = require('../poker/group');
const utils = require('../poker/utils');
const utilsSystem = require('../../../utils');
const _ = require('underscore');
// const Formatter = require('../poker/formatter');
const Card = require('../poker/card')
const logger = require('pomelo-logger').getLogger('game-ddz-robot', __filename);

class Level1 {
    constructor() {
        this.init();
    }

    init(room, index) {
        this.room = null;                       // 当前房间信息
        this.index = null;                      // 当前座位
        this.publicCards = null;                // 当局公牌
        this.seat = null;                       // 自己座位
        this.escaper = null;
        this.Lastformation = null;                  // 自己最终的牌型结果
        this.curType = null;
        this.lastCard = null;
        this.enemyHand = null;
        this.enemyClsfy = null;

        this.friendCard = null;                 //当两家机器人都为闲家是开放
        this.myHandinfo = null;                 //当前玩家手牌数据
        this.handcards = [];                    //手牌,结构为 num = 个数 key = 牌值 
        this.knowncard = [];                    //当前已知牌  
        this.handCount = [];                   // 手牌数量     
        this.OutCardTurn = [];   //{0：{seat.index, cards}, 1:{seat.index, cards}}
        this.OutCardPlayers = [];               //每个玩家已经出过的牌
        this.OutCardTypePlayers = [];                //座位，类型,  ,玩家出的牌型，以及主动被动
        this.OutCardType = [];
        this.OutCntPlayers = [];
        this.OutNonePlayers = [];
        this.SingleCount = [3, 3, 3];
        this.isInit = false;                    // 是否已经初始化
        this.turn = null;
        this.lastSeat = null;
        this.myLastType = null;
        this.rdm = 0;                           // 行为意识值（弃牌 < [0-49] < 50 跟注 < [51-100] < 加注）
        this.banker = {};
        for (let i = 0; i < ddzcons.ROOM_CAPACITY(); i++) {
            this.OutCntPlayers[i] = [];
            for (let j = 1; j < 16; j++) {
                this.OutCntPlayers[i][j] = 0;
            }
        }

        for (let i = 1; i < 16; i++) {
            this.knowncard[i] = 0;
        }

        for (let i = ddzcons.Formation.ONE(); i < ddzcons.Formation.ROCKET(); i++) {
            this.OutCardType[i] = [];
        }

        for (let i = 0; i < 100; i++) {
            this.OutCardTurn[i] = [];
        }
        for (let i = 0; i < ddzcons.ROOM_CAPACITY(); i++) {
            this.handCount[i] = 17;
            this.OutCardPlayers[i] = [];
            this.OutNonePlayers[i] = [];
            this.OutCardTypePlayers[i] = [];

            for (let j = ddzcons.Formation.ONE(); j < ddzcons.Formation.ROCKET(); j++) {
                this.OutCardTypePlayers[i][j] = [];
            }
        }

        logger.info('[AI]', '初始化AI');
    }

    countToInfo(cards) {
        if (!cards || cards.length == 0 || this.getLength(cards) > this.myHandinfo.length
            || this.getLength(cards) == 0) {
            return null;
        }
        let hadChoose = [];
        for (let i = 0; i < 21; i++) {
            hadChoose[i] = true;
        }
        //数据转化
        if (utilsSystem.isNumber(cards[0])) {
            cards = this.countToInfo(this.putCard(cards));
        }

        let cardInfo = this.seat.getCards();
        let cardsInfo = [];

        if (cards[0]) {
            for (let i = 0; i < cards.length; i++) {
                if (!cards[i]) continue;
                for (let j = 0; j < cardInfo.length; j++) {
                    if (this.getValue(cardInfo[j].point) == cards[i].key && hadChoose[j]) {
                        cardsInfo.push(cardInfo[j]);
                        hadChoose[j] = false;
                        break;
                    }
                }
            }
        }
        else {
            for (let i = 0; i < cards.length; i++) {
                for (let j = 0; j < cardInfo.length; j++) {
                    if (this.getValue(cardInfo[j].point) == cards[i] && hadChoose[j]) {
                        cardsInfo.push(cardInfo[j]);
                        hadChoose[j] = false;
                        break;
                    }
                }
            }
        }

        if (cardsInfo.length != cards.length) {
            logger.info("出的牌不存在", cardsInfo, cards);
            return null;
        }
        return cardsInfo;
    }

    bankerAction(room, index) {
        let statMgr = room.getComp('state');
        let seatMgr = room.getComp('seat');
        let seat = seatMgr.getSeat(index);
        if (!seat.isPlaying()) {
            return;
        }

        this.seat = seat;
        logger.debug('手牌分数', this.calculateRemainScore(this.InfoToCount(seat.getCards())));
        let cards = seat.getCards().concat(statMgr.getBottomCards());
        this.score = this.calculateRemainScore(this.InfoToCount(seat.getCards()));
        let allScore = this.calculateRemainScore(this.InfoToCount(cards));
        logger.debug('拿地主分数', allScore);
        let cardsCnt = this.InfoToCount(cards);
        return allScore > 65 && this.scoreIsBiggest(room, seat.getIndex(), allScore) && this.countOfBigCards(cardsCnt) >= 3 ? (room.getAttr('standard') ? 1 : 3) : 0;
    }

    grabAction(room, index) {
        let statMgr = room.getComp('state');
        let seatMgr = room.getComp('seat');
        let seat = seatMgr.getSeat(index);
        if (!seat.isPlaying()) {
            return;
        }

        this.seat = seat;
        logger.debug('手牌分数', this.calculateRemainScore(this.InfoToCount(seat.getCards())));
        let cards = seat.getCards().concat(statMgr.getBottomCards());
        this.score = this.calculateRemainScore(this.InfoToCount(seat.getCards()));
        let allScore = this.calculateRemainScore(this.InfoToCount(cards));
        logger.debug('拿地主分数', allScore);
        let cardsCnt = this.InfoToCount(cards);
        return allScore >= Infinity && this.scoreIsBiggest(room, seat.getIndex(), allScore) && this.countOfBigCards(cardsCnt) >= 5 ? 1 : 0;
    }

    mingAction(room, index) {
        let statMgr = room.getComp('state');
        let seatMgr = room.getComp('seat');
        let seat = seatMgr.getSeat(index);
        if (!seat.isPlaying()) {
            return;
        }

        this.seat = seat;
        logger.debug('手牌分数', this.calculateRemainScore(this.InfoToCount(seat.getCards())));
        let cards = seat.getCards().concat(statMgr.getBottomCards());
        this.score = this.calculateRemainScore(this.InfoToCount(seat.getCards()));
        let allScore = this.calculateRemainScore(this.InfoToCount(cards));
        logger.debug('拿地主分数', allScore);
        let cardsCnt = this.InfoToCount(cards);
        return allScore >= Infinity && this.scoreIsBiggest(room, seat.getIndex(), allScore) && this.countOfBigCards(cardsCnt) >= 4 ? 1 : 0;
    }

    scoreIsBiggest(room, index, Score) {
        let statMgr = room.getComp('state');
        let seatMgr = room.getComp('seat');
        if (seatMgr.robotCnt() == 1) {
            return true;
        }
        let seat = seatMgr.getSeat(seatMgr.anotherRobotIndex(index));
        let cards = seat.getCards().concat(statMgr.getBottomCards());
        let cardsCnt = this.InfoToCount(cards);
        let anotherScore = this.calculateRemainScore(this.InfoToCount(cards));
        return anotherScore <= Score || this.countOfBigCards(cardsCnt) < 3;
    }

    RoomInfo(room, seat) {
        if (!seat || !seat.getCards()) return;
        this.index = seat.getIndex();
        this.seat = seat;
        this.setBank(room.getComp('state').getBankerSeat().getIndex());
        this.handCount[this.index] = seat.getCards().length;
        this.room = room;
        this.myHandinfo = seat.getCards();                 //当前玩家手牌数据
        this.handcards = this.InfoToCount(seat.getCards());                    //手牌,结构为 num = 个数 key = 牌值 
        this.knowncard = this.InfoToCount(seat.getCards());                  //当前已知牌

        let stateMgr = this.room.getComp('state');
        this.banker = stateMgr.getBanker();
        let bottomCards = stateMgr.getBottomCards();
        _.each(bottomCards, c => {
            this.knowncard[c.getValue()]++;
        });
        let seatMgr = this.room.getComp('seat');
        if (seatMgr.immortalCnt() == 1 && seatMgr.getSeat(stateMgr.getBanker()).isRobot()) {
            this.friendCard = seatMgr.getSeat(this.banker).getCards();
            _.each(this.friendCard, c => {
                this.knowncard[c.getValue()]++;
            });
        }
    }
    //拆分
    classify(cards) {
        let classifyCards = [];
        classifyCards.SequenceCard = this.getTypeCard(cards, ddzcons.Formation.SEQUENCE());
        classifyCards.BombCards = this.getTypeCard(cards, ddzcons.Formation.BOMB());
        classifyCards.TripleCards = this.getTypeCard(cards, ddzcons.Formation.TRIPLE());
        classifyCards.PairCards = this.getTypeCard(cards, ddzcons.Formation.PAIR());
        classifyCards.SingleCards = this.getTypeCard(cards, ddzcons.Formation.ONE());

        return classifyCards;
    }

    getOutCards(turn) {
        let IsActive = false;
        if (this.turn != turn) {
            this.turn = turn;
        }
        if (this.room.getComp('state').getLastCards()) {
            logger.debug('186 被动出牌')
            IsActive = false;
        }
        else {
            logger.debug('186 主动出牌');
            IsActive = true;
        }
        //重新确认逃牌者和门板省份
        //主动出牌
        let outcardResult = null;
        this.myHandinfo = _.sortBy(this.seat.getCards(), (c) => this.getValue(c.point));
        logger.debug('机器人', this.seat.getIndex(), '开始出牌');
        logger.debug(utils.printCards(this.myHandinfo));

        if (!IsActive) {
            this.lastCard = this.room.getComp('state').getLastCards().cards;
            this.lastSeat = this.room.getComp('state').getLastCards().seat;
            if (this.lastSeat == this.index) {
                this.myLastType = utils.getCardType(this.lastCard);
            }
            else {
                this.myLastType = null;
            }
        }

        let scoreResult = -Infinity;
        let scoretemp = -Infinity;
        let scoreBiggest = -Infinity;
        let scoreSingle = -Infinity;
        let scorePair = -Infinity;
        let scoreTriple = -Infinity;
        let scoreTriple1 = -Infinity;
        let scoreTriple2 = -Infinity;
        let scoreSEQ = -Infinity;
        let BestSingle = -Infinity;
        let BestPair = [];
        let BestTriple = [];
        let BestSEQ = [];
        let outcards = [];
        let BiggestCard = [];
        let stateMgr = this.room.getComp('state');
        //手牌分类数据
        this.handcards = this.InfoToCount(this.seat.getCards());
        let seatMgr = this.room.getComp('seat');
        if (seatMgr.immortalCnt() == 1) {
            let enemyIndex = seatMgr.OnlyImmortalIndex();
            this.enemyHand = this.InfoToCount(seatMgr.getSeat(enemyIndex).getCards());
            this.enemyClsfy = this.classify(this.handcards);
        }
        //        this.handcards = _.sort
        let classifyCards = this.classify(this.handcards);
        let SgleCards = classifyCards.SingleCards;
        let PairCards = classifyCards.PairCards;
        let TripleCards = classifyCards.TripleCards;
        let SequenceCards = classifyCards.SequenceCard;
        let BombCards = classifyCards.BombCards;
        let PairSeqCards = this.hasPairSEQ(this.handcards);
        let bankerRobot = (seatMgr.getSeat(this.banker).isRobot() && this.banker == this.index) || !seatMgr.getSeat(this.banker).isRobot();
        let SpSG1 = [];
        let SpSG2 = [];
        let SpSG = [];
        let SpPair = [];
        if (bankerRobot) {
            SpSG1 = this.SpSGbyPairSEQ(this.handcards, PairSeqCards);
            SpSG2 = this.SpSgbySEQ(this.handcards, SequenceCards);
            SpSG = this.MergArry(SpSG1, SpSG2);
            SpPair = this.SpPairbySEQ(this.handcards, SequenceCards);
        }

        let hasTransfer = false;
        let lastType = utils.getCardType(this.lastCard);

        if (IsActive) {
            //最后冲刺
            // if (!seatMgr.isBlackList()/*!seatMgr.getSeat(this.banker).isRobot() || this.index == this.banker*/) {
            //     let cards = this.AllIsBiggest();
            //     if (cards) {
            //         logger.debug('结束了 258', utils.printCards(cards));
            //         return { cards, formation: utils.getCardType(cards) };
            //     }
            // }

            if (this.index == this.banker || !seatMgr.getSeat(this.banker).isRobot()) {
                let cards = this.AllIsBiggest(this.myHandinfo, null, true);
                if (cards) {
                    logger.debug('结束了 265', utils.printCards(cards));
                    return { cards, formation: utils.getCardType(cards) };
                }
            }

            //能一把出则出
            if (utils.getCardType(this.seat.getCards())) {
                //let cards = this.countToInfo(this.putCard(this.handcards));
                return { cards: this.seat.getCards(), formation: utils.getCardType(this.seat.getCards()) };
            }

            //递牌
            let MBCards = seatMgr.getSeat(this.getIndexMB()).getCards();
            let MBtype = utils.getCardType(MBCards);
            if (this.index == this.escaper && (MBtype == ddzcons.Formation.ONE() || MBtype == ddzcons.Formation.PAIR())) {
                for (let i = ddzcons.CardPoint.THREE(); i < ddzcons.CardPoint.MAIN_JOKER(); i++) {
                    if (this.handcards[i] == 0 || (MBtype == ddzcons.Formation.PAIR() && this.handcards[i] == 1)) continue;//手中无此牌
                    if (i >= this.getValue(MBCards[0].point)) break;  //i大于等于此单张的卡
                    let assistCard = [];//助攻牌
                    assistCard.push({ key: i });
                    if (MBtype == ddzcons.Formation.PAIR()) {
                        assistCard.push({ key: i });
                    }
                    let PoinInfo = this.countToInfo(assistCard);
                    logger.debug('神助攻 264', utils.printCards(PoinInfo));
                    return { cards: PoinInfo, formation: utils.getCardType(PoinInfo) };
                }
            }
            //出炸弹后能ALLIN
            // if (this.RemoveBombCanAllIn(this.handcards, BombCards)) {
            //     let myBombCards = this.getBomb();
            //     logger.debug('最终出的牌型 272', utils.printCards(myBombCards));
            //     return { cards: myBombCards, formation: utils.getCardType(this.countToInfo(myBombCards)) };
            // }
            //出自己能收回来，并且尽量让自己单牌减少的组合
            //或者出逃跑者压不了的牌,最好先出顺子
            //都没有时，则出逃牌者不要 门板不舒服， 自己减少单张，并且增加手中牌分的牌
            let escapPair, escapTriple, escapBomb, escapSEQ;
            if (this.seat.getIndex() == this.banker) {
                escapPair = this.guessPair(this.escaper);
                escapTriple = this.guessTriple(this.escaper);
                escapBomb = this.guessBomb(this.escaper);
                escapSEQ = this.guessSequence(this.escaper);
            }
            else {
                escapPair = this.guessPair(this.banker);
                escapTriple = this.guessTriple(this.banker);
                escapBomb = this.guessBomb(this.banker);
                escapSEQ = this.guessSequence(this.banker);
            }
            //新连对
            for (let i = ddzcons.CardPoint.THREE(); i < ddzcons.CardPoint.JACK(); i++) {
                if (this.handcards[i] == 0 || this.handcards[i] == 4 || (i >= ddzcons.CardPoint.QUEEN() && bankerRobot)) continue;
                outcards = [];
                let pPairLength = 0;
                let TripleCnt = 0;
                for (let j = i; j < this.handcards.length; j++) {
                    if (this.handcards[j] < 2 || this.handcards[j] == 4) {
                        break;
                    }
                    pPairLength++;
                    if (this.handcards[i] == 3) { TripleCnt++; }
                    outcards[2 * (j - i)] = { key: j };
                    outcards[2 * (j - i) + 1] = { key: j };
                }
                if (pPairLength < 3 || TripleCnt >= 2) continue;
                scoretemp = this.calculateRemainScore(this.handcards, outcards) + 20;
                if (scoretemp > scoreResult || this.IsBiggest(this.countToInfo(outcards))) {
                    scoreResult = scoretemp;
                    outcardResult = outcards;
                    logger.debug('考虑出的牌型 314', utils.printCards(this.countToInfo(outcardResult)));
                }
            }
            //出飞机
            for (let i = 0; i < TripleCards.length - 4; i++) {
                if (!TripleCards[i] || (this.breakSEQ(i, SequenceCards, 3) || (this.breakPairSeq(i, PairSeqCards) && i < ddzcons.CardPoint.JACK()) && bankerRobot)) continue;
                if (TripleCards[i].key >= ddzcons.CardPoint.ACE() && (this.turn <= 3 && bankerRobot)) continue;
                outcards = [];
                let planeLength = 0;
                for (let j = i; j < TripleCards.length; j++) {
                    if (!TripleCards[j]) {
                        break;
                    }
                    planeLength++;
                    outcards[3 * (j - i)] = TripleCards[j];
                    outcards[3 * (j - i) + 1] = TripleCards[j];
                    outcards[3 * (j - i) + 2] = TripleCards[j];
                }
                scoretemp = this.calculateRemainScore(this.handcards, outcards);
                //scoretemp = scoretemp == Infinity ? 100 : scoretemp;
                if (scoretemp > scoreResult || this.IsBiggest(this.countToInfo(outcards))) {
                    scoreResult = scoretemp;
                    outcardResult = outcards;
                    logger.debug('考虑出的牌型 237', utils.printCards(this.countToInfo(outcardResult)), '分数', scoreResult);
                }
                //飞机带对子
                let PairPlanelength = planeLength;
                let outcardsPlane = this.CopyArray(outcards);
                let takePairCards = (SpPair.length == 0 || this.breakSEQ(i, SequenceCards, 3) || this.breakPairSeq(i, PairSeqCards) && bankerRobot) ? PairCards : SpPair;
                for (let k = 0; k < takePairCards.length - 3; k++) {
                    if ((PairPlanelength == 0 || !takePairCards[k] || takePairCards[k].key >= ddzcons.CardPoint.ACE() || this.breakSEQ(k, SequenceCards, 2) || this.breakPairSeq(k, PairSeqCards)) && bankerRobot) continue;
                    //不带散牌的飞机
                    if (PairPlanelength > 0) {
                        outcardsPlane.push(takePairCards[k]);
                        outcardsPlane.push(takePairCards[k]);
                        PairPlanelength--;
                    }
                    if (PairPlanelength != 0) continue;

                    scoretemp = this.calculateRemainScore(this.handcards, outcardsPlane);
                    if (scoretemp > scoreTriple) {
                        scoreTriple = scoretemp;
                        BestTriple = outcardsPlane;
                    }

                    if (scoretemp < scoreResult && !this.IsBiggest(this.countToInfo(outcards)) && outcardsPlane.length < 6) {
                        continue;
                    }
                    else {
                        outcardResult = outcardsPlane;
                        scoreResult = scoretemp
                        logger.debug('考虑出的牌型 286', utils.printCards(this.countToInfo(outcardResult)));
                    }

                    if (scoretemp >= scoreBiggest) {
                        scoreBiggest = scoretemp;
                        BiggestCard = outcards;
                    }
                }

                //飞机带单张
                let SgPlanelength = planeLength;
                let outcardsSGPlane = this.CopyArray(outcards);
                let takeOneCards = (SpSG.length == 0 || this.breakSEQ(i, SequenceCards, 3) && bankerRobot)/*|| this.MinCardIndex(SgleCards) < this.MaxCardIndex(SpSG)*/ ? SgleCards.slice(0, 11) : SpSG;
                for (let k = 0; k < takeOneCards.length; k++) {
                    if ((SgPlanelength == 0 || !takeOneCards[k] || takeOneCards[k].key >= ddzcons.CardPoint.ACE()
                        || this.breakSEQ(takeOneCards[k].key, SequenceCards) && bankerRobot)) continue;
                    //判断能不能收牌
                    if (SgPlanelength > 0) {
                        outcardsSGPlane.push(takeOneCards[k]);
                        SgPlanelength--;
                    }
                    if (SgPlanelength != 0) continue;

                    scoretemp = this.calculateRemainScore(this.handcards, outcardsSGPlane);
                    if (scoretemp > scoreTriple || this.IsBiggest(this.countToInfo(outcards))) {
                        scoreTriple = scoretemp;
                        BestTriple = outcardsSGPlane;
                    }

                    if (scoretemp < scoreResult && !this.IsBiggest(this.countToInfo(outcards)) && outcardsPlane.length < 6) {
                        continue;
                    }
                    else {
                        outcardResult = outcardsSGPlane;
                        scoreResult = scoretemp
                        logger.debug('考虑出的牌型 256', utils.printCards(this.countToInfo(outcardResult)));
                    }

                    if (scoretemp >= scoreBiggest) {
                        scoreBiggest = scoretemp;
                        BiggestCard = outcardsSGPlane;
                    }
                }
                break;
            }
            //出顺子
            let NoSeq = true;
            for (let i = 0; i < SequenceCards.length; i++) {
                if (!SequenceCards[i]) continue;
                if ((SequenceCards[i].key + SequenceCards[i].count >= 14 && (this.handcards >= 15 || outcardResult || this.countOfBigCards(this.handcards) < 3)) && bankerRobot) break;
                outcards = [];
                let outcardsBig = [];
                outcardsBig.push({ key: ddzcons.CardPoint.KING() });
                outcardsBig.push({ key: ddzcons.CardPoint.KING() });
                for (let j = 0; j < SequenceCards[i].count; j++) {
                    if (!this.handcards[SequenceCards[i].key + j]) break;
                    if (SequenceCards[i].key + j == ddzcons.CardPoint.ACE() && this.countOfBigCards(this.handcards) < 3 && outcards.length >= 5 && bankerRobot) {
                        continue;
                    }
                    if (outcards.length >= 5 && SequenceCards[i].key + j >= ddzcons.CardPoint.KING() && (this.handcards[SequenceCards[i].key + j] >= 3 || this.IsBiggest(this.countToInfo(outcardsBig))) && this.IsBiggest(this.countToInfo(outcards))) break;
                    outcards.push({ key: SequenceCards[i].key + j });
                }
                if ((!outcards || outcards.length < 5 || utils.getCardType(this.countToInfo(outcards)) == 0) && bankerRobot) {
                    continue;
                }
                scoretemp = this.calculateRemainScore(this.handcards, outcards);
                if (scoretemp > scoreSEQ || this.IsBiggest(this.countToInfo(outcards))) {
                    scoreSEQ = scoretemp;
                    BestSEQ = outcards;
                }
                if (scoretemp <= scoreResult && !this.IsBiggest(this.countToInfo(outcards))) {
                    continue;
                }
                if (scoretemp > scoreBiggest) {
                    scoreBiggest = scoretemp;
                    BiggestCard = outcards;
                }
                let MaxIndex = this.MaxCardIndex(escapSEQ);
                if (NoSeq) {
                    if (!MaxIndex || (escapSEQ[MaxIndex].key <= SequenceCards.key
                        && escapSEQ[MaxIndex].count <= SequenceCards.count)) {
                        outcardResult = outcards;
                        scoreResult = scoretemp;
                        NoSeq = false;
                        logger.debug('考虑出的牌型 323', utils.printCards(this.countToInfo(outcardResult)), '分数', scoreResult);
                    }
                }
            }
            //出三张,带单张或者一对,注释掉了
            {
                // for (let i = 0; i < TripleCards.length; i++) {
                //     if (!TripleCards[i]) continue;
                //     outcards = [];
                //     for (let j = 0; j < 3; j++) {
                //         outcards.push(TripleCards[i]);
                //     }
                //     scoretemp = this.calculateRemainScore(this.handcards, outcards);
                //     if (scoretemp > scoreTriple) {
                //         scoreTriple = scoretemp;
                //         BestTriple = outcards;
                //     }
                //     if (scoretemp <= scoreResult) {
                //         continue;
                //     }

                //     if (scoretemp > scoreBiggest) {
                //         scoreBiggest = scoretemp;
                //         BiggestCard = outcards;
                //     }
                //     //最大单牌比2大(往往用在开局)
                //     //最大单牌无人能压,用在冲刺
                //     let MaxIndex = this.MaxCardIndex(escapTriple);
                //     if (!MaxIndex || escapTriple[MaxIndex].key <= this.getValue(TripleCards[i].point)) {
                //         outcardResult = outcards;
                //         scoreResult = scoretemp;
                //         logger.debug('考虑出的牌型 425', utils.printCards(this.countToInfo(outcardResult)));
                //     }
                //     //三带一
                //     for (let j = SgleCards.length - 1; j > 0; j--) {
                //         if (!SgleCards[j] || this.breakSEQ(j, SequenceCards)) continue;
                //         //判断能不能收牌
                //         outcards[ddzcons.Formation.TRIPLE()] = SgleCards[j];
                //         scoretemp = this.calculateRemainScore(this.handcards, outcards);
                //         if (scoretemp > scoreTriple) {
                //             scoreTriple = scoretemp;
                //             BestTriple = outcards;
                //         }
                //         if (scoretemp <= scoreResult) {
                //             continue;
                //         }
                //         else {
                //             outcardResult = outcards;
                //             scoreResult = scoretemp;
                //             logger.debug('考虑出的牌型 443', utils.printCards(this.countToInfo(outcardResult)));
                //         }

                //         if (scoretemp > scoreBiggest) {
                //             scoreBiggest = scoretemp;
                //             BiggestCard = outcards;
                //         }
                //     }
                //     //三带二
                //     for (let j = PairCards.length - 1; j > 0; j--) {
                //         if (!PairCards[j] || PairCards[j].key >= ddzcons.CardPoint.TWO() || this.breakSEQ(j, SequenceCards, 2) || this.breakPairSeq(j, PairSeqCards)) continue;
                //         //判断能不能收牌  
                //         outcards[3] = PairCards[j];
                //         outcards[4] = PairCards[j];
                //         scoretemp = this.calculateRemainScore(this.handcards, outcards);
                //         if (scoretemp > scoreTriple) {
                //             scoreTriple = scoretemp;
                //             BestTriple = outcards;
                //         }
                //         if (scoretemp <= scoreResult) {
                //             continue;
                //         }
                //         else {
                //             outcardResult = outcards;
                //             scoreResult = scoretemp;
                //             logger.debug('考虑出的牌型 469', utils.printCards(this.countToInfo(outcardResult)));
                //         }

                //         if (scoretemp > scoreBiggest) {
                //             scoreBiggest = scoretemp;
                //             BiggestCard = outcards;
                //         }
                //     }
                // }
            }
            //出单张
            if (!outcardResult && this.getLength(SgleCards) > 0 && (this.myLastType != ddzcons.Formation.ONE() || this.getLength(SgleCards) == this.handCount[this.index])) {
                outcards = [];
                let MaxIndex = this.MaxCardIndex(SgleCards);
                let MinIndex = this.MinCardIndex(SgleCards);
                let MaxCard = SgleCards[MaxIndex];
                let MinCard = SgleCards[MinIndex];
                let MBCards = seatMgr.getSeat(this.getIndexMB()).getCards();
                let BkCards = seatMgr.getSeat(this.banker).getCards();
                let EsCards = seatMgr.getSeat(this.escaper).getCards();
                //庄家是真人,能赢的牌
                //递牌
                if (this.index == this.escaper) {
                    if (this.handCount[this.getIndexMB()] == 1 && MinIndex < this.getValue(MBCards[0].point)) {
                        outcards.push(MinCard);
                    }
                }
                else if (this.index == this.getIndexMB() && MinIndex >= this.getValue(BkCards[0].point) && this.IsBiggest(seatMgr.getSeat(this.escaper).getCards())) {
                    if (this.handCount[this.escaper] == 1 && this.IsBiggest(seatMgr.getSeat(this.escaper).getCards())) {
                        outcards.push(MinCard);
                    }
                }
                if (!seatMgr.getSeat(this.banker).isRobot() && outcards.length == 0 && !outcardResult) {
                    //玩家手里的牌正好比我大，只能拆着打
                    if (outcards.length == 0) {
                        //自身手里只有单牌
                        if (this.getLength(SgleCards) == this.handCount[this.index] && ((this.index == this.banker && (EsCards.length == 1 || MBCards.length == 1)) || (this.index != this.banker && BkCards.length == 1))) {
                            if (seatMgr.getSeat(this.banker).getCards().length == 1) {
                                outcards.push(MaxCard);
                            }
                        }
                    }
                    logger.debug('庄家单张比我最大的对子小', utils.printCards(this.countToInfo(outcards)));
                }

                if (outcards.length != 0) {
                    let cards = this.countToInfo(outcards);
                    logger.debug('最终出的牌型 616', utils.printCards(cards));
                    return { cards, formation: utils.getCardType(cards) };
                }

                //上面与此处无关
                if (!outcardResult || outcardResult.length == 0) {
                    if (!seatMgr.getSeat(this.banker).isRobot() && this.selfIsMB()) {
                        for (let i = this.MinCardIndex(SgleCards) + 2; i <= SgleCards.length - 5; i++) {
                            if (!SgleCards[i]) continue;
                            outcards = [];
                            outcards.push(SgleCards[i]);
                            logger.debug('考虑出的牌型 line 437', utils.printCards(this.countToInfo(outcardResult)));
                            break;
                        }
                    }

                    if (outcards.length != 0) {
                        let cards = this.countToInfo(outcards);
                        logger.debug('最终出的牌型 634', utils.printCards(cards));
                        return { cards, formation: utils.getCardType(cards) };
                    }
                }

                if (this.index != this.getIndexMB() || (!outcardResult || outcardResult.length == 0)) {
                    let minIndex = this.MinCardIndex(SgleCards);
                    let repressCards = this.getLength(SpSG) > 0 ? SpSG : SgleCards.slice(0, 14);
                    for (let i = 0; i < repressCards.length; i++) {
                        if (!repressCards[i] || this.breakSEQ(i, SequenceCards)) continue;
                        if (this.beEnemyAssist(repressCards[i].key)) continue;
                        if (i == ddzcons.CardPoint.TWO()) continue;
                        //判断能不能收牌
                        outcards = [];
                        outcards.push(repressCards[i]);

                        scoretemp = this.calculateRemainScore(this.handcards, outcards);
                        if (scoretemp > scoreSingle || this.IsBiggest(this.countToInfo(outcards))) {
                            scoreSingle = scoretemp;
                            BestSingle = outcards;
                        }
                        if (scoretemp <= scoreResult) {
                            continue;
                        }
                        if (scoretemp > scoreBiggest) {
                            scoreBiggest = scoretemp;
                            BiggestCard = outcards;
                        }
                        //最大单牌比2大(往往用在开局)
                        //最大单牌无人能压,用在冲刺
                        let MaxIndex = this.MaxCardIndex(repressCards);
                        if (MaxIndex >= ddzcons.CardPoint.TWO()
                            || this.handcards[ddzcons.CardPoint.TWO()] > 0
                            || this.handcards[ddzcons.CardPoint.ACE()] > 0) {
                            let haveBiggest = true;

                            if (haveBiggest || this.seat.getIndex() == this.banker || this.getLength(SgleCards) == this.handCount[this.index] - 3) {
                                outcardResult = outcards;
                                scoreResult = scoretemp;
                                logger.debug('考虑出的牌型 622', utils.printCards(this.countToInfo(outcardResult)));
                            }
                        }
                    }
                }
            }
            //出一对
            if (!outcardResult && this.getLength(PairCards) > 0 && (this.myLastType != ddzcons.Formation.PAIR() || this.getLength(PairCards) * 2 == this.handCount[this.index])) {
                outcards = [];
                let MaxIndex = this.MaxCardIndex(PairCards);
                let MinIndex = this.MinCardIndex(PairCards);
                let MaxCard = PairCards[MaxIndex];
                let MinCard = PairCards[MinIndex];
                let MBCards = seatMgr.getSeat(this.getIndexMB()).getCards();
                let BkCards = seatMgr.getSeat(this.banker).getCards();
                //庄家是真人
                if (this.index == this.escaper) {
                    if (utils.getCardType(seatMgr.getSeat(this.getIndexMB()).getCards()) == ddzcons.Formation.PAIR() && MinIndex < this.getValue(MBCards[0].point)) {
                        outcards = [];
                        outcards.push(MinCard);
                        outcards.push(MinCard);
                    }
                }
                else if (this.index == this.getIndexMB()) {
                    if (utils.getCardType(seatMgr.getSeat(this.getIndexMB()).getCards()) == ddzcons.Formation.PAIR() && (utils.getCardType(BkCards) != ddzcons.Formation.PAIR() || (utils.getCardType(BkCards) == ddzcons.Formation.PAIR() && minIndex >= this.getValue(BkCards[0].point))) && this.IsBiggest(seatMgr.getSeat(this.escaper).getCards())) {
                        outcards = [];
                        outcards.push(MinCard);
                        outcards.push(MinCard);
                    }
                }
                if (!seatMgr.getSeat(this.banker).isRobot() && outcards.length == 0 && (!outcardResult || outcardResult.length == 0)) {
                    //真人手里的牌最大
                    //手里一对
                    let bankerCards = _.clone(seatMgr.getSeat(this.banker).getCards());
                    let cardsInfo = utils.searchOutCard(bankerCards, bankerCards.length, this.lastCard, this.lastCard.length);
                    let cards = cardsInfo.cbResultCard;
                    let big = this.IsBiggest(cards);
                    bankerCards = utils.removeCards(bankerCards, cards)
                    if (utils.getCardType(seatMgr.getSeat(this.banker).getCards()) == ddzcons.Formation.PAIR()
                        || (big && utils.getCardType(bankerCards))) {
                        outcards = [];
                        outcards.push(MaxCard);
                        outcards.push(MaxCard);


                        if (utils.compareCard(this.countToInfo(outcards), seatMgr.getSeat(this.banker).getCards())
                            || (big && utils.getCardType(bankerCards))) {
                            if (this.getLength(SgleCards) == 0) {
                                outcards = [];
                                outcards.push(MaxCard);
                            }
                            else {
                                outcards = [];
                                outcards.push(SgleCards[this.MaxCardIndex(SgleCards)]);;
                            }
                        }
                        logger.debug('庄家对子比我最大的对子小', utils.printCards(this.countToInfo(outcards)));
                    }
                }
                if (outcards.length != 0) {
                    let cards = this.countToInfo(outcards);
                    logger.debug('最终出的牌型 544', utils.printCards(cards));
                    return { cards, formation: utils.getCardType(cards) };
                }

                let repressCards = SpPair.length > 0 ? SpPair : PairCards;
                for (let i = 0; i < repressCards.length; i++) {
                    if (!repressCards[i] || this.breakSEQ(i, SequenceCards, 2) || this.breakPairSeq(i, PairSeqCards)) continue;
                    if (this.beEnemyAssist(repressCards[i].key, 2)) continue;
                    outcards = [];
                    for (let j = 0; j < 2; j++) {
                        outcards.push(repressCards[i]);
                    }

                    scoretemp = this.calculateRemainScore(this.handcards, outcards);
                    if (scoretemp > scorePair || this.IsBiggest(this.countToInfo(outcards))) {
                        scorePair = scoretemp;
                        BestPair = outcards;
                    }
                    if (scoretemp <= scoreResult) {
                        continue;
                    }
                    if (scoretemp > scoreBiggest) {
                        scoreBiggest = scoretemp;
                        BiggestCard = outcards;
                    }
                    //最大单牌比2大(往往用在开局)
                    //最大单牌无人能压,用在冲刺
                    let MaxIndex = this.MaxCardIndex(escapPair);
                    if (!outcardResult && (!MaxIndex || escapPair[MaxIndex].key <= repressCards[i].key
                        || this.seat.getIndex() == this.banker
                        || this.handcards[ddzcons.CardPoint.TWO()] >= 2
                        || this.handcards[ddzcons.CardPoint.ACE()] >= 2)) {
                        outcardResult = outcards;
                        scoreResult = scoretemp;
                        logger.debug('考虑出的牌型 484', utils.printCards(this.countToInfo(outcardResult), '分数 ', scoreResult));
                    }
                }
            }

            //庄家和逃牌者的打法相近
            //没有能大过对方的，就出让自己牌型最好的牌
            if (this.seat.getIndex() == this.banker || this.seat.getIndex() == this.escaper) {
                if ((!outcardResult || outcardResult.length == 0) && BiggestCard.length > 0) {
                    outcardResult = BiggestCard;
                    logger.debug('考虑出的牌型 674', utils.printCards(this.countToInfo(outcardResult)));
                }
            }
            //门板
            else {
                if (!outcardResult && BiggestCard.length > 1) {
                    outcardResult = BiggestCard;
                    logger.debug('考虑出的牌型 706', utils.printCards(this.countToInfo(outcardResult)));
                }
                else {
                    // 1.友方玩家能接上的，
                    // 2.增加自己分数的
                    // 3.不要出小单张
                    let frindSingle = this.guessSingle(this.escaper);
                    let friendPair = this.guessPair(this.escaper);
                    let friendTriple = this.guessTriple(this.escaper);
                    let friendBomb = this.guessBomb(this.escaper);
                    let friendSEQ = this.guessSequence(this.escaper);
                    let hasCard = false;
                    //友方的牌值比
                    //可能出现牌不存在的BUG
                    let OutValue = null;
                    let OutCount = null;
                    //顺子
                    let FrMaxIndex = this.MaxCardIndex(friendSEQ);
                    let EsMaxIndex = this.MaxCardIndex(escapSEQ);
                    //出顺子
                    if (!hasCard && BestSEQ.length >= 5) {
                        if (FrMaxIndex) {
                            OutValue = friendSEQ[FrMaxIndex].key;
                            OutCount = friendSEQ[FrMaxIndex].count;

                            if (!EsMaxIndex || (OutValue >= escapSEQ[EsMaxIndex].key &&
                                OutValue >= BestSEQ[0].key &&
                                OutCount >= escapSEQ[EsMaxIndex].count)) {
                                outcardResult = BestSEQ;
                                logger.debug('考虑出的牌型 519', utils.printCards(this.countToInfo(outcardResult)));
                                hasCard = true;
                            }
                        }
                    }
                    //三张，三带一,三带二
                    if (!hasCard && BestTriple.length != 0) {
                        FrMaxIndex = this.MaxCardIndex(friendTriple);
                        EsMaxIndex = this.MaxCardIndex(escapTriple);
                        if (FrMaxIndex) {
                            OutValue = friendTriple[FrMaxIndex].key;
                            if (!hasCard && this.getLength(TripleCards.length)) {
                                if (OutValue >= escapTriple[EsMaxIndex].key
                                    && OutValue > BestTriple[0].key) {
                                    outcardResult = BestTriple;
                                    hasCard = true;
                                    logger.debug('考虑出的牌型 535', utils.printCards(this.countToInfo(outcardResult)));
                                }
                            }
                        }
                    }
                    //出对子
                    if (!hasCard && BestPair.length != 0) {
                        FrMaxIndex = this.MaxCardIndex(friendPair);
                        EsMaxIndex = this.MaxCardIndex(escapPair);
                        let myMaxIndex = this.MaxCardIndex(PairCards);
                        if (FrMaxIndex) {
                            OutValue = friendPair[FrMaxIndex].key;
                            if (PairCards.length > 0) {
                                if (!EsMaxIndex || (OutValue >= escapPair[EsMaxIndex].key
                                    && OutValue > BestPair[0].key)) {
                                    if (seatMgr.getSeat(this.banker).isRobot()) {
                                        outcardResult = BestPair;
                                        hasCard = true;
                                        logger.debug('考虑出的牌型 552', utils.printCards(this.countToInfo(outcardResult)));
                                    }
                                    else {
                                        for (let i = PairCards.length - 8; i >= 0; i--) {
                                            if (!PairCards[i]) continue;
                                            outcardResult = [];
                                            outcardResult.push(PairCards[i]);
                                            outcardResult.push(PairCards[i]);
                                            logger.debug('考虑出的牌型 line 716', utils.printCards(this.countToInfo(outcardResult)));
                                            break;
                                        }
                                    }
                                }
                                if (!outcardResult || outcardResult.length == 0) {
                                    for (let i = 0; i < PairCards.length - 1; i++) {
                                        if (!PairCards[i]) continue;
                                        outcardResult = [];
                                        outcardResult.push(PairCards[i]);
                                        outcardResult.push(PairCards[i]);
                                        logger.debug('考虑出的牌型 line 727', utils.printCards(this.countToInfo(outcardResult)));
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    //出单张
                    if (!hasCard && this.getLength(SgleCards) > 0 && (!outcardResult || outcardResult.length == 0)) {
                        let i = null;
                        if (this.PrvIsEnemy() && this.handCount[this.lastSeat] <= 3) {
                            i = SgleCards.length - 1;
                        }
                        else {
                            i = SgleCards.length - 4;
                        }

                        for (; i >= 0; i--) {
                            if (!SgleCards[i]) continue;
                            outcardResult = [];
                            outcardResult.push(SgleCards[i]);
                            logger.debug('考虑出的牌型 line 568', utils.printCards(this.countToInfo(outcardResult)));
                            break;
                        }

                        if ((!outcardResult || outcardResult.length <= 0) && BiggestCard.length >= 0) {
                            outcardResult = BiggestCard;
                            logger.debug('考虑出的牌型  line 573', utils.printCards(this.countToInfo(outcardResult)));
                        }
                    }
                }
            }
            if (!outcardResult && SgleCards[SgleCards.length - 1] && SgleCards[SgleCards.length - 2] && seatMgr.isBlackList()) {
                let PoinCards = [];
                PoinCards.push(SgleCards[SgleCards.length - 1]);
                PoinCards.push(SgleCards[SgleCards.length - 2]);
                let PoinInfo = this.countToInfo(PoinCards);

                logger.debug('最终出的牌型 869', utils.printCards(PoinInfo));
                return { cards: PoinInfo, formation: utils.getCardType(PoinInfo) };
            }
            if (!outcardResult) {
                for (let i = ddzcons.CardPoint.MAIN_JOKER(); i >= ddzcons.CardPoint.THREE(); i--) {
                    if (this.handcards[i] == 0 || !this.handcards[i]) continue;
                    let PoinCards = [];
                    for (let j = 0; j < this.handcards[i]; j++) {
                        PoinCards.push({ key: i });
                    }
                    let PoinInfo = this.countToInfo(PoinCards);
                    logger.debug('输定了 869', utils.printCards(PoinInfo));
                    return { cards: PoinInfo, formation: utils.getCardType(PoinInfo) };

                }
            }
        }
        else {
            //被动出牌
            //庄家和逃牌者出牌一样，计算出牌后，牌能能更顺
            //查找出牌后能让牌型更顺的牌
            let LastMPCfy = this.MingPai(this.lastSeat);
            let lastValue = this.getValue(this.lastCard[0].point);
            let lastValueEnd = this.getValue(this.lastCard[this.lastCard.length - 1].point);
            let lastRemainCards = seatMgr.getSeat(this.lastSeat).getCards()
            let lastLength = this.lastCard.length;
            let BKCards = seatMgr.getSeat(this.banker).getCards();

            //一手甩完就甩出去
            if (utils.compareCard(this.lastCard, this.seat.getCards())) {
                return { cards: this.seat.getCards(), formation: utils.getCardType(this.seat.getCards()) };
            }
            //自己一个人出那就
            let curTurnLength = this.OutCardTurn[this.turn].length;
            if (this.selfIsMB() && this.lastSeat == this.escaper
                && ((this.getValue(this.lastCard[0].point) > ddzcons.CardPoint.ACE()) ||
                    (curTurnLength >= 3 && this.OutCardTurn[this.turn][curTurnLength - 2].cards == null))) {
                logger.debug('最终出的牌型 827', utils.printCards(null));
                return { cards: null, formation: null };
            }
            //庄剩一张，队友出牌，队友无单张，不压
            if (!this.selfIsBK() && seatMgr.getSeat(this.banker).getCards().length == 1 && (this.lastSeat != this.banker && this.getLength(this.MingPai(this.lastSeat).SingleCards) == 0)) {
                logger.debug('最终出的牌型 858 过牌');
                return { cards: null, formation: null };
            }

            if (this.PrvisFriend() && this.AllIsBiggest(lastRemainCards, null, true) && !seatMgr.getSeat(this.banker).isRobot()) {
                return { cards: null, formation: null };
            }

            if (this.escaper == this.index && this.lastSeat == this.getIndexMB() && seatMgr.getSeat(this.lastSeat).isRobot()) {
                if (utils.getCardType(seatMgr.getSeat(this.lastSeat).getCards())) {
                    logger.debug('最终出的牌型 863 过牌');
                    return { cards: null, formation: null };
                }
            }
            //先锋牌
            if (!seatMgr.getSeat(this.banker).isRobot() || this.banker == this.index) {
                let PoinCards = [];
                for (let i = 0; i <= BombCards.length; i++) {
                    if (!BombCards[i] || this.handcards[i] == 0) continue;

                    for (let k = 0; k < 4; k++) { PoinCards.push({ key: i }); }

                    let PoinInfo = this.countToInfo(PoinCards);
                    if (this.PioneerCards(PoinInfo, this.lastCard)) {
                        logger.debug('scoreResult 925', utils.printCards(PoinInfo));
                        return { cards: PoinInfo, formation: utils.getCardType(PoinInfo) };
                    }
                }
                if (SgleCards[SgleCards.length - 1] && SgleCards[SgleCards.length - 2]) {
                    PoinCards = [];
                    PoinCards.push(SgleCards[SgleCards.length - 1]);
                    PoinCards.push(SgleCards[SgleCards.length - 2]);
                    let PoinInfo = this.countToInfo(PoinCards);
                    if (this.PioneerCards(PoinInfo, this.lastCard)) {
                        logger.debug('最终出的牌型 857', utils.printCards(PoinInfo));
                        return { cards: PoinInfo, formation: utils.getCardType(PoinInfo) };
                    }
                }
            }
            let outCardTemp = [];
            if (lastType == ddzcons.Formation.ONE() &&
                ((this.PrvisFriend() && lastValue < ddzcons.CardPoint.ACE()) || this.PrvIsEnemy())) {
                let remainEnemytype = null;
                let cardEnemyvalue = null;
                let enemyIndex = null;
                if (seatMgr.immortalCnt() == 1) {
                    enemyIndex = seatMgr.OnlyImmortalIndex();
                    let cards = _.sortBy(seatMgr.getSeat(enemyIndex).getCards(), (c) => -(this.getValue(c.point)));
                    remainEnemytype = utils.getCardType(cards);
                    if (remainEnemytype != null) {
                        cardEnemyvalue = this.getValue(cards[0].point);
                    }
                }
                //先锋牌
                if (!seatMgr.getSeat(this.banker).isRobot() || this.banker == this.index) {
                    for (let i = ddzcons.CardPoint.TEN(); i <= ddzcons.CardPoint.MAIN_JOKER(); i++) {
                        if (this.handcards[i] == 0 || i <= lastValue) continue;
                        let PoinCards = [];
                        PoinCards.push({ key: i });
                        let PoinInfo = this.countToInfo(PoinCards);
                        if (this.PioneerCards(PoinInfo, this.lastCard)) {
                            logger.debug('最后先锋 899', utils.printCards(PoinInfo));
                            return { cards: PoinInfo, formation: utils.getCardType(PoinInfo) };
                        }
                    }
                }
                if (this.selfIsMB() || (remainEnemytype == ddzcons.Formation.ONE() && (cardEnemyvalue > lastValue || this.lastSeat == enemyIndex))) {
                    //从大到下
                    let outCardTemp = [];
                    let repressCards = this.MaxCardIndex(SpSG) > lastValue ? SpSG : SgleCards.slice(0, 14);
                    for (let i = repressCards.length; i >= 0; i--) {
                        if (!repressCards[i] || this.breakSEQ(i, SequenceCards)) continue;
                        if (repressCards[i].key <= lastValue) continue;//A比他小，后面肯定比他小
                        //if (cardEnemyvalue != null && SpSG[i].key < cardEnemyvalue) break;
                        //判断能不能收牌
                        outCardTemp = [];
                        outCardTemp.push(repressCards[i]);
                        break;
                    }

                    //没单张A 拆一对A
                    if (!outCardTemp || outCardTemp.length <= 0 /*|| outCardTemp[0].key < 11*/) {
                        if (ddzcons.CardPoint.ACE() > lastValue && this.handcards[ddzcons.CardPoint.ACE()]) {
                            if (this.handcards[ddzcons.CardPoint.ACE()] != 0) {
                                outcardResult = [];
                                outcardResult.push({ key: ddzcons.CardPoint.ACE() });
                                logger.debug('考虑出的牌型 654', utils.printCards(this.countToInfo(outcardResult)));
                            }
                        }
                        if (this.PrvIsEnemy()) {
                            if ((!outcardResult || outcardResult.length == 0) && ddzcons.CardPoint.TWO() > lastValue) {
                                if (this.handcards[ddzcons.CardPoint.TWO()] != 0) {
                                    outcardResult = [];
                                    outcardResult.push({ key: ddzcons.CardPoint.TWO() });
                                    logger.debug('考虑出的牌型 659', utils.printCards(this.countToInfo(outcardResult)));
                                }
                            }
                            if ((!outcardResult || outcardResult.length == 0) && ddzcons.CardPoint.SUB_JOKER() > lastValue) {
                                if (this.handcards[ddzcons.CardPoint.SUB_JOKER()] != 0) {
                                    outcardResult = [];
                                    outcardResult.push({ key: ddzcons.CardPoint.SUB_JOKER() });
                                    logger.debug('考虑出的牌型 664', utils.printCards(this.countToInfo(outcardResult)));
                                }
                            }
                            if ((!outcardResult || outcardResult.length == 0) && ddzcons.CardPoint.MAIN_JOKER() > lastValue) {
                                if (this.handcards[ddzcons.CardPoint.MAIN_JOKER()] != 0) {
                                    if (this.index != this.banker || (this.index == this.banker && (this.turn >= 2))) {
                                        outcardResult = [];
                                        outcardResult.push({ key: ddzcons.CardPoint.MAIN_JOKER() });
                                        logger.debug('考虑出的牌型 669', utils.printCards(this.countToInfo(outcardResult)));
                                    }
                                }
                            }
                        }
                    }
                    if ((!outcardResult || outcardResult.length == 0) && outCardTemp.length > 0) {
                        outcardResult = outCardTemp;
                        logger.debug('考虑出的牌型 950', utils.printCards(this.countToInfo(outcardResult)));
                    }
                }
                else {
                    let hasSpCards = false;
                    let repressCards = null;
                    if (this.MaxCardIndex(SpSG) > lastValue) {
                        repressCards = SpSG;
                        logger.debug('多余单牌最大值', this.MaxCardIndex(SpSG), '使用的数组是 SpSG');
                    }
                    else {
                        repressCards = SgleCards.slice(0, 13);
                        logger.debug('多余单牌最大值', this.MaxCardIndex(SpSG), '使用的数组是 SgleCards.slice(0, 13)');
                    }

                    let outCardTemp = [];
                    for (let i = 0; i < repressCards.length; i++) {
                        if (!repressCards[i] || this.breakSEQ(i, SequenceCards) || repressCards[i].key <= lastValue) continue;

                        hasSpCards = true;
                        //判断能不能收牌
                        outCardTemp = [];
                        outCardTemp.push(repressCards[i]);
                        scoretemp = this.calculateRemainScore(this.handcards, outcards);
                        if (scoretemp > scoreResult) {
                            scoreResult = scoretemp;
                            outcardResult = outCardTemp;
                            logger.debug('考虑出的多余牌 919', utils.printCards(this.countToInfo(outcardResult)));
                        }
                    }

                    //没单张A 拆一对A
                    if (outCardTemp.length <= 0) {
                        if (ddzcons.CardPoint.ACE() > lastValue && this.handcards[ddzcons.CardPoint.ACE()] > 0) {
                            if (this.handcards[ddzcons.CardPoint.ACE()] != 0) {
                                outcardResult = [];
                                outcardResult.push({ key: ddzcons.CardPoint.ACE() });
                                logger.debug('考虑出的牌型 654', utils.printCards(this.countToInfo(outcardResult)));
                            }
                        }
                        if (this.PrvIsEnemy()) {
                            if ((!outcardResult || outcardResult.length == 0) && ddzcons.CardPoint.TWO() > lastValue) {
                                if (this.handcards[ddzcons.CardPoint.TWO()] != 0) {
                                    outcardResult = [];
                                    outcardResult.push({ key: ddzcons.CardPoint.TWO() });
                                    logger.debug('考虑出的牌型 659', utils.printCards(this.countToInfo(outcardResult)));
                                }
                            }
                            if ((!outcardResult || outcardResult.length == 0) && ddzcons.CardPoint.SUB_JOKER() > lastValue) {
                                if (this.handcards[ddzcons.CardPoint.SUB_JOKER()] != 0) {
                                    outcardResult = [];
                                    outcardResult.push({ key: ddzcons.CardPoint.SUB_JOKER() });
                                    logger.debug('考虑出的牌型 664', utils.printCards(this.countToInfo(outcardResult)));
                                }
                            }
                            if ((!outcardResult || outcardResult.length == 0) && ddzcons.CardPoint.MAIN_JOKER() > lastValue) {
                                if (this.handcards[ddzcons.CardPoint.MAIN_JOKER()] != 0) {
                                    if (this.index != this.banker || (this.index == this.banker && this.turn >= 2)) {
                                        outcardResult = [];
                                        outcardResult.push({ key: ddzcons.CardPoint.MAIN_JOKER() });
                                        logger.debug('考虑出的牌型 669', utils.printCards(this.countToInfo(outcardResult)));
                                    }
                                }
                            }
                        }
                    }
                    if ((!outcardResult || outcardResult.length == 0) && outCardTemp.length > 0) {
                        outcardResult = outCardTemp;
                        logger.debug('考虑出的牌型 950', utils.printCards(this.countToInfo(outcardResult)));
                    }
                }
            }
            if (lastType == ddzcons.Formation.PAIR()
                && ((this.PrvisFriend() && lastValue < ddzcons.CardPoint.ACE()) || this.PrvIsEnemy())
            /*&& (this.PrvIsEnemy()
        || (!this.BiggerSEQbyCards(PairCards, LastMPCfy.PairCards)))*/) {
                let remainEnemytype = null;
                let cardEnemyvalue = null;
                let enemyIndex = null;
                if ((seatMgr.immortalCnt() == 1 && seatMgr.getSeat(this.banker).isRobot())
                    || this.PrvIsEnemy()) {
                    enemyIndex = seatMgr.OnlyImmortalIndex() == -1 ? this.lastSeat : seatMgr.OnlyImmortalIndex();
                    let cards = _.sortBy(seatMgr.getSeat(enemyIndex).getCards(enemyIndex), (c) => -(this.getValue(c.point)));
                    remainEnemytype = utils.getCardType(cards);
                    if (remainEnemytype != null) {
                        cardEnemyvalue = this.getValue(cards[0].point);
                    }
                }
                if ((this.index != this.escaper && this.index != this.banker)
                    || (remainEnemytype == ddzcons.Formation.PAIR() && (cardEnemyvalue > lastValue || this.lastSeat == enemyIndex))) {
                    //先锋牌
                    if (!seatMgr.getSeat(this.banker).isRobot() || this.banker == this.index) {
                        for (let i = ddzcons.CardPoint.TEN(); i <= ddzcons.CardPoint.MAIN_JOKER(); i++) {
                            if (this.handcards[i] < 2 || i <= lastValue) continue;
                            let PoinCards = [];
                            PoinCards.push({ key: i });
                            PoinCards.push({ key: i });
                            let PoinInfo = this.countToInfo(PoinCards);
                            if (this.PioneerCards(PoinInfo, this.lastCard)) {
                                logger.debug('最后先锋 1029', utils.printCards(PoinInfo));
                                return { cards: PoinInfo, formation: utils.getCardType(PoinInfo) };
                            }
                        }
                    }
                    //有对A出A
                    let repressCards = (this.MaxCardIndex(SpPair) > lastValue || (this.MaxCardIndex(PairCards) < this.MaxCardIndex(SpPair) && this.MaxCardIndex(PairCards) > lastValue) && bankerRobot) ? SpPair : PairCards.slice(0, 13);
                    for (let i = repressCards.length; i >= 0; i--) {
                        if (!repressCards[i] || this.breakSEQ(i, SequenceCards, 2) || this.breakPairSeq(i, PairSeqCards)) continue;
                        if (repressCards[i].key <= lastValue) break;//A比他小，后面肯定比他小
                        //if (cardEnemyvalue != null && repressCards[i].key < cardEnemyvalue) break;
                        //判断能不能收牌
                        outCardTemp = [];
                        outCardTemp.push(repressCards[i]);
                        outCardTemp.push(repressCards[i]);
                        break;
                    }

                    //没对A 拆出A
                    if (!outCardTemp || outCardTemp.length <= 0 || outCardTemp[0].key < 10 || this.score >= 60) {
                        if (ddzcons.CardPoint.ACE() > lastValue) {
                            if (this.handcards[ddzcons.CardPoint.ACE()] >= 2) {
                                outcardResult = [];
                                outcardResult.push({ key: ddzcons.CardPoint.ACE() });
                                outcardResult.push({ key: ddzcons.CardPoint.ACE() });
                                logger.debug('考虑出的牌型 1053', utils.printCards(this.countToInfo(outcardResult)));
                            }
                        }
                        if (this.PrvIsEnemy() || (remainEnemytype == ddzcons.Formation.PAIR() && (cardEnemyvalue > lastValue || this.lastSeat == enemyIndex))
                            || this.handCount[this.index] == 2) {
                            //|| utils.compareCard(this.lastCard, this.seat.getCards())) {
                            if ((!outcardResult || outcardResult.length == 0) && ddzcons.CardPoint.ACE() > lastValue && this.handcards[ddzcons.CardPoint.TWO()] >= 2) {
                                outcardResult = [];
                                outcardResult.push({ key: ddzcons.CardPoint.TWO() });
                                outcardResult.push({ key: ddzcons.CardPoint.TWO() });
                                logger.debug('考虑出的牌型 725', utils.printCards(this.countToInfo(outcardResult)));
                            }
                        }
                    }
                    if (outCardTemp && (!outcardResult || outcardResult.length == 0)) {
                        outcardResult = outCardTemp;
                        logger.debug('考虑出的牌型 1065', utils.printCards(this.countToInfo(outcardResult)));
                    }
                }
                else {
                    let hasSpPair = false;
                    let repressCards = (this.MaxCardIndex(SpPair) > lastValue && bankerRobot) ? SpPair : PairCards;
                    for (let i = 0; i < repressCards.length; i++) {
                        if (!repressCards[i] || this.breakSEQ(i, SequenceCards, 2) || this.breakPairSeq(i, PairSeqCards) || repressCards[i].key <= lastValue) continue;
                        hasSpPair = true;
                        //判断能不能收牌
                        outcards = [];
                        outcards.push(repressCards[i]);
                        outcards.push(repressCards[i]);
                        scoretemp = this.calculateRemainScore(this.handcards, outcards);
                        if (scoretemp > scoreResult) {
                            scoreResult = scoretemp;
                            outcardResult = outcards;
                            logger.debug('考虑出的牌型 1081', utils.printCards(this.countToInfo(outcardResult)));
                        }
                    }
                    // if (!hasSpPair) {
                    //     for (let i = 0; i < PairCards.length; i++) {
                    //         if (!PairCards[i] || PairCards[i].key <= lastValue || this.breakSEQ(i, SequenceCards, 2) || this.breakPairSeq(i, PairSeqCards)) continue;
                    //         //判断能不能收牌
                    //         outcards = [];
                    //         outcards[0] = PairCards[i];
                    //         outcards[1] = PairCards[i];
                    //         scoretemp = this.calculateRemainScore(this.handcards, outcards);
                    //         if (scoretemp > scoreResult) {
                    //             scoreResult = scoretemp;
                    //             outcardResult = outcards;
                    //             logger.debug('考虑出的牌型 653x', utils.printCards(this.countToInfo(outcardResult)));
                    //         }
                    //     }
                    // }
                }
            }
            if (lastType == ddzcons.Formation.TRIPLE()
                && ((this.PrvisFriend() && lastValue < ddzcons.CardPoint.TEN()) || this.PrvIsEnemy())
                /*&& (this.PrvIsEnemy() || (!this.BiggerSEQbyCards(TripleCards, LastMPCfy.TripleCards)))*/) {
                for (let i = 0; i < TripleCards.length; i++) {
                    if (!TripleCards[i] || TripleCards[i].key <= lastValue) continue;
                    if (TripleCards[i].key >= ddzcons.CardPoint.TWO() && (this.turn <= 3 || this.PrvisFriend())) continue;
                    //判断能不能收牌
                    outcards = [];
                    outcards[0] = TripleCards[i];
                    outcards[1] = TripleCards[i];
                    outcards[2] = TripleCards[i];
                    scoretemp = this.calculateRemainScore(this.handcards, outcards);
                    if (scoretemp > scoreResult) {
                        scoreResult = scoretemp;
                        outcardResult = outcards;
                        logger.debug('考虑出的牌型 671x', utils.printCards(this.countToInfo(outcardResult)));
                    }
                }
            }
            if (lastType == ddzcons.Formation.TRIPLE_1() && this.lastCard.length == 4
                && ((this.PrvisFriend() && lastValue < ddzcons.CardPoint.ACE()) || this.PrvIsEnemy())
              /*  && (this.PrvIsEnemy() || (!this.BiggerSEQbyCards(TripleCards, LastMPCfy.TripleCards)))*/) {
                if (this.myHandinfo.length > 3) {
                    for (let i = 0; i < TripleCards.length; i++) {
                        if (!TripleCards[i] || TripleCards[i].key <= lastValue || this.breakSEQ(i, SequenceCards, 3) || this.breakPairSeq(i, PairSeqCards)) continue;
                        if (TripleCards[i].key >= ddzcons.CardPoint.ACE() && this.PrvisFriend()) continue;
                        if (TripleCards[i].key >= ddzcons.CardPoint.TWO() && (this.turn <= 3 || this.PrvisFriend())) continue;
                        //判断能不能收牌
                        outcards = [];
                        outcards[0] = TripleCards[i];
                        outcards[1] = TripleCards[i];
                        outcards[2] = TripleCards[i];
                        let MinSgIndex = this.MinNoBreakIndex(SgleCards, SequenceCards);
                        if (outcards.length != 4 && this.MinCardIndex(SpSG) && (!MinSgIndex || this.MinCardIndex(SpSG) < MinSgIndex)) {
                            outcards.push(SpSG[0]);
                        }
                        if (outcards.length != 4 && MinSgIndex && (!this.MinCardIndex(SpSG) || MinSgIndex < this.MinCardIndex(SpSG))) {
                            outcards.push(SgleCards[MinSgIndex]);
                        }

                        if (outcards.length != 4 && this.getLength(SgleCards) > 0) {
                            for (let i = 0; i < SgleCards.length - 2; i++) {
                                if (!SgleCards[i] || this.breakSEQ(i, SequenceCards)) continue;
                                outcards.push(SgleCards[i]);
                                logger.debug('三带一 1177');
                                break;
                            }
                        }
                        if ((outcards.length != 4 && SpPair.length >= 1 && this.MinCardIndex(SpPair) < ddzcons.CardPoint.KING() && bankerRobot)) {
                            outcards.push(SpPair[0]);
                            logger.debug('三带一 1183');
                        }
                        if (outcards.length != 4 && this.getLength(PairCards) > 0) {
                            for (let i = 0; i < PairCards.length - 1; i++) {
                                if (!PairCards[i] || this.breakSEQ(i, SequenceCards, 2) || this.breakPairSeq(i, PairSeqCards)) continue;
                                outcards.push(PairCards[i]);
                                logger.debug('三带一 1189');
                                break;
                            }
                        }
                        if (outcards.length != 4 && TripleCards >= 2) {
                            if (i == this.MinCardIndex(TripleCards)) continue;
                            outcards.push(TripleCards[0]);
                            logger.debug('三带一 1196');
                        }
                        if (outcards.length != 4) continue;
                        scoretemp = this.calculateRemainScore(this.handcards, outcards);
                        if (scoretemp > scoreResult) {
                            scoreResult = scoretemp;
                            outcardResult = outcards;
                            logger.debug('考虑出的牌型 700', utils.printCards(this.countToInfo(outcardResult)));
                        }
                    }
                }
            }
            if (lastType == ddzcons.Formation.TRIPLE_2() && this.lastCard.length == 5
                && ((this.PrvisFriend() && lastValue < ddzcons.CardPoint.KING()) || this.PrvIsEnemy())
    /*        &&               (this.PrvIsEnemy() || (!this.BiggerSEQbyCards(TripleCards, LastMPCfy.TripleCards)))*/) {
                for (let i = 0; i < TripleCards.length; i++) {
                    if (!TripleCards[i] || TripleCards[i].key <= lastValue || this.breakSEQ(i, SequenceCards, 3) || this.breakPairSeq(i, PairSeqCards)) continue;
                    if (TripleCards[i].key >= ddzcons.CardPoint.ACE() && this.turn <= 2) continue;
                    if (TripleCards[i].key >= ddzcons.CardPoint.TWO() && this.turn <= 2) continue;
                    //判断能不能收牌
                    outcards = [];
                    outcards[0] = TripleCards[i];
                    outcards[1] = TripleCards[i];
                    outcards[2] = TripleCards[i];

                    let MinPairIndex = this.MinPairNoBreakIndex(PairCards, SequenceCards, PairSeqCards);
                    if ((outcards.length != 5 && _.isNumber(this.MinCardIndex(SpPair)) && (!_.isNumber(MinPairIndex) || this.MinCardIndex(SpPair) < MinPairIndex)) && bankerRobot) {
                        outcards.push(SpPair[0]);
                        outcards.push(SpPair[0]);
                    }
                    if (outcards.length != 5 && MinPairIndex && (!_.isNumber(this.MinCardIndex(SpPair)) || MinPairIndex < this.MinCardIndex(SpPair))) {
                        outcards.push(PairCards[MinPairIndex]);
                        outcards.push(PairCards[MinPairIndex]);
                    }

                    if (outcards.length != 5 && this.getLength(TripleCards) >= 2) {
                        if (i == this.MinCardIndex(TripleCards)) continue;
                        outcards.push(TripleCards[this.MinCardIndex(TripleCards)]);
                        outcards.push(TripleCards[this.MinCardIndex(TripleCards)]);
                    }
                    if (outcards.length != 5) continue;
                    scoretemp = this.calculateRemainScore(this.handcards, outcards);
                    if (scoretemp > scoreResult) {
                        scoreResult = scoretemp;
                        outcardResult = outcards;
                        logger.debug('考虑出的牌型 396', utils.printCards(this.countToInfo(outcardResult)));
                    }
                }
            }
            let NoSeq = true;
            if (lastType == ddzcons.Formation.SEQUENCE()
                && ((this.PrvisFriend() && lastValue < ddzcons.CardPoint.ACE()) || this.PrvIsEnemy())
               /* && (this.PrvIsEnemy() || (!this.BiggerSEQbyCards(SequenceCards, LastMPCfy.SeqCards)))*/) {
                //lastValue = this.getValue(this.lastCard[lastLength - 1].point);
                for (let i = 0; i < SequenceCards.length; i++) {
                    if (!SequenceCards[i]) continue;
                    if (SequenceCards[i].key + SequenceCards[i].count - 1 <= lastValue
                        || SequenceCards[i].count < lastLength) {
                        continue;
                    }
                    logger.debug('正在筛选顺子出牌');
                    //判断能不能收牌
                    outcards = [];
                    for (let j = 0; j < SequenceCards[i].count; j++) {
                        if (SequenceCards[i].key + j <= lastValueEnd) continue;
                        outcards.push({ key: SequenceCards[i].key + j });
                        if (outcards.length == lastLength) break;
                    }
                    if (outcards.length != lastLength) continue;
                    scoretemp = this.calculateRemainScore(this.handcards, outcards);
                    if (NoSeq) {
                        if (scoretemp > scoreResult || this.IsBiggest(this.countToInfo(outcards))) {
                            NoSeq = false;
                            scoreResult = scoretemp;
                            outcardResult = outcards;
                            logger.debug('考虑出的牌型 745', utils.printCards(this.countToInfo(outcardResult)));
                        }
                    }
                }
            }
            if (lastType == ddzcons.Formation.SEQUENCE_PAIR() && this.PrvIsEnemy()
            /*&& this.PrvIsEnemy()*/) {
                if (this.getLength(PairCards) * 2 < lastLength) {
                    for (let i = 0; i < PairCards.length; i++) {
                        if (!PairCards[i]) continue;
                        //值小于等于
                        if (PairCards[i].key <= lastValue) continue;
                        //判断能不能收牌
                        if ((PairCards.length - i) * 2 < this.lastCard) break;
                        outcards = [];
                        for (let j = i; j < i + this.lastCard / 2; j++) {
                            if (!PairCards[j]) continue;
                            outcards[2 * (j - i)] = PairCards[j];
                            outcards[2 * (j - i) + 1] = PairCards[j];
                        }

                        scoretemp = this.calculateRemainScore(this.handcards, outcards);
                        if (scoretemp > scoreResult || this.IsBiggest(this.countToInfo(outcards))) {
                            scoreResult = scoretemp;
                            outcardResult = outcards;
                            logger.debug('考虑出的牌型 772x', utils.printCards(this.countToInfo(outcardResult)));
                        }
                    }
                }
            }
            if (lastType == ddzcons.Formation.SEQUENCE_PLANE() && this.lastCard.length % 3 == 0
                && this.PrvIsEnemy()) {
                if (TripleCards.length * 2 < this.lastCard) {
                    for (let i = 0; i < TripleCards.length; i++) {
                        if (!TripleCards[i] || TripleCards[i].key <= lastValue) continue;
                        //判断能不能收牌
                        if ((this.getLength(TripleCards) - i) * 3 < this.lastCard) break;
                        outcards = [];
                        for (let j = i; j < i + this.lastCard / 2; j++) {
                            if (!TripleCards[j] || (j != i + this.lastCard / 2 - 1 && TripleCards[j].key + 1 != TripleCards[j + 1].key + 1)) {
                                break;
                            }
                            outcards[3 * (j - i)] = TripleCards[j];
                            outcards[3 * (j - i) + 1] = TripleCards[j];
                            outcards[3 * (j - i) + 2] = TripleCards[j];
                        }

                        scoretemp = this.calculateRemainScore(this.handcards, outcards);
                        if (scoretemp > scoreResult || this.IsBiggest(this.countToInfo(outcards))) {
                            scoreResult = scoretemp;
                            outcardResult = outcards;
                            logger.debug('考虑出的牌型 797', utils.printCards(this.countToInfo(outcardResult)));
                        }
                    }
                }
            }
            if (lastType == ddzcons.Formation.SEQUENCE_PLANE() && this.lastCard.length % 4 == 0
                && this.PrvIsEnemy()) {
                if (TripleCards.length * 4 < lastLength) {
                    for (let i = 0; i < TripleCards.length; i++) {
                        if (!TripleCards[i] || TripleCards[i].key <= lastValue) continue;
                        //判断能不能收牌
                        if ((this.getLength(TripleCards) - i) * 4 < this.lastCard) break;
                        outcards = [];
                        for (let j = i; j < i + this.lastCard / 2; j++) {
                            if (!TripleCards[j]
                                || (j != i + this.lastCard / 2 - 1 && TripleCards[j].key + 1 != TripleCards[j + 1].key + 1)) {
                                break;
                            }

                            outcards[3 * (j - i)] = TripleCards[j];
                            outcards[3 * (j - i) + 1] = TripleCards[j];
                            outcards[3 * (j - i) + 2] = TripleCards[j];
                        }
                        for (let k = 0; k < SpSG.length; k++) {
                            if (!SpSG[k]) continue;
                            outcards.push(SpSG[k]);
                            if (outcards.length == lastLength) break;
                        }
                        if (outcards.length < lastLength) {
                            for (let k = 0; k < SpPair.length; k++) {
                                if (!SpPair[k]) continue;
                                outcards.push(SpPair[k]);
                                if (outcards.length == lastLength) break;
                            }
                        }
                        if (outcards.length < lastLength) {
                            for (let i = 0; i < SgleCards.length; i++) {
                                if (!SgleCards[i] || this.breakSEQ(i, SequenceCards)) continue;
                                outcards.push(SgleCards[i]);
                                if (outcards.length == lastLength) break;
                                break;
                            }
                        }
                        if (outcards.length < lastLength) {
                            for (let i = 0; i < PairCards.length; i++) {
                                if (!PairCards[i] || this.breakSEQ(i, SequenceCards, 2) || this.breakPairSeq(i, PairSeqCards)) continue;
                                outcards.push(SgleCards[i]);
                                if (outcards.length == lastLength) break;
                                outcards.push(SgleCards[i]);
                                if (outcards.length == lastLength) break;
                            }
                        }

                        if (outcards.length != lastLength) break;

                        scoretemp = this.calculateRemainScore(this.handcards, outcards);
                        if (scoretemp > scoreResult || this.IsBiggest(this.countToInfo(outcards))) {
                            scoreResult = scoretemp;
                            outcardResult = outcards;
                            logger.debug('考虑出的牌型 840', utils.printCards(this.countToInfo(outcardResult)));
                        }
                    }
                }
            }
            if (lastType == ddzcons.Formation.SEQUENCE_PLANE() && this.lastCard.length % 5 == 0
                && this.PrvIsEnemy()) {
                if (TripleCards.length * 4 < this.lastCard) {
                    for (let i = 0; i < TripleCards.length; i++) {
                        if (!TripleCards[i] || TripleCards[i].key <= lastValue) continue;
                        //判断能不能收牌
                        if ((this.getLength(TripleCards) - i) * 4 < this.lastCard) break;
                        outcards = [];
                        for (let j = i; j < i + this.lastCard / 2; j++) {
                            if (!TripleCards[j] || (j != i + this.lastCard / 2 - 1 && TripleCards[j].key + 1 != TripleCards[j + 1].key + 1)) {
                                break;
                            }
                            outcards[3 * (j - i)] = TripleCards[j];
                            outcards[3 * (j - i) + 1] = TripleCards[j];
                            outcards[3 * (j - i) + 2] = TripleCards[j];
                        }

                        for (let k = 0; k < SpPair.length; k++) {
                            if (!SpPair[k]) continue;
                            outcards.push(SpPair[k]);
                            outcards.push(SpPair[k]);
                            if (outcards.length == lastLength) break;
                            logger.debug('考虑出的多余牌 1297', utils.printCards(this.countToInfo(outcards)));
                        }
                        if (outcards.length < lastLength) {
                            for (let k = 0; k < PairCards.length; k++) {
                                if (!PairCards[k] || this.breakSEQ(k, SequenceCards, 2) || this.breakPairSeq(k, PairSeqCards)) continue;
                                outcards.push(PairCards[k]);
                                outcards.push(PairCards[k]);
                                if (outcards.length == lastLength) break;
                            }
                        }
                        if (outcards.length < lastLength) {
                            for (let k = 0; k < TripleCards.length; k++) {
                                if (!TripleCards[k]) continue;
                                outcards.push(TripleCards[k]);
                                outcards.push(TripleCards[k]);
                                if (outcards.length == lastLength) break;
                            }
                        }

                        if (outcards.length != lastLength) break;

                        scoretemp = this.calculateRemainScore(this.handcards, outcards);
                        if (scoretemp > scoreResult || this.IsBiggest(this.countToInfo(outcards))) {
                            scoreResult = scoretemp;
                            outcardResult = outcards;
                            logger.debug('考虑出的牌型 882', utils.printCards(this.countToInfo(outcardResult)));
                        }
                    }
                }
            }
            if (lastType == ddzcons.Formation.BOMB() && this.PrvIsEnemy()) {
                for (let k = 0; k < BombCards.length; k++) {
                    if (!BombCards[k] || BombCards[k].key <= lastValue) continue;
                    outcards = [];
                    for (let i = 0; i < 4; i++) {
                        outcards.push(BombCards[k]);
                    }
                    scoretemp = this.calculateRemainScore(this.handcards, outcards);
                    if (scoretemp > scoreResult || this.IsBiggest(this.countToInfo(outcards))) {
                        scoreResult = scoretemp;
                        outcardResult = outcards;
                        logger.debug('考虑出的牌型 889', utils.printCards(this.countToInfo(outcardResult)));
                    }
                }
            }
            //没有对应的牌，手里还是一副炸弹
            if ((this.PrvIsEnemy() && (utils.getCardType(this.seat.getCards()) == ddzcons.Formation.BOMB() && utils.compareCard(this.lastCard, this.seat.getCards()))
                || utils.getCardType(this.seat.getCards()) == ddzcons.Formation.ROCKET())) {
                outcardResult = this.seat.getCards();
                hasTransfer = true;
                logger.debug('考虑出的牌型 856', utils.printCards(outcardResult));
            }

            if ((!outcardResult || outcardResult.length == 0) && ((lastType != ddzcons.Formation.ROCKET()
                && stateMgr.getContinuity(this.lastSeat) < 4 && stateMgr.getContinuity(this.lastSeat) > 1 && this.PrvIsEnemy())
                || (this.getLength(BombCards) >= 2 && turn >= 3))) {
                outcardResult = this.getBomb(lastValue);
                logger.debug('考虑出的牌型 862', utils.printCards(this.countToInfo(outcardResult)));
            }

            if ((!outcardResult || outcardResult.length == 0) && this.PrvIsEnemy()) {
                if (stateMgr.getContinuity(this.lastSeat) >= 3
                    || this.GetguessSingleCount(this.lastSeat) <= 1
                    || this.room.getComp('seat').getSeat(this.lastSeat).getCards().length <= 3
                    || (utils.getCardType(lastRemainCards) && (this.PrvIsEnemy() || this.index == this.banker))) {
                    let cardsInfo = utils.searchOutCard(this.seat.getCards(), this.seat.getCards().length, this.lastCard, lastLength);

                    outcardResult = cardsInfo.cbResultCard;
                    let type = utils.getCardType(outcardResult);
                    if (type && (type == lastType || (type == ddzcons.Formation.BOMB() || type == ddzcons.Formation.ROCKET()))) {
                        hasTransfer = true
                    }
                    else {
                        outcardResult = null;
                        hasTransfer = false;
                    }

                    logger.debug('考虑出的牌型 872', outcardResult);
                }
            }
        }

        let result = null;
        if (!hasTransfer) {
            result = this.countToInfo(outcardResult);
        }
        else {
            result = outcardResult;
        }

        if (this.lastCard) {
            utils.getCardType(this.lastCard);
        }

        if (result == null || utils.getCardType(result) == null) {
            logger.debug('最终出的牌型 1438 过牌');
            return { cards: null, formation: null };
        }
        logger.debug('最终出的牌型 1440', utils.printCards(result));
        return { cards: result, formation: result ? utils.getCardType(result) : null };
    }

    MingPai(index) {
        let seat = this.room.getComp('seat').getSeat(index);
        let EnemyCards = this.InfoToCount(seat.getCards());

        let EnemyClassify = this.classify(EnemyCards);

        return EnemyClassify;
    }

    RemoveBombCanAllIn(cards, BombCards) {
        let mycards = cards.concat();
        if (BombCards || this.getLength(BombCards) > 0) {
            for (let i = 0; i < BombCards.length; i++) {
                if (!BombCards[i]) continue;
                for (let j = 0; j < 4; j++) {
                    mycards[BombCards[i].key]--;
                }

                if (mycards[ddzcons.CardPoint.MAIN_JOKER()] != 0 && mycards[ddzcons.CardPoint.SUB_JOKER()] != 0) {
                    mycards[ddzcons.CardPoint.MAIN_JOKER()] = 0;
                    mycards[ddzcons.CardPoint.SUB_JOKER()] = 0;
                }

                if (mycards[BombCards[i].key] < 0) {
                    return false;
                }
            }
        }
        if (this.getLength(BombCards) == 1) {
            if (this.seat.getIndex() != this.banker) {
                let BankerBomb = this.guessBomb(this.banker);
                //第二个比第一个大
                if (this.BiggerByCards(BombCards, BankerBomb)) {
                    return false;
                }
            }
            else {
                let EsBankerBomb = this.guessBomb(this.escaper);
                let BankerBomb = this.guessBomb(this.getIndexMB);
                if (this.BiggerByCards(BombCards, BankerBomb) || this.BiggerByCards(this.handcards, BankerBomb)) {
                    return false;
                }
            }
        }
        let remainCards = this.countToInfo(this.putCard(mycards));
        if (utils.getCardType(remainCards) != 0) {
            return true;
        }

        return false;
    }

    putCard(cards) {
        let classify = this.classify(cards);
        let classifyCards = this.classify(this.handcards);
        let SgleCards = classifyCards.SingleCards;
        let PairCards = classifyCards.PairCards;
        let TripleCards = classifyCards.TripleCards;
        let BombCards = classifyCards.BombCards;
        let outcards = [];
        if (this.getLength(SgleCards) > 0) {
            for (let i = 0; i < SgleCards.length; i++) {
                if (!SgleCards[i]) continue;
                outcards.push(SgleCards[i]);
            }
        }
        if (this.getLength(PairCards) > 0) {
            for (let i = 0; i < PairCards.length; i++) {
                if (!PairCards[i]) continue;
                for (let j = 0; j < 2; j++) {
                    outcards.push(PairCards[i]);
                }
            }
        }
        if (this.getLength(TripleCards) > 0) {
            for (let i = 0; i < TripleCards.length; i++) {
                if (!TripleCards[i]) continue;
                for (let j = 0; j < 3; j++) {
                    outcards.push(TripleCards[i]);
                }
            }
        }
        if (this.getLength(BombCards.length) > 0) {
            for (let i = 0; i < BombCards; i++) {
                if (!BombCards[i]) continue;
                for (let i = 0; i < 4; i++) {
                    outcards.push(BombCards[i]);
                }
            }
        }
        return outcards;
    }

    IsMb(index) {
        if (index == this.getIndexMB()) {
            return true;
        }
        return false;
    }

    selfIsMB() {
        let seatMgr = this.room.getComp('seat');
        let r = _.random(0, 100);
        if (this.seat.getIndex() == this.getIndexMB()) {
            if (r < 70 && seatMgr.getSeat(this.banker).isRobot() && this.banker != this.index) return false;
            return true;
        }
        if (r < 70 && seatMgr.getSeat(this.banker).isRobot() && this.banker != this.index) return true;
        return false;
    }

    selfIsBK() {
        if (this.seat.getIndex() == this.banker) {
            return true;
        }
        return false;
    }

    getIndexMB() {
        return this.next(this.escaper) != this.banker ? this.next(this.escaper) : this.next(this.banker);
    }

    BiggerByValue(cards, value) {
        if (!cards || this.getLength(cards) == 0 || value == constants.CardPoint.MAIN_JOKER()) {
            return false
        }

        let Bigger = fasle;
        for (let i = 0; i < cards.length; i++) {
            if (!cards[i]) continue;
            if (cards[i].key > value) {
                Bigger = true;
                break;
            }
        }
        return Bigger;
    }

    PrvisFriend() {
        return !this.PrvIsEnemy();
    }

    PrvIsEnemy() {
        let seat = this.room.getComp('seat').getSeat(this.lastSeat);
        let rdm = _.random(0, 100);
        if (!seat.isRobot() && rdm > 10 && this.index != this.banker) {
            return true;
        }
        if ((this.index != this.banker && this.lastSeat == this.banker) || this.index == this.banker) {
            return true;;
        }
        return false;
    }

    IsEnemy(index) {
        let seat = this.room.getComp('seat').getSeat(index);
        //if (!seat.isRobot() || this.index == this.banker) {
        if ((this.index != this.banker && index == this.banker) || this.index == this.banker) {
            return true;;
        }
        return false;
    }
    //第二个牌里 有比第一个大的
    BiggerByCards(cards, cmpCards) {
        if (!cards || this.getLength(cards) == 0) {
            return false
        }
        if (!cmpCards || this.getLength(cmpCards)) {
            return true;
        }
        let Bigger = false;
        for (let i = 0; i < cmpCards.length; i++) {
            if (!cmpCards[i]) continue;
            value = cmpCards[i].key;
            for (let j = 0; j < cards.length; j++) {
                if (!cards[j]) continue;
                if (value > cards[j].key) {
                    Bigger = true;
                    break;
                }
            }
            if (Bigger) {
                break;
            }
        }
        return Bigger;
    }

    //第二个牌里 有比第一个大的
    BiggerSEQbyCards(cards, cmpCards) {
        if (!cards || this.getLength(cards) == 0) {
            return false
        }
        if (!cmpCards || this.getLength(cmpCards)) {
            return true;
        }
        let Bigger = false;
        for (let i = 0; i < cmpCards.length; i++) {
            if (!cmpCards[i]) continue;
            value = cmpCards[i].key;
            count = cmpCards[i].key;
            for (let j = 0; j < cards.length; j++) {
                if (!cards[j]) continue;
                if (value > cards[j].key && count >= cmpCards[i].count) {
                    Bigger = true;
                    break;
                }
            }
            if (Bigger) {
                break;
            }
        }
        return Bigger;
    }

    getBomb(key) {
        let classifyCards = this.classify(this.handcards);
        let SgleCards = classifyCards.SingleCards;
        let BombCards = classifyCards.BombCards;
        let outcards = [];
        let lastValue = this.getValue(this.lastCard[0].point);
        for (let k = 0; k < BombCards.length; k++) {
            if (!BombCards[k] || (utils.getCardType(this.lastCard) == ddzcons.Formation.BOMB() && BombCards[k].key <= lastValue)) continue;
            if (key && k <= key) continue;
            outcards = [];
            for (let i = 0; i < 4; i++) {
                outcards.push(BombCards[k]);
            }

            if (outcards.length == 4) {
                break;
            }
        }
        if (!outcards) {
            if (SgleCards[SgleCards.length - 1] && SgleCards[SgleCards.length - 2]) {
                outcards.push(SgleCards[SgleCards.length - 1]);
                outcards.push(SgleCards[SgleCards.length - 2]);
            }
        }
        return outcards;
    }

    ObjectToCards(cards) {
        if (!cards || cards.length == 0) {
            return null;
        }

        let cardsClass = [];
        for (let i = 0; i < cards.length; i++) {
            cardsClass.push(new Card(cards[i].suit, cards[i].point, 0))
        }
        return cardsClass;
    }

    calculateRemainScore(cards, outcards) {
        let mycards = cards.concat();
        if (outcards) {
            for (let i = 0; i < outcards.length; i++) {
                if (!outcards[i]) continue;
                mycards[outcards[i].key]--;
            }
        }
        let classifyCards = this.classify(mycards);
        let sumScore = 0;
        let BigScore = 0;
        let sumtemp = 0;
        //计算各种情况，分数最大值
        BigScore += 6 * mycards[ddzcons.CardPoint.TWO()];
        BigScore += 4 * mycards[ddzcons.CardPoint.ACE()];
        BigScore += 10 * mycards[ddzcons.CardPoint.SUB_JOKER()];
        BigScore += 12 * mycards[ddzcons.CardPoint.MAIN_JOKER()];
        BigScore += 12 * this.getLength(classifyCards.BombCards);
        if (BigScore > 27) {
            return Infinity;
        }

        //计算第一个顺子，并减去该牌后再次计算
        let SeqCards = classifyCards.SeqCards;
        if (this.getLength(SeqCards) > 0) {
            let MinIndex = this.MinCardIndex(SeqCards);

            let SeqFirstScore = 0;
            //根据顺子最大值，以及张数进行判断
            //SeqFirstScore -= SeqCards[MinIndex].key + SeqCards[MinIndex].count - 1 < 8 ? 8 - SeqCards[MinIndex].key + SeqCards[MinIndex].count - 1 : 0;
            SeqFirstScore += SeqCards[MinIndex].key + SeqCards[MinIndex].count - 1 < 10 ? (9 - SeqCards[MinIndex].key + SeqCards[MinIndex].count) * 3 : 0;

            //SeqFirstScore -= SeqCards[MinIndex].count < 6 ? 6 - SeqCards[MinIndex].count : 0;
            SeqFirstScore += SeqCards[MinIndex].count > 4 ? (SeqCards[MinIndex].count - 4) * 2 : 0;

            for (let j = 0; j < SeqCards.SeqCnt; j++) {
                mycards[SeqCards[MinIndex].key + j]--;
            }
            BigScore += SeqFirstScore;
            classifyCards = this.classify(mycards);
        }


        let TripleLength = this.getLength(classifyCards.TripleCards);
        //出单牌的情况，减少三带一的个数
        let SingleOutScore = 0;
        for (let i = 1; i < classifyCards.SingleCards.length; i++) {
            if (!classifyCards.SingleCards[i]) continue;
            if (TripleLength != 0) {
                TripleLength--;
                continue;
            }
            SingleOutScore -= classifyCards.SingleCards[i].key < 12 ? (10 - classifyCards.SingleCards[i].key > 0 ? (10 - classifyCards.SingleCards[i].key) * 2 : -2) : 0;
            //SingleOutScore -= classifyCards.SingleCards[i].key < 8 ? -2 : 0;;
        }
        //计算对子分数
        let PairOutScore = 0;
        for (let i = 1; i < classifyCards.PairCards.length; i++) {
            if (!classifyCards.PairCards[i]) continue;
            if (TripleLength != 0) {
                TripleLength--;
                continue;
            }
            PairOutScore -= classifyCards.PairCards[i].key < 8 ? 8 - classifyCards.PairCards[i].key - 1 : 0;
        }
        //计算三张分数
        let TripleOutScore = 0;
        for (let i = 1; i < classifyCards.TripleCards.length; i++) {
            if (!classifyCards.TripleCards[i]) continue;
            if (TripleLength != 0) {
                TripleLength--;
                continue;
            }
            //TripleOutScore -= classifyCards.TripleCards[i].key < 5 ? 5 - classifyCards.TripleCards[i].key  : 0;
            TripleOutScore += classifyCards.TripleCards[i].key > 5 && classifyCards.TripleCards[i].key < 13 ? (classifyCards.TripleCards[i].key - 5) * 2 : 0;
            //SingleOutScore -= classifyCards.SingleCards[i].key < 8 ? -2 : 0;;
        }

        sumtemp += BigScore + SingleOutScore + PairOutScore + TripleOutScore;
        sumScore = sumtemp;

        //出顺子的情况
        let biggestClassify = null;
        let SeqTwoSingleScore = 0;
        SeqCards = this.getTypeCard(cards, ddzcons.Formation.SEQUENCE());
        for (let i = 0; i < SeqCards.length; i++) {
            if (!SeqCards[i]) continue;
            let SeqSingleScore = 0;
            let SeqFirstScore = 0;
            //根据顺子最大值，以及张数进行判断
            // SeqFirstScore -= SeqCards[i].key + SeqCards[i].count - 1 < 8 ? 8 - SeqCards[i].key + SeqCards[i].count - 1 : 0;
            SeqFirstScore += SeqCards[i].key + SeqCards[i].count - 1 < 9 ? (9 - SeqCards[i].key + SeqCards[i].count) * 3 : 0;

            //SeqFirstScore -= SeqCards[i].count < 6 ? 6 - SeqCards[i].count : 0;
            SeqFirstScore += SeqCards[i].count > 4 ? SeqCards[i].count - 4 : 0;
            let SeqScoreCards = mycards.concat();
            for (let j = 0; j < SeqCards.SeqCnt; j++) {
                SeqScoreCards[SeqCards[i].key + j]--;
            }
            //计算两种情况
            //出掉一把顺子后出单牌
            classifyCards = this.classify(SeqScoreCards);
            let TripleLG2 = this.getLength(classifyCards.TripleCards);
            for (let i = 1; i < classifyCards.SingleCards.length; i++) {
                if (!classifyCards.SingleCards[i]) continue;
                if (TripleLG2 != 0) {
                    TripleLG2--;
                    continue;
                }
                SeqSingleScore -= classifyCards.SingleCards[i].key < 12 ? (10 - classifyCards.SingleCards[i].key > 0 ? (10 - classifyCards.SingleCards[i].key) * 2 : -2) : 0;
                //   SeqSingleScore -= classifyCards.SingleCards[i].key < 8 ? 8 - classifyCards.SingleCards[i].key : 0;;
            }
            sumtemp = BigScore + SeqFirstScore + SeqSingleScore;
            if (sumtemp > sumScore) {
                sumScore = sumtemp;
                sumScore = sumtemp;

            }

            //出掉顺子后再出一把顺子
            let SeqTwoCards = this.getTypeCard(cards, ddzcons.Formation.SEQUENCE());
            if (this.getLength(SeqTwoCards) == 0) break;
            for (let i = 0; i < SeqTwoCards.length; i++) {
                if (!SeqTwoCards[i]) continue;
                let SeqTwoScore = 0;
                let SeqTwoSingleScore = 0
                //SeqTwoScore -= SeqTwoCards[i].key + SeqTwoCards.count - 1 < 8 ? 8 - SeqTwoCards[i].key + SeqTwoCards.count - 1 : 0;
                SeqTwoScore += SeqTwoCards[i].key + SeqTwoCards[i].count - 1 > 9 ? SeqTwoCards[i].key + SeqTwoCards[i].count - 9 : 0;

                //SeqTwoScore -= SeqTwoCards.count < 6 ? 6 - SeqTwoCards.count : 0;
                SeqTwoScore += SeqTwoCards[i].count > 5 ? SeqTwoCards[i].count - 5 : 0;
                for (let j = 0; j < SeqTwoCards.SeqCnt; j++) {
                    SeqScoreCards[SeqTwoCards[i].key + j]--;
                }
                classifyCards = this.classify(SeqScoreCards);
                let TripleLG3 = this.getLength(classifyCards.TripleCards);
                for (let i = 1; i < classifyCards.SingleCards.length; i++) {
                    if (!classifyCards.SingleCards[i]) continue;
                    if (TripleLG3 != 0) {
                        TripleLG3--;
                        continue;
                    }
                    SeqTwoSingleScore -= classifyCards.SingleCards[i].key < 8 ? 8 - classifyCards.SingleCards[i].key : 0;;
                }
                sumtemp = BigScore + SeqFirstScore + SeqTwoScore + SeqTwoSingleScore;
                if (sumtemp > sumScore) {
                    sumScore = sumtemp;
                    sumScore = sumtemp;

                }
            }
        }
        return sumScore;
    }

    getLength(cards) {
        if (!cards) {
            return 0;
        }
        let length = 0;
        for (let i = 0; i < cards.length; i++) {
            if (cards[i]) {
                length++;
            }
        }
        return length;
    }

    getTypeCard(cards, type) {
        let result = [];

        if (type == ddzcons.Formation.ONE()) {
            result = _.map(cards, (num, key) => {
                if (num == 1) {
                    return { key: key };
                }
            });
        }
        if (type == ddzcons.Formation.PAIR()) {
            result = _.map(cards, (num, key) => {
                if (num == 2) {
                    return { key: key };
                }
            });
        }
        if (type == ddzcons.Formation.TRIPLE()) {
            result = _.map(cards, (num, key) => {
                if (num == 3) {
                    return { key: key };
                }
            });
        }
        if (type == ddzcons.Formation.BOMB()) {
            result = _.map(cards, (num, key) => {
                if (num == 4) {
                    return { key: key };
                }
            });
        }

        if (type == ddzcons.Formation.SEQUENCE()) {
            result = _.map(cards, (num, key) => {
                if (!cards[key]) return null;
                let SeqCnt = 0;
                for (let i = key; i <= ddzcons.CardPoint.ACE(); i++) {
                    if (cards[i]) {
                        SeqCnt++;
                    }
                    else {
                        if (SeqCnt >= 5) {
                            return { key: key, count: SeqCnt };
                        }
                        SeqCnt = 0;
                        return null;
                    }
                }
                if (SeqCnt >= 5) {
                    return { key: key, count: SeqCnt };
                }
                return null;
            });
        }
        return result;
    }

    setBank(index) {
        this.banker = index;
        this.handCount[index] + 3;
        this.SingleCount[index] -= 1;
        this.escaper = this.next(index);
        if (index == this.index) {
            this.score = this.calculateRemainScore(this.InfoToCount(this.seat.getCards()));
        }
    }

    setMycard(mycards) {
        this.myHandinfo = _.sortBy(mycard, (c) => this.getValue(c.point));
        for (let i = 0; i < cards.length; i++) {
            this.handcards[this.getValue(cards[i].point)]++;
        }
    }

    next(index) {
        if (index < 2) {
            return index + 1;
        }
        return 0;
    }

    last(index) {
        if (index > 0) {
            return index - 1;
        }
        return 2;
    }

    //将出牌记录塞入
    RecordCard(index, cardsParam, turn) {
        let IsActive = false;
        if (this.turn != turn) {
            this.turn = turn;
            IsActive = true;
        }

        let information = { seat: index, cards: cardsParam };
        if (!cardsParam) {
            if (!this.OutCardTurn[turn]) {
                this.OutCardTurn[turn] = [];
            }
            this.OutCardTurn[turn].push(information);

            this.OutCardTurn[turn]        //上家不接，
            let lastType = utils.getCardType(this.lastCard);
            if (!this.OutNonePlayers[index][lastType]) {
                this.OutNonePlayers[index][lastType] = [];
            }
            this.OutNonePlayers[index][lastType].push(cardsParam);

            return false;
        }

        let type = utils.getCardType(cardsParam);

        let cards = _.sortBy(cardsParam, (c) => this.getValue(c.point));

        //this.lastCard = cards;
        this.lastSeat = index;
        type = utils.getCardType(cards);
        this.handCount[index] -= cards.length;

        if (!this.OutCardType[type]) {
            this.OutCardType[type] = [];
        }
        this.OutCardType[type].push(cards);

        for (let i = 0; i < cards.length; i++) {
            this.knowncard[this.getValue(cards[i].point)]++;
            this.OutCntPlayers[index][this.getValue(cards[i].point)]++;
            if (index == this.seat.getIndex()) {
                this.handcards[this.getValue(cards[i].point)]--;
            }
        }

        if (!this.OutCardTurn[turn]) {
            this.OutCardTurn[turn] = [];
        }
        this.OutCardTurn[turn].push(information);   //{0：{seat.index, cards}, 1:{seat.index, cards}}

        if (this.OutCardPlayers[index][type] == null) {
            this.OutCardPlayers[index][type] = [];
        }
        this.OutCardPlayers[index][type].push(cards);    //玩家出的牌型，以及主动被动

        let info = { cards: cards, IsActive: IsActive };
        if (this.OutCardTypePlayers[index][type] == null) {
            this.OutCardTypePlayers[index][type] = [];
        }
        this.OutCardTypePlayers[index][type].push(info);

        return true;
    }

    //获取单张数量
    GetguessSingleCount(index) {
        return this.SingleCount[index];
    }

    addguessSingleCount(index) {
        this.SingleCount[index]++;
    }

    deletguessSingleCount(index) {
        this.SingleCount[index]--;
    }

    guessSingle(index) {
        if (this.handCount[index] <= 1) {
            return null;
        }
        //当前未出的牌
        let guessSingleCardPoint = _.map(this.knowncard, function (num, key) {
            if (num <= 2) {
                return key;
            }
        });

        let guessSingleCard = _.map(guessSingleCardPoint, (num) => {
            return new Card(1, num, 0);
        });

        if (guessSingleCard == null) {
            return null;
        }

        let SingleCard = _.filter(guessSingleCard, (g) => {
            //逃牌者,有机会出该牌却不出,没机会出时则判断无此牌
            if (index == this.escaper) {
                //每一轮出牌机会
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    let type = utils.getCardType(this.OutCardTurn[i][0].cards);
                    if (type == ddzcons.Formation.ONE()
                        || type == ddzcons.Formation.TRIPLE_1()) {

                        for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                            if (!this.OutCardTurn[i][j].cards) continue;
                            if (utils.getCardType((this.OutCardTurn[i][j].cards) != ddzcons.Formation.PAIR())) {
                                break;
                            }
                            //判断压不压别人牌
                            //重点:有机会却不压,则没有， 没机会出则有
                            if (g.getValue() > this.getValue(_.last(this.OutCardTurn[i][j].cards.point)) && this.OutCardTurn[i][j].seat != index
                                //作为上家不压牌
                                && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                    //作为下家不压牌
                                    || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
            else if (index != this.banker) {//门板
                if (g.getValue() < ddzcons.CardPoint.TEN()) return false;
                let OutpairCnt = 0;
                //庄家出牌，看门板会不会挡即可，小单张不需要考虑
                //当非主动出牌
                let group = this.OutCardTypePlayers[index][ddzcons.Formation.ONE()];
                for (let i = 0; i < group.length; i++) {
                    if (this.getValue(_.first(group[i].cards).point) >= ddzcons.CardPoint.KING()
                        && !group[i].IsActive) {
                        OutpairCnt++;
                        if (OutpairCnt >= 2) {
                            return true;
                        }
                    }
                }
                return false;
            }
            else if (index == this.banker) {
                //门板推断庄家,找庄家的空隙，让庄家难受
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    let type = utils.getCardType(this.OutCardTurn[i][0].cards);
                    // if (type >= ddzcons.Formation.PAIR() && type <= ddzcons.Formation.TRIPLE_2())
                    for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                        if (!this.OutCardTurn[i][j].cards) continue;
                        //判断牌型相当,此处format需修改
                        if (utils.getCardType(this.OutCardTurn[i][j].cards) != ddzcons.Formation.PAIR()) {
                            break;
                        }
                        //判断压不压别人牌
                        //重点:有机会却不压,则没有， 没机会出则有
                        if (g.getValue() > this.getValue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                            //作为上家不压牌
                            && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                //作为下家不压牌
                                || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {
                            return false;
                        }
                        //需要过渡小牌
                        //此种情况, 因为庄家强行出2对以后很难受，所以不需要考虑
                        /** */
                        //或者出小对子却没收回来，1.可能牌很好，先出散牌，2.被闲家大对子截了,对A,对2
                        //获取闲家截下来的对子值,且大于2
                        if (this.OutCardTurn[i][0].seat == this.banker && _.last(this.OutCardTurn[i], 2).seat != this.banker) {
                            if (g.getValue() <= this.getValue(_.first(_.last(this.OutCardTurn[i], 2)).point) && g.getValue() >= ddzcons.CardPoint.ACE()) {
                                return true;
                            }
                        }
                        return true;
                    }
                }
            }
        });
        return SingleCard;
    }

    //判断有无对子
    //主要用于自己出对子时，判断对方是否有对子，若前期不出，破坏其牌型亦可
    guessPair(index) {
        if (this.handCount[index] <= 1) {
            return null;
        }
        //当前未出的牌
        let guessPairCardPoint = _.map(this.knowncard, function (num, key) {
            if (num <= 2 && key < 13) {
                return key;
            }
        });

        let guessPairCard = _.map(guessPairCardPoint, function (num) {
            if (!num) return null;
            return new Card(1, num, 0);
        });

        if (guessPairCard == null) {
            return null;
        }

        let PairCard = _.filter(guessPairCard, (g) => {
            if (!g) return false;
            //逃牌者,有机会出该牌却不出,没机会出时则判断无此牌
            if (index == this.escaper) {
                //每一轮出牌机会
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    let type = utils.getCardType(this.OutCardTurn[i][0].cards);
                    if (type >= ddzcons.Formation.PAIR() && type <= ddzcons.Formation.TRIPLE_2()) {

                        for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                            if (!this.OutCardTurn[i][j].cards) continue;

                            //判断压不压别人牌
                            //重点:有机会却不压,则没有， 没机会出则有
                            if (g.getValue() > this.getValue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                                //作为上家不压牌
                                && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                    //作为下家不压牌
                                    || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
            else if (index != this.banker) {//门板
                if (g.getValue() < ddzcons.CardPoint.TEN()) return false;
                let OutpairCnt = 0;
                //庄家出牌，看门板会不会挡即可，小对子不需要考虑
                //当非主动出牌
                let group = this.OutCardTypePlayers[index][ddzcons.Formation.PAIR()];
                for (let i = 0; i < group.length; i++) {
                    if (this.getValue(_.first(group[i].cards).point) >= ddzcons.CardPoint.KING()
                        && !group[i].IsActive) {
                        OutpairCnt++;
                        if (OutpairCnt >= 2) {
                            return true;
                        }
                    }
                }
                return false;
            }
            else if (index == this.banker) {
                //门板推断庄家,找庄家的空隙，让庄家难受
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    let type = utils.getCardType(this.OutCardTurn[i][0].cards);
                    // if (type >= ddzcons.Formation.PAIR() && type <= ddzcons.Formation.TRIPLE_2())
                    for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                        //判断牌型相当,此处format需修改
                        if (!this.OutCardTurn[i][j].cards) continue;
                        //判断压不压别人牌
                        //重点:有机会却不压,则没有， 没机会出则有
                        if (g.getValue() > this.getValue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                            //作为上家不压牌
                            && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                //作为下家不压牌
                                || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {
                            return false;
                        }
                        //需要过渡小牌
                        //此种情况, 因为庄家强行出2对以后很难受，所以不需要考虑
                        /** */
                        //或者出小对子却没收回来，1.可能牌很好，先出散牌，2.被闲家大对子截了,对A,对2
                        //获取闲家截下来的对子值,且大于2
                        if (this.OutCardTurn[i][0].seat == this.banker && _.last(this.OutCardTurn[i], 2).seat != this.banker) {
                            if (g.getValue() <= this.getValue(_.first(_.last(this.OutCardTurn[i], 2)).point) && g.getValue() >= ddzcons.CardPoint.ACE()) {
                                return true;
                            }
                        }
                        return true;
                    }
                }
            }
        });
        return PairCard;
    }

    guessTriple(index) {
        //手牌必须大于3张
        if (this.handCount[index] < 3) {
            return null;
        }
        //当前未出的牌
        let guessTripleCardPoint = _.map(this.knowncard, function (num, key) {
            if (num <= 1 && num < 14) {
                return key;
            }
        });

        let guessTripleCard = _.map(guessTripleCardPoint, function (num) {
            if (!num) return null;
            return new Card(1, num, 0);
        });

        if (guessTripleCard == null) {
            return null;
        }

        let TripleCard = _.filter(guessTripleCard, (g) => {
            if (!g) return false;
            //逃牌者,有机会出该牌却不出,没机会出时则判断无此牌
            if (index == this.escaper) {
                //每一轮出牌机会
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    let type = utils.getCardType(this.OutCardTurn[i][0].cards);
                    if (type < ddzcons.Formation.TRIPLE() &&
                        type > ddzcons.Formation.TRIPLE_2()) {
                        continue;
                    }
                    for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                        if (!this.OutCardTurn[i][j].cards) continue;
                        //判断压不压别人牌
                        //重点:有机会却不压,则没有， 没机会出则有
                        if (g.getValue() > this.getValue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                            //作为上家不压牌
                            && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                //作为下家不压牌
                                || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {
                            return false;
                        }
                    }

                }
                return true;

            }
            else if (index != this.banker) {//门板
                if (g.getValue() < ddzcons.CardPoint.TEN()) return false;
                let OutpairCnt = 0;
                //庄家出牌，看门板会不会挡即可，小对子不需要考虑
                //当非主动出牌
                let group = this.OutCardTypePlayers[index][ddzcons.Formation.PAIR()];
                for (let i = 0; i < group.length; i++) {
                    if (this.getValue(_.first(group[i].cards).point) >= ddzcons.CardPoint.KING()
                        && !group[i].IsActive) {
                        OutpairCnt++;
                        if (OutpairCnt >= 2) {
                            return true;
                        }
                    }
                }
                return false;
            }
            else if (index == this.banker) {
                //门板推断庄家,找庄家的空隙，让庄家难受
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    let type = utils.getCardType(this.OutCardTurn[i][0].cards);
                    //三张情况只考虑 3张和3带一情况，
                    //不考虑三带二，因为对子要考虑到 对子大小，三张和 顺子的情况，可变因素太多
                    if (type >= ddzcons.Formation.TRIPLE() && type <= ddzcons.Formation.TRIPLE_1()) {
                        for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                            if (!this.OutCardTurn[i][j].cards) continue;
                            //判断压不压别人牌
                            //重点:有机会却不压,则没有， 没机会出则有
                            if (g.getValue() > this.getValue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                                //作为上家不压牌
                                && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                    //作为下家不压牌
                                    || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {
                                return false;
                            }
                            //需要过渡3张，或者有炸弹不愿意拆
                            //此种情况, 因为庄家强行出3对以后很难受，所以不需要考虑
                            /** */
                            //或者出小对子却没收回来，1.可能牌很好，先出散牌，2.被闲家大对子截了,对A,对2
                            //获取闲家截下来的对子值,且大于2
                            if (this.OutCardTurn[i][0].seat == this.banker && _.last(this.OutCardTurn[i], 2).seat != this.banker) {
                                if (g.getValue() <= this.getValue(_.first(_.last(this.OutCardTurn[i], 2)).point) && g.getValue() >= ddzcons.CardPoint.ACE()) {
                                    return true;
                                }
                            }
                            return true;
                        }
                    }
                }
                return true;
            }
        });
        return TripleCard;
    }

    //推测有顺子
    guessSequence(index) {
        //手牌小于等于4张则不存在
        if (this.handCount[index] <= 4) {
            return null;
        }

        //判断他人有没有顺子1.自己出顺子会不会被压，2.别人下一把会不会出顺子
        //判断当前已出牌是否存在顺子，并且获得顺子组合
        let guessSequenceCards = _.map(this.knowncard, (num, key) => {
            let SeqCnt = 0;
            for (let i = key; i <= ddzcons.CardPoint.ACE(); i++) {
                if (this.knowncard[i] < 4) {
                    SeqCnt++;
                }
                else if (SeqCnt >= 5) {
                    return { num: key, SeqCnt: SeqCnt };
                }
            }
        });

        if (!guessSequenceCards) {
            return null;
        }

        let SequenceCard = _.filter(guessSequenceCards, (g) => {
            if (!g) return false;
            /*统一判断能否压别人，能压却不压则肯定没有*/
            /*其次根据出顺子的铺垫条件出牌*/
            if (index == this.escaper) {//逃牌者,有机会出该牌却不出,没机会出时则判断无此牌
                //1.有机会出却不出，则说明没有
                //每一轮出牌机会
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌，牌型为顺子，并且牌张数量小于等于该值
                    if (utils.getCardType(this.OutCardTurn[i][0].cards) == ddzcons.Formation.SEQUENCE()
                        && this.OutCardTurn[i][0].cards.length <= g.SeqCnt) {
                        for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                            if (!this.OutCardTurn[i][j].cards) continue;
                            //判断压不压别人牌
                            //重点:有机会却不压,则没有， 没机会出则有
                            if (g.num > this.getValue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                                //作为上家不压牌
                                && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                    //作为下家不压牌
                                    || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {

                                return false;
                            }
                        }
                        //主动出牌，有顺子的情况，
                        //一般是最后一把甩，小牌出收大牌接或者  直接大牌， (或者判断其他人接不上当作大牌甩)这种情况顺子已出手
                        //前提都是一样的，手中无单牌，或者单牌数量为1
                        //那么判断  当前单牌数量 以及  出的单牌在该顺子中的个数即可
                        let abandonCards = [];
                        for (let i = 1; i < ddzcons.CardPoint.ACE(); i++) {
                            abandonCards[i] = [];
                        }
                        let abandonValue = 0;
                        for (let i = ddzcons.Formation.ONE(); i < ddzcons.Formation.TRIPLE_1(); i++) {
                            if (!(i == ddzcons.Formation.ONE() || i == ddzcons.Formation.TRIPLE_1()
                                || (i == ddzcons.Formation.SEQUENCE_PLANE() && this.OutCardTypePlayers[index][i].length > 0 && this.OutCardTypePlayers[index][i][0].cards.length % 4 == 0))) {
                                continue;
                            }
                            for (let j = 0; j < this.OutCardTypePlayers[index][i].length; j++) {
                                if (!this.OutCardTypePlayers[index][i][j]) continue;
                                if (i == ddzcons.Formation.ONE()) {
                                    abandonValue = this.getValue(_.first(this.OutCardTypePlayers[index][i][j].cards).point);
                                    if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                        abandonCards[abandonValue]++;
                                    }
                                }
                                else if (i == ddzcons.Formation.PAIR()) {
                                    abandonValue = this.getValue(_.first(this.OutCardTypePlayers[index][i][j].cards).point);
                                    if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                        abandonCards[abandonValue] += 2;
                                    }
                                }
                                //扔三张的情况如果是拆炸弹 被动无奈，那么可能有顺子
                                //主动扔三张，如果没有大牌收回去那么，除了大顺子，一般情况也也打不出去了
                                //除非拆大炸弹，大顺子还是有的
                                else if (i == ddzcons.Formation.TRIPLE() || i == ddzcons.Formation.TRIPLE_1() || i == ddzcons.Formation.TRIPLE_2()) {
                                    abandonValue = this.getValue(_.last(this.OutCardTypePlayers[index][i][j].cards).point);
                                    if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt  //如果收回来了则不用计算，主动出牌，牌值在这范围内，并且该出牌为主动
                                        && this.OutCardTypePlayers[index][i][j].IsActive && abandonValue < ddzcons.CardPoint.KING()) //
                                    {
                                        //推测该玩家是否有大的三张，没有则说明收不回来，那么顺子出不去
                                        let cards = this.guessTriple(index);
                                        if (!cards) return false;
                                    }

                                    if (i == ddzcons.Formation.TRIPLE()) {
                                        continue;
                                    }

                                    abandonValue = this.getValue(_.last(this.OutCardTypePlayers[index][i][j].cards).point);
                                    if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                        if (i == ddzcons.Formation.TRIPLE_1()) {
                                            abandonCards[abandonValue]++;
                                        } else {
                                            abandonCards[abandonValue] += 2;
                                        }
                                    }
                                }
                                // 
                                else if (i == ddzcons.Formation.SEQUENCE_PLANE() && this.OutCardTypePlayers[index][i].length > 0 && this.OutCardTypePlayers[index][i][0].cards.length % 4 == 0) {
                                    for (let k = 1; k < this.OutCardTypePlayers[index][i][j].cards.length >> 2; k++) {
                                        let abandonValue = this.getValue(_.last(this.OutCardTypePlayers[index][i][j].cards, k).point);
                                        if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                            abandonCards[abandonValue]++;
                                        }
                                    }
                                }
                            }
                        }
                        //分析玩家出牌后的 顺子可能性
                        //如果丢弃的牌中连起来的比较多，或者有丢三张的情况，则没有该顺子

                        //出过的对应牌过多， 大于顺子长度的一半应该没有顺子
                        let singleCnt = 0;
                        for (let j = 0; j < ddzcons.CardPoint.ACE(); j++) {
                            if (abandonCards[j] != 0) {
                                singleCnt += 1;
                            }
                        }
                        if (singleCnt >= g.SeqCnt / 2) {
                            return false;
                        }
                    }
                }
                return true;
            }
            else if (index != this.banker) {//门板
                //1.有机会出却不出，则说明没有
                //每一轮出牌机会
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    if (utils.getCardType(this.OutCardTurn[i][0].cards) == ddzcons.Formation.SEQUENCE()
                        && this.OutCardTurn[i][0].cards.length <= g.SeqCnt) {
                        for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                            if (!this.OutCardTurn[i][j].cards) continue;
                            //判断压不压别人牌
                            //重点:有机会却不压,则没有， 没机会出则可能有
                            if (g.num > this.getvalue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                                //作为上家不压牌
                                && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                    //作为下家不压牌
                                    || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {

                                return false;
                            }
                        }
                    }
                }
                let abandonCards = [];
                for (let i = 1; i < ddzcons.CardPoint.ACE(); i++) {
                    abandonCards[i] = [];
                }
                //检查该玩家之前是否出过顺子里的单牌，或者值在顺子中居中的对子
                //56789，556789，5677789，5678889一般会将单牌或者对子先甩出，用大牌收回，然后一把甩出
                let abandonValue = null;
                for (let i = ddzcons.Formation.ONE(); i < ddzcons.Formation.TRIPLE_1(); i++) {
                    if (!(i == ddzcons.Formation.ONE() || i == ddzcons.Formation.TRIPLE_1()
                        || (i == ddzcons.Formation.SEQUENCE_PLANE() && this.OutCardTypePlayers[index][i].length > 0 && this.OutCardTypePlayers[index][i][0].cards.length % 4 == 0))) {
                        continue;
                    }
                    for (let j = 0; j < this.OutCardTypePlayers[index][i].length; j++) {
                        if (!this.OutCardTypePlayers[index][i][j]) continue;
                        if (i == ddzcons.Formation.ONE()) {
                            abandonValue = this.getvalue(this.OutCardTypePlayers[index][i][j].cards.point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                abandonCards[abandonValue]++;
                            }
                        }
                        else if (i == ddzcons.Formation.PAIR()) {
                            abandonValue = this.getvalue(_.first(this.OutCardTypePlayers[index][i][j].cards).point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                abandonCards[abandonValue]++;
                            }
                        }
                        else if (i == ddzcons.Formation.TRIPLE_1()) {
                            abandonValue = this.getvalue(_.last(this.OutCardTypePlayers[index][i][j].cards).point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                abandonCards[abandonValue]++;
                            }
                        }
                        else if (i == ddzcons.Formation.TRIPLE_2()) {
                            abandonValue = this.getvalue(_.last(this.OutCardTypePlayers[index][i][j].cards).point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                abandonCards[abandonValue]++;
                            }
                        }
                        else if (i == ddzcons.Formation.SEQUENCE_PLANE()) {
                            abandonValue = this.getvalue(_.last(this.OutCardTypePlayers[index][i][j].cards).point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                abandonCards[abandonValue]++;
                            }
                            abandonValue = this.getvalue(_.last(this.OutCardTypePlayers[index][i][j].cards, 1).point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                abandonCards[abandonValue]++;
                            }
                        }
                    }
                }
                //分析玩家出牌后的 顺子可能性
                //出过的对应牌过多， 大于顺子长度的一半应该没有顺子,
                let singleCnt = 0;
                for (let j = 0; j < ddzcons.CardPoint.ACE(); j++) {
                    singleCnt += abandonCards[j];
                }

                if (singleCnt > g.SeqCnt / 2) {
                    return false;
                }
                return true;
            }
            else if (index == this.banker) {
                //1.有机会出却不出，则说明没有
                //每一轮出牌机会
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    if (utils.getCardType(this.OutCardTurn[i][0].cards) == ddzcons.Formation.SEQUENCE()
                        && this.OutCardTurn[i][0].cards.length <= g.SeqCnt) {
                        for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                            if (!this.OutCardTurn[i][j].cards) continue;
                            //判断压不压别人牌
                            //重点:有机会却不压,则没有， 没机会出则有
                            if (g.num + g.SeqCnt > this.getValue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                                //作为上家不压牌
                                && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                    //作为下家不压牌
                                    || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {

                                return false;
                            }
                        }
                    }
                }
                let abandonCards = [];
                for (let i = 1; i < ddzcons.CardPoint.ACE(); i++) {
                    abandonCards[i] = [];
                }
                //检查该玩家之前是否出过顺子里的单牌，或者值在顺子中居中的对子
                //56789，556789，5677789，5678889一般会将单牌或者对子先甩出，用大牌收回，然后一把甩出
                let abandonValue = 0;
                for (let i = ddzcons.Formation.ONE(); i < ddzcons.Formation.TRIPLE_1(); i++) {
                    if (!(i == ddzcons.Formation.ONE() || i == ddzcons.Formation.TRIPLE_1()

                        || (i == ddzcons.Formation.SEQUENCE_PLANE() && this.OutCardTypePlayers[index][i].length > 0 && this.OutCardTypePlayers[index][i][0].cards.length % 4 == 0))) {
                        continue;
                    }
                    if (!this.OutCardTypePlayers[index][i]) continue;
                    for (let j = 0; j < this.OutCardTypePlayers[index][i].length; j++) {
                        if (!this.OutCardTypePlayers[index][i] || this.OutCardTypePlayers[index][i][j].length == 0) continue;
                        if (i == ddzcons.Formation.ONE()) {
                            abandonValue = this.getValue(this.OutCardTypePlayers[index][i][j].cards.point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                abandonCards[abandonValue]++;
                            }
                        }
                        else if (i == ddzcons.Formation.PAIR()) {
                            abandonValue = this.getValue(_.first(this.OutCardTypePlayers[index][i][j].cards).point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                abandonCards[abandonValue] += 2;
                            }
                        }
                        //扔三张的情况如果是拆炸弹 被动无奈，那么可能有顺子
                        //主动扔三张，如果没有大牌收回去那么，除了大顺子，一般情况也也打不出去了
                        //除非拆大炸弹，大顺子还是有的
                        else if (i == ddzcons.Formation.TRIPLE() || i == ddzcons.Formation.TRIPLE_1() || i == ddzcons.Formation.TRIPLE_2()) {
                            abandonValue = this.getValue(_.first(this.OutCardTypePlayers[index][i][j].cards).point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt  //如果收回来了则不用计算，主动出牌，牌值在这范围内，并且该出牌为主动
                                && this.OutCardTypePlayers[index][i][j].IsActive && abandonValue < ddzcons.CardPoint.KING()) //
                            {
                                //推测该玩家是否有大的三张，没有则说明收不回来，那么顺子出不去
                                let cards = this.guessTriple(index);
                                if (!cards) return false;
                            }

                            if (i == ddzcons.Formation.TRIPLE()) {
                                continue;
                            }

                            abandonValue = this.getValue(_.last(this.OutCardTypePlayers[index][i][j].cards).point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                if (i == ddzcons.Formation.TRIPLE_1()) {
                                    abandonCards[abandonValue]++;
                                } else {
                                    abandonCards[abandonValue] += 2;
                                }
                            }
                        }
                        // 
                        else if (i == ddzcons.Formation.SEQUENCE_PLANE()) {
                            let abandonValue = this.getValue(_.last(this.OutCardTypePlayers[index][i][j].cards, 1).point);
                            if (abandonValue >= g.num && abandonValue < g.num + g.SeqCnt) {
                                abandonCards[abandonValue]++;
                            }
                        }
                    }
                }
                //分析玩家出牌后的 顺子可能性
                //如果丢弃的牌中连起来的比较多，或者有丢三张的情况，则没有该顺子

                //出过的对应牌过多， 大于顺子长度的一半应该没有顺子
                let singleCnt = 0;
                for (let j = 0; j < ddzcons.CardPoint.ACE(); j++) {
                    if (abandonCards[j] != 0) {
                        singleCnt += 1;
                    }
                }
                if (singleCnt >= g.SeqCnt / 2) {
                    return false;
                }

                return true;
            }

        });

        return SequenceCard;
    }

    //推测是否有三张
    guessBomb(index) {
        if (this.handCount[index] <= 3) {
            return null;
        }

        //当前未出的牌
        let guessBombCardPoint = _.map(this.knowncard, function (num, key) {
            if (num == 0) {
                return key;
            }
        });
        if (guessBombCardPoint == null) {
            return null;
        }
        let guessBombCard = _.map(guessBombCardPoint, (num) => {
            return new Card(1, num, 0);
        });

        //推测存在的炸弹
        let bombCard = _.filter(guessBombCard, (g) => {
            //逃牌者,有机会出该牌却不出,没机会出时则判断无此牌
            if (index == this.escaper) {
                //每一轮出牌机会
                let hasBoomb = false;
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    let type = utils.getCardType(this.OutCardTurn[i][0].cards);
                    if (type >= ddzcons.Formation.ONE() &&
                        type <= ddzcons.Formation.TRIPLE_2()) {
                        for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                            if (!this.OutCardTurn[i][j].cards) continue;
                            //判断压不压别人牌
                            //炸弹值大于该值，并且 重点:有机会却不压,则必有， 没机会出则没有
                            if (g.getValue() > this.getValue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                                //作为上家不压牌
                                && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                    //作为下家不压牌
                                    || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {
                                hasBoomb = true;
                            }
                        }
                    }
                }
                if (hasBoomb) {
                    return true;
                }
                return false;;
            }
            else if (index != this.banker) {//门板
                if (this.handCount[this.banker] <= 4
                    || (this.handCount[this.banker] <= 5 && this.GetguessSingleCount() <= 0)
                    || (this.GetguessSingleCount() <= 0 && (hasKing(index) || hasBomb(index)))) {
                    return false;
                }
                return true;
            }
            else if (index == this.banker) {
                let hasBoomb = 0;
                for (let i = 0; i < this.turn; i++) {
                    //这一轮出的牌
                    let type = utils.getCardType(this.OutCardTurn[i][0].cards);
                    if (type >= ddzcons.Formation.ONE() &&
                        type <= ddzcons.Formation.TRIPLE_2()) {
                        for (let j = 0; j < this.OutCardTurn[i].length; j++) {
                            if (!this.OutCardTurn[i][j].cards) {
                                continue;
                            }
                            //判断压不压别人牌
                            //炸弹值大于该值，并且 重点:有机会却不压,则必有， 没机会出则没有
                            if (g.getValue() > this.getValue(_.first(this.OutCardTurn[i][j].cards).point) && this.OutCardTurn[i][j].seat != index
                                //作为上家不压牌
                                && ((this.next(this.OutCardTurn[i][j].seat) == index && j + 3 == this.OutCardTurn[i][j].length)
                                    //作为下家不压牌
                                    || (this.last(this.OutCardTurn[i][j].seat) == index && !this.OutCardTurn[i][j + 1]))) {
                                hasBoomb += 100;
                            }
                        }
                    }
                }
                //推测冲刺，出牌次数过少，主动出牌次数过少
                for (let i = 0; i < this.turn; i++) {
                    if (this.GetguessSingleCount(this.banker) <= 1) {
                        //出大牌型组合，3个A，或3个2,被压不炸
                        let length = this.OutCardTurn[i].length;
                        if (this.IsBiggest(this.OutCardTurn[i][0].cards)
                            && this.OutCardTurn[i][length - 1].seat != index) {
                            let Cnt = this.handCount[this.banker];
                            if (Cnt > 15) {
                                hasBoomb -= 5;
                            } else if (Cnt > 12) {
                                hasBoomb -= 10;
                            } else if (Cnt > 9) {
                                hasBoomb -= 20;
                            } else if (Cnt > 6) {
                                hasBoomb -= 30;
                            }
                            else if (Cnt > 4) {
                                hasBoomb -= 60;
                            }
                        }
                    }
                }
                //控牌权
                let activeCnt = 0;
                for (let i = 0; i < this.turn; i++) {
                    if (this.OutCardTurn[i][0].seat == this.banker) {
                        activeCnt++;
                    }
                }
                let activeRate = 10 * activeCnt / this.turn;
                switch (activeRate) {
                    case 0:
                        hasBoomb -= 50;
                        break;
                    case 1:
                        hasBoomb -= 40;
                        break;
                    case 2:
                        hasBoomb -= 30;
                        break;
                    case 3:
                        hasBoomb -= 20;
                        break;
                    case 4:
                        hasBoomb -= 10;
                        break;
                    case 5:
                        hasBoomb -= 5;
                        break;
                    default:
                        break;
                }

                if (hasBoomb >= 80 || this.turn <= 3) {
                    return true;
                }
                if (_.random(0, hasBoomb) > 40) {
                    return true;
                }
                return false;;
            }
        });
        return bombCard;
    }
    //获取连对
    hasPairSEQ(PairCards, aimIndex) {
        let has = false;
        let pPairLength = 0;
        let SeqPairCards = [];
        let outCards = [];
        for (let i = 0; i < PairCards.length; i++) {
            if (!PairCards[i] || i == PairCards.length - 1) {
                if (pPairLength >= 3) {
                    has = true;
                    pPairLength = 0;
                    SeqPairCards.push(outCards);
                    outCards = [];
                }
                continue;
            }
            pPairLength++;
            outCards.push(PairCards[i]);
            outCards.push(PairCards[i]);
            break;
        }

        return SeqPairCards;
    }
    //顺子中多余的牌
    SpSgbySEQ(cards, SEQCards) {
        let SurSGCards = [];
        for (let i = 0; i < SEQCards.length - 8; i++) {
            if (!SEQCards[i]) continue;
            let value = SEQCards[i].key;
            let nohave = true;
            for (let j = value; j < value + SEQCards[i].count; j++) {
                if (cards[j] == 2) {
                    for (let i = 0; i < SurSGCards.length; i++) {
                        if (SurSGCards[i].key == j) nohave = false;
                    }
                    nohave && SurSGCards.push({ key: j });
                }
            }
        }
        return SurSGCards;
    }

    //连对中多余的牌
    SpSGbyPairSEQ(cards, SEQPairCards) {
        let SurSGCards = [];
        for (let i = 0; i < SEQPairCards.length - 8; i++) {
            if (!SEQPairCards[i]) continue;
            let value = SEQPairCards[0].key;
            let nohave = true;
            for (let j = value; j <= SEQPairCards[SEQPairCards.length - 1].key; j++) {
                if (cards[j] == 3) {
                    for (let i = 0; i < SurSGCards.length; i++) {
                        if (SurSGCards[i].key == j) nohave = false;
                    }
                    nohave && SurSGCards.push({ key: j });
                }
            }
        }
        return SurSGCards;
    }
    //获取顺子里多余的对子
    SpPairbySEQ(cards, SEQCards) {
        let SurPairCards = [];
        for (let i = 0; i < SEQCards.length - 8; i++) {
            if (!SEQCards[i]) continue;
            let value = SEQCards[i].key;
            for (let j = value; j < value + SEQCards[i].count; j++) {
                if (cards[j] == 3) {
                    let nohave = true;
                    for (let i = 0; i < SurPairCards.length; i++) {
                        if (SurPairCards[i].key == j) nohave = false;
                    }
                    nohave && SurPairCards.push({ key: j });
                }
            }
        }
        return SurPairCards;
    }


    ObjectToCards(cardsObeject) {
        if (!cardsObeject || !cardsObeject.cards) {
            return null;
        }

        let cardsInfo = [];
        if (cardsObeject.length) {
            for (let i = 0; i < cardsObeject.length; i++) {
                cardsInfo.push(new Card(cardsObeject[i].suit, cardsObeject.point, 0));
            }
        }
        else if (cardsObeject.cards.length) {
            for (let i = 0; i < cardsObeject.cards.length; i++) {
                cardsInfo.push(new Card(cardsObeject.cards[i].suit, cardsObeject.cards[i].point, 0));
            }
        }
        return cardsInfo;
    }

    getValue(point) {
        if (point == cons.Poker.CardPoint.ACE()) {
            return cons.Poker.CardPoint.QUEEN();
        } else if (point == cons.Poker.CardPoint.TWO()) {
            return cons.Poker.CardPoint.KING();
        } else if (point >= cons.Poker.CardPoint.SUB_JOKER()) {
            return point;
        } else {
            return point - 2;
        }
    }

    IsBiggest(cards, banker = false) {
        if (!utils.getCardType(cards)) return false;
        let seatMgr = this.room.getComp('seat');
        let IsBiggest = true;
        if (banker) {
            if (this.index == this.banker) return false;
            _.each(seatMgr.getSeats(), (seat) => {
                if (seat.getIndex() != this.banker) return;

                //if (this.index != this.banker && seat.getIndex() == this.getIndexMB()) return;

                let cardsInfo = utils.searchOutCard(seat.getCards(), seat.getCards().length, cards, cards.length);
                if (cardsInfo.cbResultCard.length > 0) {
                    IsBiggest = false;
                }
            });
        }
        else {
            _.each(seatMgr.getSeats(), (seat) => {
                if (seat.getIndex() == this.index) return;

                //if (this.index != this.banker && seat.getIndex() == this.getIndexMB()) return;

                let cardsInfo = utils.searchOutCard(seat.getCards(), seat.getCards().length, cards, cards.length);
                if (cardsInfo.cbResultCard.length > 0) {
                    IsBiggest = false;
                }
            });
        }
        return IsBiggest;
    }

    AllIsBiggest(cards, PoinCards, banker = false) {
        let seatMgr = this.room.getComp('seat');

        if (seatMgr.getSeat(this.banker).isRobot() && this.banker != this.index) return null;

        let myCards = null;
        myCards = cards ? cards : utils.deepCopy(this.myHandinfo);
        if (PoinCards) {
            if (utils.contains(cards, PoinCards)) {
                myCards = utils.removeCardsbyPoint(myCards, PoinCards);
                if (this.IsBiggest(PoinCards, banker) && utils.getCardType(myCards)) {
                    return PoinCards;
                }
            }
            else {
                return null;
            }
        }
        let classifyCards = this.classify(this.handcards);
        let SgleCards = classifyCards.SingleCards;
        let PairCards = classifyCards.PairCards;
        let TripleCards = classifyCards.TripleCards;
        let SequenceCards = classifyCards.SequenceCard;
        let BombCards = classifyCards.BombCards;
        let outcards = [];
        let outcardsTemp = [];
        let biggestCards = [];
        let cardsInfo = null;
        if (SgleCards[SgleCards.length - 2] && SgleCards[SgleCards.length - 1]) {
            outcards = [];
            outcards.push(SgleCards[SgleCards.length - 2]);
            outcards.push(SgleCards[SgleCards.length - 1]);
            cardsInfo = this.countToInfo(outcards);
            if (this.IsBiggest(cardsInfo, banker)) {
                biggestCards.push(cardsInfo);
            }
        }
        for (let i = BombCards.length - 1; i >= 0; i--) {
            if (!BombCards[i]) continue;
            outcardsTemp = [];
            for (let index = 0; index < 4; index++) { outcardsTemp.push(BombCards[i]); }

            let cardsInfo = this.countToInfo(outcardsTemp);
            if (this.IsBiggest(cardsInfo, banker)) {
                biggestCards.push(cardsInfo);
            }
            //四带一对
            for (let j = 0; j < PairCards.length; j++) {
                if (!PairCards[j]) continue;
                outcards = outcardsTemp;
                outcards.push(PairCards[j]);
                outcards.push(PairCards[j]);
                let cardsInfo = this.countToInfo(outcards);
                if (this.IsBiggest(cardsInfo, banker)) {
                    biggestCards.push(cardsInfo);
                }
            }
            //四带两张单张
            outcards = outcardsTemp;
            let firstIndex = null;
            for (let j = 0; j < SgleCards.length; j++) {
                if (!SgleCards[j]) continue;
                if (!firstIndex) { firstIndex = j; }

                outcards.push(SgleCards[j]);
                if (outcards.length == 6) {
                    let cardsInfo = this.countToInfo(outcards);
                    outcards = outcardsTemp;
                    j = firstIndex + 1;
                    firstIndex = null;
                    if (this.IsBiggest(cardsInfo, banker)) {
                        biggestCards.push(cardsInfo);
                    }
                }
            }
            if (outcards.length == 5) {
                for (let j = 0; j < PairCards.length; j++) {
                    if (!PairCards[j]) continue;
                    let outcardsSGPA = outcards;
                    outcardsSGPA.push(PairCards[j]);
                    let cardsInfo = this.countToInfo(outcardsSGPA);
                    if (this.IsBiggest(cardsInfo, banker)) {
                        biggestCards.push(cardsInfo);
                    }
                }
            }

        }

        for (let i = SgleCards.length - 1; i >= 0; i--) {
            if (!SgleCards[i]) continue;
            outcards = [];
            outcards.push(SgleCards[i]);
            cardsInfo = this.countToInfo(outcards);
            if (this.IsBiggest(cardsInfo, banker)) {
                biggestCards.push(cardsInfo);
            }
        }
        //对子
        for (let i = PairCards.length - 1; i >= 0; i--) {
            if (!PairCards[i]) continue;
            outcards = [];
            outcards.push(PairCards[i]);
            outcards.push(PairCards[i]);
            cardsInfo = this.countToInfo(outcards);
            if (this.IsBiggest(cardsInfo, banker)) {
                biggestCards.push(cardsInfo);
            }
        }
        //连对
        let pairSeqcards = [];
        let pairCnt = 0;
        for (let i = PairCards.length - 1; i >= 0; i--) {
            if (!PairCards[i] && !TripleCards[i]) {
                // if (pairCnt >= 3) {
                //     cardsInfo = this.countToInfo(pairSeqcards);
                //     if (this.IsBiggest(cardsInfo, banker)) {
                //         biggestCards.push(cardsInfo);
                //     }
                // }
                pairSeqcards = [];
                continue;
            };
            if (PairCards[i]) {
                pairSeqcards.push(PairCards[i]);
                pairSeqcards.push(PairCards[i]);
                pairCnt++;
            }
            else if (TripleCards[i]) {
                pairSeqcards.push(TripleCards[i]);
                pairSeqcards.push(TripleCards[i]);
                pairCnt++;
            }

            if (pairCnt >= 3) {
                cardsInfo = this.countToInfo(pairSeqcards);
                if (this.IsBiggest(cardsInfo, banker)) {
                    biggestCards.push(cardsInfo);
                }
            }
        }
        //三连带对子
        let tripSeqcards = [];
        let tripCnt = 0;
        pairCnt = this.getLength(this.PairCards);
        outcardsTemp = [];
        for (let i = TripleCards.length - 1; i >= 0; i--) {
            if (!TripleCards[i] || pairCnt <= 0) {
                // if (tripCnt >= 2) {
                //     cardsInfo = this.countToInfo(tripSeqcards);
                //     if (this.IsBiggest(cardsInfo, banker)) {
                //         biggestCards.push(cardsInfo);
                //     }
                // }
                tripSeqcards = [];
                continue;
            }
            tripSeqcards.push(TripleCards[i]);
            tripSeqcards.push(TripleCards[i]);
            tripSeqcards.push(TripleCards[i]);

            for (let j = 0; j < PairCards.length; j++) {
                if (!PairCards[j]) continue;
                tripCnt++;
                pairCnt--;
                tripSeqcards.push(PairCards[j]);
                tripSeqcards.push(PairCards[j]);
                if (tripSeqcards.length < 4) continue;
                let cardsInfo = this.countToInfo(tripSeqcards);
                if (this.IsBiggest(cardsInfo, banker)) {
                    biggestCards.push(cardsInfo);
                }
            }
        }
        //三连带单张
        tripSeqcards = [];
        tripCnt = 0;
        let sglCnt = this.getLength(this.SingleCount);
        for (let i = TripleCards.length - 1; i >= 0; i--) {
            if (!TripleCards[i] || sglCnt <= 0) {
                // if (tripCnt >= 2) {
                //     cardsInfo = this.countToInfo(tripSeqcards);
                //     if (this.IsBiggest(cardsInfo, banker)) {
                //         biggestCards.push(cardsInfo);
                //     }
                // }
                tripSeqcards = [];
                continue;
            }

            tripSeqcards.push(TripleCards[i]);
            tripSeqcards.push(TripleCards[i]);
            tripSeqcards.push(TripleCards[i]);

            //三带一
            for (let j = 0; j < SgleCards.length; j++) {
                if (!SgleCards[j]) continue;
                tripCnt++;
                pairCnt--;
                tripSeqcards.push(SgleCards[j]);
                if (tripSeqcards.length <= 4) continue;
                cardsInfo = this.countToInfo(tripSeqcards);
                if (this.IsBiggest(cardsInfo, banker)) {
                    biggestCards.push(cardsInfo);
                }
            }
        }
        //3张
        for (let i = TripleCards.length - 1; i >= 0; i--) {
            if (!TripleCards[i]) continue;
            outcardsTemp = [];
            outcardsTemp.push(TripleCards[i]);
            outcardsTemp.push(TripleCards[i]);
            outcardsTemp.push(TripleCards[i]);
            cardsInfo = this.countToInfo(outcardsTemp);
            if (this.IsBiggest(cardsInfo, banker)) {
                biggestCards.push(cardsInfo);
            }
            //三带二
            for (let j = 0; j < PairCards.length; j++) {
                if (!PairCards[j]) continue;
                outcards = utils.deepCopy(outcardsTemp);
                outcards.push(PairCards[j]);
                outcards.push(PairCards[j]);
                cardsInfo = this.countToInfo(outcards);
                if (this.IsBiggest(cardsInfo, banker)) {
                    biggestCards.push(cardsInfo);
                }
            }
            //三带一
            for (let j = 0; j < SgleCards.length; j++) {
                if (!SgleCards[j]) continue;
                outcards = utils.deepCopy(outcardsTemp);
                outcards.push(SgleCards[j]);

                let cardsInfo = this.countToInfo(outcards);
                if (this.IsBiggest(cardsInfo, banker)) {
                    biggestCards.push(cardsInfo);
                }
            }

        }

        for (let i = 0; i < biggestCards.length; i++) {
            let myCardsTemp1 = utils.deepCopy(myCards);
            if (!utils.contains(myCardsTemp1, biggestCards[i])) continue;
            myCardsTemp1 = utils.removeCardsbyPoint(myCardsTemp1, biggestCards[i]);
            if (utils.getCardType(myCardsTemp1)) {
                return biggestCards[i];
            }

            for (let j = i + 1; j < biggestCards.length; j++) {
                let myCardsTemp2 = utils.deepCopy(myCardsTemp1);
                if (!utils.contains(myCardsTemp2, biggestCards[j])) continue;
                myCardsTemp2 = utils.removeCardsbyPoint(myCardsTemp2, biggestCards[j]);
                if (utils.getCardType(myCardsTemp2)) {
                    return biggestCards[j];
                }

                for (let k = j + 1; k < biggestCards.length; k++) {
                    let myCardsTemp3 = utils.deepCopy(myCardsTemp2);
                    if (!utils.contains(myCardsTemp3, biggestCards[k])) continue;
                    myCardsTemp3 = utils.removeCardsbyPoint(myCardsTemp3, biggestCards[k]);
                    if (utils.getCardType(myCardsTemp3)) {
                        return biggestCards[k];
                    }
                }
            }
        }
        return null;
    }


    PioneerCards(cards, lastCards) {
        let seatMgr = this.room.getComp('seat');
        if (seatMgr.getSeat(this.banker).isRobot() && this.banker != this.index) return false;
        if (this.IsBiggest(cards) && (this.AllIsBiggest(this.myHandinfo, cards) || (this.selfIsBK() && this.AllIsBiggest(this.myHandinfo, cards, true))) && utils.compareCard(lastCards, cards)) {
            return true;
        }
        return false;
    }

    InfoToCount(cards) {
        if (!cards || cards.length == 0) {
            return null;
        }

        let cardsInfo = [];
        for (let i = 1; i < 16; i++) {
            cardsInfo[i] = 0;
        }

        for (let i = 0; i < cards.length; i++) {
            cardsInfo[this.getValue(cards[i].point)]++;
        }

        return cardsInfo;
    }

    MinCardIndex(cards) {
        if (!cards || cards.length == 0) {
            return null;
        }
        let index = -1;
        for (let i = 0; i < cards.length; i++) {
            if (!cards[i]) continue;
            index = cards[i].key;
            break;
        }

        if (index == -1) {
            return null;
        }
        return index;
    }

    MinNoBreakIndex(cards, SeqCards, count = 1) {
        if (!cards || cards.length == 0) {
            return null;
        }
        let index = -1;
        for (let i = 0; i < cards.length; i++) {
            if (!cards[i] || this.breakSEQ(cards[i].key, SeqCards, count)) continue;
            index = cards[i].key;
            break;
        }

        if (index == -1) {
            return null;
        }
        return index;
    }

    MinPairNoBreakIndex(cards, SeqCards, PairSeqCards, count = 2) {
        if (!cards || cards.length == 0) {
            return null;
        }
        let index = -1;
        for (let i = 0; i < cards.length; i++) {
            if (!cards[i] || this.breakSEQ(cards[i].key, SeqCards, 2) || this.breakPairSeq(cards[i].key, PairSeqCards)) continue;
            index = cards[i].key;
            break;
        }

        if (index == -1) {
            return null;
        }
        return index;
    }

    MaxCardIndex(cards) {
        if (!cards || cards.length == 0) {
            return null;
        }
        let index = -1;
        for (let i = cards.length; i >= 0; i--) {
            if (!cards[i]) continue;
            index = cards[i].key;
            break;
        }

        if (index == -1) {
            return null;
        }
        return index;
    }

    MergArry(cards1, cards2) {
        let nohave = true;
        for (let i = 0; i < cards2.length; i++) {
            if (!cards2[i]) continue;
            for (let j = 0; j < cards1.length; j++) {
                if (!cards1[j]) continue;
                if (cards1[j].key == cards2[i].key) nohave = false;
            }
            nohave && cards1.push(cards2[i]);
        }
        return cards1;
    }

    breakSEQ(key, SeqCards, count = 1) {
        let seatMgr = this.room.getComp('seat');
        if (this.getLength(SeqCards) == 0) return false;
        if (this.index != this.banker && seatMgr.getSeat(this.banker).isRobot()) {
            return false;
        }
        for (let i = 0; i < SeqCards.length; i++) {
            if (!SeqCards[i]) { continue; }
            if (key == SeqCards[i].key + SeqCards[i].count - 1 && SeqCards[i].count >= 6) { /*logger.debug('2 ', 'key ', key, 'SeqCards', SeqCards[i]);*/ continue; }
            if (this.handcards[key] != 1 && key == SeqCards[i].key && SeqCards[i].count >= 6) { /*logger.debug('3 ', 'key ', key, 'SeqCards', SeqCards[i]);*/ continue; }
            if (this.handcards[key] == count && key >= SeqCards[i].key && key <= SeqCards[i].key + count) {
                //logger.debug('breakSeq ', 'key ', key, 'SeqCards', SeqCards[i], ',handcards ', this.handcards[key]);
                return true;
            }
        }
        return false;
    }

    breakPairSeq(key, SeqPairCards) {
        let seatMgr = this.room.getComp('seat');
        if (SeqPairCards.length == 0) return false;
        if (this.index != this.banker && seatMgr.getSeat(this.banker).isRobot()) {
            return false;
        }

        for (let i = 0; i < SeqPairCards.length; i++) {
            if (!SeqPairCards[i]) continue;
            if (key == SeqPairCards[i][0].key + SeqPairCards[i].length >> 1 - 1 && SeqPairCards[i].length >= 4) continue;
            if ((this.handcards[key] == 2 || this.handcards[key] == 3) && key >= SeqPairCards[i][0].key && key <= SeqPairCards[i][0].key + SeqPairCards[i].length >> 1 - 1) {
                return true;
            }
        }
        return false;
    }

    CopyArray(array) {
        let newArray = [];
        for (let i = 0; i < array.length; i++) {
            newArray[i] = array[i]
        }
        return newArray;
    }

    countOfBigCards(cards) {
        if (!cards || cards.length == 0) return 0;

        let count = 0;
        for (let i = ddzcons.CardPoint.TWO(); i <= ddzcons.CardPoint.MAIN_JOKER(); i++) {
            count += cards[i];
        }
        return count;
    }

    beEnemyAssist(key, count = 1) {
        if (key < 1 || key > 15) return false;
        let outcards = [];
        for (let i = 0; i < count; i++) {
            outcards.push({ key });
        }

        let seatMgr = this.room.getComp('seat');
        let assistCard = false;

        _.each(seatMgr.getSeats(), (seat) => {
            if (!this.IsEnemy(seat.getIndex())) return;
            if (utils.compareCard(this.countToInfo(outcards), seat.getCards())) {
                assistCard = true;
            }
        });

        return assistCard;
    }
}

module.exports = Level1;
