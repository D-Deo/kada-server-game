let data = module.exports = {};


data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 100,
        scoreMin: 5000,
        scoreMax: 50000,
        roundCost: 0,
    }
}, {
    id: 2,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 500,
        scoreMin: 25000,
        scoreMax: 250000,
        roundCost: 0
    }
}, {
    id: 3,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 1000,
        scoreMin: 50000,
        scoreMax: 0,
        roundCost: 0,
    }
}, {
    id: 999,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 1000,
        scoreMin: 0,
        scoreMax: 0,
        roundCost: 0,
        free: true
    }
}];