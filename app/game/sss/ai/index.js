const _ = require('underscore');


let levels = [
    require('./level1')
];

module.exports = {};

module.exports.create = () => {
    return levels[0];
};