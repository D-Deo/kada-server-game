let data = module.exports = {};


data.zone = {};
data.zone.areas = [{
    id: 1,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        dismissable: true,
        baseScore: 10,
        scoreMin: 1000,
        scoreMax: 0,
        bankerLimit: 50000,
        roundCost: 0,
        bankerCount: 15,
        betOptions: [
            10,
            50,
            100,
            1000
        ]
    }
}, {
    id: 2,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        dismissable: true,
        baseScore: 50,
        scoreMin: 5000,
        scoreMax: 0,
        bankerLimit: 50000,
        roundCost: 0,
        bankerCount: 15,
        betOptions: [
            10,
            50,
            100,
            1000
        ]
    }
}, {
    id: 3,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        dismissable: true,
        baseScore: 100,
        scoreMin: 10000,
        scoreMax: 0,
        bankerLimit: 50000,
        roundCost: 0,
        bankerCount: 15,
        betOptions: [
            10,
            50,
            100,
            1000
        ]
    }
}, {
	id: 999,
    idGenerator: { length: 10, min: 1000000 },
    params: {
        dismissable: true,
        baseScore: 100,
        scoreMin: 0,
        scoreMax: 0,
        bankerLimit: 0,
        roundCost: 0,
        bankerCount: 15,
        betOptions: [
            10,
            50,
            100,
            1000
        ]
    }
}];