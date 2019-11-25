const constants = require('../common/constants');
const RoomSession = require('./roomSession');


class RoomAgentCommand {
    static createChangePlaying(room) {
        let command = new RoomAgentCommand(constants.RoomAgentCommand.CHANGE_PLAYING(), room.getComp('session'));
        command.setParam('playing', room.isPlaying());
        return command;
    }

    static createChangePlayer(room, index) {
        let command = new RoomAgentCommand(constants.RoomAgentCommand.CHANGE_PLAYER(), room.getComp('session'));
        command.setParam('index', index);
        command.setParam('player', room.getComp('seat').getSeat(index).toJsonForAgent());
        return command;
    }

    static fromJson(json) {
        return new RoomAgentCommand(json.type, RoomSession.fromJson(json.session), json.params);
    }

    constructor(type, session, params) {
        this.type = type;
        this.session = session;
        this.params = params || {};
    }

    getServerId() {
        return this.session.getServerId();
    }

    getGame() {
        return this.session.getGame();
    }

    getRoomId() {
        return this.session.getRoomId();
    }

    getOwner() {
        return this.session.getOwner();
    }

    getGuild() {
        return this.session.getGuild();
    }

    getParam(key) {
        return this.params[key];
    }

    setParam(key, value) {
        this.params[key] = value;
    }

    run(agent) {
        switch(this.type) {
            case constants.RoomAgentCommand.CHANGE_PLAYING():
                agent.setPlaying(this.getParam('playing'));
                break;

            case constants.RoomAgentCommand.CHANGE_PLAYER():
                agent.setPlayer(this.getParam('index'), this.getParam('player'));
                break;

            default:
                console.error('unknown room agent command ' + this.type);
                break;
        }
    }

    toJson() {
        let json = {};
        json.type = this.type;
        json.session = this.session.toJson();
        json.params = this.params;
        return json;
    }
}


module.exports = RoomAgentCommand;
