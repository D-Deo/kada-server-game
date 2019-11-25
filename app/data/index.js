const _ = require('underscore');


let data = module.exports = {};


data.item = require('./item');
data.rebate = require('./rebate');


data.getItemName = (id) => {
    let item = data.item[id];
    return item ? item.name : null;
};


data.getRebate = (count) => {
    let rate = data.getRebateRate(count);
    let rebate =  parseInt(count * rate);
    return [rate, rebate];
};


data.getRebateRate = (count) => {
    let i = _.findIndex(data.rebate, r => r.count > count);
    if(i < 0) {
        return _.last(data.rebate).rate;
    }

    i -= 1;
    if(i < 0) {
        return 0;
    }

    return data.rebate[i].rate;
};
