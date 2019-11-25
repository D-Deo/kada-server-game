let data = module.exports = {};


data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        capacity: 1,
        roundCost: 0,
        baseScore: 10,
        scoreMin: 100,
        scoreMax: 0,
        betOptions: [
            10,
            50,
            100,
            500
        ]
    }
}, {
    id: 2,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        capacity: 1,
        roundCost: 0,
        baseScore: 100,
        scoreMin: 1000,
        scoreMax: 0,
        betOptions: [
            100,
            500,
            1000,
            5000
        ]
    }
}, {
    id: 3,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        capacity: 1,
        roundCost: 0,
        baseScore: 1000,
        scoreMin: 10000,
        scoreMax: 0,
        betOptions: [
            1000,
            5000,
            10000,
            50000
        ]
    }
}];