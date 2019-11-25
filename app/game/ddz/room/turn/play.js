const cons = require('../../../../common/constants');
const ddzcons = require('../../common/constants');
const Turn = require('../../../../room/turn');
const utils = require('../../../../utils');
const ddzutils = require('../../poker/utils');
const _ = require('underscore');
const Card = require('../../poker/card');


class PlayTurn extends Turn {

    static create(room, seat, to) {
        room.getComp('turn').schedule(new PlayTurn(room, seat, to));
    }

    constructor(room, seat, to) {
        super(room, ddzcons.Turn.PLAY(), seat.getAuto() ? ddzcons.TurnInterval.ROBOT() : ddzcons.TurnInterval.PLAY());

        this.seat = seat;
        this.to = to;
        this.logger = this.room.getComp('logger');
    }

    action(seat, action, next) {
        if (seat !== this.seat) {
            super.action(seat, action, next);
            return;
        }

        if (action.name !== ddzcons.RoomAction.PLAYER_ACTION()) {
            super.action(seat, action, next);
            return;
        }

        switch (action.type) {
            case ddzcons.PlayerAction.PLAY():
                this.onPlayerPlay(action.cards, action.formation, next);
                break;
            case ddzcons.PlayerAction.MING():
                this.onMingPai(seat, action, next);
                break;
            case ddzcons.PlayerAction.PASS():
                this.onPlayerPass(next);
                break;
            default:
                utils.nextError(next);
                return;
        }
    }

    onMingPai(seat, action, next) {
        seat.mingPai();
        utils.cbOK(next);
    }

    onPlayerPlay(cards, formation, next) {
        if (!utils.isArray(cards, 1)) {
            return utils.nextError(next);
        }

        if (!utils.isNumber(formation, ddzcons.Formation.ONE(), ddzcons.Formation.ROCKET())) {
            return utils.nextError(next);
        }

        let stateManager = this.room.getComp('state');

        if (!stateManager.canPlay(cards, formation)) {
            return utils.nextError(next);
        }

        if (!this.seat.canPlay(cards)) {
            return utils.nextError(next);
        }

        if (formation == ddzcons.Formation.BOMB() || formation == ddzcons.Formation.ROCKET()) {
            stateManager.setMultiple();
        }

        cards = ddzutils.deepCopy(cards);
        this.seat.play(cards, formation);
        if (!this.seat.isRobot()) {
            this.logger.debug('房间', this.room.getAttr('id'), '座位', this.seat.getIndex(), '玩家' + this.seat.getUser().getAttr('id'), '出牌', ddzutils.printCards(cards), '剩余手牌', ddzutils.printCards(this.seat.getCards()));
        } else {
            this.logger.debug('房间', this.room.getAttr('id'), '座位', this.seat.getIndex(), '机器人' + this.seat.getUser().getAttr('id'), '出牌', ddzutils.printCards(cards), '剩余手牌', ddzutils.printCards(this.seat.getCards()));
        }
        for (let i = 0; i < cards.length; i++) {
            cards[i] = new Card(cards[i].suit, cards[i].point, cards[i].index);
        }
        stateManager.setLastCards({ cards, formation, seat: this.seat.getIndex() });

        //任何人出牌，机器人记录该牌
        stateManager.RobotRecordcard(this.seat.getIndex(), cards);
        stateManager.clearPass();
        this.end(next);
    }

    onPlayerPass(next) {
        if (this.seat.canPass()) {
            this.seat.pass();
            this.end(next);
        }
    }

    end(next) {
        super.end(next);
        let stateManager = this.room.getComp('state');
        if (!stateManager.isPlaying()) {
            stateManager.checkSpring();
            stateManager.setWinner(this.seat.index);
            stateManager.changeState(ddzcons.RoomState.RESULT());
            let s = ''
            _.map(this.room.getComp('seat').getPlayingSeats(), (seat) => {
                stateManager.pushOutCards(seat.getCards());
                let isRobot = seat.isRobot() ? '机器人' : '真人';
                s += '座位', seat.getIndex() + isRobot + seat.getUser().getAttr('id') + ' ' + ddzutils.printCards(seat.getCards());
            })
            this.logger.debug('房间', this.room.getAttr('id'), '当前一局结束 ', '胜者', this.seat.getUser().getAttr('id'), '剩余手牌' + s);
            return;
        }

        stateManager.createTurn(ddzcons.Turn.PLAY(), this.seat.nextPlaying(), null);
    }

    timeout() {
        let stateManager = this.room.getComp('state');
        if (!stateManager.isPlaying()) {
            return;
        }
        if (!this.seat.getAuto() && this.seat.canPass()) {
            this.seat.pass();
            this.end();
            return;
        }

        this.seat.autoPlay();
        this.end();
    }

    getIndex() {
        return this.seat.getIndex();
    }

    toJson() {
        let json = super.toJson();
        json.seat = this.seat.getIndex();
        return json;
    }
}


module.exports = PlayTurn;