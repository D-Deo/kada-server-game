const _ = require('underscore');


let util = module.exports = {};


util.toItems = () => {
    let items = {};

    _.each(arguments, (a) => {
        if(!a) {
            return;
        }

        if(!_.has(items, a.id)) {
            items[a.id] = a.count;
            return;
        }

        items[a.id] += a.count;
    });

    return items;
};