const _ = require('underscore');


class Task {
    constructor(manager, id, name, crontab, loop) {
        this.manager = manager;
        this.id = id;
        this.name = name;
        this.crontab = crontab;
        this.handler = null;
        this.loop = loop;
    }

    clear() {
        this.manager = null;
        this.crontab = null;
        if(this.handler) {
            clearTimeout(this.handler);
            this.handler = null;
        }
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    async init(params) {
        return true;
    }

    async reset() {
        this.loop -= 1;
        if(this.loop === 0) {
            return false;
        }

        let next = this.crontab.next();
        this.handler = setTimeout(() => this.manager.scheduleTask(this), next.getTime() - _.now());
        return true;
    }

    async run() {
        return true;
    }
}


module.exports = Task;