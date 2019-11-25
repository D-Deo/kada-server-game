const pomelo = require('pomelo');


let rpc = module.exports = {};


rpc.register = (params, cb) => {
    pomelo.app.rpc.user.agentRemote.register(null, params, cb);
};


rpc.remove = (params, cb) => {
    pomelo.app.rpc.user.agentRemote.remove(null, params, cb);
};
