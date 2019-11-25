const Component = require('./component');
const constants = require('../common/constants');
const utils = require('../utils/index');


class ChatManager extends Component {
    constructor(room) {
        super(room);
    }

    chat(userId, type, content, next) {
        let seat = this.room.getComp('seat').getSeatByUserId(userId);
        if(!seat) {
            utils.nextError(next);
            return;
        }

        if(!utils.isNumber(type, constants.Chat.EMOJI(), constants.Chat.VOICE())) {
            utils.nextError(next);
            return;
        }

        if((type === constants.Chat.EMOJI() || type === constants.Chat.DIALECT()) && !utils.isNumber(type, 0, 99)) {
            utils.nextError(next);
            return;
        }

        if((type === constants.Chat.TYPE()) && !utils.isString(content, 1, 30)) {
            utils.nextError(next);
            return;
        }

        if((type === constants.Chat.VOICE()) && !utils.isString(content)) {
            utils.nextError(next);
            return;
        }

        this.room.emit(constants.RoomEvent.ROOM_ACTION(), constants.RoomAction.CHAT(), {
            seat: seat.getIndex(),
            type: type,
            content: content
        });
        utils.nextOK(next);
    }
}


module.exports = ChatManager;