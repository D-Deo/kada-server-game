let data = module.exports = {};


data.zone = {};


data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        created: true,
        baseScore: 1,
        scoreMin: 0,
        betOptions: [
            100,
            1000,
            5000,
            10000
        ],
        roundCost: 0,
    }
}];