const utils = require('../utils/index');
const _ = require('underscore');


class Gps {
    static fromJson(json) {
        if( !json ||
            !utils.isNumber(json.latitude) ||
            !utils.isNumber(json.longitude)) {
            return null;
        }

        return new Gps(json.latitude, json.longitude, utils.string.filterAddress(json.address));
    }

    constructor(latitude, longitude, address) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
    }

    distanceTo(g) {
        let lat = [this.latitude, g.latitude];
        let lng = [this.longitude, g.longitude];
        const R = 6378137;
        let dLat = (lat[1] - lat[0]) * Math.PI / 180;
        let dLng = (lng[1] - lng[0]) * Math.PI / 180;
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat[0] * Math.PI / 180) * Math.cos(lat[1] * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
        return Math.round(d);
    }

    toJson() {
        return _.pick(this, ['latitude', 'longitude', 'address']);
    }
}


module.exports = Gps;