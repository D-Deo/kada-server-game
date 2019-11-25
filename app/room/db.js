const Comp = require('./component');
const cons = require('../common/constants');
const db = require('../db/model');
const logger = require('log4js').getLogger('room');
const utils = require('../utils');


class Db extends Comp {
    getId() {
        return this.data.uuid;
    }

    init() {
        super.init();

        this.data = this.room.toJson_Db();
        this.data.state = cons.RoomRecord.INIT();
        this.data.createTime = utils.date.timestamp();
        this.data = db.RoomRecord.build(this.data);
        this.dirty = false;
        this.saving = false;
        this.save();

        this.room.on(cons.RoomEvent.ROOM_CLEAR(), this.onRoomClear, this);
    }

    save() {
        if(this.saving) {
            this.dirty = true;
            return;
        }

        this.dirty = false;
        this.saving = true;
        let p = this.data.save();
        p.catch(e => {
            logger.error('Db save:', e);
        }).then(() => {
            this.saving = false;
            this.dirty && this.save();
        });
    }

    update(data) {
        for(let k in data) {
            this.data[k] = data[k];
        }
        this.save();
    }

    onRoomClear() {
        this.update({
            state: cons.RoomRecord.END(),
            endTime: utils.date.timestamp()
        });
    }
}


module.exports = Db;