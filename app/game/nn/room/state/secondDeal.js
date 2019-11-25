const nncons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');
const utils = require('../../../../utils');
const Hand = require('../hand');

class SecondDealState extends Super {
    constructor(room) {
        super(room, nncons.RoomState.SECOND_DEAL(), nncons.RoomStateInterval.SECOND_DEAL());
    }

    enter() {
        super.enter();

        let jackpotMgr = this.room.getComp('jackpot');
        let jackpot = jackpotMgr.getJackpot();
        jackpot = -10000;

        let allowed = true;
        let index = 0;
        while (allowed) {
            _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
                // seat.getHand().addCards(this.room.getComp('state').getLibrary().draw(1));
                seat.getHand().secondDeal();
            });
            let seatManager = this.room.getComp('seat');
            let stateMgr = this.room.getComp('state');
            let banker = stateMgr.getBankerSeat();
            let bankerFormation = banker.getHand().format();
            let sumRobotScore = 0;
            let sumScore = 0;
            let scores = _.map(seatManager.getSeats(), (seat) => {
                if (seat === banker || !seat.isPlaying()) {
                    return null;
                }

                let bid = seat.getBid();
                //seat.getHand().format();
                let formation = seat.getHand().format();//seat.getHand().getFormation();

                let win = formation.isGreaterThan(bankerFormation);
                let roundScore = 0;
                if (win) {
                    roundScore = bid * formation.getTimes(this.room.getAttr("timesMode")) * this.room.getAttr('baseScore');
                    roundScore = _.min([roundScore, seat.getUser().getScore()]);
                } else {
                    roundScore = -bid * bankerFormation.getTimes(this.room.getAttr("timesMode")) * this.room.getAttr('baseScore');
                }
                if (seat.isRobot()) {
                    sumRobotScore += roundScore;
                }
                return roundScore;
            });
            let bankerScore = banker.getUser().getScore();
            let pays = utils.score.pay_Proportion(bankerScore, scores);
            for (let i = 0; i < pays.length; i++) {
                if (!pays[i]) continue;
                sumScore += pays[i];
            }
            if (!banker.isRobot()) {
                if (jackpot + sumRobotScore > jackpotMgr.getMinJackpot()) {
                    allowed = false;
                }
            }
            else {
                if (jackpot - (sumScore - sumRobotScore) > jackpotMgr.getMinJackpot()) {
                    allowed = false;
                }
            }

            if (allowed) {
                stateMgr.washLibrary();
                _.every(this.room.getComp('seat').getPlayingSeats(), (seat) => {
                    // seat.getHand().addCards(this.room.getComp('state').getLibrary().draw(1));
                    if (this.room.getAttr('standard')) {
                        seat.hand = new Hand(this.room, seat);
                        jackpot = 100000;
                    }
                    else {
                        seat.getHand().changeLast(index + seat.index);
                        jackpot = 100000;
                    }
                });
                index++;
            }
            else {
                _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
                    seat.getHand().clearFormation();
                    seat.getHand().sendLastCard();
                });
            }
        }
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(nncons.RoomState.PLAY());
    }
}


module.exports = SecondDealState;