const Comp = require('./component');
const cons = require('../common/constants');
const logger = require('log4js').getLogger('room');
const _ = require('underscore');


class JobManager extends Comp {
    constructor(room) {
        super(room);

        this.idGenerator = 0;
        this.jobs = {};
    }

    clear() {
        super.clear();

        _.each(this.jobs, j => j.clear());
        this.jobs = {};
    }

    addJob(j) {
        this.jobs[j.getId()] = j;
    }

    getJob(id) {
        return this.jobs[id];
    }

    nextJobId() {
        return ++this.idGenerator;
    }

    removeJob(id) {
        let job = this.getJob(id);
        if(!job) {
            logger.error('JobManager removeJob: unknown job', id);
            return;
        }

        job.clear();
        delete this.jobs[id];
    }

    init() {
        this.room.on(cons.RoomEvent.ROOM_BEFORE_CLEAR(), this.clear, this);
    }
}


module.exports = JobManager;