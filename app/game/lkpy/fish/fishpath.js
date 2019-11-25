class FishPath {
    constructor(kind, id, direction) {
        this.kind = kind;
        this.id = id;
        this.direction = direction;
    }

    toJson() {
        let json = {};
        json.kind = this.kind;
        json.id = this.id;
        json.direction = this.direction;
        return json;
    }
}

module.exports = FishPath;