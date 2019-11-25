const Channel = require('./channel');
const dao = require('../../../dao/guild');
const MemberManager = require('./memberManager');
const pomelo = require('pomelo');
const RoomAgentManager = require('./roomAgentManager');
const utils = require('../../../utils');
const _ = require('underscore');


class Guild{
    constructor(id, name) {
        this.game = pomelo.app.getCurServer().game;
        this.id = id;
        this.name = name;
        this.comps = {};

        this.init();
    }

    getGame() {
        return this.game;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getComp(key) {
        return this.comps[key];
    }

    init() {
        this.comps.channel = new Channel(this);
        this.comps.member = new MemberManager(this);
        this.comps.roomAgent = new RoomAgentManager(this);
    }

    load(cb) {
        this.getComp('member').load(cb);
    }

    save() {
        dao.insert(this.toJsonForSave());
    }

    toJson() {
        let json = _.pick(this, ['game', 'id', 'name']);
        json.members = this.getComp('member').toJson();
        json.roomAgents = this.getComp('roomAgent').toJson();
        return json;
    }

    toJsonForList() {
        let json = _.pick(this, ['id', 'name']);
        json.chairman = this.getComp('member').getChairman().toJson();
        json.members = this.getComp('member').getMemberCount();
        json.agents = 0;
        return json;
    }

    toJsonForSave() {
        return _.pick(this, ['game', 'id', 'name']);
    }
}


module.exports = Guild;