const cons = require('../../../common/constants');
const Super = require('../../../room/db');
const utils = require('../../../utils');
const _ = require('underscore');
const zlib = require('zlib');


class Db extends Super {
    init() {
        super.init();

        this.room.on(cons.RoomEvent.ROOM_CREATE(), this.onRoomCreate.bind(this));
        this.room.on(cons.RoomEvent.ROOM_CLEAR(), this.onRoomClear.bind(this));
    }

    onRoomCreate() {
        this.update({
            state: cons.RoomRecord.PLAYING(),
            beginTime: utils.date.timestamp()
        });
    }

    onRoomClear() {
        let balance = this.room.getComp('state').getBalance();
        if (!balance) {
            this.update({
                balance: null,
                state: cons.RoomRecord.END(),
                endTime: utils.date.timestamp()
            });
            return;
        }
        
        zlib.gzip(JSON.stringify(balance), (err, buffer) => {
            if (err) {
                this.update({
                    balance: null,
                    state: cons.RoomRecord.END(),
                    endTime: utils.date.timestamp()
                });
                return console.error(err);
            }

            this.update({
                balance: Buffer.from(buffer).toString('base64'),
                state: cons.RoomRecord.END(),
                endTime: utils.date.timestamp()
            });
        });
    }
}


module.exports = Db;