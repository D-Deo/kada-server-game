class PomeloRoute {
    static fromString(str) {
        let sps = str.split('.');
        return new PomeloRoute(sps[0], sps[1], sps[2]);
    }

    constructor(server, handler, method) {
        this.server = server;
        this.handler = handler;
        this.method = method;
    }

    isConnector() {
        return this.server === 'connector';
    }
}


module.exports = PomeloRoute;