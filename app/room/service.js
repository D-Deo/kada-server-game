const Component = require('./component');
const pomelo = require('pomelo');


class Service extends Component {
    constructor(room) {
        super(room);
        this.service = pomelo.app.get('roomService');
    }

    clear() {
        this.service.removeRoom(this.room.getGame(), this.room.getId());
    }
}


module.exports = Service;