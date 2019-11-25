const Card = require('../poker/card');
const cons = require('../../../common/constants');
const dzcons = require('../common/constants');
const Library = require('../poker/library');
const Super = require('../../../room/stateManager');
const WaitState = require('./state/wait');
const DealState = require('./state/deal');
const PlayState = require('./state/play');
const ResultState = require('./state/result');
const BidTurn = require('./turn/bid');
const DealTurn = require('./turn/deal');
const _ = require('underscore');


/**
 * @api {json} room.state 房间状态数据结构
 * @apiGroup dz
 * @params {number} type 状态类型 - 等待开始(wait - 1) 发牌大小盲下注(deal - 2) 游戏(play - 3) 结算(result - 4)
 * @params {number} banker 庄家
 * @params {number} sblind 小盲
 * @params {number} bblind 大盲
 * @params {[Card]} publicCards 公共牌
 */


/**
 * @api {push} room.action 公共牌发牌
 * @apiGroup dz
 * @params {string} name RoomStateDeal
 * @params {[Card]} msg 发牌数组
 */
class StateManager extends Super {
    createState(type) {
        if(type === dzcons.RoomState.WAIT()) {
            return new WaitState(this.room);
        } else if(type === dzcons.RoomState.DEAL()) {
            return new DealState(this.room);
        } else if(type === dzcons.RoomState.PLAY()) {
            return new PlayState(this.room);
        } else if(type === dzcons.RoomState.RESULT()) {
            return new ResultState(this.room);
        }
        return null;
    }

    createTurn(type, param1, param2) {
        if(type === dzcons.Turn.BID()) {
            BidTurn.create(this.room, param1, param2);
        } else if(type === dzcons.Turn.DEAL()) {
            DealTurn.create(this.room);
        }
    }

    getBanker() {
        return this.banker;
    }

    getBankerSeat() {
        return this.room.getComp('seat').getSeat(this.banker);
    }

    getSblind() {
        return this.sblind;
    }

    getSblindSeat() {
        return this.room.getComp('seat').getSeat(this.sblind);
    }

    getBblind() {
        return this.bblind;
    }

    getBblindSeat() {
        return this.room.getComp('seat').getSeat(this.bblind);
    }

    resetBanker() {
        let seat = this.getBankerSeat();
        let banker = seat.next(true);
        let sblind = banker.next(true);
        let bblind = sblind.next(true);

        this.banker = banker.getIndex();
        this.sblind = sblind.getIndex();
        this.bblind = bblind.getIndex();
    }

    getBid() {
        let seats = this.room.getComp('seat').getPlayingSeats();
        let bids = _.map(seats, s => s.getBidCount());
        return _.max(bids);
    }

    getRobotBid() {
        let seats = this.room.getComp('seat').getPlayingSeats();
        let bid = 0;
        _.each(seats, (s) => {
            if(s.isRobot()) {
                bid += s.getBidTotal();
            }
        });
        return bid;
    }
    
    getBidSeat() {
        let seats = this.room.getComp('seat').getPlayingSeats();
        let bid = _.max(seats, s => s.getBidCount());
        if(bid.getBidCount() === 0) {
            return null;
        }

        seats = _.filter(seats, s => s.getBidCount() === bid.getBidCount());
        return _.find(seats, s => s.getBidType() !== dzcons.Bid.FOLLOW());
    }

    getLibrary() {
        return this.library;
    }

    getPublicCards() {
        return this.publicCards;
    }

    isShowHand() {
        return this.showHand;
    }

    setShowhand() {
        if(this.showHand) {
            return;
        }

        let biddings = this.room.getComp('seat').getBiddingSeats();
        let playings = this.room.getComp('seat').getPlayingSeats();
        if(playings.length <= 1 && this.canDeal()) {
            return;
        }

        if(biddings.length > 1 && this.canDeal()) {
            return;
        }

        this.showHand = true;
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_SHOW_HAND(), _.map(playings, p => p.toJson_ShowHand()));
    }

    isBidding() {
        let bid = this.getBid();
        let biddings = this.room.getComp('seat').getBiddingSeats();
        return _.some(biddings, s => s.getBidCount() < bid);
    }

    isPlaying() {
        let playings = this.room.getComp('seat').getPlayingSeats();
        return playings.length > 1;
    }

    bidReset() {
        _.each(this.room.getComp('seat').getSeats(), s => s.bidReset());
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.PLAYER_RESET(), {});
    }

    canDeal() {
        return this.publicCards.length < dzcons.PUBLIC_CARD_SIZE();
    }

    deal() {
        let count = _.isEmpty(this.publicCards) ? 3 : 1;
        let cards = this.library.dealPublicCards(this.publicCards.length, count);
        this.publicCards = _.flatten([this.publicCards, cards]);
        this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROOM_STATE_DEAL(), Card.toJson(cards));
    }

    init() {
        super.init();

        this.banker = 0;
        this.sblind = null;
        this.bblind = null;
        this.library = new Library();
        this.publicCards = [];
        this.showHand = false;

        this.changeState(dzcons.RoomState.WAIT());
    }

    onRoundBegin() {
        super.onRoundBegin();
        this.resetBanker();
        this.changeState(dzcons.RoomState.DEAL());
    }

    onRoundResult() {
        this.showHand = true;
    }

    reset() {
        super.reset();

        this.library = new Library();
        this.publicCards = [];
        this.showHand = false;

        this.changeState(dzcons.RoomState.WAIT());
    }

    toJson() {
        let json = super.toJson();
        json.banker = this.banker;
        json.sblind = this.sblind;
        json.bblind = this.bblind;
        json.publicCards = Card.toJson(this.publicCards);
        json.showHand = this.showHand;
        return json;
    }
}


module.exports = StateManager;