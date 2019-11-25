const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const _ = require('underscore');
const utils = require('../../poker/utils');

/**
 * @api {push} room.action 手牌发牌
 * @apiGroup dz
 * @params {string} name PlayerDeal
 * @params {json} msg 每个玩家手牌数据, 未参与牌局的位置为null
 */
class DealState extends Super {
    constructor(room) {
        super(room, ddzcons.RoomState.DEAL(), ddzcons.RoomStateInterval.DEAL());
    }

    enter() {
        super.enter();

        let jackpotMgr = this.room.getComp('jackpot');
        let stateMgr = this.room.getComp('state');

        // let library = stateMgr.getLibrary();
        // let cards = await jackpotMgr.balance();

        let cards = null;
        // if (!this.room.getAttr('wash') && stateMgr.hasOutCards()) {
        //     cards = stateMgr.outCards;
        // }
        // else {
        cards = jackpotMgr.balance();
        //}

        let index = 0;
        _.each(this.room.getComp('seat').getSittingSeats(), seat => {
            seat.deal(cards.slice(index * 17, (index + 1) * 17));
            this.logger.info('发牌数据', utils.printCards(utils.sortCard(cards.slice(index * 17, (index + 1) * 17))));
            index++;
        });

        stateMgr.setBottomCards(cards.slice(index * 17, index * 17 + 3));
        stateMgr.clearOutRecord();
    }

    end() {
        super.end();
        this.room.getComp('state').changeState(ddzcons.RoomState.BANKER());
    }

    toJson() {
        let json = super.toJson();
        json.timer = this.timer.isRunning() ? this.timer.remain() : null;
        return json;
    }
}

module.exports = DealState;