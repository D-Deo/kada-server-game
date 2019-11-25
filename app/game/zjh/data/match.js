let data = module.exports = {};


data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 100,
        scoreMin: 5000,
        scoreMax: 0,
        betOptions: [
            200,
            400,
            600,
            800,
            1000
        ],
        roundCost: 0,
        roundMax: 20,
        lookTurn: true
    }
}, {
    id: 2,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 500,
        scoreMin: 30000,
        scoreMax: 0,
        betOptions: [
            1000,
            2000,
            3000,
            4000,
            5000
        ],
        roundCost: 0,
        roundMax: 20,
        lookTurn: true
    }
}, {
    id: 3,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 1000,
        scoreMin: 60000,
        scoreMax: 0,
        betOptions: [
            2000,
            4000,
            6000,
            8000,
            10000
        ],
        roundMax: 20,
        roundCost: 0,
        lookTurn: true
    }
}, {
    id: 999,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        baseScore: 1000,
        scoreMin: 0,
        scoreMax: 0,
        betOptions: [
            2000,
            4000,
            6000,
            8000,
            10000
        ],
        roundMax: 20,
        roundCost: 0,
        lookTurn: true,
        free: true
    }
}];