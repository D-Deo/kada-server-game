let data = module.exports = {};


data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        standard: true,
        baseScore: 100,
        scoreMin: 1500,
        scoreMax: 0,
        roundCost: 0
    }
}, {
    id: 2,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        standard: true,
        baseScore: 500,
        scoreMin: 7500,
        scoreMax: 0,
        roundCost: 0
    }
}, {
    id: 3,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        standard: false,
        baseScore: 1000,
        scoreMin: 15000,
        scoreMax: 0,
        roundCost: 0,
    }
}, {
    id: 999,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        standard: false,
        baseScore: 1000,
        scoreMin: 0,
        scoreMax: 0,
        roundCost: 0,
        free: true
    }
}];