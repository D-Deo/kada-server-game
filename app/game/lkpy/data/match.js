let data = module.exports = {};


data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 10,
        scoreMin: 1000,
        scoreMax: 0,
        betOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
}, {
    id: 2,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 100,
        scoreMin: 10000,
        scoreMax: 0,
        betOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
}, {
    id: 3,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 1000,
        scoreMin: 50000,
        scoreMax: 0,
        betOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    }
}, {
    id: 999,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 1000,
        scoreMin: 0,
        scoreMax: 0,
        betOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        free: true
    }
}];