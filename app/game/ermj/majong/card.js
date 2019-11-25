
const cons = require('./majongConstants');
const _ = require('underscore');

class card {
    constructor(suit, point, index = 0) {
        this.suit = suit; //类型，0万1筒2索3字
        this.point = point; //点数，1-9,suit==3时 point1-9为东 南 西 北 中 发 白 季节 花
        this.index = index; //序号
        this.ch = this.toCH();
    }

    static createCard(value) {
        return new card(Math.floor(value / 100),
            Math.floor(value / 10) % 10,
            value % 10);
    }

    isWind() {
        return this.suit == cons.CardSuit.WIND() && this.point != 8 && this.point != 9;
    }

    isArrow() {
        return this.suit == cons.CardSuit.WIND() && this.point >= 5 && this.point <= 7;
    }

    isFlower() {
        if (this.suit == cons.CardSuit.WIND()) {
            if (this.point == 8 || this.point == 9) {
                // 花牌
                return true;
            }
        }

        return false;
    }

    is19() {
        return this.point == 1 || this.point == 9 || this.isWind();
    }

    getCH() {
        return this.ch;
    }

    toCH() {
        if (this.point < 1 || this.point > 9 || this.index < 0 || this.index > 3) {
            return 'X';
        }

        let s = '';
        switch (this.suit) {
            case cons.CardSuit.WAN():
                s = s + cons.CardSuit.NUMCH().charAt(this.point - 1) + '万';
                break;
            case cons.CardSuit.TONG():
                s = s + cons.CardSuit.NUMCH().charAt(this.point - 1) + '筒';
                break;
            case cons.CardSuit.SUO():
                s = s + cons.CardSuit.NUMCH().charAt(this.point - 1) + '条';
                break;
            case cons.CardSuit.WIND():
                if (this.point <= 7) {
                    s = s + cons.CardSuit.WINDCH().charAt(this.point - 1);
                }
                else if (this.point == 8) {
                    s = s + cons.CardSuit.FLOWERCH().charAt(this.index);
                }
                else if (this.point == 9) {
                    s = s + cons.CardSuit.FLOWERCH().charAt(this.index + 4);
                }
                break;
        }

        return s;
    }

    getValue() {
        return 100 * this.suit + 10 * this.point + this.index;
    }

    toJson(real = true) {
        let json = {};
        if (real) {
            json.suit = this.suit;
            json.point = this.point;
            json.index = this.index;
            json.value = this.getValue();
        }
        else {
            json.suit = -1;
            json.point = -1;
            json.index = -1;
            json.value = -1;
        }

        return json;
    }
}

module.exports = card;