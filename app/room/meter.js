const Component = require('./component');


class Meter extends Component {
    constructor(room) {
        super(room);
    }

    init() {
        super.init();

        this.diamondRecord = {};
    }

    getDiamondRecord(userId) {
        return this.diamondRecord[userId] || 0;
    }

    recordDiamond(userId, count) {
        this.diamondRecord[userId]  = this.diamondRecord[userId] || 0;
        this.diamondRecord[userId] += count;
    }

    result(balance) {
        return balance;
    }
}


module.exports = Meter;