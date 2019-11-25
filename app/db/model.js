const db = require('./index');
const Sequelize = require('sequelize');


let model = module.exports = {};


model.User = db.sequelize.define('user', {
    account: {
        allowNull: false,
        type: Sequelize.STRING(64),
        unqiue: true
    },

    desp: {
        defaultValue: null,
        type: Sequelize.STRING(255)
    },

    device: {
        defaultValue: null,
        type: Sequelize.STRING(255)
    },

    deviceid: {
        defaultValue: null,
        type: Sequelize.STRING(255)
    },

    head: {
        defaultValue: null,
        type: Sequelize.TEXT
    },

    ip: {
        defaultValue: null,
        type: Sequelize.STRING(255)
    },

    name: {
        defaultValue: null,
        type: Sequelize.STRING(255)
    },

    nick: {
        allowNull: false,
        type: Sequelize.STRING(255)
    },

    password: {
        defaultValue: null,
        type: Sequelize.STRING(255)
    },

    phone: {
        defaultValue: null,
        type: Sequelize.STRING(255)
    },

    sex: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER(11)
    },

    recommender: {
        defaultValue: null,
        type: Sequelize.INTEGER(11)
    },

    role: {
        allowNull: false,
        type: Sequelize.INTEGER(11)
    },

    state: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER(11)
    },

    type: {
        allowNull: false,
        type: Sequelize.INTEGER(11)
    },

    timestamp: {
        allowNull: false,
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
    },

    password2: {
        defaultValue: null,
        type: Sequelize.STRING(255)
    },

    bankId: {
        defaultValue: null,
        type: Sequelize.INTEGER,
    }
}, {
        tableName: 'user'
    });


model.UserLoginRecord = db.sequelize.define('user_login_record', {
    userId: Sequelize.INTEGER,
    ip: Sequelize.STRING,
    device: Sequelize.STRING,
    deviceinfo: Sequelize.STRING,
    login: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    logout: { type: Sequelize.DATE, defaultValue: null },
    game: { type: Sequelize.STRING, defaultValue: null },
    area: { type: Sequelize.INTEGER, defaultValue: null }
}, { tableName: 'user_login_record' });


model.UserRebateDaily = db.sequelize.define('user_rebate_daily', {
    userId: Sequelize.INTEGER,

    timestamp: Sequelize.DATE,

    count: Sequelize.INTEGER
}, {
        tableName: 'user_rebate_daily'
    });


model.UserRebateRecord = db.sequelize.define('user_rebate_record', {
    userId: Sequelize.INTEGER,

    index: Sequelize.INTEGER,

    from: Sequelize.DATE,

    to: Sequelize.DATE,

    recommender: Sequelize.TEXT,

    children: Sequelize.INTEGER,

    descendants: Sequelize.INTEGER,

    cachieve: Sequelize.INTEGER,

    sachieve: Sequelize.INTEGER,

    tachieve: Sequelize.INTEGER,

    rate: Sequelize.DECIMAL,

    rebate: Sequelize.INTEGER
}, {
        tableName: 'user_rebate_record'
    });


model.Item = db.sequelize.define('item', {
    itemId: {
        allowNull: false,
        type: Sequelize.INTEGER(11)
    },

    count: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER(11)
    }
}, {
        tableName: 'item'
    });


model.ItemRecord = db.sequelize.define('item_record', {
    userId: { allowNull: false, type: Sequelize.INTEGER },
    itemId: { allowNull: false, type: Sequelize.INTEGER },
    count: { allowNull: false, type: Sequelize.INTEGER },
    remain: { allowNull: false, type: Sequelize.INTEGER },
    game: { defaultValue: null, type: Sequelize.STRING },
    guildId: { defaultValue: null, type: Sequelize.INTEGER },
    from: { defaultValue: null, type: Sequelize.STRING },
    reason: { defaultValue: null, type: Sequelize.INTEGER },
    timestamp: { defaultValue: null, type: Sequelize.DATE },
    memo: { defaultValue: null, type: Sequelize.STRING },
}, { tableName: 'item_record' });

model.RoomParams = db.sequelize.define('room_params', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    area: Sequelize.INTEGER,
    name: Sequelize.STRING,
    play: Sequelize.INTEGER,
    // baseScore: { type: Sequelize.INTEGER, defaultValue: 0 },
    // scoreMin: { type: Sequelize.INTEGER, defaultValue: 0 },
    // scoreMax: { type: Sequelize.INTEGER, defaultValue: 0 },
    options: { type: Sequelize.TEXT, defaultValue: null },
    // bankerLimit: { type: Sequelize.INTEGER, defaultValue: 0 },
    // bankerCount: { type: Sequelize.INTEGER, defaultValue: 0 },
    // betOptions: { type: Sequelize.STRING, defaultValue: null },
    game: Sequelize.STRING,
}, { tableName: 'room_params' });

model.RoomRecord = db.sequelize.define('room_record', {
    uuid: Sequelize.STRING,
    game: Sequelize.STRING,
    roomId: Sequelize.STRING,
    owner: { defaultValue: null, type: Sequelize.INTEGER },
    guildId: { defaultValue: null, type: Sequelize.INTEGER },
    rounds: { defaultValue: null, type: Sequelize.INTEGER },
    balance: { defaultValue: null, type: Sequelize.TEXT },
    state: { defaultValue: null, type: Sequelize.TEXT },
    attrs: { defaultValue: null, type: Sequelize.TEXT },
    createTime: { defaultValue: null, type: Sequelize.DATE },
    beginTime: { defaultValue: null, type: Sequelize.DATE },
    endTime: { defaultValue: null, type: Sequelize.DATE }
}, { tableName: 'room_record' });

model.RoomIncomeRecord = db.sequelize.define('room_income_record', {
    room: Sequelize.STRING,
    userId: Sequelize.INTEGER,
    itemId: Sequelize.INTEGER,
    count: Sequelize.INTEGER,
    timestamp: Sequelize.DATE,
    gameId: Sequelize.STRING,
    cost: Sequelize.INTEGER,
    score: Sequelize.INTEGER,
    open: { type: Sequelize.TEXT, defaultValue: Sequelize.NONE },
    game: Sequelize.STRING,
    area: Sequelize.INTEGER,
    coin: Sequelize.INTEGER,
    jackpot: { type: Sequelize.BIGINT, defaultValue: 0 },
}, { tableName: 'room_income_record' });

model.Setting = db.sequelize.define('setting', {
    key: Sequelize.STRING,

    value: Sequelize.TEXT,

    desp: Sequelize.TEXT
}, { tableName: 'setting' });

model.UserPay = db.sequelize.define('user_pay', {
    id: { type: Sequelize.STRING(255), primaryKey: true },
    userId: Sequelize.INTEGER,
    money: Sequelize.BIGINT,
    state: Sequelize.INTEGER,
    push: Sequelize.INTEGER,
}, { tableName: 'user_pay' });

model.Problem = db.sequelize.define('problem', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    reporterId: Sequelize.INTEGER,

    type: Sequelize.INTEGER,

    msg: Sequelize.STRING(255),

    status: Sequelize.INTEGER,

    feedback: Sequelize.STRING(255)
}, { tableName: 'problem' });

model.UserBank = db.sequelize.define('user_bank', {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    userId: Sequelize.INTEGER,
    bank: Sequelize.STRING(255),
    bankNo: Sequelize.INTEGER,
    createTime: Sequelize.DATE,
    updateTime: Sequelize.DATE
}, { tableName: 'user_bank' });

// 【用户】登录奖励记录表
model.UserLoginReward = db.sequelize.define('user_login_reward', {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    userId: Sequelize.INTEGER,
    day: Sequelize.INTEGER,
    coin: Sequelize.BIGINT,
    logTime: Sequelize.DATE,
}, { tableName: 'user_login_reward' });

// 【活动】登录奖励配置表
model.ActivityLogin = db.sequelize.define('activity_login', {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    coin: Sequelize.INTEGER,
}, { tableName: 'activity_login' });

model.User.hasMany(model.Item);
