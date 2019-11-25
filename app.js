const constants = require('./app/common/constants');
const GameManager = require('./app/game/manager');
const MatchManager = require('./app/match/manager');
const Inspector = require('./app/inspector/inspector');
const RobotManager = require('./app/robot/manager');
const RoomManager = require('./app/zone/roomManager');
const UserManager = require('./app/user/manager');
const pomelo = require('pomelo');

Date.prototype.toJSON = function () { return this.toLocaleString(); }

let app = pomelo.createApp();
app.set('name', 'vpserver');

app.configure('production|development', function () {
    app.load('gameManager', new GameManager());
    app.load('inspector', new Inspector());
    // app.route('guild', require('./app/routers/gameRouter')('guild'));
    app.route('robot', require('./app/routers/typeRouter')('robot'));
    app.route('room', require('./app/routers/idRouter')('room'));
    app.route('user', require('./app/routers/typeRouter')('user'));
    app.route('zone', require('./app/routers/gameRouter')('zone'));
    app.set('errorHandler', require('./app/handler/errorHandler'));
    app.set('globalErrorHandler', require('./app/handler/errorHandler'));
});


app.configure('production|development', 'gate', function () {
    app.set('connectorConfig', {
        connector: pomelo.connectors.hybridconnector,
        heartbeat: 15,
        useDict: false,
        useProtobuf: false
    });
});


app.configure('production|development', 'connector', function () {
    app.globalBefore(require('./app/filters/bootFilter'));
    app.globalBefore(require('./app/filters/loginFilter'));
    app.globalBefore(require('./app/filters/requestFrequencyFilter'));
    // app.route('guild', require('./app/routers/guildSessionRouter')());
    app.route('room', require('./app/routers/roomSessionRouter')());
    app.route('zone', require('./app/routers/zoneSessionRouter')());
    app.set('connectorConfig', {
        connector: pomelo.connectors.hybridconnector,
        heartbeat: 15,
        useDict: false,
        useProtobuf: false
    });
    app.event.on(pomelo.events.CLOSE_SESSION, require('./app/handler/sessionHandler'));
});


// app.configure('production|development', 'guild', function () {
    // app.set('guildService', require('./app/servers/guild/service/guildService')(app));
// });


app.configure('production|development', 'http', function () {
    // app.route('guild', require('./app/routers/idRouter')('guild'));
    app.route('room', require('./app/routers/idRouter')('room'));
    app.route('zone', require('./app/routers/idRouter')('zone'));
    app.set('httpService', require('./app/servers/http/service/httpService')(app));
});


app.configure('production|development', 'robot', function () {
    app.load('robotManager', new RobotManager());
});


app.configure('production|development', 'room', function () {
    app.set('roomService', require('./app/servers/room/service/roomService')(app));
});


app.configure('production|development', 'user', function () {
    UserManager.set();
    app.set('smsService', require('./app/servers/user/service/smsService')(app));
});


app.configure('production|development', 'zone', function () {
    app.load('roomManager', new RoomManager());
    app.load('matchManager', new MatchManager());
    app.set('privateService', require('./app/servers/zone/service/privateService')(app));
});


app.start();

process.on('uncaughtException', (err) => {
    console.error(' Caught exception: ' + err.stack);
});
