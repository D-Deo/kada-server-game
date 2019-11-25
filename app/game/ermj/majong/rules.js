const _ = require('underscore');
const mjcons = require('../majong/majongConstants');
const mjutils = require('../majong/utils');
const Rule = require('./rule');

class Rules {
    static createRules(fmt, jiang, seqArray, triArray) {
        let rules = new Rules();

        for (let x in global.rulesArray) {
            rules.checkRuleByName(x, fmt, jiang, seqArray, triArray);
        }

        return rules;
    }

    static getBetter(rules1, rules2) {
        return _.max([rules1, rules2], r => r.getFan());
    }

    constructor() {
        this.rules = [];
        this.ignore = [];
    }

    // 检查是否连七对
    is7Pair(fmt, jiang, seqArray, triArray) {
        if (this.checkRuleByName("七对", fmt, jiang, seqArray, triArray) == 0) {
            return false;
        }

        this.checkRuleByName("连七对", fmt, jiang, seqArray, triArray);
        this.checkRuleByName("双龙会", fmt, jiang, seqArray, triArray);
        this.checkRuleByName("三元七对", fmt, jiang, seqArray, triArray);
        this.checkRuleByName("四喜七对", fmt, jiang, seqArray, triArray);
        this.checkRuleByName("断幺九", fmt, jiang, seqArray, triArray);
        this.checkRuleByName("四归一", fmt, jiang, seqArray, triArray);
        this.checkRuleByName("混一色", fmt, jiang, seqArray, triArray);

        return true;
    }

    checkRuleByName(ruleName, fmt, jiang, seqArray, triArray) {
        return this.checkRule(global.rulesArray[ruleName], fmt, jiang, seqArray, triArray);
    }

    checkRule(rule, fmt, jiang, seqArray, triArray) {
        if (this.ignore.indexOf(rule.type) != -1) {
            // 忽略的牌型
            return 0;
        }

        let mul = rule.check(fmt, jiang, seqArray, triArray);
        if (mul > 0) {
            this.addRule(rule, mul);
            return mul;
        }

        return 0;
    }

    addRule(rule, mul = 1) {
        if (rule == undefined) {
            return;
        }

        if (this.ignore.indexOf(rule.type) != -1) {
            // 忽略的牌型
            return 0;
        }
        
        if (mul != 1) {
            // 改变番数
            this.rules.push(new Rule(rule.type, rule.fan * mul));
        }
        else {
            this.rules.push(rule);
        }

        rule.ignore.forEach(element => {
            let index = _.findIndex(this.rules, rule => rule.type == element);
            if (index != -1) {
                // 删除应该忽略的牌型
                this.rules.splice(index, 1);
            }
        });

        // 添加忽略的牌型, 同一牌型只能添加一次，所以也要忽略
        this.ignore = _.union(this.ignore, rule.name, rule.ignore);
    }

    addRuleByName(name, mul = 1) {
        this.addRule(global.rulesArray[name], mul);
    }

    toJson() {
        let json = {};
        json.ronCard = this.ronCard.toJson();
        json.fan = this.getFan();
        json.rules = _.map(this.rules, r => r.toJson());
        return json;
    }

    getFan() {
        let fan = _.reduce(this.rules, (fan, r) => {
            return r.fan + fan;
        }, 0)

        return Math.min(100, fan); // 100番封顶，防止不够赔的情况
    }

    isRon() {
        return this.rules.length > 0;
    }
}

module.exports = Rules;