const logger = require('log4js').getLogger('crontab');

class Manager {
    constructor() {
        this.idGenerator = 0;
        this.pendings = [];
        this.running = null;
        this.tasks = {};
    }

    addTasks(t) {
        this.tasks[t.getId()] = t;
    }

    async createTask(path, params) {
        try {
            let Task = require('./tasks/' + path);
            let task = new Task(this, ++this.idGenerator);

            let init = await task.init(params);
            if(!init) {
                logger.error('Manager createTask: init fail', path, params);
                return;
            }

            this.addTasks(task);

            let reset = await task.reset();
            if(!reset) {
                this.removeTask(task);
                logger.error('Manager createTask: reset fail', path, params);
                return;
            }

            return task;
        }catch(e) {
            logger.error('Manager createTask: error', path, params, e);
        }
    }

    removeTask(id) {
        delete this.tasks[id];
    }

    runTask() {
        this.running = this.pendings.shift();
        if(!this.running) {
            return;
        }

        logger.info('Manager runTask:', this.running.getId(), this.running.getName());

        let p = this.running.run();
        p.catch(e => {
            logger.error('Manager runTask:', e);
        }).then(() => {
            return this.running.reset();
        }).then((r) => {
            !r && this.removeTask(this.running.getId());
            this.running = null;
            this.runTask();
        });
    }

    scheduleTask(t) {
        logger.info('Manager scheduleTask:', t.getId(), t.getName());

        this.pendings.push(t);
        !this.running && this.runTask();
    }

    async start() {
        // await this.createTask('dbScanner');
        await this.createTask('rebater');
    }
}


module.exports = Manager;