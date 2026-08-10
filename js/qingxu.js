

if (typeof module !== "undefined" && module.exports) {

    var { 科创50估值, 沪深300估值, 双创50_800消费_关联度_300权重, 指数分位writeDateTime } = require("../cn/情绪/指数分位.js");

    var 金融地产ETF广发 = require("../cn/行情/金融地产ETF广发.js").金融地产ETF广发;
    var 消费ETF华夏 = require("../cn/行情/消费ETF华夏.js").消费ETF华夏;
    var 工业40LOF = require("../cn/行情/工业40LOF.js").工业40LOF;
    var TMTETF景顺 = require("../cn/行情/TMTETF景顺.js").TMTETF景顺;

    var { 恐贪指数, 恐贪指数writeDateTime } = require("../cn/情绪/恐贪指数.js");

    var { 拥挤度, 融资买入占比, 拥挤杠杆writeDateTime } = require("../cn/情绪/拥挤杠杆.js");
}



/*

长周期                               中周期                 中短周期！

科创50沪深300高估                 get深度恐贪_贪婪         恐贪六子_贪婪todo??

沪深300行业震荡割裂大标准差

科创50沪深300低估                 get深度恐贪_恐惧         恐贪六子_恐惧
*/

const 缺少数据 = "缺少数据"

function 科创50沪深300高估(trigDate) {
    let cur科创50估值 = 科创50估值.findLast(ele => ele.date.substring(0, 9) == trigDate.substring(0, 9))
    let cur沪深300估值 = 沪深300估值.findLast(ele => ele.date.substring(0, 9) == trigDate.substring(0, 9))

    if (!cur科创50估值 || !cur沪深300估值) return 缺少数据


    if (
        cur科创50估值 && cur沪深300估值 &&
        (cur科创50估值?.ps > 90 || (cur科创50估值?.ps > 80 && cur科创50估值?.pe > 90)) &&
        cur沪深300估值.pe > 80 && cur沪深300估值.ps > 80 && (cur沪深300估值.pe > 90 || cur沪深300估值.ps > 90)
    ) {
        return true
    }

    return false
}
function 沪深300行业割裂大标准差(trigDate) {

    function getN同比(指数list, trigDate, preNday = 60) {
        let trigDateIndex = 指数list.findIndex((item) => item.date == trigDate);
        if (trigDateIndex < 0) trigDateIndex = 指数list.findIndex((item) => item.date.substring(0, 7) == trigDate.substring(0, 7));
        let 最近60日同比;
        if (trigDateIndex > preNday) {
            最近60日同比 = ((指数list[trigDateIndex].close - 指数list[trigDateIndex - preNday].close) / 指数list[trigDateIndex - preNday].close) * 100;
            最近60日同比 = +最近60日同比.toFixed(2);
        }
        return 最近60日同比
    }

    let 沪深300最近60日同比 = getN同比(沪深300, trigDate)

    let TMTETF景顺最近60日同比 = getN同比(工业40LOF, trigDate)

    let 工业40LOF最近60日同比 = getN同比(TMTETF景顺, trigDate)

    let 消费ETF华夏最近60日同比 = getN同比(消费ETF华夏, trigDate)

    let 金融地产ETF广发最近60日同比 = getN同比(金融地产ETF广发, trigDate)

    let 同比涨跌幅Arr = [TMTETF景顺最近60日同比, 工业40LOF最近60日同比, 消费ETF华夏最近60日同比, 金融地产ETF广发最近60日同比].filter((ele, index) => isNumber(ele)).sort()
    let sqrvariance = variance(同比涨跌幅Arr);

    if (
        sqrvariance > 15 &&
        同比涨跌幅Arr[0] * 同比涨跌幅Arr.at(-1) < -15
    ) {
        return true
    }


    let cur_双创50_800消费_关联度_300权重 = 双创50_800消费_关联度_300权重.find(ele => ele.date == trigDate)
    let cur关联度
    let cur三百权重
    if (!cur_双创50_800消费_关联度_300权重) return 缺少数据

    cur关联度 = cur_双创50_800消费_关联度_300权重?.关联度
    cur三百权重 = cur_双创50_800消费_关联度_300权重?.三百权重

    if (
        cur关联度 && cur三百权重 &&
        parseFloat(cur关联度) < 0 &&
        (
            (cur三百权重[0] + cur三百权重[1]).includes("电子") ||
            (cur三百权重[0] + cur三百权重[1]).includes("通信")
        )
    ) {
        return true
    }

    return false
}
function 科创50沪深300低估(trigDate) {
    console.log("科创50沪深300低估", 沪深300估值.at(-1))
    let cur科创50估值 = 科创50估值.findLast(ele => ele.date.substring(0, 9) == trigDate.substring(0, 9))
    let cur沪深300估值 = 沪深300估值.findLast(ele => ele.date.substring(0, 9) == trigDate.substring(0, 9))

    if (!cur科创50估值 || !cur沪深300估值) return 缺少数据

    if (
        cur科创50估值 && cur沪深300估值 &&
        cur科创50估值?.ps < 1 && cur科创50估值?.pb < 1 &&
        cur沪深300估值.pe <= 25 && cur沪深300估值.ps <= 25 && cur沪深300估值.pb <= 6
    ) {
        return true
    }

    return false
}


function 恐贪_深度贪婪(curDate) {
    let curDate恐贪指数Index = 恐贪指数.findIndex(ele => ele.date == curDate)
    if (curDate恐贪指数Index < 0) return 缺少数据
    curDate恐贪指数 = 恐贪指数[curDate恐贪指数Index]

    let preN5HigJC = -1000
    let preN5HigASH = -1000
    for (let ii = 1; ii < 7; ii++) {
        const ele = 恐贪指数[curDate恐贪指数Index - ii];
        if (ele?.jiucaishuo > preN5HigJC) preN5HigJC = ele?.jiucaishuo
        if (ele?.ashare > preN5HigASH) preN5HigASH = ele?.ashare
    }

    let thsPlus资金 = ""
    if (curDate恐贪指数.ths资金?.[0] && curDate恐贪指数.ths资金?.[1] && curDate恐贪指数.ths资金?.[0] != "" && curDate恐贪指数.ths资金?.[1] != "") {
        thsPlus资金 = curDate恐贪指数.ths资金[0] + curDate恐贪指数.ths资金[1]
    }

    let 数据count = 0
    if (curDate恐贪指数?.jiucaishuo) 数据count++
    if (curDate恐贪指数?.baifenwei) 数据count++
    if (curDate恐贪指数?.ashare) 数据count++
    if (curDate恐贪指数?.miumiu) 数据count++
    if (thsPlus资金) 数据count++
    if (数据count < 3) return 缺少数据

    let 深度贪婪count = 0
    if (curDate恐贪指数?.jiucaishuo > 79 || (curDate恐贪指数?.jiucaishuo > 71 && preN5HigJC > 79)) 深度贪婪count++
    if (curDate恐贪指数?.baifenwei > 74) 深度贪婪count++
    if (curDate恐贪指数?.ashare > 95 && preN5HigASH > 99) 深度贪婪count++
    if (curDate恐贪指数?.miumiu > 85) 深度贪婪count++
    if (thsPlus资金 > 65.5) 深度贪婪count++

    let 深度恐惧count = 0
    if (curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 8) 深度恐惧count++
    if (curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 20) 深度恐惧count++
    if (curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 15) 深度恐惧count++
    if (curDate恐贪指数?.miumiu && curDate恐贪指数?.miumiu < 10) 深度恐惧count++
    if (thsPlus资金 && thsPlus资金 < 55.5) 深度恐惧count++


    if (深度贪婪count >= 3 && 深度恐惧count == 0) return true

    if (
        curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo > 79 &&
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei > 74 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare > 95 && preN5HigASH > 99 &&
        深度恐惧count == 0
    ) return true


    if (
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei > 74 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare > 95 && preN5HigASH > 99 &&
        (curDate恐贪指数?.jiucaishuo > 79 || curDate恐贪指数?.miumiu > 85 || thsPlus资金 > 65.5) &&
        深度恐惧count == 0
    ) return true


    return false
}

function 恐贪_深度恐惧(curDate) {
    let curDate恐贪指数Index = 恐贪指数.findIndex(ele => ele.date == curDate)
    if (curDate恐贪指数Index < 0) return 缺少数据
    curDate恐贪指数 = 恐贪指数[curDate恐贪指数Index]

    let preN5HigJC = -1000
    let preN5HigASH = -1000
    for (let ii = 1; ii < 7; ii++) {
        const ele = 恐贪指数[curDate恐贪指数Index - ii];
        if (ele?.jiucaishuo > preN5HigJC) preN5HigJC = ele?.jiucaishuo
        if (ele?.ashare > preN5HigASH) preN5HigASH = ele?.ashare
    }

    let thsPlus资金 = ""
    if (curDate恐贪指数.ths资金?.[0] && curDate恐贪指数.ths资金?.[1] && curDate恐贪指数.ths资金?.[0] != "" && curDate恐贪指数.ths资金?.[1] != "") {
        thsPlus资金 = curDate恐贪指数.ths资金[0] + curDate恐贪指数.ths资金[1]
    }

    let 数据count = 0
    if (curDate恐贪指数?.jiucaishuo) 数据count++
    if (curDate恐贪指数?.baifenwei) 数据count++
    if (curDate恐贪指数?.ashare) 数据count++
    if (curDate恐贪指数?.miumiu) 数据count++
    if (thsPlus资金) 数据count++
    if (数据count < 3) return 缺少数据


    let 深度贪婪count = 0
    if (curDate恐贪指数?.jiucaishuo > 79 || (curDate恐贪指数?.jiucaishuo > 71 && preN5HigJC > 79)) 深度贪婪count++
    if (curDate恐贪指数?.baifenwei > 74) 深度贪婪count++
    if (curDate恐贪指数?.ashare > 95 && preN5HigASH > 99) 深度贪婪count++
    if (curDate恐贪指数?.miumiu > 85) 深度贪婪count++
    if (thsPlus资金 > 65.5) 深度贪婪count++

    let 深度恐惧count = 0
    if (curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 8) 深度恐惧count++
    if (curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 20) 深度恐惧count++
    if (curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 15) 深度恐惧count++
    if (curDate恐贪指数?.miumiu && curDate恐贪指数?.miumiu < 10) 深度恐惧count++
    if (thsPlus资金 && thsPlus资金 < 55.5) 深度恐惧count++


    if (深度恐惧count >= 3 && 深度贪婪count == 0) return true
    if (
        curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 8 &&
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 30 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 15 &&
        深度贪婪count == 0
    ) return true

    if (
        curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 15 &&
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 20 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 15 &&
        深度贪婪count == 0
    ) return true

    if (
        curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 8 &&
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 30 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 0 &&
        深度贪婪count == 0
    ) return true

    if (
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 20 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 0 &&
        深度贪婪count == 0
    ) return true //"深度恐惧5"


    return false
}



function 恐贪六子_深度恐惧(curDate) {
    let curDataIndex = 恐贪指数.findIndex(ele => ele.date == curDate)
    if (curDataIndex < 0) return 缺少数据

    let pre1Data = 恐贪指数[curDataIndex - 1]
    let curData = 恐贪指数[curDataIndex]
    if (!curData?.jiucaishuo六子 && !curData?.baifenwei六子) return 缺少数据

    let 中周期 = false ||
        (curData?.jiucaishuo六子 && curData?.jiucaishuo六子?.[4] < -2) ||    //股债
        (curData?.baifenwei六子 && curData?.baifenwei六子?.[0] < 20.05) ||  //波动
        (curData?.baifenwei六子 && curData?.baifenwei六子?.[2] < 20.05)     //融资

    if (
        curData?.jiucaishuo六子 &&
        curData?.jiucaishuo六子[2] > 2.2 && pre1Data?.jiucaishuo六子[2] > 2.2 &&//强度
        !(curData?.jiucaishuo六子?.[4] < -3) &&
        !(curData?.baifenwei六子 && curData?.baifenwei六子?.[0] < 20.05 && curData?.baifenwei六子?.[2] < 20.05)
    ) 中周期 = false //trick


    let 短周期 = true &&
        (
            (curData?.baifenwei六子 && curData?.baifenwei六子?.[3] <= 20) ||  //宽度
            (curData?.baifenwei六子 && pre1Data?.baifenwei六子?.[3] <= 20 && curData?.baifenwei六子?.[3] <= 40) ||
            (curData?.baifenwei六子 && pre1Data?.baifenwei六子?.[3] <= 20 && curData?.baifenwei六子?.[4] <= 20)
        )
        && (
            (curData?.baifenwei六子 && curData?.baifenwei六子?.[4] <= 20) ||  //rsi
            (curData?.baifenwei六子 && pre1Data?.baifenwei六子?.[4] <= 20 && curData?.baifenwei六子?.[4] <= 40) ||
            (curData?.baifenwei六子 && pre1Data?.baifenwei六子?.[4] <= 20 && curData?.baifenwei六子?.[3] <= 20)
        )


    if (中周期 && 短周期) {
        return true
    }


    return false
}


function 情绪汇总(curDate) {
    let 汇总 = ""

    if (科创50沪深300高估(curDate) === true) 汇总 += "科创50沪深300高估,"
    if (沪深300行业割裂大标准差(curDate) === true) 汇总 += "沪深300行业割裂大标准差,"
    if (科创50沪深300低估(curDate) === true) 汇总 += "科创50沪深300低估,"

    if (恐贪_深度贪婪(curDate) === true) 汇总 += "恐贪_深度贪婪,"
    if (恐贪_深度恐惧(curDate) === true) 汇总 += "恐贪_深度恐惧,"

    if (恐贪六子_深度恐惧(curDate) === true) 汇总 += "恐贪六子_深度恐惧,"

    return 汇总
}

if (typeof module !== "undefined" && module.exports) {

    exports.科创50估值 = 科创50估值
    exports.沪深300估值 = 沪深300估值
    exports.双创50_800消费_关联度_300权重 = 双创50_800消费_关联度_300权重
    exports.指数分位writeDateTime = 指数分位writeDateTime

    exports.恐贪指数 = 恐贪指数
    exports.恐贪指数writeDateTime = 恐贪指数writeDateTime

    exports.拥挤度 = 拥挤度
    exports.融资买入占比 = 融资买入占比
    exports.拥挤杠杆writeDateTime = 拥挤杠杆writeDateTime


    exports.科创50沪深300高估 = 科创50沪深300高估
    exports.沪深300行业割裂大标准差 = 沪深300行业割裂大标准差
    exports.科创50沪深300低估 = 科创50沪深300低估

    exports.恐贪_深度贪婪 = 恐贪_深度贪婪
    exports.恐贪_深度恐惧 = 恐贪_深度恐惧

    exports.恐贪六子_深度恐惧 = 恐贪六子_深度恐惧

    exports.情绪汇总 = 情绪汇总

}
