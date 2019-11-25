const Card = require('../poker/card');
const cons = require('../../../common/constants');
const ddzcons = require('../common/constants');
const Library = require('../poker/library');
const Super = require('../../../room/stateManager');
const WaitState = require('./state/wait');
const DealState = require('./state/deal');
const PlayState = require('./state/play');
const ResultState = require('./state/result');
const BankerState = require('./state/banker');
const PlayTurn = require('./turn/play');
const SpeakTurn = require('./turn/speak');
const GrabTurn = require('./turn/grab');
const MingTurn = require('./turn/ming');
const utils = require('../poker/utils');
const _ = require('underscore');
const utilsSys = require('../../../../app/utils/index');



/**
 * @api {json} room.state 房间状态数据结构
 * @apiGroup dz
 * @params {number} type 状态类型 - 等待开始(wait - 1) 发牌(deal - 2) 游戏(play - 3) 结算(result - 4)
 * @params {number} banker 庄家
  */

class StateManager extends Super {

    constructor(room) {
        super(room);
    }

    init() {
        super.init();

        this.passCnt = 0;
        this.turn = 0;
        this.state = null;
        this.library = new Library(this.room);
        this.lastCards = null;
        this.continuity = [0, 0, 0];
        this.outCards = [];
        // 注册日志
        this.logger = this.room.getComp('logger');
        this.playCnt = 0;
        this.reset();
        this.changeState(ddzcons.RoomState.WAIT());
    }

    reset() {
        super.reset();

        this.library.wash();

        this.banker = null;
        this.winner = null;
        this.lastCards = null;
        this.bottomCards = null;
        this.multiple = 1;
        this.spring = 0;            //0-都没有 1-春天 2-反春

        this.clearTurn();
    }

    createState(type) {
        if (type === ddzcons.RoomState.WAIT()) {            //空闲
            return new WaitState(this.room);
        } else if (type === ddzcons.RoomState.DEAL()) {     //发牌
            return new DealState(this.room);
        } else if (type === ddzcons.RoomState.BANKER()) {   //叫庄
            return new BankerState(this.room);
        } else if (type === ddzcons.RoomState.PLAY()) {     //打牌
            return new PlayState(this.room);
        } else if (type === ddzcons.RoomState.RESULT()) {   //结果
            return new ResultState(this.room);
        }
        return null;
    }

    createTurn(type, ...params) {
        switch (type) {
            case ddzcons.Turn.SPEAK():
                SpeakTurn.create(this.room, params[0], params[1]);
                break;
            case ddzcons.Turn.PLAY():
                PlayTurn.create(this.room, params[0]);
                break;
            case ddzcons.Turn.GRAB():
                GrabTurn.create(this.room, params[0], params[1]);
                break;
            case ddzcons.Turn.MING():
                MingTurn.create(this.room, params[0], params[1]);
                break;
            default:
                this.logger.error('当前回合类型不存在', type, params);
                break;
        }
    }

    action(seat, action, next) {
        if (action.name !== cons.RoomAction.PLAYER_ROBOT()) {
            super.action(seat, action, next);
            return;
        }

        switch (action.type) {
            case ddzcons.PlayerAction.ROBOT():
                this.onPlayerRobot(seat, action.robot, next);
                break;
            default:
                return;
        }
    }

    onPlayerRobot(seat, robot, next) {
        seat.setAuto(robot);
        if (!robot) {
            return utilsSys.nextError(next);
        };
        let turn = this.room.getComp('turn').getRunning();
        if (!turn || turn.isEnded()) {
            return utilsSys.nextError(next);
        }
        if (seat.getIndex() != turn.getIndex()) {
            return utilsSys.nextError(next);
        }
        seat.autoPlay();
        turn.end(next);
    }

    onRoundBegin() {
        super.onRoundBegin();
        if (this.playCnt >= 10) {
            this.room.playedUserID = [];
            this.playCnt = 0;
        }
        this.playCnt++;
        let seatMgr = this.room.getComp('seat');
        let s = ' ';
        _.each(seatMgr.getSeats(), (seat) => {
            if (!seat.isRobot()) {
                if (!_.find(this.room.playedUserID, (id) => id == seat.getUserId())) {
                    this.room.playedUserID.push(seat.getUserId());
                }
            }
            let isRobot = seat.isRobot() ? '机器人' : (seat.isTest() ? '测试' : '真人');
            s + `座位 ${seat.getIndex()} ${isRobot} ID ${seat.getUserId()} `;
        });

        this.logger.info('游戏开始', s);
        this.changeState(ddzcons.RoomState.DEAL());
    }

    onRoundEnd() {
        super.onRoundEnd();
        // let seatMgr = this.room.getComp('seat');
        this.logger.info('游戏结束');
        // this.room.getComp('seat').removeSittingUser();
        this.room.getComp('state').changeState(ddzcons.RoomState.WAIT());
        // this.room.clear();
    }

    /**
     * 是否可以出牌
     * @param {Array} cards 当前牌组
     * @param {int} formation 当前牌组类型
     */
    canPlay(cards, formation) {
        if (this.lastCards && formation < ddzcons.Formation.BOMB() && formation != this.lastCards.formation) {
            this.logger.warn('玩家出牌不符合上家牌型', this.lastCards.formation, formation);
            return false;
        }

        //校验是否大过对方的牌
        let lastCard = this.getLastCards();
        if (lastCard && lastCard.formation > 0) {
            if (!utils.compareCard(lastCard.cards, cards)) {
                this.logger.warn('玩家出牌类型不符合', lastCard.cards, cards, formation);
                return false;
            }
        }

        return true;
    }

    isBanker(index) {
        return index == this.banker ? true : false;
    }

    checkSpring() {
        let seatManager = this.room.getComp('seat')
        let seats = seatManager.getSeats();
        let bankerSeat = this.getBankerSeat();
        let banker = this.getBanker();

        let farmerSeats = [];
        for (let i = 0; i < 3; i++) {
            let seat = seats[i];
            if (i != banker) {
                farmerSeats.push(seat);
            }
        }

        let bankerSpring = (farmerSeats[0].getPlayTimes() + farmerSeats[1].getPlayTimes()) == 0 ? 1 : 0;
        let farmerSpring = (bankerSeat.getPlayTimes() == 1) ? 2 : 0;

        if (bankerSpring/* || farmerSpring*/) {
            this.spring = bankerSpring || farmerSpring;
            this.setMultiple();
        }
    }

    setMultiple() {
        this.multiple *= 2;
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), ddzcons.RoomAction.ROOM_MULTIPLE(), { multiple: this.multiple });
    }

    getMultiple() {
        return this.multiple;
    }

    getSpeakScore() {
        return this.getBankerSeat() ? this.getBankerSeat().getSpeaked() : 0;
    }

    /**
     * 获取春天
     * @param {ojbect} spring 0-没有 1-春天 2-反春
     */
    getSpring() {
        return this.spring;
    }

    setBanker(banker) {
        this.banker = banker;
        this.logger.info('玩家当庄', this.banker, this.getBankerSeat().getUserId());
    }

    hasBanker() {
        return this.banker != -1;
    }

    openBanker(hasOpen) {
        this.hasOpen = hasOpen;
    }

    hasOpenBanker() {
        return this.hasOpen;
    }

    getBanker() {
        return this.banker;
    }

    getBankerSeat() {
        return this.room.getComp('seat').getSeat(this.banker);
    }

    setWinner(winner) {
        this.winner = winner;
    }

    getWinner() {
        return this.winner;
    }

    getLibrary() {
        return this.library;
    }

    setLastCards(cards) {
        if (cards.formation == 0) {
            this.lastCards = null;
            return;
        }
        this.lastCards = cards;
        if (cards) {
            this.passCnt = 0;
        }
        cards && this.outCards.push(...cards.cards);
    }

    pushOutCards(cards) {
        cards && this.outCards.push(...cards);
    }

    hasOutCards() {
        return this.outCards.length > 0 ? true : false;
    }

    clearOutRecord() {
        this.outCards = [];
    }

    getLastCards() {
        return this.lastCards;
    }

    getTurn() {
        return this.turn;
    }

    clearTurn() {
        this.turn = 0;
        this.passCn = 0;
        this.continuity = [0, 0, 0,];
    }

    addTurn(index) {
        this.passCnt++;
        if (this.passCnt == 2) {
            this.lastCards = null;
            this.continuity[this.next(index)]++;
            this.turn++;
            this.passCnt = 0;
        }
    }

    getContinuity(index) {
        if (index < 0 || index >= this.room.getAttr('capacity')) {
            return false;
        }

        return this.continuity[index];
    }

    next(index) {
        if (index < 2) {
            return index + 1;
        }
        return 0;
    }

    clearPass() {
        this.passCnt = 0;
    }

    getGrabTimes() {
        let seatMgr = this.room.getComp('seat');
        let grabTimes = 0;
        _.each(seatMgr.getSeats(), (seat) => {
            if (seat.grabbed) {
                grabTimes++;
            }
        });
        return grabTimes;
    }

    /**
     * 看着不爽的代码
     * @author 麻将 
     */
    RobotRecordcard(index, cards) {
        let robots = this.room.getComp('robot').getRobots();
        _.each(robots, r => {
            r.RecordCard(index, cards, this.turn);
        });
    }

    setBottomCards(cards) {
        this.bottomCards = cards;
        this.botManage();
    }

    botManage() {
        this.bottomMulti = 1;
        this.bottomType = 0;

        if (utils.botisSuit(this.bottomCards)) {
            this.bottomMulti = 2;
            this.bottomType |= 1;
        }

        if (utils.botIsSequence(this.bottomCards)) {
            this.bottomMulti += 1;
            this.bottomType |= 2;
        }

        if (utils.botisBomb(this.bottomCards)) {
            this.bottomMulti = 3;
            this.bottomType |= 4;
        }

        if (utils.hasKing(this.bottomCards) == 2) {
            this.bottomMulti = 4;
            this.bottomType |= 8;
        }
    }

    getBotMulti() {
        return this.bottomMulti;
    }

    getBotType() {
        return this.bottomType;
    }

    getBottomCards() {
        return this.bottomCards;
    }

    isPlaying() {
        let playings = this.room.getComp('seat').getPlayingSeats();
        return playings.length == this.room.getAttr('capacity');
    }

    toJson() {
        let json = super.toJson();
        json.banker = this.banker;
        json.bottomCards = this.bottomCards;
        json.bottomMulti = this.bottomMulti;
        json.bottomType = this.bottomType;
        json.multiple = this.multiple;
        json.baseScore = this.getSpeakScore();
        json.lastCards = this.lastCards ? this.lastCards : null;
        return json;
    }
}


module.exports = StateManager;