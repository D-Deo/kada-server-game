let data = module.exports = {};


data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        standard: true,
        baseScore: 10,
        scoreMin: 100,
        scoreMax: 0,
        roundCost: 0,
        capacity: 3,
        blacklist: false,
        wash: true,
    }
}, {
    id: 2,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        standard: true,
        baseScore: 100,
        scoreMin: 1000,
        scoreMax: 0,
        roundCost: 0,
        capacity: 3,
        blacklist: true,
        wash: true,
    }
}, {
    id: 3,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        standard: true,
        baseScore: 1000,
        scoreMin: 10000,
        scoreMax: 0,
        roundCost: 0,
        capacity: 3,
        blacklist: true,
        wash: true,
    }
}, {
    id: 999,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        standard: true,
        baseScore: 1000,
        scoreMin: 0,
        scoreMax: 0,
        roundCost: 0,
        capacity: 3,
        free: true,
        wash: false,
    }
}];