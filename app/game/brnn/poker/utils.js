/**
 * 工具类
 */
class Utils {

    /**
     * 输出开奖区域 0-未中奖 1-开奖
     * @param {number} road 路单
     */
    static toOpenAreas(road) {
        return [road >> 3, road >> 2 & 1, road >> 1 & 1, road & 1];
    }

    constructor() {

    }
}

module.exports = Utils;
