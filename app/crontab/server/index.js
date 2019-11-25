const conf = require('../../common/configuration');
const http = require('http');
const utils = require('../../utils/index');
const _ = require('underscore');


class Server {
    constructor() {
        this.host = conf.http.host;
        this.port = conf.http.port;
        this.path = 'http://' + this.host + ':' + this.port + '/';
    }

    get(route, params, cb) {
        params = _.map(params, (v, k) => k + '=' + v);

        let query = params.join('&');
        query = (query ? '?' : '') + query;
        query = encodeURI(query);

        http.get(this.path + route + query, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => cb && cb(JSON.parse(body)));
        });
    }

    getp(route, params) {
        return new Promise((rs, rj) => {
            this.get(route, params, (result) => {
                utils.crOK(result) ? rs(result.msg) : rj(result);
            });
        });
    }

    post(route, params = {}, cb) {
        const data = JSON.stringify(params);
        const options = {
            hostname: this.host,
            port: this.port,
            path: '/' + route,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        let req = http.request(options, res => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => cb && cb(JSON.parse(body)));
        });
        req.write(data);
        req.end();
    }

    postp(route, params) {
        return new Promise((rs, rj) => {
            this.post(route, params, (result) => {
                utils.crOK(result) ? rs(result.msg) : rj(result);
            });
        });
    }
}


module.exports = new Server();