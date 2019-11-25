class InspectorCommand {
    constructor(inspector, params) {
        this.inspector = inspector;
        this.params = params || {};
        this.init();
    }

    clear() {
        this.inspector.removeCommand(this);
        this.inspector = null;
    }

    end() {
        this.clear();
    }

    init() {
        this.inspector.addCommand(this);
    }

    run() {
        this.end();
    }
}


module.exports = InspectorCommand;
