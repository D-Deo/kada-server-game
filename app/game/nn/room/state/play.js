const cons = require('../../../../common/constants');
const nncons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');


class PlayState extends Super {
    constructor(room) {
        super(room, nncons.RoomState.PLAY(), room.getAttr('canPlay') ? nncons.RoomStateInterval.PLAY_FOR_PLAY() : nncons.RoomStateInterval.PLAY());
    }

    action(seat, action, next) {
        if (action.name !== cons.RoomAction.PLAYER_PLAY()) {
            utils.nextOK(next);
            return;
        }

        if (!seat.isPlaying() ||
            seat.isPlayed()) {
            utils.nextError(next);
            return;
        }

        seat.setPlayed(true);
        utils.nextOK(next);
        this.room.getComp('seat').isPlayed() && this.end();
    }

    enter() {
        super.enter();

        _.each(this.room.getComp('seat').getSittingSeats(), (seat) => {
            if (!seat.isHosting()) {
                return;
            }

            seat.setPlayed(true, true);
        });

        this.room.getComp('seat').isPlayed() && this.end();
    }

    end() {
        super.end();

        _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
            !seat.isPlayed() && seat.setPlayed(true, true);
        });

        let formations = _.map(this.room.getComp('seat').getSeats(), (s) => {
            return s.isPlaying() ? s.getHand().format() : null;
        });
        this.room.getComp('channel').sendAction(cons.RoomAction.PLAYER_SHOW_HAND(), _.map(formations, (f) => f === null ? null : f.toJson()));

        setTimeout(() => {
            this.room.getComp('state').changeState(nncons.RoomState.RESULT());
        }, (_.size(this.room.getComp('seat').getPlayingSeats()) * 0.4 + 0.2) * 1000);
    }

}


module.exports = PlayState;