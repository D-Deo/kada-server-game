const server = require('./index');


let item = module.exports = {};


item.changeItems = (userId, items, exts) => {
    return server.postp('item/change', {userId, items, exts});
};


item.changeItem = (userId, itemId, count, exts) => {
    let items = {};
    items[itemId] = count;
    return server.postp('item/change', {userId, items, exts});
};