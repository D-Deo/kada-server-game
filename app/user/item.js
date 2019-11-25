const cons = require('../common/constants');
const dao = require('../dao/index');
const EventEmitter = require('eventemitter3');
const logger = require('log4js').getLogger('item');
const _ = require('underscore');


class Item extends EventEmitter {
    static create(user, id, count) {
        return new Item(user, id, count);
    }

    constructor(user, id, count) {
        super();

        this.user = user;
        this.id = id;
        this.count = count || 0;
        this.locked = 0;
    }

    change(count, exts, relock) {
        if (this.count + count < 0) {
            logger.error('Item change: remain', this.count, 'change', count, 'exts', exts);
            return 0;
        }

        this.count += count;
        this.relock(relock ? count : 0);
        this.emit(cons.ItemEvent.CHANGE(), this, count, relock);
        dao.item.record(this.user.getId(), this.id, count, this.count, exts);
        dao.item.save(this.user.getId(), this.id, this.count);
        this.user.sendItemChangeAction(this.id);
        return this.count;
    }

    getId() {
        return this.id;
    }

    getCount(lock = false) {
        return this.count - (lock ? 0 : this.locked);
    }

    isEmpty() {
        return this.count === 0;
    }

    lock(count) {
        count = count || this.getCount();

        if (count < 0) {
            logger.error('Item lock:', count);
            return 0;
        }

        if (this.getCount() < count) {
            logger.error('Item lock:', this.getCount(), '<', count);
            return 0;
        }

        this.locked += count;
        return count;
    }

    relock(count) {
        if (count === 0) {
            return;
        }

        (count < 0) ? this.unlock(-count) : this.lock(count);
    }

    unlock(count) {
        count = count || this.locked;


        if (count > this.locked) {
            logger.error('Item unlock:', this.locked, '<', count);
            return 0;
        }

        this.locked -= count;
        return count;
    }

    toJson() {
        return _.pick(this, ['id', 'count']);
    }
}


module.exports = Item;