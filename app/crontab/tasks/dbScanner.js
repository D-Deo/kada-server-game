const cons = require('../../common/constants');
const crontabParser = require('cron-parser');
const db = require('../../db');
const logger = require('log4js').getLogger('crontab');
const model = require('../../db/model');
const Setting = require('../../setting/setting');
const Super = require('../task');
const utils = require('../../utils');
const _ = require('underscore');


class User {
    static async create(id) {
        let data = await model.User.findById(id);
        if(!data) {
            return null;
        }

        return new User(data.id, data.type);
    }

    constructor(id, type) {
        this.id = id;
        this.type = type;
    }

    getId() {
        return this.id;
    }

    getType() {
        return this.type;
    }
}


class UserManager {
    constructor() {
        this.users = {};
    }

    addUser(user) {
        this.users[user.getId] = user;
    }

    getUser(id) {
        return this.users[id];
    }

    async loadUser(id) {
        let user = this.getUser(id);
        if(user) {
            return user;
        }

        user = await User.create(id);
        if(!user) {
            return user;
        }

        this.addUser(user);
        return user;
    }

    reset() {
        this.users = {};
    }

    async save() {
        return;
    }
}


class Daily {
    static async create(userId, timestamp) {
        let [data] = await model.UserRebateDaily.findOrCreate({
            where: {userId, timestamp},
            defaults: {userId, timestamp, count: 0}
        });
        return new Daily(data);
    }

    constructor(data) {
        this.data = data;
    }

    getUserId() {
        return this.data.userId;
    }

    getTimestamp() {
        return utils.date.toDaily(this.data.timestamp);
    }

    changeCount(value) {
        this.data.count += value;
    }

    getCount() {
        return this.data.count;
    }

    async save() {
        await this.data.save();
    }
}


class DailyManager {
    constructor() {
        this.dailys = {};
    }

    addDaily(daily) {
        this.dailys[daily.getUserId()] = this.dailys[daily.getUserId()] || {};
        this.dailys[daily.getUserId()][daily.getTimestamp()] = daily;
    }

    getDaily(userId, timestamp) {
        if(!this.dailys[userId]) {
            return null;
        }

        return this.dailys[userId][timestamp];
    }

    async loadDaily(userId, timestamp) {
        let daily = this.getDaily(userId, timestamp);
        if(daily) {
            return daily;
        }

        daily = await Daily.create(userId, timestamp);
        this.addDaily(daily);
        return daily;
    }

    reset() {
        this.dailys = {};
    }

    async save() {
        for(let k1 in this.dailys) {
            for(let k2 in this.dailys[k1]) {
                await this.dailys[k1][k2].save();
            }
        }
    }
}


class DbScanner extends Super {
    constructor(manager, id) {
        super(manager, id, 'DbScanner', crontabParser.parseExpression('* * * * * *'), -1);

        this.dailyManager = new DailyManager();
        this.userManager = new UserManager();
    }

    async init() {
        this.balance = {};
        this.balance['dz'] = await Setting.create('robot.balance.dz', 0);
        this.balance['nn'] = await Setting.create('robot.balance.nn', 0);

        this.progress = {};
        this.progress['item_record'] = await Setting.create('dbScanner.progress.item_record', 0);
        this.progress['room_income_record'] = await Setting.create('dbScanner.progress.room_income_record', 0);

        return true;
    }

    async reset() {
        this.dailyManager.reset();
        this.userManager.reset();

        return await super.reset();
    }

    async run() {
        await this.run_ItemRecord();
        await this.run_RoomIncomeRecord();
        await this.dailyManager.save();
        await this.userManager.save();

        for(let k in this.balance) {
            await this.balance[k].save();
        }

        for(let k in this.progress) {
            await this.progress[k].save();
        }
    }

    async run_ItemRecord() {
        let progress = this.progress['item_record'];
        let rows = await model.ItemRecord.findAll({where: {
            id: {[db.sequelize.Op.gt]: progress.get()},
            reason: cons.ItemChangeReason.PLAY()
        }});

        let trace = _.now();
        for(let row of rows) {
            await this.run_ItemRecord_Row(row);
            progress.set(row.id);
        }
        logger.info('Task(' + this.getName() + ') run_ItemRecord: rows', rows.length, 'time',( _.now() - trace) + 'ms');
    }

    async run_ItemRecord_Row(row) {
        let user = await this.userManager.loadUser(row.userId);
        if(!user || user.getType() !== cons.User.ROBOT()) {
            return;
        }

        let balance = this.balance[row.game];
        if(!balance) {
            return;
        }

        balance.change(row.count);
    }

    async run_RoomIncomeRecord() {
        let progress = this.progress['room_income_record'];
        let rows = await model.RoomIncomeRecord.findAll({where: {
            id: {[db.sequelize.Op.gt]: progress.get()}
        }});

        let trace = _.now();
        for(let row of rows) {
            await this.run_RoomIncomeRecord_Row(row);
            progress.set(row.id);
        }
        logger.info('Task(' + this.getName() + ') run_RoomIncomeRecord: rows', rows.length, 'time',( _.now() - trace) + 'ms');
    }

    async run_RoomIncomeRecord_Row(row) {
        let timestamp = utils.date.toDaily(row.timestamp);
        let daily = await this.dailyManager.loadDaily(row.userId, timestamp);
        daily.changeCount(row.count);
    }
}


module.exports = DbScanner;