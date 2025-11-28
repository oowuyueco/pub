
const {
    dayToPeriod,
    wait,
    getDayPercent,
    curtPercent,
    curtAmp,
    writeDataToFile,
    getDataFromFile,
    isSendMail,
    mySendMail,
    devTestEnv,
    currentDayYMD,
    dateToStamp,
    stampToDate,
    getDateTime,
    PtPPercent
} = require("./my.js")

/////////////////////////////////////////////////////////////////

function volMaPre(N = 5, periodList, endIndex) {
    if (periodList.length < N + 1) return 0
    if (!periodList.at(0 - N - 4)?.volume) return 0
    //console.log(periodList.at(-1), periodList.at(0 - N - 1)?.volume)
    let sum = 0
    for (var i = 0; i < N; i++) {
        let currentPeriod = periodList.at(endIndex - i)
        sum += currentPeriod.volume
    }
    return sum / N
}

function ma5_ma10(currentPeriodList, index) {
    return volMaPre(5, currentPeriodList, index) - volMaPre(10, currentPeriodList, index)
}

function VOL死叉(currentPeriodList, N = 3, ma1 = 5, ma2 = 10) {
    if (currentPeriodList.length < 3) return false
    for (let index = 1; index <= N; index++) {
        if (
            volMaPre(ma1, currentPeriodList, 0 - (index + 1)) > volMaPre(ma2, currentPeriodList, 0 - (index + 1)) &&
            volMaPre(ma1, currentPeriodList, 0 - index) <= volMaPre(ma2, currentPeriodList, 0 - index)
        ) return true
    }
    return false
}

function KDJ死叉(periodList, N = 2, tweaks = 0) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = (pre1Period.K > pre1Period.D) && (currentPeriod.K <= currentPeriod.D + tweaks)
        if (res) return true
    }
    return false
}
function MACD死叉(periodList, N = 2, tweaks = 0) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period.bar > 0 && currentPeriod.bar <= 0 + tweaks
        if (res) return true
    }
    return false
}
function CCI死叉(periodList, N = 2, tweaks = 0) {
    if (periodList.length < 3) return false
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = (pre1Period.cci.cci > 100 && currentPeriod.cci.cci < 100) ||
            (pre1Period.cci.cci > 0 && currentPeriod.cci.cci <= 0)
        if (res) return true
    }
    return false

}
function 红空红绿(periodList, N = 1, tweaks = 0) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        if (
            true
            && curtPercent(pre2Period) >= 0
            && pre2Period.close <= pre1Period.open + tweaks && pre2Period.close <= pre1Period.close
            && curtPercent(pre1Period) >= 0
            && curtPercent(currentPeriod) < 0
        ) {
            return true
        }
    }

    return false
}
function pre4矩形穿ups(periodList) {
    if (periodList.length < 6) return false
    let pre3Period = periodList[periodList.length - 4]
    let pre2Period = periodList[periodList.length - 3]
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]

    for (index = -1; index >= -4; index--) {
        if (ocHighest(periodList.at(index)) >= periodList.at(index).ups)
            return true
    }

    return false
}
function kdjAllDown(periodList) {
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]
    return pre1Period.K > currentPeriod.K &&
        pre1Period.D > currentPeriod.D &&
        pre1Period.J > currentPeriod.J
}

function pre4矩形穿lows(periodList) {
    if (periodList.length < 6) return false
    let pre3Period = periodList[periodList.length - 4]
    let pre2Period = periodList[periodList.length - 3]
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]

    for (index = -1; index >= -4; index--) {
        if (ocLowest(periodList.at(index)) <= periodList.at(index).lows)
            return true
    }

    return false
}
function preNHighestAttr(periodList, N = 7, attr = "J") {
    let highest = -10000
    for (let index = periodList.length - 1; index >= periodList.length - N; index--) {
        let currentJVal = periodList[index][attr]
        if (currentJVal >= highest) highest = currentJVal
    }
    return highest
}
function ocHighest(period) {
    return period.open > period.close ? period.open : period.close
}
function ocLowest(period) {
    return period.open > period.close ? period.close : period.open
}
function preN矩形穿ups(periodList, N = 4, tweaks = 10) {
    if (periodList.length < 6) return false
    let pre3Period = periodList[periodList.length - 4]
    let pre2Period = periodList[periodList.length - 3]
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]

    //2018-01-31 shagnzheng
    for (index = -1; index >= (0 - N); index--) {
        if (ocHighest(periodList.at(index)) + tweaks >= periodList.at(index).ups)
            return true
    }

    return false
}
function preN十字星(periodList, N = 2) {
    for (let index = 1; index <= N; index++) {
        let currentPeriod = periodList[periodList.length - index]
        let res = (
            +Math.abs(curtPercent(currentPeriod)) < 0.9 &&   //1   //当期涨跌幅 阳线阴线 短矩形   '0.57,8.88'  0.35,11.96
            +Math.abs(curtAmp(currentPeriod)) < 23          //23 //矩形占比小
        )
        if (res) return true
    }
    return false
}
function 绿空绿红(periodList, N = 1) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        if (
            true
            && curtPercent(pre2Period) < 0
            && pre2Period.close >= pre1Period.open
            && curtPercent(pre1Period) < 0
            && curtPercent(currentPeriod) > 0
        ) {
            return true
        }
    }

    return false
}
function KDJ金叉(periodList, N = 2) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = (pre1Period.K < pre1Period.D) && (currentPeriod.K >= currentPeriod.D)
        if (res) return true
    }
    return false
}
function MACDpre金叉(periodList, N = 2) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = (
            (pre1Period.bar < pre1Period.dea && currentPeriod.bar >= currentPeriod.dea)
            ||
            (pre1Period.bar < pre1Period.diff && currentPeriod.bar >= currentPeriod.diff)
        )
        if (res) return true
    }
    return false
}
function MACD金叉(periodList, N = 2) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period.bar < 0 && currentPeriod.bar > 0
        if (res) return true
    }
    return false
}
function BIAS金叉0(periodList, attr = "bias1", N = 2) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period.bias[attr] < 0 && currentPeriod.bias[attr] >= 0
        if (res) return true
    }
    return false
}
function BIAS低位(periodList) {

    let pre2Period = periodList[periodList.length - 3]
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]

    return currentPeriod.bias.bias1 >= currentPeriod.bias.bias2 &&
        currentPeriod.bias.bias2 > currentPeriod.bias.bias3

}
function CCI金叉(periodList, N = 2) {
    if (periodList.length < 3) return false
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = (pre1Period.cci.cci < -100 && currentPeriod.cci.cci >= -100) ||
            (pre1Period.cci.cci < 0 && currentPeriod.cci.cci >= 0)
        if (res) return true
    }
    return false

}

function PSY金叉(periodList, N = 2) {
    if (periodList.length < 3) return false
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period.psyma > pre1Period.psy && currentPeriod.psyma <= currentPeriod.psy

        if (res) return true
    }
    return false

}
function ROC金叉(periodList, N = 2) {
    if (periodList.length < 3) return false
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period.roc.maRoc > pre1Period.roc.roc && currentPeriod.roc.maRoc <= currentPeriod.roc.roc

        if (res) return true
    }
    return false

}
function WVAD金叉(periodList, N = 2) {
    if (periodList.length < 3) return false
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period.wvad.wvadMa6 > pre1Period.wvad.wvad && currentPeriod.wvad.wvadMa6 <= currentPeriod.wvad.wvad

        if (res) return true
    }
    return false

}

function bollAllUp(periodList) {
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]
    if (!pre1Period?.ups) return false
    return pre1Period.ups < currentPeriod.ups &&
        pre1Period.mas < currentPeriod.mas &&
        pre1Period.lows < currentPeriod.lows
}
function kdjAllUp(periodList) {
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]
    return pre1Period.K < currentPeriod.K &&
        pre1Period.D < currentPeriod.D &&
        pre1Period.J < currentPeriod.J
}
function macdAllUp(periodList) {
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]
    return pre1Period.bar < currentPeriod.bar &&
        pre1Period.diff < currentPeriod.diff &&
        pre1Period.dea < currentPeriod.dea
}
function biasAllUp(periodList) {
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]
    return pre1Period.bias.bias1 < currentPeriod.bias.bias1 &&
        pre1Period.bias.bias2 < currentPeriod.bias.bias2 &&
        pre1Period.bias.bias3 < currentPeriod.bias.bias3
}

function mw宽松cal9转(periodList, N = 5) {

    var candleList = periodList
    if (candleList.length < 20) return candleList

    for (let endIndex = candleList.length - 1; candleList.length - N <= endIndex; endIndex--) {

        /*
        注意月 周 九转 cnIndex  Kline.html  这里使用Kline的
        if (endIndex == candleList.length - 1) {
            if (priod == "week" && new Date(当前交易日期).getDay() < 3) continue
            if (priod == "month" && +当前交易日期.substring(8, 10) < 18) continue
        }
        */

        let is9转up = true
        let is9转down = true
        for (var i = 0; i <= 8; i++) {
            is9转down = is9转down && (candleList[endIndex - i - 4].close > candleList[endIndex - i].close)
            is9转up = is9转up && (candleList[endIndex - i - 4].close < candleList[endIndex - i].close)
        }

        if (is9转up) {
            for (var i = 0; i <= 8; i++)
                candleList[endIndex - i]["is9转up"] = 9 - i
            //break
        }
        if (is9转down) {
            for (var i = 0; i <= 8; i++)
                candleList[endIndex - i]["is9转down"] = 9 - i
            //break
        }
    }

    return candleList
}


/*-----------------------------------------------------------------------*/


function globalMonth高位Filter(trigDate, triggerLogObj指数, nameCodes) {

    function 高概率继续上涨1() {
        return ( //ok
            bollAllUp(currentWeekList) &&
            (pre1Week.D < curWeek.D || (pre1Week.dea < curWeek.dea && pre1Week.diff < curWeek.diff)) &&

            bollAllUp(currentMonthList) &&
            curtPercent(curMonth) > 0 &&
            pre1Month.D < curMonth.D &&
            pre1Month.K < curMonth.K &&
            curMonth.mas < curMonth.ma10 &&
            (
                volMaPre(10, currentMonthList, -2) <= volMaPre(10, currentMonthList, -1) ||
                pre1Month.bar < curMonth.bar ||
                pre1Month.bias.bias3 < curMonth.bias.bias3
            )
        )
    }

    for (let index = 0; index < nameCodes.length; index++) {
        var nameCode = nameCodes[index]

        var currentMonthList = mw宽松cal9转(nameCode.currentMonthList)
        var pre3Month = currentMonthList.at(-4);
        var pre2Month = currentMonthList.at(-3);
        var pre1Month = currentMonthList.at(-2);
        var curMonth = currentMonthList.at(-1);

        var currentWeekList = nameCode.currentWeekList
        var pre3Week = currentWeekList.at(-4);
        var pre2Week = currentWeekList.at(-3);
        var pre1Week = currentWeekList.at(-2);
        var curWeek = currentWeekList.at(-1);

        if (高概率继续上涨1()) return [true, `高概率继续上涨1_${nameCode.name}`]
    }

    return [false, ""]
}

/*-----------------------------------------------------------------------*/

function globalTest低位Filter(trigDate, triggerLogObj指数, nameCodes) {

    let filterCount = 0
    for (let index = 0; index < triggerLogObj指数.按日期排序[trigDate].length; index++) {
        let quantName = triggerLogObj指数.按日期排序[trigDate][index];
        let nameCode
        if (quantName.includes("上证")) nameCode = nameCodes[0]
        if (quantName.includes("沪深300")) nameCode = nameCodes[1]
        if (quantName.includes("上证50")) nameCode = nameCodes[2]
        if (quantName.includes("恒生")) nameCode = nameCodes[3]
        if (!nameCode) nameCode = nameCodes[1]

        var currentDayList = nameCode.currentDayList
        var pre1Day = currentDayList.at(-2);
        var curDay = currentDayList.at(-1);


        var currentWeekList = nameCode.currentWeekList
        var pre3Week = currentWeekList.at(-4);
        var pre2Week = currentWeekList.at(-3);
        var pre1Week = currentWeekList.at(-2);
        var curWeek = currentWeekList.at(-1);

        var currentMonthList = nameCode.currentMonthList
        var pre3Month = currentMonthList.at(-4);
        var pre2Month = currentMonthList.at(-3);
        var pre1Month = currentMonthList.at(-2);
        var curMonth = currentMonthList.at(-1);

        let monthPRWArr = [
            curMonth.psyma > curMonth.psy,
            curMonth.roc.maRoc > curMonth.roc.roc,
            curMonth.wvad.wvadMa6 > curMonth.wvad.wvad
        ]
        let monthPRWLowCount = 0
        for (let i = 0; i < monthPRWArr.length; i++) {
            if (monthPRWArr[i]) monthPRWLowCount = monthPRWLowCount + 1
        }


        if (
            curMonth?.wvad?.wvadMa6 && curMonth?.psyma &&
            (
                quantName.includes("空但叉") || quantName.includes("日周") ||
                quantName.includes("KdjMacd双死叉副") || quantName.includes("KDJ")
            )
            &&
            !(
                51 >= curDay.psyma && 0.2 >= curDay.roc.maRoc &&
                (monthPRWLowCount >= 2 || (WVAD金叉(currentMonthList) && (PSY金叉(currentMonthList) || ROC金叉(currentMonthList)))) &&
                (50 >= curMonth.psy || 50 >= curMonth.psyma || 0 >= curMonth.roc.roc || 0 >= curMonth.roc.maRoc) &&
                !(
                    curWeek.wvad.wvadMa6 < curWeek.wvad.wvad &&
                    pre1Week.wvad.wvadMa6 > curWeek.wvad.wvadMa6 &&
                    curWeek.psyma < curWeek.psy &&
                    curWeek.roc.maRoc < curWeek.roc.roc
                )
            )
        ) {
            filterCount = filterCount + 1
        }


        if (
            quantName.includes("空但叉") &&
            kdjAllDown(currentWeekList) && curWeek.D >= 50 &&
            pre1Week.bar > curWeek.bar && curWeek.bar >= 0 &&
            curDay.bias.bias1 > 0
        ) {
            filterCount = filterCount + 1
        }
    }

    if (filterCount > Math.floor(triggerLogObj指数.按日期排序[trigDate].length / 2))
        return [true, `低位过滤数量${filterCount}`]





    return [false, ""]
}

/*-----------------------------------------------------------------------*/

function globalCheck缩量(trigDate, triggerLogObj指数, nameCodes) {

    function check缩量(quantName) {
        let nameCode
        if (quantName.includes("上证")) nameCode = nameCodes[0]
        if (quantName.includes("沪深300")) nameCode = nameCodes[1]
        if (quantName.includes("上证50")) nameCode = nameCodes[2]
        if (quantName.includes("恒生")) nameCode = nameCodes[3]
        if (!nameCode) nameCode = nameCodes[1]

        let currentDayList = nameCode.currentDayList
        let currentWeekList = nameCode.currentWeekList
        let currentMonthList = nameCode.currentMonthList


        if (+trigDate.substring(8, 10) > 25) {
            if (
                (currentMonthList.at(-1).volume / currentMonthList.at(-2).volume) < 0.86 &&
                volMaPre(10, currentMonthList, -1) >= volMaPre(5, currentMonthList, -1)
            ) {
                return [true, ""]
            }
        }


        if (+trigDate.substring(8, 10) < 25) {
            if (volMaPre(5, currentMonthList, -3) >= volMaPre(5, currentMonthList, -2))
                return [true, ""]

        } else {
            if (volMaPre(5, currentMonthList, -2) >= volMaPre(5, currentMonthList, -1))
                return [true, ""]
        }

        if (ma5_ma10(currentMonthList, -2) >= ma5_ma10(currentMonthList, -1))
            return [true, ""]

        if (
            volMaPre(20, currentMonthList, -1) >= volMaPre(10, currentMonthList, -1) &&
            volMaPre(10, currentMonthList, -1) >= volMaPre(5, currentMonthList, -1) &&
            volMaPre(5, currentMonthList, -2) >= volMaPre(5, currentMonthList, -1) &&
            volMaPre(10, currentMonthList, -2) >= volMaPre(10, currentMonthList, -1)
            // 2022-07-07 
        ) return [true, ""]

        if (
            (
                volMaPre(20, currentDayList, -2) >= volMaPre(20, currentDayList, -1) ||
                volMaPre(10, currentDayList, -2) >= volMaPre(10, currentDayList, -1) ||
                pre4矩形穿ups(currentDayList) || pre4矩形穿lows(currentDayList)
            ) &&
            currentWeekList.at(-3)?.volume > currentWeekList.at(-2)?.volume &&
            currentWeekList.at(-2)?.volume > currentWeekList.at(-1)?.volume &&
            (
                pre4矩形穿ups(currentWeekList) ||
                pre4矩形穿lows(currentWeekList) ||
                (preN十字星(currentWeekList) && 红空红绿(currentWeekList)) || // 2025-10-28
                (preN十字星(currentWeekList) && 绿空绿红(currentWeekList))
            )
            //2019-04-19 2020-03-27  2010-10-29
        ) return [true, ""]


        return [false, ""]
    }

    let has缩量 = false
    for (let index = 0; index < triggerLogObj指数.按日期排序[trigDate].length; index++) {
        let quantName = triggerLogObj指数.按日期排序[trigDate][index];
        if (typeof quantName === "object") continue

        let [quantName缩量, reson] = check缩量(quantName)
        has缩量 = has缩量 || quantName缩量
    }

    return [has缩量, ""]
}

/*-----------------------------------------------------------------------*/

function globalFilter(trigDate, triggerLogObj指数, nameCodes) {
    let quantType = triggerLogObj指数.按日期排序[trigDate][0].includes("高位") ? "高位" : "低位"
    let is过滤掉 = false
    let 过滤原因 = ""

    if (quantType == "高位") {
        let isFilter, filterReson;

        [isFilter, filterReson] = globalMonth高位Filter(trigDate, triggerLogObj指数, nameCodes)
        if (isFilter) { is过滤掉 = true; 过滤原因 += filterReson }

        if (is过滤掉) 过滤原因 = "高位过滤:" + filterReson
    }

    if (quantType == "低位") {
        let isFilter, filterReson;

        [isFilter, filterReson] = globalTest低位Filter(trigDate, triggerLogObj指数, nameCodes)
        if (isFilter) { is过滤掉 = true; 过滤原因 += filterReson }


        if (is过滤掉) 过滤原因 = "低位过滤:" + filterReson
    }

    let [isCheckOk, noCheckReson] = globalCheck缩量(trigDate, triggerLogObj指数, nameCodes)
    if (!isCheckOk) { is过滤掉 = true; 过滤原因 = 过滤原因 + ":全部未缩量" }


    return [is过滤掉, 过滤原因]
}

///////////////////////////////////

if (typeof module !== "undefined" && module.exports) {
    exports.globalFilter = globalFilter
}