const Level2 = require('./level2');
const _ = require('underscore');

module.exports = {};

module.exports.create = () => {
    // return require('./level1');
    return new Level2();

};