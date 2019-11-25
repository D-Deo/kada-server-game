const _ = require('underscore');


let util = module.exports = {};


util.formatString = (n, l) => {
    let s = n + '';
    _.times(l - s.length, () => s = '0' + s);
    return s;
};


util.randomId = (length) => {
    let min = Math.pow(10, length - 1);
    let max = Math.pow(10, length) - 1;
    return _.random(min, max);
};


util.randomUniqueId = (tracer, length) => {
    while(true) {
        let id = util.randomId(length);
        if(!_.has(tracer, id)) {
            return id;
        }
    }
};


util.toRadian = (l) => {
    return l * Math.PI / 180.0;
};


util.toSequence = (nums, count = 5) => {
    nums = _.uniq(nums);
    nums = _.sortBy(nums);
    if(nums.length < count) {
        return null;
    }

    let from = nums.length - 1;
    let itr = from;
    while(from > (count - 2) && itr >= 0) {
        if(itr === from) {
            itr -= 1;
            continue;
        }

        if((nums[from] - nums[itr]) !== (from - itr)) {
            from = itr;
            continue;
        }

        if((from - itr) >= (count - 1)) {
            return nums.slice(itr, from + 1);
        }

        itr -= 1;
    }
    return null;
};


util.sum1OR0 = (bs) => {
    return _.reduce(bs, (m, b) => {
        return m + util.to1OR0(b);
    }, 0);
};


util.to1OR0 = (b) => {
    return b ? 1 : 0;
};
