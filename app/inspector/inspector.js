const cons = require('../common/constants');
const EventEmitter = require('eventemitter3');
const pomelo = require('pomelo');
const utils = require('../utils');
const _ = require('underscore');


class Inspector extends EventEmitter {
    static get() {
        return pomelo.app.components['inspector'];
    }

    constructor() {
        super();

        this.attrs = {};
        this.commands = [];
    }

    disable(key) {
        this.setAttr(key, false);
    }

    enable(key) {
        this.setAttr(key, true);
    }

    isDisabled(key) {
        return !this.isEnabled(key);
    }

    isEnabled(key) {
        return !!this.attrs[key];
    }

    setAttr(key, value) {
        this.attrs[key] = value;
    }

    setAttrs(attrs) {
        _.each(attrs, (value, key) => {
            this.attrs[key] = value;
        });
    }

    addCommand(command) {
        this.commands.push(command);
    }

    findCommand(name) {
        let Command = this.findServerCommand(name);
        if (Command) {
            return Command;
        }

        try {
            return require('./commands/' + name);
        } catch (e) {
            return null;
        }
    }

    findServerCommand(name) {
        try {
            return require('./commands/' + name + '_' + pomelo.app.getServerType());
        } catch (e) {
            return null;
        }
    }

    removeCommand(command) {
        this.commands = _.without(this.commands, command);
    }

    runCommand(name, params = {}) {
        let Command = this.findCommand(name);
        if (!Command) {
            console.error('Inspector runCommand: unknown command - ', name);
            return;
        }

        let command = new Command(this, params);
        command.run();
        console.info('Inspector runCommand: ', name, params);
    }

    boot() {
        this.enable('booted');
        this.emit(cons.InspectorEvent.BOOT());
    }

    close() {
        this.enable('closing');
        this.emit(cons.InspectorEvent.CLOSE());
    }

    start(cb) {
        this.runCommand('boot');
        utils.cb(cb);
    }
}


module.exports = Inspector;
