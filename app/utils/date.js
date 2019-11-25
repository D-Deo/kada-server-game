const _ = require('underscore');


let util = module.exports = {};


util.isExpired = (timestamp, interval) => {
    return (_.now() - timestamp) >= interval;
};


util.remain = (timestamp, interval, from) => {
    from = from || _.now();
    return interval - (from - timestamp);
};


util.timestamp = (fmt = 'yyyy-MM-dd hh:mm:ss.S') => {
    var d = new Date();
    var o = {
        "M+": d.getMonth() + 1,                     //月份
        "d+": d.getDate(),                          //日
        "h+": d.getHours(),                         //小时
        "m+": d.getMinutes(),                       //分
        "s+": d.getSeconds(),                       //秒
        "q+": Math.floor((d.getMonth() + 3) / 3),   //季度
        "S": d.getMilliseconds()                   //毫秒
    };

    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;

    // return (new Date()).toLocaleString();
};


util.toDaily = (t) => {
    let d = new Date(t);
    let year = d.getFullYear() + '';
    let month = d.getMonth() + 1;
    month = ((month < 10) ? '0' : '') + month;
    let date = d.getDate();
    date = ((date < 10) ? '0' : '') + date;
    return year + '-' + month + '-' + date + ' 00:00:00';
};