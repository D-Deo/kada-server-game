const db = require('../db/model');
const logger = require('log4js').getLogger('setting');


class Setting {
    static async create(key, value, desp) {
        let setting = new Setting(key, value, desp);
        await setting.load();
        return setting;
    }

    constructor(key, value, desp) {
        this.key = key;
        this.value = value;
        this.desp = desp || null;
        this.data = null;
    }

    change(value, save = false) {
        this.set(this.value + value, save);
    }

    get() {
        return this.value;
    }

    set(value, save = false) {
        this.value = value;
        save && this.save().catch(e => {
            logger.error('Setting set:', e);
        })
    }

    async load() {
        let [data] = await db.Setting.findOrCreate({
            where: {key: this.key},
            defaults: {key: this.key, value: JSON.stringify(this.value), desp: this.desp}
        });
        this.data = data;
        this.value = JSON.parse(this.data.value);
        this.desp = this.data.desp;
    }

    async save() {
        this.data.update({value: JSON.stringify(this.value)});
    }
}


module.exports = Setting;