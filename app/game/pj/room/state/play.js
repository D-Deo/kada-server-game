const cons = require('../../../../common/constants');
const p9cons = require('../../common/constants');
const Super = require('../../../../room/timerState');
const utils = require('../../../../utils');
const _ = require('underscore');


class PlayState extends Super {
    constructor(room) {
        super(
            room,
            p9cons.RoomState.PLAY(),
            p9cons.RoomStateInterval.PLAY()
        );
    }

    action(seat, action, next) {
        if (action.name !== cons.RoomAction.PLAYER_PLAY()) {
            utils.nextOK(next);
            return;
        }

        if (!seat.isPlaying() ||
            seat.isPlayed() ||
            action.cards == undefined) {
            utils.nextError(next);
            return;
        }

        this.logger.debug('play ', action.cards);

        seat.setPlayed(action.cards);
        utils.nextOK(next);
        this.room.getComp('seat').isPlayed() && this.end();
    }

    enter() {
        super.enter();

        _.each(this.room.getComp('seat').getSittingSeats(), (seat) => {
            if (!seat.isHosting()) {
                return;
            }

            seat.setPlayed([]);
        });

        this.room.getComp('seat').isPlayed() && this.end();
    }

    end() {
        super.end();

        _.each(this.room.getComp('seat').getPlayingSeats(), (seat) => {
            !seat.isPlayed() && seat.setPlayed([]);
        });

        let banker = this.room.getComp('state').getBankerSeat();
        let bankerFormatter = banker.getHand().getFormatter();

        let formatters = _.map(this.room.getComp('seat').getSeats(), (s) => {
            if (!s.isPlaying()) {
                return null;
            }

            s.setShowed();
            let fmt = s.getHand().getFormatter();
            if (fmt != null && fmt != bankerFormatter) {
                fmt.win1 = - bankerFormatter.formation1.compare(fmt.formation1);
                fmt.win2 = - bankerFormatter.formation2.compare(fmt.formation2);
            }

            return fmt;
        });

        this.room.getComp('channel').sendAction(cons.RoomAction.PLAYER_SHOW_HAND(), _.map(formatters,
            fmt => {
                if (fmt == null) {
                    return fmt;
                }

                return fmt.toJson();
            }));

        setTimeout(() => {
            this.room.getComp('state').changeState(p9cons.RoomState.RESULT());
        }, _.size(this.room.getComp('seat').getPlayingSeats()) * 2000 + 2);
    }

}

module.exports = PlayState;