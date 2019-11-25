let data = module.exports = {};


data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        created: true,
        drawReturn: true,
        threeKing: false,
        baseScore: 100,
        scoreMin: 100,
        scoreMax: 0,
        bankerLimit: 0,
        roundCost: 0,
        bankerCount: 0,
        betOptions: [
            100,
            1000,
            10000,
            100000
        ]
    }
}];