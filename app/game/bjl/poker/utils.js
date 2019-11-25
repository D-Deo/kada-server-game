/**
 * 工具类
 */
class Utils {

    /**
     * 输出开奖区域 0-未中奖 1-开奖
     * @param {number} road 路单
     */
    static toOpenAreas(road) {
        return [road >> 7, road >> 6 & 1, road >> 5 & 1, road >> 4 & 1, road >> 3 & 1, road >> 2 & 1, road >> 1 & 1, road & 1];
    }

    constructor() {
        
    }
}

module.exports = Utils;
