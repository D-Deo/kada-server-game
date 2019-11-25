const Card = require('../poker/card');
const cons = require('../../../common/constants');
const zjhcons = require('../common/constants');
const Formatter = require('../poker/formatter');
const Formation = require('../poker/formation');
const Super = require('../../../room/seat');
const _ = require('underscore');
const utils = require('../poker/utils');


/**
 * @api {json} room.seats.seat seat数据结构
 * @apiGroup zjh
 * @params {json} user 玩家
 * @params {number} bidType 下注类型
 * @params {number} bidCount 当前轮下注金额
 * @params {number} bidTotal 整局游戏下注总额
 * @params {[Card]} hand 手牌数组 - null表示未参与牌局
 */


/**
 * @api {push} room.action 公共牌发牌
 * @apiGroup zjh
 * @params {string} name PlayerBid
 * @params {json} msg
 * @apiSuccessExample msg数据结构
 * {
 *  seat: 1, 下注玩家位置索引
 *  type: 9, 下注类型,
 *  count: 10, 下注金额
 * }
 */
class Seat extends Super {
    constructor(room, index) {
        super(room, index);
        this.logger = this.room.getComp('logger');
    }

    /**
     * 是否已经比牌输
     * @author Deo
     */
    get lose() {
        return this._lose;
    }

    set lose(v) {
        this._lose = v;
    }

    clear() {
        super.clear();

        if (this.bidType === zjhcons.Bid.FOLD()) {
            this.bidType = zjhcons.Bid.LEAVE();
            return;
        }

        this.reset();
    }

    /**
     * 是否可以加注
     * @param {number} count 
     * @return {boolean}
     */
    canBidAdd(count) {
        if (count <= this.bidCount) {
            this.logger.warn('加注金额不能低于当前投注额', count, this.bidCount);
            return false;
        }
        return this.user.getScore() > count;
    }

    /**
     * 是否可以跟注
     * @return {boolean}
     */
    canBidFollow() {
        let count = this.getBidCount_Follow();
        if (count <= 0) {
            return false;
        }

        return this.user.getScore() > count;
    }

    /**
     * 是否可以比牌
     * @return {boolean}
     */
    canBidCompare() {
        let count = this.getBidCount_Follow() * 2;
        if (count <= 0) {
            return false;
        }

        return this.user.getScore() > count;
    }

    /**
     * 是否可以看牌
     */
    canLook() {
        return !this.isLooked() && this.room.getComp('state').getRound() >= 2;
    }

    // canBidPass() {
    //     return this.getBidCount_Follow() === 0;
    // }

    bid(type, count = 0) {
        this.logger.info('玩家下注', this.getIndex(), this.getUserId(), type, count);

        (count > 0) && this.user.changeScore(-count);
        this.bidType = type;
        this.bidCount = count;
        this.bidTotal += count;

        (count > 0) && this.room.getComp('state').setBid(count, type, this.isLooking());

        this.sendChannelAction(cons.RoomAction.PLAYER_BID(), { type, count });
    }

    /**
     * 孤注一掷
     * @author Deo
     * @return {number} 比牌次数
     */
    bidAllin() {
        this.bid(zjhcons.Bid.ALLIN(), this.user.getScore());
        return this.room.getComp('state').compare(this.getIndex());
    }

    /**
     * 跟注
     */
    bidFollow() {
        this.bid(zjhcons.Bid.FOLLOW(), this.getBidCount_Follow());
    }

    addwincount() {
        this.wincount++;
    }

    IsMaxWinCount() {
        let bMax = true;
        let seats = this.room.getComp('seat').getPlayingSeats();
        for (let seat of seats) {
            if (seat.getIndex() == this.getIndex()) continue;

            if (this.getwincount() <= seat.getwincount()) {
                bMax = false;
            }
        }
        return bMax;
    }

    getwincount() {
        return this.wincount;
    }

    /**
     * 比牌
     */
    bidCompare(index, cb) {
        let seat = this.room.getComp('seat').getSeat(index);
        if (!seat.isPlaying()) {
            return -1;
        }

        let formations = [Formatter.format(this.getHand()), Formatter.format(seat.getHand())];
        let winIndex = Formation.max(formations);

        let result = {
            win: winIndex == 0 ? this.getIndex() : index,
            lose: winIndex == 0 ? index : this.getIndex()
        };

        if (result.win == this.getIndex()) {
            this.addwincount();
        }
        else {
            seat.addwincount();
        }

        this.bid(zjhcons.Bid.COMPARE(), this.getBidCount_Follow() * 2);
        this.sendChannelAction(cons.RoomAction.PLAYER_COMPARE(), result);

        this.addCompare(seat.getIndex());
        seat.addCompare(this.getIndex());

        this.logger.info('玩家比牌', this.getIndex(), this.getUserId(), result);
        return winIndex;
    }

    bidReset() {
        this.bidType = this.isBidding() ? null : this.bidType;
        this.bidCount = 0;
    }

    /**
     * 看牌
     */
    look() {
        if (this.looked) return;

        if (this.user == null || this.bidType == zjhcons.Bid.FOLD() || !this.hand) {
            return;
        }

        if (this.room.getComp('state').getRound() < 2) {
            this.logger.warn('第二回合才能看牌', this.getIndex(), this.getUserId());
            return;
        }

        this.looked = true;
        this.sendAction(cons.RoomAction.PLAYER_SHOW_HAND(), { formation: Formatter.format(this.hand), cards: Card.toJson(this.hand) });
        this.sendChannelAction(cons.RoomAction.PLAYER_LOOK());

        return true;
    }

    deal(cards) {
        this.wincount = 0;
        this.hand = cards;
    }

    getBidType() {
        return this.bidType;
    }

    getBidCount() {
        return this.bidCount;
    }

    getBidCount_Follow() {
        return this.room.getComp('state').getBid() * (this.isLooking() ? 2 : 1);
    }

    getBidTotal() {
        return this.bidTotal;
    }

    getHand() {
        return this.hand;
    }

    isHighValue() {
        let card = _.first(_.sortBy(this.hand, card => utils.toValue(card.point)));
        return utils.toValue(card) > 11;
    }
    isLooked() {
        return this.looked;
    }

    isBidding() {
        if (!this.isPlaying()) {
            return false;
        }

        return true;
        // return this.bidType !== zjhcons.Bid.ALLIN();
    }

    isLooking() {
        return this.looked;
    }

    setCrtLook() {
        this.crtLook = true;
    }

    isAddBidding() {
        if (this.bidType === zjhcons.Bid.ADD()) {
            return true;
        }

        if (this.bidType !== zjhcons.Bid.ALLIN()) {
            return false;
        }

        let seats = this.room.getComp('seat').getPlayingSeats();
        seats = _.filter(seats, s => s.getBidTotal() >= this.bidTotal);
        return seats.length <= 1;
    }

    nextBidding() {
        if (this.crtLook) {
            this.crtLook = false;
            return this;
        }
        return _.find(this.nexts(), s => s.isBidding());
    }

    prevBidding() {
        return _.find(this.prevs(), s => s.isBidding());
    }

    isPlaying() {
        if (!this.room.isPlaying()) {
            return false;
        }

        if (!this.hand) {
            return false;
        }

        if (!this.isReady()) {
            return false;
        }

        return !this.lose && (this.bidType !== zjhcons.Bid.FOLD()) && (this.bidType !== zjhcons.Bid.LEAVE());
    }

    showhand() {
        _.each(this.hand, (card) => {
            card.setExtra(cons.Poker.CardExtra.SHOW(), true);
        });

        this.sendChannelAction(cons.RoomAction.ROOM_STATE_SHOW_HAND(), { seats: [this.toJson_ShowHand()] });
        return true;
    }

    // setShowHand(index, show) {
    //     // if (!this.isPlaying() && this.bidType !== zjhcons.Bid.FOLD()) {
    //     //     return false;
    //     // }

    //     // if (index >= this.hand.length) {
    //     //     return false;
    //     // }

    //     _.each(this.hand, (card) => {
    //         card.setExtra(cons.Poker.CardExtra.SHOW(), true);
    //     });

    //     // let card = this.hand[index];
    //     // card.setExtra(cons.Poker.CardExtra.SHOW(), !!show);
    //     // card = show ? card : Card.fack();
    //     // this.sendChannelAction(cons.RoomAction.PLAYER_SHOW_HAND(), { index, card: card.toJson() });
    //     return true;
    // }

    addCompare(index) {
        this.compares.push(index);
    }

    getCompares() {
        return this.compares;
    }

    onRoundBegin() {
        super.onRoundBegin();
        this.hand = [];
    }

    reset() {
        super.reset();

        this.crtLook = false;
        this.lose = false;
        this.looked = false;
        this.bidType = null;
        this.bidCount = 0;
        this.bidTotal = 0;
        this.hand = null;
        this.compares = [];
    }

    toJson(seat) {
        let json = super.toJson();
        json.bidType = this.bidType;
        json.bidCount = this.bidCount;
        json.bidTotal = this.bidTotal;
        json.look = this.looked;
        json.hand = this.toJson_Hand(seat);
        return json;
    }

    toJson_Hand(seat = null) {
        if (!this.hand) {
            return null;
        }

        return _.map(this.hand, c => {
            let card = this.isLooking() ? c : Card.fack();
            return card.toJson();
        });
    }

    toJson_Jackpot() {
        return {
            type: this.bidType,
            count: this.bidTotal
        }
    }

    toJson_Result() {
        let ret = {};
        ret.index = this.index;
        ret.bid = this.bidTotal;
        ret.formation = Formatter.format(this.hand).toJson();
        ret.score = 0;
        return ret;
    }

    toJson_ShowHand() {
        let json = {};
        json.index = this.index;
        json.formation = Formatter.format(this.hand);
        json.hand = Card.toJson(this.hand);
        return json;
    }
}


module.exports = Seat;