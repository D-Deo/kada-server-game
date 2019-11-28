const conf = require('../../config/redis.json');
const Redis = require('redis');
const { promisify } = require('util');

let opts = {
    host: conf.host || '127.0.0.1',
    port: conf.port || 6379,
}
if (conf.auth) {
    opts.password = conf.auth;
}

let redis = module.exports = {};
redis.client = Redis.createClient(opts);

redis.async = {};
redis.async.get = promisify(redis.client.get).bind(redis.client);
redis.async.incrby = promisify(redis.client.incrby).bind(redis.client);
redis.async.keys = promisify(redis.client.keys).bind(redis.client);
redis.async.mget = promisify(redis.client.mget).bind(redis.client);
redis.async.incrby = promisify(redis.client.incrby).bind(redis.client);

redis.get = (key, cb) => {
    redis.client.get(key, (err, reply) => {
        if (err) {
            return console.error(err);
        }
        if (cb) cb(reply);
    });
};

redis.set = (key, value) => {
    redis.client.set(key, value);
};

redis.keys = (key, cb) => {
    redis.client.keys(key, (err, replies) => {
        if (err) {
            return console.error(err);
        }
        if (cb) cb(replies);
    });
};

redis.mget = (key, cb) => {
    redis.client.mget(key, (err, replies) => {
        if (err) {
            return console.error(err);
        }
        if (cb) cb(replies);
    });
};

redis.incrby = (key, value) => {
    redis.client.incrby(key, value);
}

redis.del = (key, cb) => {
    redis.client.del(key, (error, reply) => {
        if (error) {
            return console.error(error);
        }
        if (cb) cb(reply);
    });
}

redis.decrby = (key, value) => {
    redis.client.decrby(key, value);
}