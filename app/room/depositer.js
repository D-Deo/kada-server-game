// const cons = require('../common/constants');
// const dao = require('../dao/item');
// const rpc = require('../rpc/user');
// const _ = require('underscore');
//
//
// let depositer = module.exports = {};
//
//
// depositer.charge = (userId, deposit, count) => {
//     let remain = count;
//     _.each(deposit.items, (item) => {
//         let c = _.min([item.count, remain])
//         if(c <= 0) {
//             return;
//         }
//
//         item.count -= c;
//         dao.record(userId, null, item.id, -c, -1, cons.ItemChangeReason.PLAY());
//     });
// };
//
//
// depositer.undeposit = (room) => {
//     let deposit = room.getAttr('deposit');
//     if(!deposit) {
//         return;
//     }
//
//     let items = {};
//     _.each(deposit.items, (item) => {
//         if(item.count <= 0) {
//             return;
//         }
//
//         items[item.id] = item.count;
//     });
//     rpc.changeItems(room.getAttr('owner'), items, cons.ItemChangeReason.UNDEPOSIT());
// };