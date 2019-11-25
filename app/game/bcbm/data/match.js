let data = module.exports = {};

data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        created: true,
        baseScore: 10,
        scoreMin: 100,
        scoreMax: 0,
        bankerLimit: 100000,
        bankerCount: 10,
        betOptions: [
            10,
            100,
            1000,
            10000
        ],
        roundCost: 0
    }
}];