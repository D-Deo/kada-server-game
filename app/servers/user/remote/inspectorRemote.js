const Inspector = require('../../../inspector/inspector');
const utils = require('../../../utils');
const _ = require('underscore');


function Remote(app) {
    this.app = app;
}


Remote.prototype.runCommand = function(name, params, cb) {
    Inspector.get().runCommand(name, params);
    utils.cbOK(cb);
};


Remote.prototype.setAttrs = function(attrs, cb) {
    Inspector.get().setAttrs(attrs);
    utils.cbOK(cb);
};


module.exports = (app) => new Remote(app);