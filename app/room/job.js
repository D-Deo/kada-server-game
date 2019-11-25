class Job {
    constructor(room, id) {
        this.room = room;
        this.id = id;

        this.init();
    }

    clear() {
        this.room = null;
    }

    getId() {
        return this.id;
    }

    init() {}

    run() {}
}

module.exports = Job;