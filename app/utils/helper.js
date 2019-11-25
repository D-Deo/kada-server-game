const _ = require('underscore');

let util = module.exports = {};

/**
 * 返回下一次跑马灯间隔
 */
util.getNoticeDelay = function(){
    let scaleDay  = [ 1.0 , 1.5 , 2.3 , 3.1 , 4.5 , 5.15 , 6 , 7.05 , 7.1 , 6.2 , 5.3 , 4.4 ,
                      3.5 , 3.2 , 2.9 , 2.7 , 2.5 , 2.4 , 2.0 , 1.8 , 1.5 , 1.0 , 1.0 , 1.0 ] ;
    let hour      = new Date().getHours();
    let base      = 20 ;
    let ret       = Math.max( 20 , parseInt ( _.random( base * scaleDay[hour] , base * scaleDay[hour] * 2.5 )));
    return ret ;
}


util.getValueChinese = function( value ){
    if( value === 0 ) return "0";
    value = value * 0.01;
    //10.86亿 
    let amount = 1 * 10000 * 10000 ;
    if( value >= amount ){
        let count = ( Math.floor( value / 1000000 ) ) / 100 ;
        let name = count + '亿' ;
        return name ;
    }
  
    //9876万
    amount = 10000 * 10000 ;
    if( value >= amount ){
        let count = ( Math.floor( value / 10000 ) );
        let name  = count + '万' ;
        return name ; 
    }
    
    //987.1万
    if( value >= 1000000 ){
        let count = ( Math.floor( value / 1000 ) ) / 10  ;
        let name  = count + '万' ;
        return name ; 
    }
    
    //99.99万
    if( value >= 100000 ){
        let count = ( Math.floor( value / 100 ) ) / 100  ;
        let name  = count + '万' ;
        return name ; 
    }
    
    //9.99万
    if( value > 9999 ){
        let count = ( Math.floor( value / 100 ) ) / 100  ;
        let name  = count + '万' ;
        return name ; 
    }
    
    return value.toFixed(2);
};