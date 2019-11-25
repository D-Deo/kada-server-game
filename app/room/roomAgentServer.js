const Component = require('./component');
const constants = require('../common/constants');
const pomelo = require('pomelo');
const RoomAgentCommand = require('../session/roomAgentCommand');
const _ = require('underscore');


class RoomAgentServer extends Component{
    constructor(room) {
        super(room);
    }

    clear() {
        _.each(this.clients, (server) => {
            pomelo.app.rpc[server.type]['roomAgentRemote'].onRoomClear(
                server.session,
                this.room.getComp('session').toJson(),
                () => {}
            );
        });

        this.clients = [];
    }

    init() {
        super.init();

        // this.clients = [];
        // if(this.room.getAttr('guild')) {
        //     this.clients.push({type: 'guild', session: this.room.getAttr('game')});
        // } else if(this.room.getAttr('mode') === constants.RoomMode.PRIVATE_OTHER()) {
        //     this.clients.push({type: 'user', session: this.room.getAttr('owner')});
        // }
        //
        // this.room.on(constants.RoomEvent.ROOM_CHANGE_PLAYING(), () => {
        //     this.onCommand(RoomAgentCommand.createChangePlaying(this.room));
        // });
        //
        // this.room.on(constants.RoomEvent.ROOM_CREATE(), this.onRoomCreate.bind(this));
        //
        // this.room.on(constants.RoomEvent.SEAT_ADD_PLAYER(), (seat) => {
        //     this.onCommand(RoomAgentCommand.createChangePlayer(this.room, seat.getIndex()));
        // });
        //
        // this.room.on(constants.RoomEvent.SEAT_REMOVE_PLAYER(), (seat) => {
        //     this.onCommand(RoomAgentCommand.createChangePlayer(this.room, seat.getIndex()));
        // });
    }

    onCommand(command) {
        _.each(this.clients, (server) => {
            pomelo.app.rpc[server.type]['roomAgentRemote'].onCommand(
                server.session,
                command.toJson(),
                () => {}
            );
        });
    }

    onRoomCreate() {
        _.each(this.clients, (server) => {
            pomelo.app.rpc[server.type]['roomAgentRemote'].onRoomCreate(
                server.session,
                this.room.toJsonForAgent(),
                () => {}
            );
        });
    }
}


module.exports = RoomAgentServer;