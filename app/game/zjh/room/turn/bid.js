const cons = require('../../../../common/constants');
const zjhcons = require('../../common/constants');
const Turn = require('../../../../room/turn');
const utils = require('../../../../utils');
const _ = require('underscore');


class BidTurn extends Turn {
    static create(room, seat, to) {
        room.getComp('turn').schedule(new BidTurn(room, seat, to));
    }

    constructor(room, seat, to) {
        super(room, zjhcons.Turn.BID(), zjhcons.TurnInterval.BID());

        this.seat = seat;
        this.to = to;

        this.logger = this.room.getComp('logger');
        this.logger.info('玩家回合', this.seat.getIndex(), this.to.getIndex());
    }

    getIndex() {
        return this.seat.getIndex();
    }

    action(seat, action, next) {
        if (seat !== this.seat) {
            super.action(seat, action, next);
            return;
        }

        if (action.name !== cons.RoomAction.PLAYER_BID()) {
            super.action(seat, action, next);
            return;
        }

        switch (action.type) {
            // case zjhcons.Bid.LOOK():
            //     this.seat.look();
            //     break;
            case zjhcons.Bid.ADD():
                this.onBidAction_Add(action.count, next);
                break;

            case zjhcons.Bid.ALLIN():
                this.onBidAction_Allin(next);
                break;

            case zjhcons.Bid.FOLD():
                this.onBidAction_Fold(next);
                // let look = false;
                // if (!seat.isLooking() && seat.isRobot() && this.room.getComp('state').round > 1) {
                //     this.seat.look();
                //     look = true;
                // }
                // if (look) {
                //     _.delay(_.bind(this.onBidAction_Fold, this), _.random(2800, 3800), next);
                // }
                // else {
                //     this.onBidAction_Fold(next);
                // }
                break;

            case zjhcons.Bid.FOLLOW():
                this.onBidAction_Follow(next);
                // let see = false;
                // if (this.room.getComp('state').getBid() / this.room.getAttr('baseScore') == 10) {
                //     if (!this.seat.isLooking() && seat.isRobot()) {
                //         this.seat.look();
                //         see = true;
                //     }
                // }
                // if (see) {
                //     _.delay(_.bind(this.onBidAction_Follow, this), _.random(2800, 3800), next);
                // }
                // else {
                //     this.onBidAction_Follow(next);
                // }

                break;

            case zjhcons.Bid.COMPARE():
                this.onBidAction_Compare(action.index, next);
                break;
            // case zjhcons.Bid.ROBOTCOMPARE():
            //     this.onBidAction_Compare(action.count, next);
            //     break;
            default:
                utils.nextError(next);
                return;
        }

        return;
    }

    onBidAction_Add(count, next) {
        if (!utils.isNumber(count, 1)) {
            utils.nextError(next);
            return;
        }

        if (!this.seat.canBidAdd(count)) {
            utils.nextError(next);
            return;
        }

        this.logger.debug('玩家加注', this.seat.getIndex(), this.seat.getUserId(), count, this.room.getComp('state').getBid());
        this.seat.bid(zjhcons.Bid.ADD(), count);

        // let multip = count / this.room.getAttr('baseScore');
        // let seatManager = this.room.getComp('seat');
        // _.each(seatManager.getSeats(), (seat) => {
        //     if (seat.isEmpty() || !seat.isRobot()) return;
        //     if (_.random(multip, 10) > 8 || (multip == 10 && !seat.IsMaxWinCount())) {
        //         _.delay(_.bind(seat.look, seat), _.random(2000, 15000));
        //     }
        // });

        this.end(next);
    }

    onBidAction_Allin(next) {
        this.logger.debug('玩家孤注一掷', this.seat.getIndex(), this.seat.getUserId(), this.seat.getUser().getScore(), this.room.getComp('state').getBid());
        let ret = this.seat.bidAllin();
        if (ret <= 0) {
            this.end(next);
            return;
        }

        // 因为比牌的关系，停止当前行动时间，并延迟进入下一个行动
        this.clear();
        _.delay(() => {
            let seats = this.room.getComp('seat').getSittingSeats();
            _.each(seats, (seat) => {
                seat.lose && seat.bid(zjhcons.Bid.FOLD());
            });
            this.end(next);
        }, zjhcons.TurnInterval.COMPARE() * ret);
    }

    onBidAction_Fold(next) {
        this.logger.debug('玩家弃牌', this.seat.getIndex(), this.seat.getUserId());
        this.seat.bid(zjhcons.Bid.FOLD());
        this.end(next);
    }

    onBidAction_Follow(next) {
        if (!this.seat.canBidFollow()) {
            this.logger.warn('金币不足，不能跟注', this.seat.getIndex(), this.seat.getUserId(), this.seat.getUser().getScore(), this.seat.getBidCount_Follow());
            utils.nextError(next);
            return;
        }

        this.logger.debug('玩家跟注', this.seat.getIndex(), this.seat.getUserId(), this.seat.getBidCount_Follow(), this.room.getComp('state').getBid());
        this.seat.bidFollow();
        this.end(next);
    }

    onBidAction_Compare(index, next) {
        if (!utils.isNumber(index, 0)) {
            utils.nextError(next);
            return;
        }

        if (this.room.getComp('state').getRound() < 2) {
            this.logger.warn('第二回合才能比牌', this.seat.getIndex(), this.seat.getUserId(), index);
            utils.nextError(next);
            return;
        }

        if (!this.seat.canBidCompare()) {
            this.logger.warn('玩家金币不足，不能比牌', this.seat.getIndex(), this.seat.getUserId(), index);
            utils.nextError(next);
            return;
        }

        let ret = this.seat.bidCompare(index);
        if (ret == -1) {
            this.loser = null;
        } else if (ret == 0) {
            this.loser = this.room.getComp('seat').getSeat(index);
        } else {
            this.loser = this.seat;
        }

        this.end(next);
    }

    end(next) {
        super.end(next);

        if (this.loser) {
            this.room.getComp('state').createTurn(zjhcons.Turn.COMPARE(), this.seat, this.to, this.loser);
            return;
        }

        let stateManager = this.room.getComp('state');
        if (!stateManager.isPlaying()) {
            stateManager.bidReset();
            stateManager.changeState(zjhcons.RoomState.RESULT());
            return;
        }

        if (this.seat === this.to) {
            let ret = stateManager.nextRound();
            if (ret >= 0) {
                if (ret > 0) {
                    this.room.getComp('state').createTurn(zjhcons.Turn.COMPARE(), this.seat, this.to, this.loser, ret);
                    return;
                }

                stateManager.changeState(zjhcons.RoomState.RESULT());
                return;
            }

            this.room.emit(cons.RoomEvent.ROOM_ACTION(), cons.RoomAction.ROUND_CHANGE(), stateManager.getRound());
            stateManager.createTurn(zjhcons.Turn.BID(), this.seat.nextBidding(), this.seat.isPlaying() ? this.seat : this.seat.prevBidding());
            return;
        }

        stateManager.createTurn(zjhcons.Turn.BID(), this.seat.nextBidding(), this.to);
    }

    timeout() {
        this.seat.bid(zjhcons.Bid.FOLD());
        this.end();
    }

    toJson() {
        let json = super.toJson();
        json.seat = this.seat.getIndex();
        return json;
    }

}


module.exports = BidTurn;