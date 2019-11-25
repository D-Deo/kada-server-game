const _ = require('underscore');
const p9cons = require('../common/constants');

class Card {
    constructor(p1, p2) {
        this.point = _.min([p1, p2]) * 10 + _.max([p1, p2]);
        this.value = (p1 + p2) % 10;
        this.init();
    }

    static create(point) {
        return new Card(Math.floor(point / 10), point % 10);
    }

    init() {
        switch (this.point) {
            case p9cons.Poker.TIAN.point():
                this.name = p9cons.Poker.TIAN.name();
                this.weight = p9cons.Poker.TIAN.weight();
                break;
            case p9cons.Poker.DI.point():
                this.name = p9cons.Poker.DI.name();
                this.weight = p9cons.Poker.DI.weight();
                break;
            case p9cons.Poker.REN.point():
                this.name = p9cons.Poker.REN.name();
                this.weight = p9cons.Poker.REN.weight();
                break;
            case p9cons.Poker.HE.point():
                this.name = p9cons.Poker.HE.name();
                this.weight = p9cons.Poker.HE.weight();
                break;
            case p9cons.Poker.MEI.point():
                this.name = p9cons.Poker.MEI.name();
                this.weight = p9cons.Poker.MEI.weight();
                break;
            case p9cons.Poker.CHANG.point():
                this.name = p9cons.Poker.CHANG.name();
                this.weight = p9cons.Poker.CHANG.weight();
                break;
            case p9cons.Poker.BANDENG.point():
                this.name = p9cons.Poker.BANDENG.name();
                this.weight = p9cons.Poker.BANDENG.weight();
                break;
            case p9cons.Poker.FUTOU.point():
                this.name = p9cons.Poker.FUTOU.name();
                this.weight = p9cons.Poker.FUTOU.weight();
                break;
            case p9cons.Poker.HONGTOU.point():
                this.name = p9cons.Poker.HONGTOU.name();
                this.weight = p9cons.Poker.HONGTOU.weight();
                break;
            case p9cons.Poker.GAOJIAO.point():
                this.name = p9cons.Poker.GAOJIAO.name();
                this.weight = p9cons.Poker.GAOJIAO.weight();
                break;
            case p9cons.Poker.TONGCHUI.point():
                this.name = p9cons.Poker.TONGCHUI.name();
                this.weight = p9cons.Poker.TONGCHUI.weight();
                break;
            case p9cons.Poker.HONG9.point():
                this.name = p9cons.Poker.HONG9.name();
                this.weight = p9cons.Poker.HONG9.weight();
                break;
            case p9cons.Poker.HEI9.point():
                this.name = p9cons.Poker.HEI9.name();
                this.weight = p9cons.Poker.HEI9.weight();
                break;
            case p9cons.Poker.PING8.point():
                this.name = p9cons.Poker.PING8.name();
                this.weight = p9cons.Poker.PING8.weight();
                break;
            case p9cons.Poker.XIE8.point():
                this.name = p9cons.Poker.XIE8.name();
                this.weight = p9cons.Poker.XIE8.weight();
                break;
            case p9cons.Poker.HONG7.point():
                this.name = p9cons.Poker.HONG7.name();
                this.weight = p9cons.Poker.HONG7.weight();
                break;
            case p9cons.Poker.HEI7.point():
                this.name = p9cons.Poker.HEI7.name();
                this.weight = p9cons.Poker.HEI7.weight();
                break;
            case p9cons.Poker.HONG5.point():
                this.name = p9cons.Poker.HONG5.name();
                this.weight = p9cons.Poker.HONG5.weight();
                break;
            case p9cons.Poker.HEI5.point():
                this.name = p9cons.Poker.HEI5.name();
                this.weight = p9cons.Poker.HEI5.weight();
                break;
            case p9cons.Poker.DAHOU.point():
                this.name = p9cons.Poker.DAHOU.name();
                this.weight = p9cons.Poker.DAHOU.weight();
                break;
            case p9cons.Poker.XIAOHOU.point():
                this.name = p9cons.Poker.XIAOHOU.name();
                this.weight = p9cons.Poker.XIAOHOU.weight();
                break;
        }
    }

    getPoint() {
        return this.point;
    }

    getValue() {
        return this.value;
    }

    getWeight() {
        return this.weight;
    }

    isWen() {
        switch (this.point) {
            case 66: return true;
            case 11: return true;
            case 44: return true;
            case 13: return true;
            case 55: return true;
            case 33: return true;
            case 22: return true;
            case 56: return true;
            case 46: return true;
            case 16: return true;
            case 15: return true;
        }

        return false;
    }

    toJson(real = false) {
        let json = {};
        if (real) {
            json.point = this.point;
            json.name = this.name;
        }
        else {
            json.point = -1;
            json.name = "";
        }

        return json;
    }
}

module.exports = Card;