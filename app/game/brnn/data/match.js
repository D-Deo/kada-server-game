let data = module.exports = {};


data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        created: true,
        standard: true,
        baseMulti: 1,
        baseScore: 100,
        scoreMin: 500,
        scoreMax: 0,
        bankerLimit: 0,
        bankerCount: 0,
        betOptions: [
            100,
            500,
            1000,
            5000
        ]
    }
}, {
    id: 2,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        created: true,
        standard: true,
        baseMulti: 2,
        baseScore: 100,
        scoreMin: 1000,
        scoreMax: 0,
        bankerLimit: 0,
        bankerCount: 0,
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
        created: true,
        standard: false,
        baseMulti: 1,
        baseScore: 100,
        scoreMin: 500,
        scoreMax: 0,
        bankerLimit: 0,
        bankerCount: 0,
        betOptions: [
            100,
            500,
            1000,
            5000
        ]
    }
}];