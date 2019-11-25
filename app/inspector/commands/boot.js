const InspectorCommand = require('../inspectorCommand');
const pomelo = require('pomelo');
const _ = require('underscore');


class InspectorCommand_Boot extends InspectorCommand {
    constructor(inspector, params) {
        super(inspector, params);
    }

    clear() {
        pomelo.app.event.removeListener(pomelo.events.ADD_SERVERS, this.handler);

        super.clear();
    }

    end() {
        this.inspector.boot();

        super.end();
    }

    onAddServers(servers) {
        this.servers = _.difference(this.servers, _.map(servers, (s) => s.id));
        _.isEmpty(this.servers) && this.end();
    }

    run() {
        if(this.inspector.isEnabled('booted')) {
            console.error('Inspector Boot: reboot');
            this.end();
            return;
        }

        this.handler = this.onAddServers.bind(this);
        this.servers = _.map(pomelo.app.getServersFromConfig(), (server) => server.needed ? server.id : null);
        this.servers = _.compact(this.servers);
        pomelo.app.event.on(pomelo.events.ADD_SERVERS, this.handler);
    }
}


module.exports = InspectorCommand_Boot;
