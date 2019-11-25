const _ = require('underscore');


let utils = module.exports = {};


utils.money_Proportion = (have, scores) => {
    let moneys = _.filter(scores, (s) => s && s < 0);
    if(_.isEmpty(moneys)) {
        return scores;
    }

    let total = _.reduce(moneys, (m, s) => m - s, 0);
    if(total <= have) {
        return scores;
    }

    moneys = _.map(moneys, (money) => {
        return Math.floor(-money * have / total);
    });

    let iterator = 0;
    return _.map(scores, (score) => {
        if(!score || score >= 0) {
            return score;
        }

        return -moneys[iterator++];
    });
};


utils.pay_Proportion = (have, scores) => {
    let pays = _.filter(scores, (s) => s && s > 0);
    if(_.isEmpty(pays)) {
        return scores;
    }

    let total = _.reduce(pays, (m, s) => m + s, 0);
    if(total <= have) {
        return scores;
    }

    pays = _.map(pays, (pay) => {
        return Math.floor(pay * have / total);
    });

    let iterator = 0;
    return _.map(scores, (score) => {
        if(!score || score <= 0) {
            return score;
        }

        return pays[iterator++];
    });
};
