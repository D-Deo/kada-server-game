const UserScore = require('./userScore');
const UserScore_Item = require('./userScore_Item');


module.exports = {};


module.exports.create = (room, user, score) => {
    if (room.getAttr('free')) {
        return UserScore.create(room, user, 1000000);
    } else if (score) {
        return UserScore_Item.create(room, user, score.id, score.count);
    } else {
        return UserScore.create(room, user);
    }
};