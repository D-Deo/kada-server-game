const bodyParser = require('body-parser');
// const conf = require('../../../../common/configuration');
const conf = require('../../../../../config/http.json');
const cookieParser = require('cookie-parser');
const debug = require('debug')('green:server');
const express = require('express');
const expressSession = require('express-session');
const favicon = require('serve-favicon');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const utils = require('../../../../utils/index');


let app = express();
app.set('port', conf.port || 30089);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: 'api'
}));
app.use('/admin', require('./routers/admin'));
app.use('/guild', require('./routers/guild'));
app.use('/inspector', require('./routers/inspector'));
app.use('/item', require('./routers/item'));
app.use('/room', require('./routers/room'));
app.use('/user', require('./routers/user'));
app.use('/wx', require('./routers/wx'));
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res) {
    utils.responseError(res, err);
});

let server = http.createServer(app);
server.listen(conf.port);
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});

server.on('listening', () => {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
});


module.exports = app;