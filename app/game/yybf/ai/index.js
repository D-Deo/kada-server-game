const Level1 = require('./level1');
const Level2 = require('./level2');
const Level3 = require('./level3');
const _ = require('underscore');

module.exports = {};

module.exports.create = (robot) => {
    let r = _.random(100);
    if( r <= 60 ){
        return new Level1(robot);
    }else if( r <= 90) {
        return new Level2(robot);
    }else{
        return new Level3(robot);
    } 
};