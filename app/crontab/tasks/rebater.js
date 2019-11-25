const cons = require('../../common/constants');
const crontabParser = require('cron-parser');
const data = require('../../data');
const db = require('../../db');
const logger = require('log4js').getLogger('crontab');
const model = require('../../db/model');
const Setting = require('../../setting/setting');
const server = require('../server/item');
const Super = require('../task');
const utils = require('../../utils');
const _ = require('underscore');


class User {
    constructor(id, parent, recommender) {
        this.id = id;
        this.parent = parent;
        this.children = {};
        this.recommender = recommender;
        this.achieve = 0;
        this.rebate = 0;

        this.init();
    }

    addChild(u) {
        this.children[u.getId()] = u;
    }

    isRoot() {
        return !this.parent;
    }

    getId() {
        return this.id;
    }

    changeAchieve(value) {
        this.achieve += value;
    }

    getAchieve_Children() {
        return _.reduce(this.children, (m, c) => m + c.getAchieve_Total(), 0);
    }

    getAchieve_Self() {
        return this.achieve;
    }

    getAchieve_Total() {
        return this.getAchieve_Children() + this.getAchieve_Self();
    }

    getRebate_Children() {
        return _.reduce(this.children, (m, c) => m + c.getRebate_Total(), 0);
    }

    getRebate_Self() {
        return this.rebate;
    }

    getRebate_Total() {
        return this.getRebate_Children() + this.getRebate_Self();
    }

    getRecommender() {
        return this.recommender;
    }

    init() {
        this.parent && this.parent.addChild(this);
    }

    async run(index, from, to) {
        for(let k in this.children) {
            await this.children[k].run(index, from, to);
        }

        let [rate, rebate] = data.getRebate(this.getAchieve_Total());
        this.rebate = rebate - this.getRebate_Children();

        let  d= {};
        d.userId = this.id;
        d.index = index;
        d.from = from;
        d.to = to;
        d.recommender = this.getRecommender();
        d.children = await model.User.count({where: {
            'recommender': {[db.sequelize.Op.like]: '%' + this.id}}
        });
        d.descendants = await model.User.count({where: {
            'recommender': {[db.sequelize.Op.like]: '%' + this.id + '%'}}
        });
        d.cachieve = this.getAchieve_Children();
        d.sachieve = this.getAchieve_Self();
        d.tachieve = d.cachieve + d.sachieve;
        d.rate = rate;
        d.rebate = this.rebate;
        await model.UserRebateRecord.create(d);
        await server.changeItem(d.userId, cons.Item.GOLD(), d.rebate, {
            from: index + '',
            reason: cons.ItemChangeReason.REBATE()
        });
    }
}


class UserManager {
    constructor() {
        this.users = {};
    }

    addUser(user) {
        this.users[user.getId()] = user;
    }

    getUser(id) {
        return this.users[id];
    }

    getUsers() {
        return this.users;
    }

    async loadUser(id) {
        if(!id) {
            return null;
        }

        let user = this.getUser(id);
        if(user) {
            return user;
        }

        let data = await model.User.findById(id);
        if(!data) {
            return null;
        }

        let recommenders = data.recommender ? data.recommender.split(':') : [];
        let recommender = await this.loadUser(parseInt(recommenders.pop()));
        user = new User(id, recommender, data.recommender);
        this.addUser(user);
        return user;
    }

    reset() {
        this.users = {};
    }
}


class Rebater extends Super {
    constructor(manager, id) {
        super(manager, id, 'Rebater', crontabParser.parseExpression('* * * * * *'), -1);

        this.userManager = new UserManager();
    }

    async init() {
        this.index = await Setting.create('rebater.index', 0);
        this.timestamp = await Setting.create('rebater.timestamp', '2018-01-01 00:00:00');
        return true;
    }

    async reset() {
        this.userManager.reset();

        return await super.reset();
    }

    async run() {
        let from = this.timestamp.get();
        let to = utils.date.toDaily(_.now());
        if(from === to) {
            logger.info(`Task(${this.getName()}) run: pass`);
            return;
        }

        let index = this.index.get() + 1;
        let rows = await model.UserRebateDaily.findAll({
            where: {timestamp: {[db.sequelize.Op.gte]: from, [db.sequelize.Op.lt]: to}}
        });

        for(let row of rows) {
            let user = await this.userManager.loadUser(row.userId);
            user.changeAchieve(row.count);
        }

        let users = this.userManager.getUsers();
        users = _.filter(users, u => u.isRoot());
        for(let u of users) {
            await u.run(index, from, to);
        }

        this.index.set(index);
        this.timestamp.set(to);

        await this.index.save();
        await this.timestamp.save();
    }
}


module.exports = Rebater;