const _ = require('underscore');

let constants = module.exports = {};

// 房间最大人数
constants.ROOM_CAPACITY = _.constant(4);
constants.MAX_FISH_COUNT = _.constant(100);	//场景最大支持鱼数量

constants.MAX_SMALL_PATH_COUNT = _.constant(208); // 轨迹数量
constants.MAX_BIG_PATH_COUNT = _.constant(130); // 轨迹数量
constants.MAX_HUGE_PATH_COUNT = _.constant(62); // 轨迹数量
constants.MAX_SPECIAL_PATH_COUNT = _.constant(24); // 轨迹数量
constants.WAIT_CLIENT_ANI_TIME = _.constant(6);
constants.MAX_SYNC_FISH_COUNT = _.constant(50);

constants.RoomState = {};
constants.RoomState.WAIT = _.constant(0); // 等待状态
constants.RoomState.FREE = _.constant(1); // 自由捕鱼状态
constants.RoomState.LOAD = _.constant(2); // 切换场景状态
constants.RoomState.SHOAL_1 = _.constant(3); // 鱼群状态
constants.RoomState.SHOAL_2 = _.constant(4); // 鱼群状态
constants.RoomState.SHOAL_3 = _.constant(5); // 鱼群状态
constants.RoomState.SHOAL_4 = _.constant(6); // 鱼群状态
constants.RoomState.SHOAL_5 = _.constant(7); // 鱼群状态
constants.RoomState.FLEE = _.constant(8); // 鱼群逃跑状态

constants.SHOAL_KIND_1 = _.constant(1); // 企鹅场景
constants.SHOAL_KIND_2 = _.constant(2); // 平衡虾场景
constants.SHOAL_KIND_3 = _.constant(3); // 两条鱼圈交接场景
constants.SHOAL_KIND_4 = _.constant(4); // 交叉鱼阵场景
constants.SHOAL_KIND_5 = _.constant(5); // 两条鱼圈旋转场景

constants.FISH_KIND_1 = _.constant(1);
constants.FISH_KIND_2 = _.constant(2);
constants.FISH_KIND_3 = _.constant(3);
constants.FISH_KIND_4 = _.constant(4);
constants.FISH_KIND_5 = _.constant(5);
constants.FISH_KIND_6 = _.constant(6);
constants.FISH_KIND_7 = _.constant(7);
constants.FISH_KIND_8 = _.constant(8);
constants.FISH_KIND_9 = _.constant(9);
constants.FISH_KIND_10 = _.constant(10);
constants.FISH_KIND_11 = _.constant(11);
constants.FISH_KIND_12 = _.constant(12);
constants.FISH_KIND_13 = _.constant(13);
constants.FISH_KIND_14 = _.constant(14);
constants.FISH_KIND_15 = _.constant(15);
constants.FISH_KIND_16 = _.constant(16);
constants.FISH_KIND_17 = _.constant(17);
constants.FISH_KIND_18 = _.constant(18);
constants.FISH_KIND_19 = _.constant(19);
constants.FISH_KIND_20 = _.constant(20); // 企鹅
constants.FISH_KIND_21 = _.constant(21); // 李逵
constants.FISH_KIND_22 = _.constant(22); // 定屏炸弹
constants.FISH_KIND_23 = _.constant(23); // 局部炸弹
constants.FISH_KIND_24 = _.constant(24); // 超级炸弹
constants.FISH_KIND_25 = _.constant(25); // 大三元1
constants.FISH_KIND_26 = _.constant(26); // 大三元2
constants.FISH_KIND_27 = _.constant(27); // 大三元3
constants.FISH_KIND_28 = _.constant(28); // 大四喜1
constants.FISH_KIND_29 = _.constant(29); // 大四喜2
constants.FISH_KIND_30 = _.constant(30); // 大四喜3
constants.FISH_KIND_31 = _.constant(31); // 鱼王1
constants.FISH_KIND_32 = _.constant(32); // 鱼王2
constants.FISH_KIND_33 = _.constant(33); // 鱼王3
constants.FISH_KIND_34 = _.constant(34); // 鱼王4
constants.FISH_KIND_35 = _.constant(35); // 鱼王5
constants.FISH_KIND_36 = _.constant(36); // 鱼王6
constants.FISH_KIND_37 = _.constant(37); // 鱼王7
constants.FISH_KIND_38 = _.constant(38); // 鱼王8
constants.FISH_KIND_39 = _.constant(39); // 鱼王9
constants.FISH_KIND_40 = _.constant(40); // 鱼王10

constants.FISH_SCORE_1 = _.constant(2);
constants.FISH_SCORE_2 = _.constant(3);
constants.FISH_SCORE_3 = _.constant(4);
constants.FISH_SCORE_4 = _.constant(5);
constants.FISH_SCORE_5 = _.constant(6);
constants.FISH_SCORE_6 = _.constant(7);
constants.FISH_SCORE_7 = _.constant(8);
constants.FISH_SCORE_8 = _.constant(9);
constants.FISH_SCORE_9 = _.constant(10);
constants.FISH_SCORE_10 = _.constant(11);
constants.FISH_SCORE_11 = _.constant(12);
constants.FISH_SCORE_12 = _.constant(15);
constants.FISH_SCORE_13 = _.constant(18);
constants.FISH_SCORE_14 = _.constant(20);
constants.FISH_SCORE_15 = _.constant(25);
constants.FISH_SCORE_16 = _.constant(30);
constants.FISH_SCORE_17 = _.constant(35);
constants.FISH_SCORE_18 = _.constant(40);
constants.FISH_SCORE_18_MAX = _.constant(150);
constants.FISH_SCORE_19 = _.constant(120);
constants.FISH_SCORE_19_MAX = _.constant(150);
constants.FISH_SCORE_20 = _.constant(150); // 企鹅
constants.FISH_SCORE_21 = _.constant(40); // 李逵
constants.FISH_SCORE_21_MAX = _.constant(300); // 李逵
constants.FISH_SCORE_22 = _.constant(20); // 定屏炸弹
constants.FISH_SCORE_23 = _.constant(0); // 局部炸弹
constants.FISH_SCORE_24 = _.constant(0); // 超级炸弹
constants.FISH_SCORE_25 = _.constant(12); // 大三元1
constants.FISH_SCORE_26 = _.constant(15); // 大三元2
constants.FISH_SCORE_27 = _.constant(21); // 大三元3
constants.FISH_SCORE_28 = _.constant(24); // 大四喜1
constants.FISH_SCORE_29 = _.constant(32); // 大四喜2
constants.FISH_SCORE_30 = _.constant(40); // 大四喜3
constants.FISH_SCORE_31 = _.constant(0); // 鱼王1
constants.FISH_SCORE_32 = _.constant(0); // 鱼王2
constants.FISH_SCORE_33 = _.constant(0); // 鱼王3
constants.FISH_SCORE_34 = _.constant(0); // 鱼王4
constants.FISH_SCORE_35 = _.constant(0); // 鱼王5
constants.FISH_SCORE_36 = _.constant(0); // 鱼王6
constants.FISH_SCORE_37 = _.constant(0); // 鱼王7
constants.FISH_SCORE_38 = _.constant(0); // 鱼王8
constants.FISH_SCORE_39 = _.constant(0); // 鱼王9
constants.FISH_SCORE_40 = _.constant(0); // 鱼王10

constants.PathKind = {
    SPECIAL: _.constant(1),
    SMALL: _.constant(2),
    BIG: _.constant(3),
    HUGE: _.constant(4),
    SHOAL_1: _.constant(5),
    SHOAL_2: _.constant(6),
    SHOAL_3: _.constant(7),
    SHOAL_4: _.constant(8),
    SHOAL_5: _.constant(9),
}

//子弹类型
constants.BULLET_NORMAL = _.constant(1); // 子弹类型 正常
constants.BULLET_CANNON = _.constant(2); // 子弹类型 离子

// 房间状态倒计时
constants.RoomStateInterval = {
    /** 捕鱼时间 */
    WAIT: _.constant(1000), // 等待玩家1秒
    FREE: _.constant(120000), // 捕鱼场景120秒
    FLEE: _.constant(5000), // 鱼群逃跑5秒
    LOAD: _.constant(6000), // 切换场景6秒
    SHOAL_1: _.constant(42000), // 企鹅场景48秒
    SHOAL_2: _.constant(60000), // 平衡虾场景63秒
    SHOAL_3: _.constant(40000), // 两条鱼圈交接场景46秒
    SHOAL_4: _.constant(47000), // 交叉鱼阵场景53秒
    SHOAL_5: _.constant(27000), // 两条鱼圈旋转场景33秒
};

// constants.Interval = {
//     SMALL_FISH: _.constant(3000), // 小型鱼3秒
//     MEDIUM_FISH: _.constant(5000), // 中型鱼5秒
//     FISH_18: _.constant(63000), // 
//     FISH_19: _.constant(80000), // 
//     FISH_20: _.constant(200000), // 一般不出
//     FISH_KING: _.constant(19000), // 鱼王
//     FISH_BOMB: _.constant(45000), // 鱼王
//     FISH_LOCK: _.constant(40000), // 鱼王
//     FISH_SUPERBOMB: _.constant(50000), // 鱼王
//     FISH_BOSS: _.constant(30000), // 李逵
//     FISH_3YUAN: _.constant(5000), // 大三元
//     FISH_4XI: _.constant(5000), // 大四喜
//     FREEZE: _.constant(10000), // 冰冻效果
//     CANNON: _.constant(10000)
// };

constants.Interval = {
    SMALL_FISH: _.constant(10000), // 小型鱼3秒
    MEDIUM_FISH: _.constant(20000), // 中型鱼5秒
    FISH_18: _.constant(63000), // 
    FISH_19: _.constant(80000), // 
    FISH_20: _.constant(200000), // 一般不出
    FISH_KING: _.constant(19000), // 鱼王
    FISH_BOMB: _.constant(45000), // 鱼王
    FISH_LOCK: _.constant(40000), // 鱼王
    FISH_SUPERBOMB: _.constant(50000), // 鱼王
    FISH_BOSS: _.constant(40000), // 李逵
    FISH_3YUAN: _.constant(30000), // 大三元
    FISH_4XI: _.constant(30000), // 大四喜
    FREEZE: _.constant(10000), // 冰冻效果
    CANNON: _.constant(10000)
};

constants.FreezeFishInterval = _.constant(10000); // 定身10秒