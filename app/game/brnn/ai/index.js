const Level1 = require('./level1');
const _ = require('underscore');

module.exports = {};

module.exports.create = (robot) => {
    return new Level1(robot);
};