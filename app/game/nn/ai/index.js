const _ = require('underscore');


let levels = [
    require('./level1'),
    require('./level2'),
    require('./level3')
];


module.exports = {};


module.exports.create = () => {
    let r = _.random(0, 100);

    if(r <= 20) {
        return levels[0];
    }

    if(r <= 70) {
        return levels[1];
    }

    return levels[2];
};