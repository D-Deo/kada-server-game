const pomelo = require('pomelo');
const utils = require('../utils');
const redis = require('../../app/redis');
const logger = require('pomelo-logger').getLogger('game-jackpot');
const debugL = require('pomelo-logger').getLogger('game-jackpot', __filename);

class GameManager {
    static getInstance() {
        return pomelo.app.components['gameManager'];
    }

    constructor() {
        this.games = {};
        this.jackpots = {};
        this.userJackpots = {};
        this.def = null;
        this.init();
    }

    call0(type, key) {
        return this.getInterface(type, key)();
    }

    call1(type, key, param1) {
        return this.getInterface(type, key)(param1);
    }

    call2(type, key, param1, param2) {
        return this.getInterface(type, key)(param1, param2);
    }

    call3(type, key, param1, param2, param3) {
        return this.getInterface(type, key)(param1, param2, param3);
    }

    addJackpot(game, area, score, pass) {
        score = parseInt(score) || 0;
        let str = `UpGame:${game.toUpperCase()}:AREA_${area}:jackpot`;
        this.jackpots[str] = (this.jackpots[str] || 0) + (score || 0);
        !pass && redis.incrby(str, score);
        logger.info(game, area, 'jackpot', score, this.jackpots[str]);
    }

    /**
     * 设置奖池配置
     * @param {string} game 游戏ID
     * @param {number} area 区域ID
     * @param {string} key  配置名称
     * @param {number} value 配置值
     */
    setJackpot(game, area, key, value) {
        let str = `UpGame:${game.toUpperCase()}:AREA_${area}:${key}`;
        this.jackpots[str] = value || 0;
    }

    /**
     * 获取奖池配置
     * @param {string} game 游戏ID 
     * @param {number} area 区域ID
     * @param {string} key  配置名称
     */
    getJackpot(game, area, key) {
        let value = this.jackpots[`UpGame:${game.toUpperCase()}:AREA_${area}:${key}`];
        value = parseInt(value) || 0;
        debugL.debug(game, area, key, value);
        return value;
    }

    addUserJackpot(game, area, userId, score, pass) {
        if (!userId) return;
        // let str = `User:${game.toUpperCase()}:${area}:${userId}`;
        let str = `User:${userId}`;
        this.userJackpots[str] = (this.userJackpots[str] || 0) + (score || 0);
        !pass && redis.incrby(str, score);
        logger.info(game, area, 'jackpot', score, this.userJackpots[str]);
    }

    getUserJackpot(game, area, userId) {
        if (!userId) return 0;
        // let value = this.userJackpots[`User:${game.toUpperCase()}:${area}:${userId}`];
        let value = this.userJackpots[`User:${userId}`];
        value = parseInt(value) || 0;
        debugL.debug(game, area, userId, value);
        return value;
    }

    getGame(game) {
        return this.games[game];
    }

    getAttr(type, key) {
        let game = this.getGame(type) || this.def;
        return game.getAttr(key) || this.def.getAttr(key);
    }

    getClass(type, key) {
        let game = this.getGame(type) || this.def;
        return game.getClass(key) || this.def.getClass(key);
    }

    getData(type, key) {
        let game = this.getGame(type);
        return game ? game.getData(key) : null;
    }

    getInterface(type, key) {
        let game = this.getGame(type) || this.def;
        return game.getInterface(key) || this.def.getInterface(key);
    }

    init() { }

    new0(type, key) {
        let Cls = this.getClass(type, key);
        return new Cls();
    }

    new1(type, key, param1) {
        let Cls = this.getClass(type, key);
        return new Cls(param1);
    }

    new2(type, key, param1, param2) {
        let Cls = this.getClass(type, key);
        return new Cls(param1, param2);
    }

    new3(type, key, param1, param2, param3) {
        let Cls = this.getClass(type, key);
        return new Cls(param1, param2, param3);
    }

    async start(cb) {
        this.games['bcbm'] = require('./bcbm');
        this.games['bjl'] = require('./bjl');
        this.games['ddz'] = require('./ddz');
        this.games['dz'] = require('./dz');
        this.games['lx9'] = require('./lx9');
        this.games['nn'] = require('./nn');
        this.games['zjh'] = require('./zjh');
        this.games['brnn'] = require('./brnn');
        this.games['yybf'] = require('./yybf');
        this.games['lkpy'] = require('./lkpy');
        this.games['fqzs'] = require('./fqzs');
        this.games['ermj'] = require('./ermj');
        this.games['pj'] = require('./pj');
        this.games['sss'] = require('./sss');
        this.def = require('./def');

        let keys = await redis.async.keys('UpGame:*:AREA_*:*');
        if (!keys || keys.length == 0) return utils.cb(cb);
        let values = await redis.async.mget(keys);
        for (let i = 0; i < keys.length; i++) {
            this.jackpots[keys[i]] = parseInt(values[i]) || 0;
            logger.info('当前房间配置', keys[i], values[i]);
        }

        keys = await redis.async.keys('User:*');
        if (!keys || keys.length == 0) return utils.cb(cb);
        values = await redis.async.mget(keys);
        for (let i = 0; i < keys.length; i++) {
            this.userJackpots[keys[i]] = parseInt(values[i]) || 0;
            logger.info('当前玩家分数', keys[i], values[i]);
        }

        utils.cb(cb);
    }
}


module.exports = GameManager;