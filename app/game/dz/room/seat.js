const Card = require('../poker/card');
const cons = require('../../../common/constants');
const dzcons = require('../common/constants');
const Formatter = require('../poker/formatter');
const Super = require('../../../room/seat');
const _ = require('underscore');


/**
 * @api {json} room.seats.seat seat数据结构
 * @apiGroup dz
 * @params {json} user 玩家
 * @params {number} bidType 下注类型
 * @params {number} bidCount 当前轮下注金额
 * @params {number} bidTotal 整局游戏下注总额
 * @params {[Card]} hand 手牌数组 - null表示未参与牌局
 */


/**
 * @api {push} room.action 公共牌发牌
 * @apiGroup dz
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

    get weight() {
        return this._weight;
    }

    set weight(v) {
        this._weight = v;
    }

    clear() {
        super.clear();

        if (this.bidType === dzcons.Bid.FOLD()) {
            this.bidType = dzcons.Bid.LEAVE();
            return;
        }

        this.reset();
    }

    canBidAdd(count) {
        if (count <= this.getBidCount_Follow()) {
            return false;
        }

        return this.user.getScore() > count;
    }

    canBidFollow() {
        let count = this.getBidCount_Follow();
        if (count <= 0) {
            return false;
        }

        return this.user.getScore() > count;
    }

    canBidPass() {
        return this.getBidCount_Follow() === 0;
    }

    bid(type, count = 0) {
        (count > 0) && this.user.changeScore(-count);
        this.bidType = type;
        this.bidCount += count;
        this.bidTotal += count;
        this.sendChannelAction(cons.RoomAction.PLAYER_BID(), { type, count });
    }

    bidAllin() {
        this.bid(dzcons.Bid.ALLIN(), this.user.getScore());
    }

    bidFollow() {
        this.bid(dzcons.Bid.FOLLOW(), this.getBidCount_Follow());
    }

    bidReset() {
        this.bidType = this.isBidding() ? null : this.bidType;
        this.bidCount = 0;
    }

    deal(cards) {
        this.hand = cards;
    }

    getBidType() {
        return this.bidType;
    }

    getBidCount() {
        return this.bidCount;
    }

    getBidCount_Follow() {
        return this.room.getComp('state').getBid() - this.bidCount;
    }

    getBidCount_AddMin() {
        if (this.room.getComp('state').getBid() === 0 && this.bidCount === 0) {
            return this.room.getAttr('baseScore');
        }

        return this.room.getComp('state').getBid() * 2 - this.bidCount;
    }

    getBidTotal() {
        return this.bidTotal;
    }

    getHand() {
        return this.hand;
    }

    hasHand() {
        return this.hand && this.hand.length > 0;
    }

    isBidding() {
        if (!this.isPlaying()) {
            return false;
        }

        return this.bidType !== dzcons.Bid.ALLIN();
    }

    isAddBidding() {
        if (this.bidType === dzcons.Bid.ADD()) {
            return true;
        }

        if (this.bidType !== dzcons.Bid.ALLIN()) {
            return false;
        }

        let seats = this.room.getComp('seat').getPlayingSeats();
        seats = _.filter(seats, s => s.getBidCount() >= this.bidCount);
        return seats.length <= 1;
    }

    nextBidding() {
        return _.find(this.nexts(), s => s.isBidding());
    }

    prevBidding() {
        return _.find(this.prevs(), s => s.isBidding());
    }

    isPlaying() {
        if (!this.room.isPlaying()) {
            return false;
        }

        if (!this.isReady()) {
            return false;
        }

        if (!this.hand) {
            return false;
        }

        return (this.bidType !== dzcons.Bid.FOLD()) && (this.bidType !== dzcons.Bid.LEAVE());
    }

    setShowHand(index, show) {
        if (!this.isPlaying() && this.bidType !== dzcons.Bid.FOLD()) {
            return false;
        }

        if (index >= this.hand.length) {
            return false;
        }

        let card = this.hand[index];
        card.setExtra(cons.Poker.CardExtra.SHOW(), !!show);
        card = show ? card : Card.fack();
        this.sendChannelAction(cons.RoomAction.PLAYER_SHOW_HAND(), { index, card: card.toJson() });
        return true;
    }

    onRoundBegin() {
        super.onRoundBegin();
        this.hand = [];
    }

    reset() {
        super.reset();

        this.bidType = null;
        this.bidCount = 0;
        this.bidTotal = 0;
        this.hand = null;
    }

    toJson(seat) {
        let json = super.toJson();
        json.bidType = this.bidType;
        json.bidCount = this.bidCount;
        json.bidTotal = this.bidTotal;
        json.hand = this.toJson_Hand(seat);
        return json;
    }

    toJson_Hand(seat = null) {
        if (!this.hand) {
            return null;
        }

        let show = (this.room.getComp('state').isShowHand() && this.isPlaying()) || (seat === this);
        return _.map(this.hand, c => {
            let card = (show || c.haveExtra(cons.Poker.CardExtra.SHOW())) ? c : Card.fack();
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
        ret.formation = Formatter.format(_.flatten([this.hand, this.room.getComp('state').getPublicCards()]));
        ret.hand = Card.toJson(this.hand);
        ret.score = 0;
        ret.playing = this.isPlaying();
        return ret;
    }

    toJson_ShowHand() {
        let json = {};
        json.index = this.index;
        json.hand = this.toJson_Hand();
        return json;
    }
}


module.exports = Seat;