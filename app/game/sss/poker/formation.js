const constants = require('../common/constants');
const i18n = require('../../../i18n');
const _ = require('underscore');
const ssscons = require('../common/constants');

class Formation {
    constructor(...cards) {
        this.cards = cards;
        this.type = ssscons.SSS.Formation.SP.type();
        this.name = ssscons.SSS.Formation.SP.name();
        this.resolve();
    }

    resolve() {
        let cards = [...this.cards].sort(c => c.getSortValue());
        if (this.cards.length == 13) {
            this.resolve13(cards);
        }
        else if (this.cards.length == 3) {
            this.resolve3(cards);
        }
        else if (this.cards.length = 5) {
            this.resolve5(cards);
        }
    }

    resolve13(cards) {
        if (this.IsZZQL(cards)) {
            this.type = ssscons.SSS.Formation.ZZQL.type();
            this.name = ssscons.SSS.Formation.ZZQL.name();
        }
        else if (this.IsQHong(cards)) {
            this.type = ssscons.SSS.Formation.QHONG.type();
            this.name = ssscons.SSS.Formation.QHONG.name();
        }
        else if (this.IsQHei(cards)) {
            this.type = ssscons.SSS.Formation.QHEI.type();
            this.name = ssscons.SSS.Formation.QHEI.name();
        }
        else if (this.IsQHong1H(cards)) {
            this.type = ssscons.SSS.Formation.QHONG1H.type();
            this.name = ssscons.SSS.Formation.QHONG1H.name();
        }
        else if (this.IsQHei1H(cards)) {
            this.type = ssscons.SSS.Formation.QHEI1H.type();
            this.name = ssscons.SSS.Formation.QHEI1H.name();
        }
        else if (this.IsYtl(cards)) {
            this.type = ssscons.SSS.Formation.YTL.type();
            this.name = ssscons.SSS.Formation.YTL.name();
        }
        else if (this.IsWdyk(cards)) {
            this.type = ssscons.SSS.Formation.WDYK.type();
            this.name = ssscons.SSS.Formation.WDYK.name();
        }
        else if (this.IsQd(cards)) {
            this.type = ssscons.SSS.Formation.QD.type();
            this.name = ssscons.SSS.Formation.QD.name();
        }
        else if (this.IsQx(cards)) {
            this.type = ssscons.SSS.Formation.QX.type();
            this.name = ssscons.SSS.Formation.QX.name();
        }
        else if (this.IsLdb(cards)) {
            this.type = ssscons.SSS.Formation.LDB.type();
            this.name = ssscons.SSS.Formation.LDB.name();
        }
        else if (this.IsSth(cards)) {
            this.type = ssscons.SSS.Formation.STH.type();
            this.name = ssscons.SSS.Formation.STH.name();
        }
        else if (this.IsSsz(cards)) {
            this.type = ssscons.SSS.Formation.SSZ.type();
            this.name = ssscons.SSS.Formation.SSZ.name();
        }
        else if (this.IsBx(cards)) {
            this.type = ssscons.SSS.Formation.BX.type();
            this.name = ssscons.SSS.Formation.BX.name();
        }
        else if (this.IsBd(cards)) {
            this.type = ssscons.SSS.Formation.BD.type();
            this.name = ssscons.SSS.Formation.BD.name();
        }
    }

    // 至尊青龙
    IsZZQL(cards) {
        return false;
    }

    // 全红
    IsQHong(cards) {
        return false;
    }

    // 全黑
    IsQHei(cards) {
        return false;
    }

    // 全红一黑
    IsQHong1H(cards) {
        return false;
    }

    // 全黑一红
    IsQHei1H(cards) {
        return false;
    }

    // 一条龙
    IsYtl(cards) {
        return false;
    }

    // 五对一刻
    IsWdyk(cards) {
        return false;
    }

    // 全大
    IsQd(cards) {
        return false;
    }

    // 全小
    IsQx(cards) {
        return false;
    }

    // 六对半
    IsLdb(cards) {
        return false;
    }

    // 三同花
    IsSth(cards) {
        return false;
    }

    // 三顺子
    IsSsz(cards) {
        return false;
    }

    // 半小
    IsBx(cards) {
        return false;
    }

    // 半大
    IsBd(cards) {
        return false;
    }

    resolve3(cards) {
        if (this.IsSt(cards)) {
            this.type = ssscons.SSS.Formation.ST.type();
            this.name = ssscons.SSS.Formation.ST.name();
        }
        else if (this.IsDz(cards)) {
            this.type = ssscons.SSS.Formation.DZ.type();
            this.name = ssscons.SSS.Formation.DZ.name();
        }
    }

    resolve5(cards) {
        if (this.IsWzz(cards)) {
            this.type = ssscons.SSS.Formation.WZZ.type();
            this.name = ssscons.SSS.Formation.WZZ.name();
        }
        else if (this.IsThs(cards)) {
            this.type = ssscons.SSS.Formation.THS.type();
            this.name = ssscons.SSS.Formation.THS.name();
        }
        else if (this.IsZd(cards)) {
            this.type = ssscons.SSS.Formation.ZD.type();
            this.name = ssscons.SSS.Formation.ZD.name();
        }
        else if (this.IsHl(cards)) {
            this.type = ssscons.SSS.Formation.HL.type();
            this.name = ssscons.SSS.Formation.HL.name();
        }
        else if (this.IsTh(cards)) {
            this.type = ssscons.SSS.Formation.TH.type();
            this.name = ssscons.SSS.Formation.TH.name();
        }
        else if (this.IsSz(cards)) {
            this.type = ssscons.SSS.Formation.SZ.type();
            this.name = ssscons.SSS.Formation.SZ.name();
        }
        else if (this.IsSt(cards)) {
            this.type = ssscons.SSS.Formation.ST.type();
            this.name = ssscons.SSS.Formation.ST.name();
        }
        else if (this.IsLd(cards)) {
            this.type = ssscons.SSS.Formation.LD.type();
            this.name = ssscons.SSS.Formation.LD.name();
        }
        else if (this.IsDz(cards)) {
            this.type = ssscons.SSS.Formation.DZ.type();
            this.name = ssscons.SSS.Formation.DZ.name();
        }
    }

    // 五张炸
    IsWzz(cards) {
        return false;
    }

    // 同花顺
    IsThs(cards) {
        return false;
    }

    // 炸弹
    IsZd(cards) {
        return false;
    }

    // 葫芦
    IsHl(cards) {
        return false;
    }

    // 同花
    IsTh(cards) {
        return false;
    }

    // 顺子
    IsSz(cards) {
        return false;
    }

    // 三条
    IsSt(cards) {
        return false;
    }

    // 两对
    IsLd(cards) {
        return false;
    }

    // 两对
    IsDz(cards) {
        return false;
    }

    getType() {
        return this.type;
    }

    getName() {
        return this.name;
    }

    getScore() {
        
    }

    // 庄 compare 闲
    compare(formation) {
        if (this.type != formation.type) {
            return this.type > formation.type ? 1 : -1;
        }

        let n = 0; //_.max(this.cards, c => c.getWeight()).getWeight() - _.max(formation.cards, c => c.getWeight()).getWeight();

        return n >= 0 ? 1 : -1;
    }

    toJson() {
        let json = {};
        json.type = this.type;
        json.name = this.name;
        return json;
    }
}

module.exports = Formation;