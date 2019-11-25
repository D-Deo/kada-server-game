const cons = require('../../../../common/constants');
const ermjcons = require('../../common/constants');
const mjcons = require('../../majong/majongConstants')
const Super = require('../../../../room/timerState');
const mjutils = require('../../majong/utils');
const utils = require('../../../../utils');
const _ = require('underscore');
const fs = require('fs'); //文件模块

class DealState extends Super {
    constructor(room) {
        super(room, ermjcons.RoomState.DEAL(), ermjcons.RoomStateInterval.DEAL());
    }

    enter() {
        super.enter();

        let stateManager = this.room.getComp('state');
        let initCards = {};
        let json = JSON.parse(fs.readFileSync('./app/game/ermj/test/data.json'));
        if (json.current == -1) {
            initCards.cards = [];
        }
        else {
            try {
                initCards = JSON.parse(fs.readFileSync('./app/game/ermj/test/' + json.current + '.json'));
            }
            catch (e) {
                console.warn(e.message);
                initCards.cards = [];
            }
        }

        _.each(this.room.getComp('seat').getSittingSeats(), seat => {
            if (seat.index == stateManager.getBanker()) {
                if (initCards.cards.length >= 4) {
                    seat.deal(stateManager.getLibrary().pickCardsByCH(
                        ...initCards.cards[0]));
                }
            }
            else {
                if (initCards.cards.length >= 4) {
                    seat.deal(stateManager.getLibrary().pickCardsByCH(
                        ...initCards.cards[1]));
                }
            }

            seat.deal(stateManager.getLibrary().deal(mjcons.cardsPerPlayer() - seat.handCards.length));
        });

        if (initCards.cards.length >= 4) {
            stateManager.getLibrary().prepare(initCards.cards[2], initCards.cards[3]);
        }

        let seat = this.room.getComp('seat').getSeat(stateManager.getBanker());
        seat.drawFront();
        seat.lastAction = ermjcons.RoomAction.DRAW();

        _.each(this.room.getComp('seat').getSittingSeats(), seat => {
            seat.sortHandCards();
            this.logger.debug('发牌数据', mjutils.printCards(seat.handCards));
            seat.sendDeal();
        });
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(ermjcons.RoomState.FLOWER());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = DealState;