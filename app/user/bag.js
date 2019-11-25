const Comp = require('./component');
const cons = require('../common/constants');
const db = require('../db/model');
const Item = require('./item');
const _ = require('underscore');


class Bag extends Comp {
    constructor(user) {
        super(user);

        this.items = {};
    }

    addItem(item) {
        this.items[item.getId()] = item;
    }

    changeItem(id, count, exts, relock = false) {
        if(count === 0) {
            return;
        }

        let ret = {id, change: count};
        let item = this.getItem(id, true);
        ret.remain = item.change(count, exts, relock);
        return ret;
    }

    changeItems(items, exts) {
        let ret = {};
        _.each(items, (count, itemId) => {
            ret[itemId] = this.changeItem(parseInt(itemId), count, exts);
        });
        return ret;
    }

    createItem(id) {
        let item = Item.create(this.user, id);
        this.addItem(item);
        return item;
    }

    getItem(id, create = false) {
        let item = this.items[id];
        return (!item && create) ? this.createItem(id) : item;
    }

    getItemCount(id, lock = false) {
        let item = this.getItem(id);
        return item ? item.getCount(lock) : 0;
    }

    getItemBundleCount(ids, lock = false) {
        return _.reduce(ids, (m, i) => m += this.getItemCount(i, lock), 0);
    }

    getItemCount_Diamond(bind = true) {
        return this.getItemCount(cons.Item.DIAMOND()) + (bind ? this.getItemCount(cons.Item.BIND_DIAMOND()) : 0);
    }

    haveEnoughItem(id, count) {
        if(count <= 0) {
            return true;
        }

        return this.getItemCount(id) >= count;
    }

    haveEnoughItemBundle(ids, count) {
        return this.getItemBundleCount(ids) >= count;
    }

    haveEnoughItem_Diamond(count, bind = true) {
        return this.getItemCount_Diamond(bind) >= count;
    }

    resetItem(id, count, exts) {
        return this.changeItem(id, count - this.getItemCount(id), exts);
    }

    resetItems(items, exts) {
        return _.mapObject(items, (c, i) => {
            return this.resetItem(i, c, exts);
        });
    }

    useItem(id, count, exts) {
        return this.changeItem(id, -count, exts);
    }

    useItemBundle(ids, count, exts) {
        let remain = count;
        let ret = _.map(ids, id => {
            if(remain <= 0) {
                return;
            }

            let c = _.min([this.getItemCount(id), remain]);
            remain -= c;
            return this.changeItem(id, -c, exts);
        });
        ret = _.compact(ret);
        return ret;
    }

    useItem_Diamond(count, exts, bind = true) {
        let ret = {};
        let bindDiamond = bind ? _.min([count, this.getItemCount(cons.Item.BIND_DIAMOND())]) : 0;
        let diamond = count - bindDiamond;
        ret.diamond = this.useItem(cons.Item.DIAMOND(), diamond, exts);
        ret.bindDiamond = this.useItem(cons.Item.BIND_DIAMOND(), bindDiamond, exts);
        return ret;
    }

    useItems(items, exts) {
        return _.mapObject(items, (c, i) => {
            return this.useItem(i, c, exts);
        });
    }

    async load() {
        let data = await db.Item.findAll({where: {userId: this.user.getId()}});
        for(let d of data) {
            this.addItem(Item.create(this.user, d.itemId, d.count));
        }
    }

    toJson(lock) {
        return _.mapObject(this.items, (i) => i.getCount(lock));
    }
}


module.exports = Bag;