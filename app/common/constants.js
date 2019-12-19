const i18n = require('../i18n');
const _ = require('underscore');


/**
 * @apiDefine Room
 * 房间
 */


/**
 * @apiDefine User
 * 玩家
 */


/**
 * @apiDefine UserPush
 * 玩家推送
 */


let constants = module.exports = {};


constants.GAME_FEE = _.constant(0.05);
constants.GUILD_MAX = _.constant(10);
constants.GUILD_AGENT_MAX = _.constant(20);
constants.GUILD_MEMBER_MAX = _.constant(50);
constants.GUILD_ROOM_AGENT_MAX = _.constant(20);
constants.MAIL_INTERVAL = _.constant(1000 * 60 * 60 * 24 * 10);
constants.MATCH_SCOPE = _.constant(6);
constants.MATCH_UPDATE_INTERVAL = _.constant(3000);
constants.NEW_USER_GOLD = _.constant(0);
constants.NEW_USER_DIAMOND = _.constant(30);
constants.NEW_USER_BANK = _.constant(0);
constants.PRIVATE_ROOM_ID_LENGTH = _.constant(6);
constants.PRIVATE_ROOM_ID_RETRYS = _.constant(10);
constants.RECOMMENDER_REWARD_ITEM = _.constant(1);
constants.RECOMMENDER_REWARD_COUNT = _.constant(500);
constants.REQUEST_FREQUENCY = _.constant(500);
constants.ROOM_AGENT_MAX = _.constant(10);
constants.ROOM_DISMISS_INTERVAL = _.constant(120000);
constants.ROOM_ID_LENGTH = _.constant(10);
constants.ROOM_ID_RETRY = _.constant(10);
constants.ROOM_UPDATE_INTERVAL = _.constant(100);
constants.USER_BIND_PHONE_REWARD = _.constant(300);
constants.ZONE_QUEUE_EMPTY_LEAST = _.constant(1);
constants.ZONE_QUEUE_UPDATE_INTERVAL = _.constant(1000);


constants.Chat = {};
constants.Chat.EMOJI = _.constant(1);
constants.Chat.DIALECT = _.constant(2);
constants.Chat.TYPE = _.constant(3);
constants.Chat.VOICE = _.constant(4);


constants.Broadcast = {};
constants.Broadcast.ACTION = _.constant('broadcast.action');
constants.Broadcast.DEFAULT = _.constant('Default');
constants.Broadcast.ANNOUNCE = _.constant('broadcast.announce');
constants.Broadcast.GAMEOPEN = _.constant('broadcast.gameopen');
constants.Broadcast.MINGCOIN = _.constant(50000);

constants.PushMail = {};
constants.PushMail.ACTION = _.constant('push.mail.action');

constants.Game = {};
constants.Game.DEFAULT = _.constant('def');
constants.Game.DZ = _.constant('dz');
constants.Game.NN = _.constant('nn');
constants.Game.BJL = _.constant('bjl');
constants.Game.BCBM = _.constant('bcbm');
constants.Game.ZJH = _.constant('zjh');
constants.Game.LX9 = _.constant('lx9');
constants.Game.BRNN = _.constant('brnn');
constants.Game.YYBF = _.constant('yybf');
constants.Game.DDZ = _.constant('ddz');
constants.Game.LKPY = _.constant('lkpy');
constants.Game.FQZS = _.constant('fqzs');
constants.Game.ERMJ = _.constant('ermj');
constants.Game.PJ = _.constant('pj');
constants.Game.SSS = _.constant('sss');

constants.GameRecordAction = {};
constants.GameRecordAction.ROUTE = _.constant('game.record.action');
constants.GameRecordAction.CHANGE = _.constant('Change');


constants.GuildMemberLevel = {};
constants.GuildMemberLevel.NORMAL = _.constant(1);
constants.GuildMemberLevel.CHAIRMAN = _.constant(10);


constants.InspectorEvent = {};
constants.InspectorEvent.BOOT = _.constant('Boot');
constants.InspectorEvent.CLOSE = _.constant('Close');


/**
 * @api {enum} Item 物品类型
 * @apiGroup User
 * @apiParam {number} 1 金币
 * @apiParam {number} 2 钻石
 * @apiParam {number} 3 绑定钻石
 */
constants.Item = {};
constants.Item.NONE = _.constant(0);
constants.Item.GOLD = _.constant(1);
constants.Item.DIAMOND = _.constant(2);
constants.Item.BIND_DIAMOND = _.constant(3);
constants.Item.BANK = _.constant(9);


constants.ItemAction = {};
constants.ItemAction.ROUTE = _.constant('item.action');
constants.ItemAction.CHANGE = _.constant('Change');


/**
 * @api {enum} ItemChangeReason 物品变动原因
 * @apiGroup User
 * @apiParam {number} 0 未知
 * @apiParam {number} 1 游戏消耗
 * @apiParam {number} 2 预扣
 * @apiParam {number} 3 预扣退款
 * @apiParam {number} 4 邮件领取
 * @apiParam {number} 5 转盘抽奖获取
 * @apiParam {number} 6 绑定代理
 * @apiParam {number} 7 绑定送金币
 * @apiParam {number} 8 管理员
 * @apiParam {number} 9 代理充值
 * @apiParam {number} 10 充值购买
 * @apiParam {number} 11 转盘抽奖消耗
 * @apiParam {number} 12 新用戶贈送
 * @apiParam {number} 13 每局开局扣钱
 * @apiParam {number} 14 从以太币兑换
 * @apiParam {number} 15 兑换到以太币
 * @apiParam {number} 16 被推荐人绑定赠送
 * @apiParam {number} 17 被推荐人首冲赠送
 * @apiParam {number} 18 被推荐人完成游戏局数赠送
 * @apiParam {number} 19 返利
 * @apiParam {number} 23 绑定银行卡送金币
 */
constants.ItemChangeReason = {};
constants.ItemChangeReason.UNKNOWN = _.constant(0);
constants.ItemChangeReason.PLAY = _.constant(1);
constants.ItemChangeReason.DEPOSIT = _.constant(2);
constants.ItemChangeReason.UNDEPOSIT = _.constant(3);
constants.ItemChangeReason.MAIL = _.constant(4);
constants.ItemChangeReason.ROUNDABOUT = _.constant(5);
constants.ItemChangeReason.BIND_AGENT = _.constant(6);
constants.ItemChangeReason.BIND_PHONE = _.constant(7);
constants.ItemChangeReason.ADMIN = _.constant(8);
constants.ItemChangeReason.AGENT = _.constant(9);
constants.ItemChangeReason.BUY = _.constant(10);
constants.ItemChangeReason.ROUNDABOUT_COST = _.constant(11);
constants.ItemChangeReason.NEW_USER = _.constant(12);
constants.ItemChangeReason.PLAY_ROUND_COST = _.constant(13);
constants.ItemChangeReason.FROM_ETHER = _.constant(14);
constants.ItemChangeReason.TO_ETHER = _.constant(15);
constants.ItemChangeReason.RECOMMENDER_BIND = _.constant(16);
constants.ItemChangeReason.RECOMMENDER_CHARGE = _.constant(17);
constants.ItemChangeReason.RECOMMENDER_PLAY = _.constant(18);
constants.ItemChangeReason.REBATE = _.constant(19);
constants.ItemChangeReason.USERPAY = _.constant(20);
constants.ItemChangeReason.USERPAY_Manual = _.constant(201);        //人工存入
constants.ItemChangeReason.USERPAY_Activity = _.constant(202);      //活动优惠
constants.ItemChangeReason.USERPAY_Other = _.constant(203);         //其他优惠
constants.ItemChangeReason.WITHDRAW = _.constant(21);
constants.ItemChangeReason.DRAWRETURN = _.constant(22);
constants.ItemChangeReason.BIND_BANK = _.constant(23);              //绑定银行卡
constants.ItemChangeReason.ACTIVITY_LOGIN = _.constant(101);        //登录奖励
constants.ItemChangeReason.PLAY_LOSE = _.constant(98);
constants.ItemChangeReason.PLAY_WIN = _.constant(99);
constants.ItemChangeReason.ROBOT_RESET = _.constant(100);


constants.ItemEvent = {};
constants.ItemEvent.CHANGE = _.constant('Change');

constants.ProblemType = {};
constants.ProblemType.CUSTOM_SERVICE = _.constant(1);

constants.GuildAction = {};
constants.GuildAction.ROUTE = _.constant('guild.action');
constants.GuildAction.ADD = _.constant('Add');


constants.GuildMemberAction = {};
constants.GuildMemberAction.ROUTE = _.constant('guild.member.action');
constants.GuildMemberAction.ADD = _.constant('Add');
constants.GuildMemberAction.REMOVE = _.constant('Remove');


constants.GuildRoomAgentAction = {};
constants.GuildRoomAgentAction.ROUTE = _.constant('guild.room.agent.action');
constants.GuildRoomAgentAction.ADD = _.constant('Add');
constants.GuildRoomAgentAction.COMMAND = _.constant('Command');
constants.GuildRoomAgentAction.REMOVE = _.constant('Remove');


constants.Order = {};
constants.Order.IAP = _.constant(1);


constants.OrderState = {};
constants.OrderState.UNPAY = _.constant(1);
constants.OrderState.PAY = _.constant(2);
constants.OrderState.FINISH = _.constant(3);

constants.UserPayState = {};
constants.UserPayState.INITIAL = _.constant(0);
constants.UserPayState.FINISH = _.constant(1);
constants.UserPayState.REDUCE = _.constant(2);

constants.UserPushState = {};
constants.UserPushState.INITIAL = _.constant(0);
constants.UserPushState.FINISH = _.constant(1);

constants.ResultCode = {};
constants.ResultCode.OK = _.constant({ code: 200, msg: "ok" });
constants.ResultCode.ERROR = _.constant({ code: 404, msg: "error" });
constants.ResultCode.ROUTE_ERROR = _.constant({ code: 405, msg: "route error" });
constants.ResultCode.SESSION_ERROR = _.constant({ code: 406, msg: i18n.__('ResultCode_SessionError') });
constants.ResultCode.SERVER_BOOTING = _.constant({ code: 500, msg: i18n.__('ResultCode_ServerBooting') });
constants.ResultCode.SERVER_BUSY = _.constant({ code: 501, msg: i18n.__('ResultCode_ServerBusy') });
constants.ResultCode.SERVER_CLOSING = _.constant({ code: 502, msg: i18n.__('ResultCode_ServerClosing') });

// 用户相关错误信息
constants.ResultCode.USER_ERROR = _.constant({ code: 10000, msg: i18n.__('ResultCode_UserError') });
constants.ResultCode.USER_PLAYING = _.constant({ code: 10001, msg: i18n.__('ResultCode_UserPlaying') });
constants.ResultCode.USER_NOT_PLAYING = _.constant({ code: 10002, msg: i18n.__('ResultCode_UserNotPlaying') });
constants.ResultCode.USER_REBIND_PHONE = _.constant({ code: 10003, msg: i18n.__('ResultCode_UserRebindPhone') });
constants.ResultCode.USER_NOT_ENOUGH_DIAMOND = _.constant({ code: 10004, msg: i18n.__('ResultCode_UserNotEnoughDiamond') });
constants.ResultCode.USER_ROOM_FULL = _.constant({ code: 10005, msg: i18n.__('ResultCode_UserRoomFull') });
constants.ResultCode.USER_GUILD_FULL = _.constant({ code: 10006, msg: i18n.__('ResultCode_UserGuildFull') });
constants.ResultCode.USER_NOT_ENOUGH_GOLD = _.constant({ code: 10007, msg: i18n.__('ResultCode_UserNotEnoughGold') });
constants.ResultCode.USER_NOT_IN_GUILD = _.constant({ code: 10008, msg: i18n.__('ResultCode_UserNotInGuild') });
constants.ResultCode.USER_UNKNOWN = _.constant({ code: 10009, msg: i18n.__('ResultCode_UserUnkown') });
constants.ResultCode.USER_CHARGE_PLAYING = _.constant({ code: 10010, msg: i18n.__('ResultCode_UserChargePlaying') });
constants.ResultCode.USER_BINDED_PHONE = _.constant({ code: 10011, msg: i18n.__('ResultCode_UserBindedPhone') });
constants.ResultCode.USER_SUSPENDED = _.constant({ code: 10012, msg: i18n.__('ResultCode_UserSuspended') });
constants.ResultCode.USER_RESUSPEND = _.constant({ code: 10013, msg: i18n.__('ResultCode_UserResuspend') });
constants.ResultCode.USER_REUNSUSPEND = _.constant({ code: 10014, msg: i18n.__('ResultCode_UserReunsuspend') });
constants.ResultCode.USER_ACCOUNT_USED = _.constant({ code: 10015, msg: i18n.__('ResultCode_UserAccountUsed') });
constants.ResultCode.USER_SAME_IP_OVER = _.constant({ code: 10015, msg: i18n.__('ResultCode_UserSameIpOver') });
constants.ResultCode.USER_SAME_DEVICE_OVER = _.constant({ code: 10015, msg: i18n.__('ResultCode_UserSameDeviceOver') });
constants.ResultCode.USER_CODE_ERROR = _.constant({ code: 10016, msg: i18n.__('ResultCode_UserCodeError') });
constants.ResultCode.USER_PASSWORD_ERROR = _.constant({ code: 10017, msg: i18n.__('ResultCode_UserPasswordError') });
constants.ResultCode.USER_NOT_ENOUGH_ITEM = _.constant({ code: 10018, msg: i18n.__('ResultCode_UserNotEnoughItem') });
constants.ResultCode.USER_RECOMMENDER_UNKNOWN = _.constant({ code: 10019, msg: i18n.__('ResultCode_UserRecommenderUnknown') });
constants.ResultCode.USER_RECOMMENDER_ANCESTOR = _.constant({ code: 10020, msg: i18n.__('ResultCode_UserRecommenderAncestor') });
constants.ResultCode.USER_UP_BANKER = _.constant({ code: 10021, msg: i18n.__('ResultCode_UserUpBanker') });
constants.ResultCode.USER_BE_BANKER = _.constant({ code: 10022, msg: i18n.__('ResultCode_UserBeBanker') });
constants.ResultCode.USER_BAD_AGENT = _.constant({ code: 10023, msg: "代理是无效的用户" });
constants.ResultCode.USER_NO_BANK_PASSWORD = _.constant({ code: 10024, msg: "请先设置银行密码" });
constants.ResultCode.USER_BANK_PASSWORD_ERROR = _.constant({ code: 10025, msg: "银行密码不正确，取出失败" });
constants.ResultCode.USER_NO_BANK_MONEY = _.constant({ code: 10026, msg: "银行余额不足" });
constants.ResultCode.USER_BANK_PASSWORD_WRONG = _.constant({ code: 10027, msg: "原银行密码不匹配，请重新输入" });
constants.ResultCode.USER_PASSWORD_WRONG = _.constant({ code: 10028, msg: '原密码不匹配，请重新输入' });
constants.ResultCode.USER_BANK_ADD_WRONG = _.constant({ code: 10029, msg: '添加的支付宝需与账户姓名一致' });
constants.ResultCode.USER_BANK_SAME_WRONG = _.constant({ code: 10030, msg: '当前支付宝已经被绑定过，请换一张' });
constants.ResultCode.USER_DEVICE_USED = _.constant({ code: 10100, msg: '该设备已注册' });

// 房间相关
constants.ResultCode.ROOM_ERROR = _.constant({ code: 11000, msg: i18n.__('ResultCode_RoomError') });
constants.ResultCode.ROOM_UNKNOWN = _.constant({ code: 11001, msg: i18n.__('ResultCode_RoomUnknown') });
constants.ResultCode.ROOM_PLAYING = _.constant({ code: 11002, msg: i18n.__('ResultCode_RoomPlaying') });
constants.ResultCode.ROOM_FULL = _.constant({ code: 11003, msg: i18n.__('ResultCode_RoomFull') });
constants.ResultCode.ROOM_OWNER_LEAVE = _.constant({ code: 11004, msg: i18n.__('ResultCode_RoomOwnerLeave') });
constants.ResultCode.ROOM_TURN_ERROR = _.constant({ code: 11100, msg: i18n.__('ResultCode_RoomTurnError') });
constants.ResultCode.ROOM_TURN_EXPIRED = _.constant({ code: 11101, msg: i18n.__('ResultCode_RoomTurnExpired') });
constants.ResultCode.ROOM_DISMISS_ERROR = _.constant({ code: 11102, msg: '游戏未开始，只有房主可以解散房间' });
constants.ResultCode.MAIL_ERROR = _.constant({ code: 12000, msg: i18n.__('ResultCode_MailError') });
constants.ResultCode.GUILD_ERROR = _.constant({ code: 13000, msg: i18n.__('ResultCode_GuildError') });
constants.ResultCode.GUILD_NAME_USED = _.constant({ code: 13001, msg: i18n.__('ResultCode_GuildNameUsed') });
constants.ResultCode.GUILD_UNKNOWN = _.constant({ code: 13002, msg: i18n.__('ResultCode_GuildUnkown') });
constants.ResultCode.GUILD_FULL = _.constant({ code: 13003, msg: i18n.__('ResultCode_GuildFull') });
constants.ResultCode.GUILD_CHAIRMAN_QUIT = _.constant({ code: 13004, msg: i18n.__('ResultCode_GuildChairmanQuit') });
constants.ResultCode.GUILD_MEMBER_CREATE_ROOM = _.constant({ code: 13005, msg: i18n.__('ResultCode_GuildMemberCreateRoom') });
constants.ResultCode.GUILD_ROOM_FULL = _.constant({ code: 13006, msg: i18n.__('ResultCode_GuildRoomFull') });
constants.ResultCode.ITEM_ERROR = _.constant({ code: 14000, msg: i18n.__('ResultCode_ItemError') });
constants.ResultCode.ITEM_NOT_ENOUGH = _.constant({ code: 14001, msg: i18n.__('ResultCode_ItemNotEnough') });
constants.ResultCode.ITEM_TOO_MUCH = _.constant({ code: 14002, msg: i18n.__('ResultCode_ItemTooMuch') });
constants.ResultCode.USERPAY_UNKNOWN = _.constant({ code: 14003, msg: i18n.__('ResultCode_UserPayUnknown') });
constants.ResultCode.USERPAY_PUSHED = _.constant({ code: 14004, msg: "充值订单已发放" });
constants.ResultCode.USERPAY_ERRORMONEY = _.constant({ code: 14003, msg: "充值订单金额不符" });
constants.ResultCode.USERPAY_ERRORSTATE = _.constant({ code: 14004, msg: "充值订单状态有误" });
constants.ResultCode.USERWITHDRAW_UNKNOWN = _.constant({ code: 14005, msg: i18n.__('ResultCode_UserWithdrawUnknown') });
constants.ResultCode.USERWITHDRAW_PUSHED = _.constant({ code: 14006, msg: i18n.__('ResultCode_UserWithdrawPushed') });
constants.ResultCode.USERWITHDRAW_ERRORMONEY = _.constant({ code: 14007, msg: "提现订单金额不符" });
constants.ResultCode.USERWITHDRAW_ERRORSTATE = _.constant({ code: 14008, msg: "提现订单状态有误" });
constants.ResultCode.ACTIVITY_LOGIN_REWARD_GOT = _.constant({ code: 15001, msg: "当天奖励已经领取" });

// PS：为什么这里的CodeID在上面已经重复了呢？
constants.ResultCode.USER_NOT_ENOUGH_BANKGOLD = _.constant({ code: 10007, msg: i18n.__('ResultCode_UserNotEnoughBankGold') });

constants.RobotCommand = {};
constants.RobotCommand.ROOM_STATE_CHANGE_STATE = _.constant(1);
constants.RobotCommand.TURN_START = _.constant(2);


constants.RoomAgentCommand = {};
constants.RoomAgentCommand.CHANGE_PLAYING = _.constant(1);
constants.RoomAgentCommand.CHANGE_PLAYER = _.constant(2);


constants.RoomAgentAction = {};
constants.RoomAgentAction.ROUTE = _.constant('room.agent.action');
constants.RoomAgentAction.ADD = _.constant('Add');
constants.RoomAgentAction.COMMAND = _.constant('Command');
constants.RoomAgentAction.REMOVE = _.constant('Remove');


constants.RoomAction = {};
constants.RoomAction.ROUTE = _.constant('room.action');
constants.RoomAction.CHAT = _.constant("Chat");
constants.RoomAction.DISMISS_START = _.constant("DismissStart");
constants.RoomAction.DISMISS_VOTE = _.constant("DismissVote");
constants.RoomAction.DISMISS_STOP = _.constant("DismissStop");



constants.RoomAction.FLOWER = _.constant('FLOWER');
constants.RoomAction.PLAYER_ACTION = _.constant('PlayerAction');                // 用户通用行为
constants.RoomAction.PLAYER_ADD_CARDS = _.constant('PlayerAddCards');
constants.RoomAction.PLAYER_BANKER = _.constant('PlayerBanker');
constants.RoomAction.PLAYER_BID = _.constant('PlayerBid');
constants.RoomAction.PLAYER_BID_REPEAT = _.constant('PlayerBidRepeat');
constants.RoomAction.PLAYER_BID_CANCEL = _.constant('PlayerBidCancel');
constants.RoomAction.PLAYER_OUTCARD = _.constant('PlayerOutCard');
constants.RoomAction.PLAYER_ROBOT = _.constant('PlayerRobot');
constants.RoomAction.PLAYER_BID_CANCEL = _.constant('PlayerBidCancel');
constants.RoomAction.PLAYER_SPEAK = _.constant('PlayerSpeak');
constants.RoomAction.PLAYER_PANEL = _.constant('PlayerPanel');
constants.RoomAction.PLAYER_COMMIT = _.constant('PlayerCommit');
constants.RoomAction.PLAYER_DEAL = _.constant('PlayerDeal');
constants.RoomAction.PLAYER_MING = _.constant('PlayerMing');
constants.RoomAction.PLAYER_MING_NOTICE = _.constant('PlayerMingNotice');
constants.RoomAction.PLAYER_DEAL_FLOWER = _.constant('PlayerDealFlower');
constants.RoomAction.PLAYER_DRAW = _.constant('PlayerDraw');
constants.RoomAction.PLAYER_ENTER_ROOM = _.constant('PlayerEnterRoom');
constants.RoomAction.PLAYER_ENTER_VIRTUAL = _.constant('PlayerEnterVirtual');
constants.RoomAction.PLAYER_LOOK = _.constant('PlayerLook');
constants.RoomAction.PLAYER_COMPARE = _.constant('PlayerCompare');
constants.RoomAction.PLAYER_FLOWER = _.constant('PlayerFlower');
constants.RoomAction.PLAYER_FOLD = _.constant('PlayerFold');
constants.RoomAction.PLAYER_FORBIDDEN_TAKE = _.constant('PlayerForbiddenTake');
constants.RoomAction.PLAYER_FORBIDDEN_TOUCH = _.constant('PlayerForbiddenTouch');
constants.RoomAction.PLAYER_GROUP = _.constant('PlayerGroup');
constants.RoomAction.PLAYER_HOLE = _.constant('PlayerHole');
constants.RoomAction.PLAYER_HOST = _.constant('PlayerHost');
constants.RoomAction.PLAYER_INVITE = _.constant('PlayerInvite');
constants.RoomAction.PLAYER_LEAVE_ROOM = _.constant('PlayerLeaveRoom');
constants.RoomAction.PLAYER_MATCH = _.constant('PlayerMatch');
constants.RoomAction.PLAYER_LISTEN = _.constant('PlayerListen');
constants.RoomAction.PLAYER_OVER = _.constant('PlayerOver');
constants.RoomAction.PLAYER_OPEN = _.constant('PlayerOpen');
constants.RoomAction.PLAYER_BACK = _.constant('PlayerBack');
constants.RoomAction.PLAYER_PLAY = _.constant('PlayerPlay');
constants.RoomAction.PLAYER_PLAY_DRAW = _.constant('PlayerPlayDraw');
constants.RoomAction.PLAYER_PLAY_HAND = _.constant('PlayerPlayHand');
constants.RoomAction.PLAYER_PASS = _.constant('PlayerPass');
constants.RoomAction.PLAYER_READY = _.constant('PlayerReady');
constants.RoomAction.PLAYER_CALLSCORE = _.constant('PlayerCallScore');
constants.RoomAction.PLAYER_REPORT = _.constant('PlayerReport');
constants.RoomAction.PLAYER_RESET = _.constant('PlayerReset');
constants.RoomAction.PLAYER_SCORE = _.constant('PlayerScore');
constants.RoomAction.PLAYER_MY_SCORE = _.constant('PlayerMyScore');
constants.RoomAction.PLAYER_SHOW_HAND = _.constant('PlayerShowHand');
constants.RoomAction.PLAYER_WIN = _.constant('PlayerWin');
constants.RoomAction.PLAYER_JOIN = _.constant('PlayerJoin');
constants.RoomAction.ROOM_PLAYING = _.constant("RoomPlaying");
constants.RoomAction.ROOM_RESULT = _.constant("RoomResult");
constants.RoomAction.ROOM_STATE_FIRSTOPEN = _.constant("RoomStateFirstOpen");
constants.RoomAction.ROOM_STATE_OPEN = _.constant("RoomStateOpen");                 // 房间开牌
constants.RoomAction.ROOM_STATE_BET = _.constant("RoomStateBet");                   // 房间发送筹码
constants.RoomAction.ROOM_STATE_ANTICHEAT = _.constant('RoomStateAnticheat');
constants.RoomAction.ROOM_STATE_BANKER = _.constant("RoomStateBanker");
constants.RoomAction.ROOM_STATE_BANKER_CARD = _.constant("RoomStateBankerCard");
constants.RoomAction.ROOM_STATE_BANKER_First = _.constant("RoomStateBankerFirst");
constants.RoomAction.ROOM_STATE_CHANGE_FLOW = _.constant("ChangeFlow");
constants.RoomAction.ROOM_STATE_CHANGE_STATE = _.constant("RoomStateChangeState");
constants.RoomAction.ROOM_STATE_DEAL = _.constant("RoomStateDeal");
constants.RoomAction.ROOM_STATE_AWARD = _.constant("RoomStateAward");
constants.RoomAction.ROOM_STATE_ROLL_DICE = _.constant('RoomStateRollDice');
constants.RoomAction.ROOM_STATE_SHOW_HAND = _.constant('RoomStateShowHand');
constants.RoomAction.ROOM_STATE_TIMER_START = _.constant('RoomStateTimerStart');
constants.RoomAction.ROOM_STATE_TIMER_STOP = _.constant('RoomStateTimerStop');
constants.RoomAction.ROUND_BEGIN = _.constant("RoundBegin");
constants.RoomAction.ROUND_RESULT = _.constant("RoundResult");
constants.RoomAction.ROUND_END = _.constant("RoundEnd");
constants.RoomAction.ROUND_CHANGE = _.constant("RoundChange");
constants.RoomAction.SEAT_ADD_PLAYER = _.constant('SeatAddPlayer');
constants.RoomAction.SEAT_REMOVE_PLAYER = _.constant('SeatRemovePlayer');
constants.RoomAction.SEAT_SHUFFLE = _.constant('SeatShuffle');
constants.RoomAction.TURN_START = _.constant("TurnStart");

// 李逵劈鱼
constants.RoomAction.ADD_FISH = _.constant("AddFish");
constants.RoomAction.GET_FISH = _.constant("GetFish");
constants.RoomAction.FIRE = _.constant("Fire");
constants.RoomAction.CATCH_FISH = _.constant("CatchFish");
constants.RoomAction.CATCH_BOMB = _.constant("CatchBomb");
constants.RoomAction.BOMB_FISH = _.constant("BombFish");
constants.RoomAction.RELEASE_SKILL = _.constant("ReleaseSkill");
constants.RoomAction.FREEZE = _.constant("Freeze");
constants.RoomAction.UNFREEZE = _.constant("Unfreeze");
constants.RoomAction.CHANGE_SCORE = _.constant("ChangeScore");
constants.RoomAction.CHANGE_BULLET = _.constant("ChangeBullet");
constants.RoomAction.BOSS_COMING = _.constant("BossComing");
constants.RoomAction.HANDLE_ROBOT = _.constant('HandlerRobot');

constants.RoomAction.ROOM_UP_BANKER = _.constant("UpBanker");           //上庄
constants.RoomAction.ROOM_DOWN_BANKER = _.constant("DownBanker");       //下庄
constants.RoomAction.ROOM_BANKER_LIST = _.constant("BankerList");       //庄家列表
constants.RoomAction.ROOM_ROAD_LIST = _.constant("RoadList");           //获取路单

constants.RoomClearReason = {};
constants.RoomClearReason.NONE = _.constant(0);
constants.RoomClearReason.RESULT = _.constant(1);                       // 正常结束
constants.RoomClearReason.OWNER_DISMISS = _.constant(2);
constants.RoomClearReason.VOTE_DISMISS = _.constant(3);
constants.RoomClearReason.REQUEST = _.constant(4);                      // 自己退出房间
constants.RoomClearReason.REMATCH = _.constant(5);
constants.RoomClearReason.KICK_HOSTING_USER = _.constant(6);
constants.RoomClearReason.KICK_NOT_ENOUGH_SCORE_USER = _.constant(7);
constants.RoomClearReason.ADMIN = _.constant(8);
constants.RoomClearReason.USERLEAVE = _.constant(9);
constants.RoomClearReason.ENDED = _.constant(10);                       // 组局场大局结束


constants.RoomEvent = {};
constants.RoomEvent.PLAYER_READY = _.constant('PlayerReady');
constants.RoomEvent.ROOM_ACTION = _.constant('RoomAction');
constants.RoomEvent.ROOM_BEFORE_CLEAR = _.constant('RoomBeforeClear');
constants.RoomEvent.ROOM_CHANGE_PLAYING = _.constant('RoomChangePlaying');
constants.RoomEvent.ROOM_CLEAR = _.constant('RoomClear');
constants.RoomEvent.ROOM_CREATE = _.constant('RoomCreate');
constants.RoomEvent.ROOM_DISMISS = _.constant('RoomDismiss');
constants.RoomEvent.ROOM_RESET = _.constant('RoomReset');
constants.RoomEvent.ROOM_RESULT = _.constant('RoomResult');
constants.RoomEvent.ROOM_UPDATE = _.constant('RoomUpdate');
constants.RoomEvent.ROUND_BEGIN = _.constant('RoundBegin');
constants.RoomEvent.ROUND_END = _.constant('RoundEnd');
constants.RoomEvent.ROUND_RECORD = _.constant('RoundRecord');
constants.RoomEvent.ROUND_RESULT = _.constant('RoundResult');
constants.RoomEvent.PLAYER_ENTER_ROOM = _.constant('PlayerEnterRoom');
constants.RoomEvent.SEAT_ADD_PLAYER = _.constant('SeatAddPlayer');
constants.RoomEvent.SEAT_REMOVE_PLAYER = _.constant('SeatRemovePlayer');
constants.RoomEvent.SEAT_HOST_PLAYER = _.constant('SeatHostPlayer');
constants.RoomEvent.SEAT_UNHOST_PLAYER = _.constant('SeatUnhostPlayer');
constants.RoomEvent.TURN_START = _.constant('TurnStart');
constants.RoomEvent.USER_HISTORY = _.constant('UserHistory');


constants.RoomRecord = {};
constants.RoomRecord.INIT = _.constant(1);
constants.RoomRecord.PLAYING = _.constant(2);
constants.RoomRecord.END = _.constant(3);
constants.RoomRecord.DISMISS = _.constant(4);
constants.RoomRecord.COMPENSATE = _.constant(11);


constants.RoomScore = {};
constants.RoomScore.SCORE = _.constant(1);
constants.RoomScore.ITEM = _.constant(2);


constants.RoomType = {};
constants.RoomType.COMPETITION = _.constant(1);
constants.RoomType.MATCH = _.constant(2);
constants.RoomType.PRIVATE = _.constant(3);


constants.RoomMode = {};
constants.RoomMode.PRIVATE_SELF = _.constant(1);
constants.RoomMode.PRIVATE_OTHER = _.constant(2);
constants.RoomMode.GUILD = _.constant(3);
constants.RoomMode.MATCH = _.constant(4);


constants.RoomPayMode = {};
constants.RoomPayMode.NONE = _.constant(0);
constants.RoomPayMode.OWNER = _.constant(1);
constants.RoomPayMode.AA = _.constant(2);
constants.RoomPayMode.WINNER = _.constant(3);


constants.Sex = {};
constants.Sex.MALE = _.constant(0);
constants.Sex.FEMALE = _.constant(1);


constants.SMS = {};
constants.SMS.DEBUG = _.constant('111111');
constants.SMS.LENGTH = _.constant(6);
constants.SMS.REGISTER = _.constant(1);
constants.SMS.PASSWORD = _.constant(2);
constants.SMS.GOD_CODE = _.constant('******');


constants.SMSInterval = {};
constants.SMSInterval.SEND = _.constant(60000);
constants.SMSInterval.COMMIT = _.constant(600000);


/**
 * @api {enum} User 玩家类型定义
 * @apiGroup User
 * @apiParam {enum} 1 管理员账号
 * @apiParam {enum} 3 代理账号
 * @apiParam {enum} 10 游客账号
 * @apiParam {enum} 11 授权账号
 * @apiParam {enum} 1000 机器人
 */
constants.User = {};
constants.User.ADMIN = _.constant(1);
constants.User.AGENT = _.constant(3);
constants.User.GUEST = _.constant(10);
constants.User.AUTH = _.constant(11);
constants.User.ROBOT = _.constant(1000);

/** 玩家身份定义 */
constants.Role = {};
/** 玩家 */
constants.Role.PLAYER = _.constant(11);
/** 测试 */
constants.Role.TEST = _.constant(12);


constants.UserAttributeAction = {};
constants.UserAttributeAction.ROUTE = _.constant('user.attribute.action');
constants.UserAttributeAction.CHANGE = _.constant('Change');


constants.UserCharge = {};
constants.UserCharge.AGENT = _.constant(1);


constants.UserEvent = {};
constants.UserEvent.LOGIN = _.constant('Login');
constants.UserEvent.LOGOUT = _.constant('Logout');


constants.UserKick = {};
constants.UserKick.NONE = _.constant(0);
constants.UserKick.RELOGIN = _.constant(1);
constants.UserKick.SUSPEND = _.constant(2);


constants.UserState = {};
constants.UserState.NORMAL = _.constant(0);
constants.UserState.DELETE = _.constant(1);
constants.UserState.WHITE_LIST = _.constant(2);
constants.UserState.SUSPENDED = _.constant(11);
constants.UserState.BLACK_DDZ = _.constant(12);
constants.UserState.BLACK_SSS = _.constant(13);


constants.UserToJsonReason = {};
constants.UserToJsonReason.LOGIN = _.constant(1);
constants.UserToJsonReason.ROOM = _.constant(2);
constants.UserToJsonReason.GUILD = _.constant(3);
constants.UserToJsonReason.PRIVATE = _.constant(11);
constants.UserToJsonReason.MATCH = _.constant(12);
constants.UserToJsonReason.COMPETITION = _.constant(13);


/**
 * @apiDefine Mahjong
 * 麻将
 */
constants.Mahjong = {};
constants.Mahjong.BanCard = {};
constants.Mahjong.BanCard.PLAY = _.constant('play');
constants.Mahjong.BanCard.TAKE = _.constant('take');
constants.Mahjong.BanCard.TOUCH = _.constant('touch');
constants.Mahjong.BanCard.WIN = _.constant('win');


constants.Mahjong.CardPoint = {};
constants.Mahjong.CardPoint.MIN = _.constant(1);
constants.Mahjong.CardPoint.MAX = _.constant(9);


constants.Mahjong.CardSuit = {};
constants.Mahjong.CardSuit.WAN = _.constant(1);
constants.Mahjong.CardSuit.TIAO = _.constant(2);
constants.Mahjong.CardSuit.TONG = _.constant(3);
constants.Mahjong.CardSuit.DNXB = _.constant(4);
constants.Mahjong.CardSuit.ZFB = _.constant(5);
constants.Mahjong.CardSuit.CXQD = _.constant(6);
constants.Mahjong.CardSuit.MLZJ = _.constant(7);
constants.Mahjong.CardSuit.SP = _.constant(100);


constants.Mahjong.CardExtra = {};
constants.Mahjong.CardExtra.LAST = _.constant('Last');
constants.Mahjong.CardExtra.SPECIAL = _.constant('Special');
constants.Mahjong.CardExtra.PLAY_LISTENING = _.constant('PlayListening');


constants.Mahjong.DrawReason = {};
constants.Mahjong.DrawReason.DRAW = _.constant(1);
constants.Mahjong.DrawReason.FLOWER = _.constant(2);
constants.Mahjong.DrawReason.PRIVATE_BAR = _.constant(3);
constants.Mahjong.DrawReason.PUBLIC_BAR = _.constant(4);
constants.Mahjong.DrawReason.TOUCH_BAR = _.constant(5);
constants.Mahjong.DrawReason.FLOWER_WIN = _.constant(6);


constants.Mahjong.Group = {};
constants.Mahjong.Group.PAIR = _.constant(1);
constants.Mahjong.Group.SEQUENCE = _.constant(2);
constants.Mahjong.Group.TRIPLE = _.constant(3);
constants.Mahjong.Group.TAKE = _.constant(2);
constants.Mahjong.Group.TOUCH = _.constant(3);
constants.Mahjong.Group.PRIVATE_BAR = _.constant(4);
constants.Mahjong.Group.PUBLIC_BAR = _.constant(5);
constants.Mahjong.Group.TOUCH_BAR = _.constant(6);


constants.Mahjong.Specific = {};
constants.Mahjong.Specific.ALL_TOUCH = _.constant('AllTouch'); // 碰碰胡
constants.Mahjong.Specific.AROUND_DNXB = _.constant('AroundDNXB'); // 圈风台
constants.Mahjong.Specific.ROUND_DNXB = _.constant('RoundDNXB'); // 门风台
constants.Mahjong.Specific.ROUND_FLOWER = _.constant('RoundFlower'); // 门风花牌
constants.Mahjong.Specific.BANKER_WIN = _.constant('BankerWin'); // 庄家赢
constants.Mahjong.Specific.BANKER_FIRE = _.constant('BankerFire'); // 庄家输
constants.Mahjong.Specific.BANKER_LA = _.constant('BankerLa'); // 拉庄
constants.Mahjong.Specific.BANKER_LIAN = _.constant('BankerLian'); // 连庄
constants.Mahjong.Specific.DRAW_WIN = _.constant('DrawWin'); // 自摸
constants.Mahjong.Specific.ALL_GROUP_DRAW_WIN = _.constant('AllGroupDrawWin'); // 半求人
constants.Mahjong.Specific.FLOWER_DRAW_WIN = _.constant('FlowerDrawWin'); // 七抢一 自摸
constants.Mahjong.Specific.ALL_FLOWER_DRAW_WIN = _.constant('AllFlowerDrawWin'); // 八仙过海
constants.Mahjong.Specific.NO_GROUP_DRAW_WIN = _.constant('NoGroupDrawWin'); // 门清自摸
constants.Mahjong.Specific.BAR_DRAW_WIN = _.constant('BarDrawWin'); // 杠上开花
constants.Mahjong.Specific.DNXB_PAIR_TRIPLE = _.constant('DNXBPairTriple'); // 小四喜
constants.Mahjong.Specific.DNXB_ALL_TRIPLE = _.constant('DNXBAllTriple'); // 大四喜
constants.Mahjong.Specific.EIGHT_FLOWER = _.constant('EightFlower'); // 八仙过海
constants.Mahjong.Specific.EIGHT_PAIR = _.constant('EightPair'); // 8小对 呖咕呖咕
constants.Mahjong.Specific.FIRE_WIN = _.constant('FireWin'); // 放枪胡
constants.Mahjong.Specific.ALL_GROUP_FIRE_WIN = _.constant('AllGroupFireWin'); // 全求人
constants.Mahjong.Specific.FLOWER_FIRE_WIN = _.constant('FlowerFireWin'); // 七抢一 点炮
constants.Mahjong.Specific.TOUCH_BAR_FIRE_WIN = _.constant('TouchBarFireWin'); // 抢杠胡
constants.Mahjong.Specific.FLOW = _.constant('Flow'); // 流局
constants.Mahjong.Specific.FLOWER_BAR = _.constant('FlowBar'); // 花杠
constants.Mahjong.Specific.FLOWER = _.constant('Flower'); // 花牌
constants.Mahjong.Specific.FLOWER_WIN = _.constant('FlowerWin'); // 八仙过海 花湖d
constants.Mahjong.Specific.NO_FLOWER = _.constant('NoFlower'); // 无花果
constants.Mahjong.Specific.LISTENING = _.constant('Listening'); // 报听
constants.Mahjong.Specific.SINGLE_LISTENING = _.constant('SingleListening'); // 独听
constants.Mahjong.Specific.TIAN_LISTENING = _.constant('TianListening'); // 天听
constants.Mahjong.Specific.DI_LISTENING = _.constant('DiListening'); // 地听
constants.Mahjong.Specific.ALL_GROUP = _.constant('AllGroup'); // 大吊
constants.Mahjong.Specific.NO_GROUP = _.constant('NoGroup'); // 门清
constants.Mahjong.Specific.ONE_SUIT = _.constant('OneSuit'); // 清一色
constants.Mahjong.Specific.ONE_SUIT_WITH_WORD = _.constant('OneSuitWithWord'); // 混一色
constants.Mahjong.Specific.ONE_SUIT_ALL_WORD = _.constant('OneSuitAllWord'); // 字一色
constants.Mahjong.Specific.HAND_TRIPLE3 = _.constant('HandTriple3'); // 三暗刻
constants.Mahjong.Specific.HAND_TRIPLE4 = _.constant('HandTriple4'); // 四暗刻
constants.Mahjong.Specific.HAND_TRIPLE5 = _.constant('HandTriple5'); // 五暗刻
constants.Mahjong.Specific.ZFB_1 = _.constant('ZFB1'); // 红中
constants.Mahjong.Specific.ZFB_2 = _.constant('ZFB2'); // 发财
constants.Mahjong.Specific.ZFB_3 = _.constant('ZFB3'); // 白板
constants.Mahjong.Specific.ZFB_PAIR_TRIPLE = _.constant('ZFBPairTriple'); // 小三元
constants.Mahjong.Specific.ZFB_ALL_TRIPLE = _.constant('ZFBAllTriple'); // 大三元
constants.Mahjong.Specific.LAST_CARD_WIN = _.constant('LastCardWin'); // 海底捞月
constants.Mahjong.Specific.TIAN_WIN = _.constant('TianWin'); // 天胡
constants.Mahjong.Specific.DI_WIN = _.constant('DiWin'); // 地胡
constants.Mahjong.Specific.REN_WIN = _.constant('RenWin'); // 人胡
constants.Mahjong.Specific.PING_WIN = _.constant('PingWin'); // 平胡


constants.Poker = {};


constants.Poker.CardExtra = {};
constants.Poker.CardExtra.BANKER = _.constant('Banker');
constants.Poker.CardExtra.FAKE = _.constant('Fake');
constants.Poker.CardExtra.FOCUS = _.constant('Focus');
constants.Poker.CardExtra.PLAYING = _.constant('Playing');
constants.Poker.CardExtra.REPORT = _.constant('Report');
constants.Poker.CardExtra.SHOW = _.constant('Show');
constants.Poker.CardExtra.SELECT = _.constant('Select');


constants.Poker.CardSuit = {};
constants.Poker.CardSuit.DIAMOND = _.constant(1);
constants.Poker.CardSuit.CLUB = _.constant(2);
constants.Poker.CardSuit.HEART = _.constant(3);
constants.Poker.CardSuit.SPADE = _.constant(4);
constants.Poker.CardSuit.JOKER = _.constant(5);


constants.Poker.CardPoint = {};
constants.Poker.CardPoint.ACE = _.constant(1);
constants.Poker.CardPoint.TWO = _.constant(2);
constants.Poker.CardPoint.FIVE = _.constant(5);
constants.Poker.CardPoint.TEN = _.constant(10);
constants.Poker.CardPoint.JACK = _.constant(11);
constants.Poker.CardPoint.QUEEN = _.constant(12);
constants.Poker.CardPoint.KING = _.constant(13);
constants.Poker.CardPoint.SUB_JOKER = _.constant(14);
constants.Poker.CardPoint.MAIN_JOKER = _.constant(15);

constants.Poker.CardFace = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    '小王',
    '大王'
];


