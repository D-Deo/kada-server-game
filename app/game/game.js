class Game {
    constructor(type) {
        this.type = type;
        this.attrs = {};
        this.classes = {};
        this.datas = {};
        this.interfaces = {};
    }

    registerAttr(key, value) {
        this.attrs[key] = value;
    }

    getData(key) {
        return this.datas[key];
    }

    registerData(key, value) {
        this.datas[key] = value;
    }

    getClass(key) {
        return this.classes[key];
    }

    registerClass(key, value) {
        this.classes[key] = value;
    }

    getInterface(key) {
        return this.interfaces[key];
    }

    registerInterface(key, value) {
        this.interfaces[key] = value;
    }
}


module.exports = Game;