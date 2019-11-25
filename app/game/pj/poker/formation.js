const constants = require('../common/constants');
const i18n = require('../../../i18n');
const _ = require('underscore');
const p9cons = require('../common/constants');

class Formation {
    constructor(card1, card2) {
        this.cards = [card1, card2];
        this.resolve();
    }

    resolve() {
        let card1 = _.min(this.cards, c => c.getPoint());
        let card2 = _.max(this.cards, c => c.getPoint());

        if (card1.getPoint() == p9cons.Poker.XIAOHOU.point() && card2.getPoint() == p9cons.Poker.DAHOU.point()) {
            this.type = constants.Poker.Formation.ZZB.type();
            this.name = constants.Poker.Formation.ZZB.name();
        }
        else if (card1.getPoint() == p9cons.Poker.TIAN.point() && card2.getPoint() == p9cons.Poker.TIAN.point()) {
            this.type = constants.Poker.Formation.TIAN.type();
            this.name = constants.Poker.Formation.TIAN.name();
        }
        else if (card1.getPoint() == p9cons.Poker.DI.point() && card2.getPoint() == p9cons.Poker.DI.point()) {
            this.type = constants.Poker.Formation.DI.type();
            this.name = constants.Poker.Formation.DI.name();
        }
        else if (card1.getPoint() == p9cons.Poker.REN.point() && card2.getPoint() == p9cons.Poker.REN.point()) {
            this.type = constants.Poker.Formation.REN.type();
            this.name = constants.Poker.Formation.REN.name();
        }
        else if (card1.getPoint() == p9cons.Poker.HE.point() && card2.getPoint() == p9cons.Poker.HE.point()) {
            this.type = constants.Poker.Formation.HE.type();
            this.name = constants.Poker.Formation.HE.name();
        }
        else if (card1.getPoint() == p9cons.Poker.MEI.point() && card2.getPoint() == p9cons.Poker.MEI.point()) {
            this.type = constants.Poker.Formation.MEI.type();
            this.name = constants.Poker.Formation.MEI.name();
        }
        else if (card1.getPoint() == p9cons.Poker.CHANG.point() && card2.getPoint() == p9cons.Poker.CHANG.point()) {
            this.type = constants.Poker.Formation.CHANG.type();
            this.name = constants.Poker.Formation.CHANG.name();
        }
        else if (card1.getPoint() == p9cons.Poker.BANDENG.point() && card2.getPoint() == p9cons.Poker.BANDENG.point()) {
            this.type = constants.Poker.Formation.BANDENG.type();
            this.name = constants.Poker.Formation.BANDENG.name();
        }
        else if (card1.getPoint() == p9cons.Poker.FUTOU.point() && card2.getPoint() == p9cons.Poker.FUTOU.point()) {
            this.type = constants.Poker.Formation.FUTOU.type();
            this.name = constants.Poker.Formation.FUTOU.name();
        }
        else if (card1.getPoint() == p9cons.Poker.HONGTOU.point() && card2.getPoint() == p9cons.Poker.HONGTOU.point()) {
            this.type = constants.Poker.Formation.HONGTOU.type();
            this.name = constants.Poker.Formation.HONGTOU.name();
        }
        else if (card1.getPoint() == p9cons.Poker.GAOJIAO.point() && card2.getPoint() == p9cons.Poker.GAOJIAO.point()) {
            this.type = constants.Poker.Formation.GAOJIAO.type();
            this.name = constants.Poker.Formation.GAOJIAO.name();
        }
        else if (card1.getPoint() == p9cons.Poker.TONGCHUI.point() && card2.getPoint() == p9cons.Poker.TONGCHUI.point()) {
            this.type = constants.Poker.Formation.TONGCHUI.type();
            this.name = constants.Poker.Formation.TONGCHUI.name();
        }
        else if (card1.getPoint() == p9cons.Poker.HEI9.point() && card2.getPoint() == p9cons.Poker.HONG9.point()) {
            this.type = constants.Poker.Formation.Z9.type();
            this.name = constants.Poker.Formation.Z9.name();
        }
        else if (card1.getPoint() == p9cons.Poker.PING8.point() && card2.getPoint() == p9cons.Poker.XIE8.point()) {
            this.type = constants.Poker.Formation.Z8.type();
            this.name = constants.Poker.Formation.Z8.name();
        }
        else if (card1.getPoint() == p9cons.Poker.HEI7.point() && card2.getPoint() == p9cons.Poker.HONG7.point()) {
            this.type = constants.Poker.Formation.Z7.type();
            this.name = constants.Poker.Formation.Z7.name();
        }
        else if (card1.getPoint() == p9cons.Poker.HONG5.point() && card2.getPoint() == p9cons.Poker.HEI5.point()) {
            this.type = constants.Poker.Formation.Z5.type();
            this.name = constants.Poker.Formation.Z5.name();
        }
        else if ((card1.getPoint() == p9cons.Poker.TIAN.point() && card2.getValue() == 9) ||
            (card2.getPoint() == p9cons.Poker.TIAN.point() && card1.getValue() == 9)) {
            this.type = constants.Poker.Formation.TW.type();
            this.name = constants.Poker.Formation.TW.name();
        }
        else if ((card1.getPoint() == p9cons.Poker.DI.point() && card2.getValue() == 9) ||
            (card2.getPoint() == p9cons.Poker.DI.point() && card1.getValue() == 9)) {
            this.type = constants.Poker.Formation.DW.type();
            this.name = constants.Poker.Formation.DW.name();
        }
        else if ((card1.getPoint() == p9cons.Poker.TIAN.point() && card2.getValue() == 8) ||
            (card2.getPoint() == p9cons.Poker.TIAN.point() && card1.getValue() == 8)) {
            this.type = constants.Poker.Formation.TG.type();
            this.name = constants.Poker.Formation.TG.name();
        }
        else if ((card1.getPoint() == p9cons.Poker.DI.point() && card2.getValue() == 8) ||
            (card2.getPoint() == p9cons.Poker.DI.point() && card1.getValue() == 8)) {
            this.type = constants.Poker.Formation.DG.type();
            this.name = constants.Poker.Formation.DG.name();
        }
        else if (card1.getPoint() == p9cons.Poker.HEI7.point() && card2.getPoint() == p9cons.Poker.TIAN.point()) {
            this.type = constants.Poker.Formation.TG9.type();
            this.name = constants.Poker.Formation.TG9.name();
        }
        else if (card1.getPoint() == p9cons.Poker.DI.point() && card2.getPoint() == p9cons.Poker.GAOJIAO.point()) {
            this.type = constants.Poker.Formation.DG9.type();
            this.name = constants.Poker.Formation.DG9.name();
        }
        else {
            let point = (card1.getValue() + card2.getValue()) % 10;
            if (card1.getPoint() == p9cons.Poker.DAHOU.point() || card1.getPoint() == p9cons.Poker.XIAOHOU.point()) {
                point = _.max([point, (9 - card1.getValue() + card2.getValue()) % 10]);
            }
            else if (card2.getPoint() == p9cons.Poker.DAHOU.point() || card2.getPoint() == p9cons.Poker.XIAOHOU.point()) {
                point = _.max([point, (9 - card2.getValue() + card1.getValue()) % 10]);
            }

            this.type = point;
            switch (this.type) {
                case constants.Poker.Formation.P0.type():
                    this.name = constants.Poker.Formation.P0.name();
                    break;
                case constants.Poker.Formation.P1.type():
                    this.name = constants.Poker.Formation.P1.name();
                    break;
                case constants.Poker.Formation.P2.type():
                    this.name = constants.Poker.Formation.P2.name();
                    break;
                case constants.Poker.Formation.P3.type():
                    this.name = constants.Poker.Formation.P3.name();
                    break;
                case constants.Poker.Formation.P4.type():
                    this.name = constants.Poker.Formation.P4.name();
                    break;
                case constants.Poker.Formation.P5.type():
                    this.name = constants.Poker.Formation.P5.name();
                    break;
                case constants.Poker.Formation.P6.type():
                    this.name = constants.Poker.Formation.P6.name();
                    break;
                case constants.Poker.Formation.P7.type():
                    this.name = constants.Poker.Formation.P7.name();
                    break;
                case constants.Poker.Formation.P8.type():
                    this.name = constants.Poker.Formation.P8.name();
                    break;
                case constants.Poker.Formation.P9.type():
                    this.name = constants.Poker.Formation.P9.name();
                    break;
            }
        }
    }

    getType() {
        return this.type;
    }

    getName() {
        return this.name;
    }

    // 庄 compare 闲
    compare(formation) {
        if (this.type != formation.type) {
            return this.type > formation.type ? 1 : -1;
        }

        let n = _.max(this.cards, c => c.getWeight()).getWeight() - _.max(formation.cards, c => c.getWeight()).getWeight();
        
        return n >= 0 ? 1 : -1;
    }

    toJson() {
        let json = {};
        json.cards = _.map(this.cards, c => c.toJson(true));
        json.type = this.type;
        json.name = this.name;
        return json;
    }
}

module.exports = Formation;