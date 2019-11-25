const cons = require('../../../common/constants');
const ermjcons = require('../common/constants');
const mjcons = require('../majong/majongConstants');
const Super = require('../../../room/stateManager');
const utils = require('../../../utils');
const WaitState = require('./state/wait');
const DealState = require('./state/deal');
const FlowerState = require('./state/flower');
const PlayState = require('./state/play');
const SoundState = require('./state/sound');
const DrawState = require('./state/draw');
const ResultState = require('./state/result');
const KanState = require('./state/kan');
const _ = require('underscore');
const mj = require('../majong/library');
const card = require('../majong/card');
const Library = require('../majong/library');

/**
 * @api {json} room.state 房间状态数据结构
 * @type lkpy
 * @param {number} type 状态类型 - 空间时间(idle - 1) 下注时间(betting - 2) 开奖时间(opening - 3) 结算时间(result - 4)
 */

class StateManager extends Super {
    constructor(room) {
        super(room);

        this.logger = this.room.getComp('logger');
        this.room.on(cons.RoomEvent.SEAT_REMOVE_PLAYER(), this.onSeatRemovePlayer, this);
    }

    onSeatRemovePlayer() {
        this.room.getComp('state').initRound();

        if (this.room.getComp('seat').isEmpty()) {
            this.reset();
            this.changeState(ermjcons.RoomState.WAIT());
        }
    }

    init() {
        super.init();
        this.library = new Library();
        this.newRound = true;
        this.outCards = [];
        this.reset();
        this.initRound();
        this.changeState(ermjcons.RoomState.WAIT());
    }

    reset() {
        super.reset();
        this.outCards = [];
        this.library.init();
        this.library.wash();
        this.lastPlayed = undefined; // 最后出的牌
    }

    getLibrary() {
        return this.library;
    }

    getBanker() {
        return this.bankerIndex;
    }

    isBanker(index) {
        return this.bankerIndex == index;
    }

    addOutCards(cards) {
        this.outCards.push(cards);
    }

    hasOutCards() {
        return this.outCards.length > 0 ? true : false;
    }

    getWinner() {
        return this.winnerIndex;
    }

    getCurrentSeat() {
        return this.room.getComp('seat').getSeat(this.playerIndex);
    }

    action(seat, action, next) {
        if (action.name == cons.RoomAction.PLAYER_ROBOT()) {
            seat.changeAuto();
        }

        super.action(seat, action, next);
    }

    initRound() {
        this.newRound = true;
        this.room.getComp('round').index = 0;
    }

    onRoundBegin() {
        super.onRoundBegin();
        this.logger.debug('新的一局开始');

        if (this.newRound) {
            this.winnerIndex = -1; // 胜者
            this.bankerIndex = 0; // 庄家
            this.newRound = false;
        }

        this.playerIndex = this.bankerIndex; // 出牌者

        this.changeState(ermjcons.RoomState.DEAL());
    }

    onRoundResult(balance) {
        this.logger.debug('Init()----area:' + balance);
    }

    onRoundEnd() {
        super.onRoundEnd();
        this.ron = undefined;
        this.logger.debug('当前一局结束');
        // this.changeState(ddzcons.RoomState.WAIT());
    }

    createState(type) {
        if (type === ermjcons.RoomState.WAIT()) {            //空闲
            return new WaitState(this.room);
        } else if (type === ermjcons.RoomState.DEAL()) {     //发牌
            return new DealState(this.room);
        } else if (type === ermjcons.RoomState.FLOWER()) {   //叫庄
            return new FlowerState(this.room);
        } else if (type === ermjcons.RoomState.DRAW()) {   //叫庄
            return new DrawState(this.room);
        } else if (type === ermjcons.RoomState.SOUND()) {   //叫庄
            return new SoundState(this.room);
        } else if (type === ermjcons.RoomState.PLAY()) {     //打牌
            return new PlayState(this.room);
        } else if (type === ermjcons.RoomState.RESULT()) {   //结果
            return new ResultState(this.room);
        } else if (type === ermjcons.RoomState.KAN()) {   //抢杠
            return new KanState(this.room);
        }

        return null;
    }

    nextPlayer() {
        this.playerIndex++;
        if (this.playerIndex == mjcons.playerCount()) {
            this.playerIndex = 0;
        }
    }

    getOutCards() {
        return _.map(this.room.getComp('seat').getSeats(), (s) => s.outCards);
    }

    clear() {
        super.clear();
    }

    update(dt) {
        this.state && this.state.update(dt);
    }

    isAbort() {
        return this.library.getCount() == 0;
    }

    doRon(index, ron = undefined) {
        this.winnerIndex = index;
        this.ron = ron;

        this.room.getComp('channel').sendAction(ermjcons.RoomAction.RON(),
            {
                seat: index,
            });

        this.changeState(ermjcons.RoomState.RESULT());
    }

    toJson() {
        let json = super.toJson();
        if (json.ron != undefined) {
            json.ron = this.ron.toJson();
        }
        json.current = this.playerIndex;
        json.winner = this.winnerIndex;
        json.banker = this.bankerIndex;
        if (this.library != undefined) {
            json.mountain = _.min([this.library.getCount(), 45]);
            json.cntFromBack = this.library.cntFromBack;
        }

        if (this.lastPlayed != undefined) {
            json.lastPlayed = this.lastPlayed.toJson();
        }
        return json;
    }

    changeBanker() {
        if (this.winnerIndex != -1) {
            this.bankerIndex = this.winnerIndex;
        }

        this.playerIndex = this.bankerIndex;
    }

    isPlaying() {
        let playings = this.room.getComp('seat').getPlayingSeats();
        return playings.length == mjcons.playerCount();
    }
}

module.exports = StateManager;