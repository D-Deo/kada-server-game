const _ = require('underscore');


class IdGenerator {
    static create(length, min, max) {
        return new IdGenerator(length, min, max);
    }

    static fromJson(json) {
        return new IdGenerator(json.length, json.min, json.max);
    }

    constructor(length, min, max) {
        this.length = length;
        this.min = min;
        this.max = max;
    }

    generate() {
        let max = Math.pow(10, this.length) - 1;
        if(this.max) {
            max = _.min([max, this.max]);
        }

        let min = 0;
        if(this.min) {
            min = _.max([min, this.min]);
        }


        if(max < min) {
            console.error('IdGenerator generate: max < min');
            return null;
        }

        let rand = _.random(min, max) + '';
        _.times(this.length - rand.length, () => rand = '0' + rand);
        return rand;
    }

    toJson() {
        return _.pick(this, ['length', 'min', 'max']);
    }
}


module.exports = IdGenerator;