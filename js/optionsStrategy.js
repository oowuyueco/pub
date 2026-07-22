
Array.prototype.cal9转 = function (kline交易日, priod, N = 5) {
    var candleList = this
    if (candleList.length < 20) return candleList

    for (let endIndex = candleList.length - 1; candleList.length - N <= endIndex; endIndex--) {

        if (endIndex == candleList.length - 1) {
            if (priod == "week" && new Date(kline交易日).getDay() < 3) continue
            if (priod == "month" && +kline交易日.substring(8, 10) < 18) continue
        }

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
function calDayWeekMonthKline(nameCode, kline交易日) {
    nameCode.currentDayList = []
    nameCode.currentWeekList = []
    nameCode.currentMonthList = []
    let currentDayIndex = nameCode.dayDatas.findIndex(ele => { return ele.date == kline交易日 });
    if (currentDayIndex > 70) {
        let dayStart = (currentDayIndex + 1) - 100 > 0 ? (currentDayIndex + 1) - 100 : 0 //day计算最近100天
        nameCode.currentDayList = nameCode.dayDatas.slice(dayStart, currentDayIndex + 1)
            .calBoll().cal9转(kline交易日, "day").calKdj().calMacd().maN(10, "close")
        nameCode.currentDayList = calculationBias(nameCode.currentDayList)
        nameCode.currentDayList = calculationCci(nameCode.currentDayList, [14]) //正常默认应该是14  

        let weekDayStart = (currentDayIndex + 1) - 500 > 0 ? (currentDayIndex + 1) - 500 : 0 //week最近100周500天
        nameCode.currentWeekList = dayToPeriod(nameCode.dayDatas.slice(weekDayStart, currentDayIndex + 1), "week")
            .calBoll().cal9转(kline交易日, "week").calKdj().calMacd().maN(10, 'close')
        nameCode.currentWeekList = calculationBias(nameCode.currentWeekList)
        nameCode.currentWeekList = calculationCci(nameCode.currentWeekList, [14]) //正常默认应该是14  

        let monthDayStart = 0 //month全部
        nameCode.currentMonthList = dayToPeriod(nameCode.dayDatas.slice(monthDayStart, currentDayIndex + 1), "month")
            .calBoll().cal9转(kline交易日, "month").calKdj().calMacd()
            .maN(3, 'close').maN(5, 'close').maN(10, 'close').maN(80, 'close')
        nameCode.currentMonthList = calculationBias(nameCode.currentMonthList)
        nameCode.currentMonthList = calculationCci(nameCode.currentMonthList, [14]) //正常默认应该是14  
    }
    return nameCode
}
function lastN九转(periodList = [], downUp = "is9转up", N = 3) {
    if (!periodList || periodList.length < 15) return false

    let lastNPeriondhas9 = false
    for (let index = 1; index <= N; index++) {

        if (downUp == "is9转up" && periodList[periodList.length - index]?.is9转up == 9) {
            lastNPeriondhas9 = true
            break
        }

        if (downUp == "is9转down" && periodList[periodList.length - index]?.is9转down == 9) {
            lastNPeriondhas9 = true
            break
        }
    }
    return lastNPeriondhas9
}

function volMaPre(N = 5, currentPeriodList, endIndex) {
    if (currentPeriodList.length < N + 1) return 0
    let sum = 0
    for (var i = 0; i < N; i++) {
        let currentPeriod = currentPeriodList.at(endIndex - i)
        sum += currentPeriod.volume
    }
    return sum / N
}
function volMa(N = 5, currentPeriodList, endIndex) {
    if (currentPeriodList.length < N + 1) return 0
    let sum = 0
    for (var i = 0; i < N; i++) {
        let currentPeriod = currentPeriodList.at(endIndex - i)
        sum += currentPeriod.volume
    }
    return sum / N
}
function preNHighestAttr(periodList, N = 7, attr = "J") {
    let highest = -10000
    for (let index = periodList.length - 1; index >= periodList.length - N; index--) {
        let currentVal = periodList[index][attr]
        if (currentVal > highest) highest = currentVal
    }
    return highest
}
function preN十字星(periodList, N = 2) {
    for (let index = 1; index <= N; index++) {
        let currentPeriod = periodList[periodList.length - index]
        let res = (
            +Math.abs(curtPercent(currentPeriod)) < 0.9 &&   //1   //当期涨跌幅 阳线阴线 短矩形   '0.57,8.88'  0.35,11.96
            +Math.abs(curtAmp(currentPeriod)) < 13          //23 //矩形占比小
        )
        if (res) return true
    }
    return false
}
function preN矩形穿ups(periodList, N = 4, tweaks = 0) {
    if (periodList.length < 6) return false
    for (index = -1; index >= (0 - N); index--) {
        if (ocHighest(periodList.at(index)) + tweaks >= periodList.at(index).ups)
            return true
    }
    return false
}
function KDJ金叉(periodList, N = 3) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = (pre1Period.K < pre1Period.D) && (currentPeriod.K >= currentPeriod.D)
        if (res) return true
    }
    return false
}
function MACD金叉attr(periodList, attr = "bar", N = 3) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period?.[attr] < 0 && currentPeriod?.[attr] >= 0
        if (res) return true
    }
    return false
}
function BIAS金叉attr(periodList, attr = "bias1", N = 3) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period.bias?.[attr] < 0 && currentPeriod.bias?.[attr] >= 0
        if (res) return true
    }
    return false
}
function bollAllUp(periodList) {
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]
    return pre1Period.ups < currentPeriod.ups &&
        pre1Period.mas < currentPeriod.mas &&
        pre1Period.lows < currentPeriod.lows
}
function volAllUp(periodList) {
    return volMa(5, periodList, -2) < volMa(5, periodList, -1) &&
        volMa(10, periodList, -2) < volMa(10, periodList, -1) &&
        volMa(20, periodList, -2) < volMa(20, periodList, -1)
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


function volMa死叉(currentPeriodList, maN = 5, maM = 10, N = 3) {
    for (let index = -1; index >= 0 - N; index--) {
        if (
            volMa(maN, currentPeriodList, index - 1) > volMa(maM, currentPeriodList, index - 1) &&
            volMa(maN, currentPeriodList, index) < volMa(maM, currentPeriodList, index)
        ) return true
    }
    return false
}
function KDJ死叉(periodList, N = 3, tweaks = 0) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = (pre1Period.K > pre1Period.D) && (currentPeriod.K <= currentPeriod.D + tweaks)
            && pre1Period.J > currentPeriod.J
        if (res) return true
    }
    return false
}
function MACD死叉attr(periodList, attr = "bar", N = 3) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period[attr] > 0 && currentPeriod[attr] <= 0
        if (res) return true
    }
    return false
}
function BIAS死叉attr(periodList, attr = "bias1", N = 3) {
    for (let index = 1; index <= N; index++) {
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        let res = pre1Period.bias?.[attr] > 0 && currentPeriod.bias?.[attr] <= 0
        if (res) return true
    }
    return false
}

function volAllDown(periodList) {
    return volMa(5, periodList, -2) > volMa(5, periodList, -1) &&
        volMa(10, periodList, -2) > volMa(10, periodList, -1) &&
        volMa(20, periodList, -2) > volMa(20, periodList, -1)
}
function kdjAllDown(periodList) {
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]
    return pre1Period.K > currentPeriod.K &&
        pre1Period.D > currentPeriod.D &&
        pre1Period.J > currentPeriod.J
}
function macdAllDown(periodList) {
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]
    return pre1Period.bar > currentPeriod.bar &&
        pre1Period.diff > currentPeriod.diff &&
        pre1Period.dea > currentPeriod.dea
}
function biasAllDown(periodList) {
    let pre1Period = periodList[periodList.length - 2]
    let currentPeriod = periodList[periodList.length - 1]
    return pre1Period.bias.bias1 > currentPeriod.bias.bias1 &&
        pre1Period.bias.bias2 > currentPeriod.bias.bias2 &&
        pre1Period.bias.bias3 > currentPeriod.bias.bias3
}


function ocHighest(period) {
    if (period?.open) return period.open > period.close ? period.open : period.close
    if (period?.开盘价) return period.开盘价 > period.收盘价 ? period.开盘价 : period.收盘价
}
function ocLowest(period) {
    return period.open < period.close ? period.open : period.close
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

function 绿绿(periodList, N = 1) {
    for (let index = 1; index <= N; index++) {
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        if (
            true
            && curtPercent(pre1Period) < 0
            && curtPercent(currentPeriod) < 0
        ) {
            return true
        }
    }
    return false
}
function 绿空绿(periodList, N = 1) {
    for (let index = 1; index <= N; index++) {
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        if (
            true
            && curtPercent(pre1Period) < 0
            && (pre1Period.close > currentPeriod.open)
            && curtPercent(currentPeriod) < 0
        ) {
            return true
        }
    }
    return false
}
function 绿空红(periodList, N = 1) {
    for (let index = 1; index <= N; index++) {
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        if (
            true
            && curtPercent(pre1Period) <= 0
            && (pre1Period.close > currentPeriod.close)
            && curtPercent(currentPeriod) > 0
        ) {
            return true
        }
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
            && curtPercent(pre2Period) <= 0
            && (pre2Period.close > pre1Period.open)
            && curtPercent(pre1Period) <= 0
            && curtPercent(currentPeriod) >= 0
        ) {
            return true
        }
    }

    return false
}
function 绿空绿绿(periodList, N = 1) {
    for (let index = 1; index <= N; index++) {
        let pre3Period = periodList[periodList.length - (index + 3)]
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        if (
            true
            && curtPercent(pre2Period) <= 0
            && (pre2Period.close > pre1Period.open)
            && curtPercent(pre1Period) <= 0
            && curtPercent(currentPeriod) <= 0
            //&& curtPercent(currentPeriod) >= 0
        ) {
            return true
        }
    }

    return false
}
function 绿空绿绿红(periodList, N = 1) {
    for (let index = 1; index <= N; index++) {
        let pre3Period = periodList[periodList.length - (index + 3)]
        let pre2Period = periodList[periodList.length - (index + 2)]
        let pre1Period = periodList[periodList.length - (index + 1)]
        let currentPeriod = periodList[periodList.length - index]
        if (
            true
            && curtPercent(pre3Period) <= 0
            && (pre3Period.close > pre2Period.open)
            && curtPercent(pre2Period) <= 0
            && curtPercent(pre1Period) <= 0
            && curtPercent(currentPeriod) >= 0
        ) {
            return true
        }
    }

    return false
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const min期权days = 20

const nextFirstDeliveryKey = 期权到期日类型 == "股指周五" ? "nextFirstDelivery周五" : "nextFirstDelivery周三"
const nextSecondDeliveryKey = 期权到期日类型 == "股指周五" ? "nextSecondDelivery周五" : "nextSecondDelivery周三"
const nextThirdDeliveryKey = 期权到期日类型 == "股指周五" ? "nextThirdDelivery周五" : "nextThirdDelivery周三"

const 期权标的资产 = 期权到期日类型 == "股指周五" ? 沪深300 : 沪深300ETF
const 期权标的资产Name = 期权到期日类型 == "股指周五" ? "沪深300" : "沪深300ETF"


const 标星冲突不显示 = true
function 统计策略(triggerLogObj, 策略名 = "", 高低位 = "低位", 汇总N = 5, 过滤M = 10) {

    let trigDateArr = Object.entries(triggerLogObj)
        .filter((ele, index) => { return ele[1][0].includes(高低位) })

    if (标星冲突不显示)
        trigDateArr = trigDateArr.filter((ele, index) => { return !ele[1].at(-1)?.冲突 })

    trigDateArr = trigDateArr.map((ele, index, preArr) => {
        let newArr = []
        newArr[0] = ele[0]
        newArr[1] = ele[1].toSpliced(-1)
        newArr[2] = ele[1].at(-1)
        newArr[3] = newArr[2]?.标星 ? newArr[2]?.标星.replace("位", "") : (newArr[1][0].includes("高位") ? "高位" : "低位")
        return newArr
    })

    trigDateArr.forEach((ele, index) => {
        if (index == 0) return ele[5] = "✔"
        let last对号 = trigDateArr.findLast(ele => ele.at(-1) == "✔")
        if (dateToStamp(ele[0]) >= dateToStamp(last对号[0]) + 过滤M * 86400000)
            ele[5] = "✔"
        else
            ele[5] = "✗"
    })
    trigDateArr = trigDateArr.map((ele, index, preArr) => {
        let 包含当天最近N天触发的日期 = preArr.filter(preArrEle => {
            return dateToStamp(ele[0]) >= dateToStamp(preArrEle[0]) && dateToStamp(preArrEle[0]) >= dateToStamp(ele[0]) - 汇总N * 86400000
        })
        包含当天最近N天触发的日期.sort((a, b) => dateToStamp(b[0]) - dateToStamp(a[0]))
        ele[4] = 包含当天最近N天触发的日期
        return ele
    })
    trigDateArr.sort((a, b) => dateToStamp(b[0]) - dateToStamp(a[0]))

    let trig期权日Arr = [], trig期权日Obj = {}
    trigDateArr.forEach((ele, index) => {
        let dateTrig = ele[0], trig策略s = ele[1], profileN = ele[2], 位箭 = ele[3];

        let nextN期权到期, N;
        let overMin期权days = (profileN, nextNDelivery到期) => {
            if (!profileN?.[nextFirstDeliveryKey]) return false
            if (!profileN?.[nextNDelivery到期]) return false
            let closeDay = +profileN[nextNDelivery到期].close.split("->")[0]
            if (closeDay > min期权days) return true
            return false
        }
        // 第一个>=N2&&>20天的,否则默认2。
        if (overMin期权days(profileN, nextFirstDeliveryKey)) { nextN期权到期 = nextFirstDeliveryKey; N = 1 }
        else if (overMin期权days(profileN, nextSecondDeliveryKey)) { nextN期权到期 = nextSecondDeliveryKey; N = 2 }
        else if (overMin期权days(profileN, nextThirdDeliveryKey)) { nextN期权到期 = nextThirdDeliveryKey; N = 3 }
        else {
            //after预测工作日天数 以实际为准
            if (countWorkdays(dateTrig, profileN?.after?.[nextFirstDeliveryKey]) > min期权days) { nextN期权到期 = nextFirstDeliveryKey; N = 1 }
            else if (countWorkdays(dateTrig, profileN?.after?.[nextSecondDeliveryKey]) > min期权days) { nextN期权到期 = nextSecondDeliveryKey; N = 2 }
            else if (countWorkdays(dateTrig, profileN?.after?.[nextThirdDeliveryKey]) > min期权days) { nextN期权到期 = nextThirdDeliveryKey; N = 3 }
        }

        let 期权日key
        if (profileN[nextN期权到期]) { 期权日key = `后${N}到期` + profileN[nextN期权到期].close.split("->")[1].split(",")[0] }
        else if (profileN.after) { 期权日key = `后${N}到期` + profileN.after[nextN期权到期]; }

        if (!期权日key) return
        if (位箭.includes("高") || 位箭.includes(" ↓ ")) 期权日key = "沽" + 期权日key
        else if (位箭.includes("低") || 位箭.includes(" ↑ ")) 期权日key = "购" + 期权日key

        if (trig期权日Obj.hasOwnProperty(期权日key)) trig期权日Obj[期权日key].push(ele)
        else trig期权日Obj[期权日key] = [ele]
    })
    for (let [nextN期权到期key, trigDateArr] of Object.entries(trig期权日Obj)) {

        let nextN期权到期 = nextSecondDeliveryKey
        if (nextN期权到期key.includes("后3到期")) nextN期权到期 = nextThirdDeliveryKey

        let closeHighest = -1000000, closeHighest百分比 = -1000000
        let closeLowes = 1000000, closeLowes百分比 = 1000000
        let type = trigDateArr[0][1][0].includes("高位") ? "高位" : "低位"
        for (let trigDate of trigDateArr) {
            let profileN = trigDate[2]
            let closePoint = typeof profileN[nextN期权到期] !== "undefined" ? +profileN[nextN期权到期].close.split(",")[1] : +profileN.after.close.split(",")[1]//close 点位变化
            let closePercent = typeof profileN[nextN期权到期] !== "undefined" ? +profileN[nextN期权到期].close.split(",")[2] : +profileN.after.close.split(",")[2]//baifenbi 点位变化
            if (closePoint > closeHighest) {
                closeHighest = closePoint
                closeHighest百分比 = closePercent
            }
            if (closePoint < closeLowes) {
                closeLowes = closePoint
                closeLowes百分比 = closePercent
            }
            if (profileN?.标星) type = profileN?.标星.replace("位", "")
        }

        let trig期权日Info = [nextN期权到期key, trigDateArr, type]
        trig期权日Info.maxRatio = closeHighest百分比
        trig期权日Info.minRatio = closeLowes百分比
        trig期权日Arr.push(trig期权日Info)
    }
    trig期权日Arr.sort((a, b) => dateToStamp(b[0].substring(4)) - dateToStamp(a[0].substring(4)))
    trig期权日Arr.maxRatio统计 = {
        maxRatio中位: calMedianProf(trig期权日Arr, "maxRatio"),
        maxRatio平均: calAvgProf(trig期权日Arr, "maxRatio"),
        maxRatio最大: cal极值(trig期权日Arr, "maxRatio").max,
        maxRatio最小: cal极值(trig期权日Arr, "maxRatio").min,
    }
    trig期权日Arr.minRatio统计 = {
        minRatio中位: calMedianProf(trig期权日Arr, "minRatio"),
        minRatio平均: calAvgProf(trig期权日Arr, "minRatio"),
        minRatio最大: cal极值(trig期权日Arr, "minRatio").max,
        minRatio最小: cal极值(trig期权日Arr, "minRatio").min,
    }


    return {
        trigDateArr: trigDateArr,
        trig期权日Arr: trig期权日Arr
    }
}
function changeShowLog(策略ByDay) {
    let resultArr = []
    function toKline(profileN) {
        let key

        let nextN期权到期 = nextSecondDeliveryKey
        let nextArr = [nextSecondDeliveryKey, nextThirdDeliveryKey]
        for (var i = 0; i < nextArr.length; i++) {
            let nextNDelivery到期 = nextArr[i]
            if (profileN[nextNDelivery到期]) {
                let closeDay = +profileN[nextNDelivery到期].close.split("->")[0]
                if (closeDay > min期权days) {
                    nextN期权到期 = nextNDelivery到期
                    break
                }
            }
        }

        if (Object.hasOwn(profileN, nextSecondDeliveryKey) && nextN期权到期 == nextSecondDeliveryKey) key = nextSecondDeliveryKey
        else if (Object.hasOwn(profileN, nextThirdDeliveryKey) && nextN期权到期 == nextThirdDeliveryKey) key = nextThirdDeliveryKey
        else key = "after"

        if (!profileN[key]) return []
        return [
            0,
            +profileN[key].high.split(",")[2],
            +profileN[key].low.split(",")[2],
            +profileN[key].close.split(",")[2],

            key == "after" ? `after${profileN.after.close.split("->")[0]}` : key,
            profileN[key].close.split(",")[0],
            +profileN[key].close.split(",")[1],
        ]
    }
    resultArr = 策略ByDay.map((ele, index) => {
        let newShowArr = []
        newShowArr.push(ele[0])

        newShowArr.push(ele[3])
        newShowArr.push(ele[4].length)
        newShowArr.push(ele[5])

        newShowArr = newShowArr.concat(toKline(ele[2]))
        newShowArr.push(ele[1] + "")

        let testInfo = ele[2]?.testInfo ?? ""// triggerLogObj指数.日周高位九转.find(e=>e.trigDate==ele[0])?.九转详情
        newShowArr.push(testInfo)
        return newShowArr
    })
        //.filter((ele, index) => { return ele.at(-1).includes("日周") })
        .sort((a, b) => dateToStamp(b[0]) - dateToStamp(a[0]))
        //.sort((a, b) => a[6] - b[6])
        .map((ele, index) => {
            if (ele[7] == nextSecondDeliveryKey) ele[7] = "后2到期"
            if (ele[7] == nextThirdDeliveryKey) ele[7] = "后3到期"
            return ele
        })

    return resultArr
}

//pmi股债策略
let pmi股债策略高位 = 统计策略(triggerLogObjPmi股债, "pmi股债策略", "高位")
let pmi股债策略低位 = 统计策略(triggerLogObjPmi股债, "pmi股债策略", "低位")

let pmi股债策略高位ByDay = pmi股债策略高位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let pmi股债策略低位ByDay = pmi股债策略低位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let pmi股债策略高位By期权日 = pmi股债策略高位.trig期权日Arr
let pmi股债策略低位By期权日 = pmi股债策略低位.trig期权日Arr

console.groupCollapsed("pmi股债策略高位ByDay   pmi股债策略高位By期权日")
console.log(pmi股债策略高位ByDay, changeShowLog(pmi股债策略高位ByDay), pmi股债策略高位By期权日)
console.groupEnd()
console.groupCollapsed("pmi股债策略低位ByDay   pmi股债策略低位By期权日")
console.log(pmi股债策略低位ByDay, changeShowLog(pmi股债策略低位ByDay), pmi股债策略低位By期权日)
console.groupEnd()

//基金策略
let 基金策略高位 = 统计策略(triggerLogObj基金, "基金策略", "高位")
let 基金策略低位 = 统计策略(triggerLogObj基金, "基金策略", "低位")

let 基金策略高位ByDay = 基金策略高位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let 基金策略低位ByDay = 基金策略低位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let 基金策略高位By期权日 = 基金策略高位.trig期权日Arr
let 基金策略低位By期权日 = 基金策略低位.trig期权日Arr

console.groupCollapsed("基金策略高位ByDay   基金策略高位By期权日")
console.log(基金策略高位ByDay, changeShowLog(基金策略高位ByDay), 基金策略高位By期权日)
console.groupEnd()
console.groupCollapsed("基金策略低位ByDay   基金策略低位By期权日")
console.log(基金策略低位ByDay, changeShowLog(基金策略低位ByDay), 基金策略低位By期权日)
console.groupEnd()


//同花顺策略
let 同花顺策略高位 = 统计策略(triggerLogObj同花顺, "同花顺策略", "高位")
let 同花顺策略低位 = 统计策略(triggerLogObj同花顺, "同花顺策略", "低位")

let 同花顺策略高位ByDay = 同花顺策略高位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let 同花顺策略低位ByDay = 同花顺策略低位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let 同花顺策略高位By期权日 = 同花顺策略高位.trig期权日Arr
let 同花顺策略低位By期权日 = 同花顺策略低位.trig期权日Arr

console.groupCollapsed("同花顺策略高位ByDay   同花顺策略高位By期权日")
console.log(同花顺策略高位ByDay, changeShowLog(同花顺策略高位ByDay), 同花顺策略高位By期权日)
console.groupEnd()
console.groupCollapsed("同花顺策略低位ByDay   同花顺策略低位By期权日")
console.log(同花顺策略低位ByDay, changeShowLog(同花顺策略低位ByDay), 同花顺策略低位By期权日)
console.groupEnd()

//指数策略
let 指数策略高位 = 统计策略(triggerLogObj指数.按日期排序, "指数策略", "高位")
let 指数策略低位 = 统计策略(triggerLogObj指数.按日期排序, "指数策略", "低位")
let 指数策略高位ByDay = 指数策略高位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let 指数策略低位ByDay = 指数策略低位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let 指数策略高位By期权日 = 指数策略高位.trig期权日Arr
let 指数策略低位By期权日 = 指数策略低位.trig期权日Arr

console.groupCollapsed("指数策略高位ByDay   指数策略高位By期权日")
console.log(指数策略高位ByDay, changeShowLog(指数策略高位ByDay), 指数策略高位By期权日)
console.groupEnd()
console.groupCollapsed("指数策略低位ByDay   指数策略低位By期权日")
console.log(指数策略低位ByDay, changeShowLog(指数策略低位ByDay), 指数策略低位By期权日)
console.groupEnd()


//券商策略
let 券商策略高位 = 统计策略(triggerLogObj券商.按日期排序, "券商策略", "高位")
let 券商策略低位 = 统计策略(triggerLogObj券商.按日期排序, "券商策略", "低位")
let 券商策略高位ByDay = 券商策略高位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let 券商策略低位ByDay = 券商策略低位.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
let 券商策略高位By期权日 = 券商策略高位.trig期权日Arr
let 券商策略低位By期权日 = 券商策略低位.trig期权日Arr

console.groupCollapsed("券商策略高位ByDay   券商策略高位By期权日")
console.log(券商策略高位ByDay, changeShowLog(券商策略高位ByDay), 券商策略高位By期权日)
console.groupEnd()
console.groupCollapsed("券商策略低位ByDay   券商策略低位By期权日")
console.log(券商策略低位ByDay, changeShowLog(券商策略低位ByDay), 券商策略低位By期权日)
console.groupEnd()


//区间策略
function 统计区间区间策略(区间类型 = "上升日期区间", 汇总N = 5, 过滤M = 10) {
    let 区间ByDay = {}
    let 区间By期权日 = {}
    for (let [日期区间, 区间trigDateArr] of Object.entries(triggerLogObj区间[区间类型])) {

        let trigDateArr = Object.entries(区间trigDateArr)
            .map((ele, index, preArr) => {
                let newArr = []
                newArr[0] = ele[0]
                newArr[1] = ele[1].toSpliced(-1).map((ele, index) => ele.quantName +

                    (function (ar) {
                        return ele.logInfo //""
                    })(ele.logInfo) //test

                )
                newArr[2] = ele[1].at(-1)
                newArr[3] = 区间类型.includes("上升") ? " ↑ " : " ↓ " // newArr[2]?.标星 ? newArr[2]?.标星.replace("位", "") : (newArr[1][0].includes("高位") ? "高位" : "低位")
                return newArr
            })
        trigDateArr.forEach((ele, index) => {
            if (index == 0) return ele[4] = "✔"
            let last对号 = trigDateArr.findLast(ele => ele.at(-1) == "✔")
            if (dateToStamp(ele[0]) >= dateToStamp(last对号[0]) + 过滤M * 86400000)
                ele[5] = "✔"
            else
                ele[5] = "✗"
        })
        trigDateArr = trigDateArr.map((ele, index, preArr) => {
            let 包含当天最近N天触发的日期 = preArr.filter(preArrEle => {
                return dateToStamp(ele[0]) >= dateToStamp(preArrEle[0]) && dateToStamp(preArrEle[0]) >= dateToStamp(ele[0]) - 汇总N * 86400000
            })
            包含当天最近N天触发的日期.sort((a, b) => dateToStamp(b[0]) - dateToStamp(a[0]))
            ele[4] = 包含当天最近N天触发的日期
            return ele
        })
        trigDateArr.sort((a, b) => dateToStamp(b[0]) - dateToStamp(a[0]))


        let trig期权日Arr = [], trig期权日Obj = {}
        trigDateArr.forEach((ele, index) => {
            let dateTrig = ele[0], trig策略s = ele[1], profileN = ele[2], 位箭 = ele[3];

            let nextN期权到期, N;
            let overMin期权days = (profileN, nextNDelivery到期) => {
                if (!profileN?.[nextFirstDeliveryKey]) return false
                if (!profileN?.[nextNDelivery到期]) return false
                let closeDay = +profileN[nextNDelivery到期].close.split("->")[0]
                if (closeDay > min期权days) return true
                return false
            }

            // 第一个>=N2&&>20天的,否则默认2。
            if (overMin期权days(profileN, nextFirstDeliveryKey)) { nextN期权到期 = nextFirstDeliveryKey; N = 1 }
            else if (overMin期权days(profileN, nextSecondDeliveryKey)) { nextN期权到期 = nextSecondDeliveryKey; N = 2 }
            else if (overMin期权days(profileN, nextThirdDeliveryKey)) { nextN期权到期 = nextThirdDeliveryKey; N = 3 }
            else {
                //after预测工作日天数 以实际为准
                if (countWorkdays(dateTrig, profileN?.after?.[nextFirstDeliveryKey]) > min期权days) { nextN期权到期 = nextFirstDeliveryKey; N = 1 }
                else if (countWorkdays(dateTrig, profileN?.after?.[nextSecondDeliveryKey]) > min期权days) { nextN期权到期 = nextSecondDeliveryKey; N = 2 }
                else if (countWorkdays(dateTrig, profileN?.after?.[nextThirdDeliveryKey]) > min期权days) { nextN期权到期 = nextThirdDeliveryKey; N = 3 }
            }

            let 期权日key
            if (profileN[nextN期权到期]) { 期权日key = `后${N}到期` + profileN[nextN期权到期].close.split("->")[1].split(",")[0] }
            else if (profileN.after) { 期权日key = `后${N}到期` + profileN.after[nextN期权到期]; }

            if (!期权日key) return
            if (位箭.includes("高") || 位箭.includes(" ↓ ")) 期权日key = "沽" + 期权日key
            else if (位箭.includes("低") || 位箭.includes(" ↑ ")) 期权日key = "购" + 期权日key

            if (trig期权日Obj.hasOwnProperty(期权日key)) trig期权日Obj[期权日key].push(ele)
            else trig期权日Obj[期权日key] = [ele]
        })
        for (let [nextN期权到期key, trigDateArr] of Object.entries(trig期权日Obj)) {

            let nextN期权到期 = nextSecondDeliveryKey
            if (nextN期权到期key.includes("后3到期")) nextN期权到期 = nextThirdDeliveryKey

            let closeHighest = -1000000, closeHighest百分比 = -1000000
            let closeLowes = 1000000, closeLowes百分比 = 1000000
            let type = 区间类型.includes("上升") ? " ↑ " : " ↓ "
            for (let trigDate of trigDateArr) {
                let profileN = trigDate[2]
                let closePoint = typeof profileN[nextN期权到期] !== "undefined" ? +profileN[nextN期权到期].close.split(",")[1] : +profileN.after.close.split(",")[1]//close 点位变化
                let closePercent = typeof profileN[nextN期权到期] !== "undefined" ? +profileN[nextN期权到期].close.split(",")[2] : +profileN.after.close.split(",")[2]//baifenbi 点位变化
                if (closePoint > closeHighest) {
                    closeHighest = closePoint
                    closeHighest百分比 = closePercent
                }
                if (closePoint < closeLowes) {
                    closeLowes = closePoint
                    closeLowes百分比 = closePercent
                }
                //if (profileN?.标星) type = profileN?.标星.replace("位", "")
            }

            let trig期权日Info = [nextN期权到期key, trigDateArr, type] //
            trig期权日Info.maxRatio = closeHighest百分比
            trig期权日Info.minRatio = closeLowes百分比
            trig期权日Arr.push(trig期权日Info)
        }
        trig期权日Arr.sort((a, b) => dateToStamp(b[0].substring(4)) - dateToStamp(a[0].substring(4)))
        trig期权日Arr.maxRatio统计 = {
            maxRatio中位: calMedianProf(trig期权日Arr, "maxRatio"),
            maxRatio平均: calAvgProf(trig期权日Arr, "maxRatio"),
            maxRatio最大: cal极值(trig期权日Arr, "maxRatio").max,
            maxRatio最小: cal极值(trig期权日Arr, "maxRatio").min,
        }
        trig期权日Arr.minRatio统计 = {
            minRatio中位: calMedianProf(trig期权日Arr, "minRatio"),
            minRatio平均: calAvgProf(trig期权日Arr, "minRatio"),
            minRatio最大: cal极值(trig期权日Arr, "minRatio").max,
            minRatio最小: cal极值(trig期权日Arr, "minRatio").min,
        }


        区间ByDay[日期区间] = trigDateArr
        区间By期权日[日期区间] = trig期权日Arr
    }
    return {
        区间ByDay: 区间ByDay,
        区间By期权日: 区间By期权日,
    }
}
let 上升区间区间策略 = 统计区间区间策略("上升日期区间")
let 下降区间区间策略 = 统计区间区间策略("下降日期区间")
let 上升区间ByDay = 上升区间区间策略.区间ByDay
let 上升区间By期权日 = 上升区间区间策略.区间By期权日
let 下降区间ByDay = 下降区间区间策略.区间ByDay
let 下降区间By期权日 = 下降区间区间策略.区间By期权日

上升区间By期权日.all = []
for (const [区间Date, trigDateArr] of Object.entries(上升区间By期权日)) {
    上升区间By期权日.all = 上升区间By期权日.all.concat(trigDateArr)
}
下降区间By期权日.all = []
for (const [区间Date, trigDateArr] of Object.entries(下降区间By期权日)) {
    下降区间By期权日.all = 下降区间By期权日.all.concat(trigDateArr)
}

function changeShow区间Log(区间By) {
    let result = {}
    let allArr = []
    function toKline(profileN) {
        let key

        let nextN期权到期 = nextSecondDeliveryKey
        let nextArr = [nextSecondDeliveryKey, nextThirdDeliveryKey]
        for (var i = 0; i < nextArr.length; i++) {
            let nextNDelivery到期 = nextArr[i]
            if (profileN[nextNDelivery到期]) {
                let closeDay = +profileN[nextNDelivery到期].close.split("->")[0]
                if (closeDay > min期权days) {
                    nextN期权到期 = nextNDelivery到期
                    break
                }
            }
        }

        if (Object.hasOwn(profileN, nextSecondDeliveryKey) && nextN期权到期 == nextSecondDeliveryKey) key = nextSecondDeliveryKey
        else if (Object.hasOwn(profileN, nextThirdDeliveryKey) && nextN期权到期 == nextThirdDeliveryKey) key = nextThirdDeliveryKey
        else key = "after"

        return [
            0,
            +profileN[key].high.split(",")[2],
            +profileN[key].low.split(",")[2],
            +profileN[key].close.split(",")[2],

            key == "after" ? `after${profileN.after.close.split("->")[0]}` : key,
            profileN[key].close.split(",")[0],
            +profileN[key].close.split(",")[1],
        ]
    }
    for (const [区间Date, trigDateArr] of Object.entries(区间By)) {
        result[区间Date] = trigDateArr.map((ele, index) => {
            let newShowArr = []
            newShowArr.push(ele[0])
            newShowArr.push(ele[3].length)
            newShowArr.push(ele[4])
            newShowArr = newShowArr.concat(toKline(ele[2]))
            newShowArr.push(ele[1] + "")
            return newShowArr
        })
        allArr = allArr.concat(result[区间Date])
    }
    result["all"] = allArr
        //.filter((ele, index) => { return ele.at(-1).includes("_one") })
        .sort((a, b) => dateToStamp(b[0]) - dateToStamp(a[0]))
        .sort((a, b) => b[6] - a[6])
        .map((ele, index) => {
            if (ele[7] == nextSecondDeliveryKey) ele[7] = "后2到期"
            if (ele[7] == nextThirdDeliveryKey) ele[7] = "后3到期"
            return ele
        })

    return result
}
console.groupCollapsed("区间策略上区ByDay   区间策略上区By期权日")
console.log(上升区间ByDay, changeShow区间Log(上升区间ByDay), 上升区间By期权日)
console.groupEnd()
console.groupCollapsed("区间策略下区ByDay   区间策略下区By期权日")
console.log(下降区间ByDay, changeShow区间Log(下降区间ByDay), 下降区间By期权日)
console.groupEnd()


//全部策略合并后统计
function 统计全部策略(高低位 = "位", 汇总N = 5, 过滤M = 10) {

    let trigDateArr指数 = Object.entries(triggerLogObj指数.按日期排序).filter((ele, index) => { return ele[1][0].includes(高低位) })
    if (标星冲突不显示) trigDateArr指数 = trigDateArr指数.filter((ele, index) => { return !ele[1].at(-1)?.冲突 })

    let trigDateArr券商 = Object.entries(triggerLogObj券商.按日期排序).filter((ele, index) => { return ele[1][0].includes(高低位) })
    if (标星冲突不显示) trigDateArr券商 = trigDateArr券商.filter((ele, index) => { return !ele[1].at(-1)?.冲突 })

    let trigDateArr基金 = Object.entries(triggerLogObj基金).filter((ele, index) => { return ele[1][0].includes(高低位) })

    let trigDateArr同花顺 = Object.entries(triggerLogObj同花顺).filter((ele, index) => { return ele[1][0].includes(高低位) })

    let trigDateArrPmi股债 = Object.entries(triggerLogObjPmi股债).filter((ele, index) => { return ele[1][0].includes(高低位) })

    let trigDateArr区间 = []
    Object.entries(triggerLogObj区间.上升日期区间).forEach(([日期区间, 区间trigDateArr]) => {
        Object.entries(区间trigDateArr).forEach(([trigDate, trigNameObjArr]) => {
            let newArrNames = trigNameObjArr.map((ele, index) => {
                if (index != trigNameObjArr.length - 1) return ele.quantName
                else return ele
            })
            trigDateArr区间.push([trigDate, newArrNames])
        })
    })
    Object.entries(triggerLogObj区间.下降日期区间).forEach(([日期区间, 区间trigDateArr]) => {
        Object.entries(区间trigDateArr).forEach(([trigDate, trigNameObjArr]) => {
            let newArrNames = trigNameObjArr.map((ele, index) => {
                if (index != trigNameObjArr.length - 1) return ele.quantName
                else return ele
            })
            trigDateArr区间.push([trigDate, newArrNames])
        })
    })

    let trigDateArr = [...trigDateArr区间, ...trigDateArr指数, , ...trigDateArr券商, ...trigDateArr同花顺, ...trigDateArr基金, ...trigDateArrPmi股债] //  [...trigDateArrPmi股债] //
    trigDateArr.sort((a, b) => dateToStamp(a[0]) - dateToStamp(b[0]))

    const dateMap = new Map();
    trigDateArr.forEach(([date, arr]) => {
        if (dateMap.has(date)) {
            dateMap.get(date).unshift(...arr.toSpliced(-1));
            if (arr.at(-1)?.标星) { dateMap.get(date).pop(); dateMap.get(date).push(arr.at(-1)); }
        } else {
            dateMap.set(date, [...arr]);
        }
    });
    trigDateArr = Array.from(dateMap.entries());

    function get星位箭头(trigNames, profileN) {
        if (profileN?.标星) return profileN?.标星.replace("位", "")
        let allIs位_ = trigNames.every(name => name.includes("位_"))
        if (allIs位_) return trigNames[0].includes("高位") ? " ↓ " : " ↑ "
        return trigNames[0].includes("高位") ? "高位" : "低位"
    }
    trigDateArr = trigDateArr.map((ele, index, preArr) => {
        let newArr = []
        newArr[0] = ele[1].at(-1)?.kDate ?? ele[0] //kDate 基金触发日不一定是交易日 
        newArr[1] = ele[1].toSpliced(-1) //['上证高位_红但down死叉', '上证50高位_红但down死叉']
        newArr[2] = ele[1].at(-1) //{…}
        newArr[3] = get星位箭头(newArr[1], newArr[2])
        return newArr
    })

    function is反向(当前星位箭头, 上次星位箭头) {
        if ((当前星位箭头.includes("高位") || 当前星位箭头.includes(" ↓ ")) && (上次星位箭头.includes("低位") || 上次星位箭头.includes(" ↑ "))) {
            return true
        }
        if ((当前星位箭头.includes("低位") || 当前星位箭头.includes(" ↑ ")) && (上次星位箭头.includes("高位") || 上次星位箭头.includes(" ↓ "))) {
            return true
        }
        return false
    }
    trigDateArr.forEach((ele, index) => {
        if (index == 0) return ele[5] = "✔"
        let last对号 = trigDateArr.findLast(ele => ele.at(-1) == "✔")
        if (dateToStamp(ele[0]) >= dateToStamp(last对号[0]) + 过滤M * 86400000)
            ele[5] = "✔"
        else if (is反向(ele[3], last对号[3]))
            ele[5] = "✔"
        else
            ele[5] = "✗"
    })

    trigDateArr = trigDateArr.map((ele, index, preArr) => {
        let 包含当天最近N天触发的日期 = preArr.filter(preArrEle => {
            return dateToStamp(ele[0]) >= dateToStamp(preArrEle[0]) && dateToStamp(preArrEle[0]) >= dateToStamp(ele[0]) - 汇总N * 86400000
        })
        包含当天最近N天触发的日期.sort((a, b) => dateToStamp(b[0]) - dateToStamp(a[0]))
        ele[4] = 包含当天最近N天触发的日期
        return ele
    })
    trigDateArr.sort((a, b) => dateToStamp(b[0]) - dateToStamp(a[0]))


    let trig期权日Arr = [], trig期权日Obj = {}
    trigDateArr.forEach((ele, index) => {
        let dateTrig = ele[0], trig策略s = ele[1], profileN = ele[2], 位箭 = ele[3];

        let nextN期权到期, N;
        let overMin期权days = (profileN, nextNDelivery到期) => {
            if (!profileN?.[nextFirstDeliveryKey]) return false
            if (!profileN?.[nextNDelivery到期]) return false
            let closeDay = +profileN[nextNDelivery到期].close.split("->")[0]
            if (closeDay > min期权days) return true
            return false
        }

        // 第一个>=N2&&>20天的,否则默认2。
        if (overMin期权days(profileN, nextFirstDeliveryKey)) { nextN期权到期 = nextFirstDeliveryKey; N = 1 }
        else if (overMin期权days(profileN, nextSecondDeliveryKey)) { nextN期权到期 = nextSecondDeliveryKey; N = 2 }
        else if (overMin期权days(profileN, nextThirdDeliveryKey)) { nextN期权到期 = nextThirdDeliveryKey; N = 3 }
        else {
            //after预测工作日天数 以实际为准
            if (countWorkdays(dateTrig, profileN?.after?.[nextFirstDeliveryKey]) > min期权days) { nextN期权到期 = nextFirstDeliveryKey; N = 1 }
            else if (countWorkdays(dateTrig, profileN?.after?.[nextSecondDeliveryKey]) > min期权days) { nextN期权到期 = nextSecondDeliveryKey; N = 2 }
            else if (countWorkdays(dateTrig, profileN?.after?.[nextThirdDeliveryKey]) > min期权days) { nextN期权到期 = nextThirdDeliveryKey; N = 3 }
        }

        let 期权日key
        if (profileN[nextN期权到期]) { 期权日key = `后${N}到期` + profileN[nextN期权到期].close.split("->")[1].split(",")[0] }
        else if (profileN.after) { 期权日key = `后${N}到期` + profileN.after[nextN期权到期]; }

        if (!期权日key) return
        if (位箭.includes("高") || 位箭.includes(" ↓ ")) 期权日key = "沽" + 期权日key
        else if (位箭.includes("低") || 位箭.includes(" ↑ ")) 期权日key = "购" + 期权日key

        if (trig期权日Obj.hasOwnProperty(期权日key)) trig期权日Obj[期权日key].push(ele)
        else trig期权日Obj[期权日key] = [ele]
    })

    for (let [nextN期权到期key, trigDateArr] of Object.entries(trig期权日Obj)) {

        let nextN期权到期 = nextSecondDeliveryKey
        if (nextN期权到期key.includes("后3到期")) nextN期权到期 = nextThirdDeliveryKey

        let closeHighest = -1000000, closeHighest百分比 = -1000000
        let closeLowes = 1000000, closeLowes百分比 = 1000000
        let type = [...new Set(trigDateArr.map(item => item[3]))]
        for (let trigDate of trigDateArr) {
            let profileN = trigDate[2]
            let closePoint = typeof profileN[nextN期权到期] !== "undefined" ? +profileN[nextN期权到期].close.split(",")[1] : +profileN.after.close.split(",")[1]//close 点位变化
            let closePercent = typeof profileN[nextN期权到期] !== "undefined" ? +profileN[nextN期权到期].close.split(",")[2] : +profileN.after.close.split(",")[2]//baifenbi 点位变化
            if (closePoint > closeHighest) {
                closeHighest = closePoint
                closeHighest百分比 = closePercent
            }
            if (closePoint < closeLowes) {
                closeLowes = closePoint
                closeLowes百分比 = closePercent
            }
        }

        let trig期权日Info = [nextN期权到期key, trigDateArr, type + ""]
        trig期权日Info.maxRatio = closeHighest百分比
        trig期权日Info.minRatio = closeLowes百分比
        trig期权日Arr.push(trig期权日Info)
    }
    trig期权日Arr.sort((a, b) => dateToStamp(b[0].substring(4)) - dateToStamp(a[0].substring(4)))
    trig期权日Arr.maxRatio统计 = {
        maxRatio中位: calMedianProf(trig期权日Arr, "maxRatio"),
        maxRatio平均: calAvgProf(trig期权日Arr, "maxRatio"),
        maxRatio最大: cal极值(trig期权日Arr, "maxRatio").max,
        maxRatio最小: cal极值(trig期权日Arr, "maxRatio").min,
    }
    trig期权日Arr.minRatio统计 = {
        minRatio中位: calMedianProf(trig期权日Arr, "minRatio"),
        minRatio平均: calAvgProf(trig期权日Arr, "minRatio"),
        minRatio最大: cal极值(trig期权日Arr, "minRatio").max,
        minRatio最小: cal极值(trig期权日Arr, "minRatio").min,
    }

    return {
        trigDateArr: trigDateArr,
        trig期权日Arr: trig期权日Arr
    }
}
let 全部策略 = 统计全部策略("位")
let 全部策略ByDay = 全部策略.trigDateArr.filter((ele, index) => +ele[0].substring(0, 4) >= 2000)
全部策略ByDay.sort((a, b) => dateToStamp(b[0]) - dateToStamp(a[0]))
let 全部策略By期权日 = 全部策略.trig期权日Arr



function arrayHasIndex(arr, index) {
    return Array.isArray(arr) && index >= 0 && index < arr.length && !(arr[index] == null);
}
function roundToHighestPlace(num) {
    //123 => 100 将任意数字转换为最高位保留，其他位变为0的函数。
    if (num === 0) return 0;
    num = parseInt(num)
    const numStr = Math.abs(num).toString();
    const firstDigit = numStr[0];
    const zeros = "0".repeat(numStr.length - 1);
    const result = parseInt(firstDigit + zeros, 10);
    return num < 0 ? -result : result;
}
function get标的资产ByDate(标的KList, date) {
    let curKInfoIndex = 标的KList.findIndex(e => e.date == date)
    if (curKInfoIndex <= -1) {
        let Nlist = [-1, -2, -3, -4, -5, 1, 2]
        for (let index = 0; index < Nlist.length; index++) {// "2018-12-31"
            let preNexDay = getPreNexDate(date, Nlist[index])
            curKInfoIndex = 标的KList.findIndex(ele => { return ele.date == preNexDay })
            if (curKInfoIndex > -1) break
        }
    }
    if (curKInfoIndex <= -1) {
        console.log("无法找到对应数据日期", date)
        return null
    }
    标的KList[curKInfoIndex].index = curKInfoIndex
    return 标的KList[curKInfoIndex]
}
String.prototype.unif高低位 = function () {
    var target = this;
    target = target.replace("★", "位").replace(" ↓ ", "高位").replace(" ↑ ", "低位").substring(0, 2);
    return target;
};

let 手动买卖 = [
    // ['2026-05-18', '2026-07-17', '高位', '4833.52 沽沪深300 4688.514', tAr: '沪深300高位VKM多叉', yes1: 1] start
    // ['2026-06-08', '2026-07-17', '低位', '4.852 购沪深300ETF手动 4.876', '2026-07-17沽4776:6张', null, '2026-06-09', 0.0795, 3078.350],
    // ['2026-06-04', '2026-07-17', '高位', '4.852 沽沪深300ETF手动 4.776', '2026-07-17沽4776:5张', null, '2026-06-05', 0.0795, 4078.350],
]
let 模拟买卖 = [
    ['2026-06-08', '2026-07-17', ' ↑ ', '4713.64 购沪深300模拟 4855.049', "IO2607-C-4800.xlsx"],
    ['2026-06-04', '2026-07-17', '高位', '4904.75 沽沪深300模拟 4757.608', "IO2607-P-4800.xlsx"],//fuck 了

    ['2026-04-03', '2026-05-15', ' ↑ ', '4440.79 购沪深300模拟 4574.014', "IO2605-C-4550.xlsx"],

    ['2026-02-27', '2026-04-17', '高位', '4710.65 沽沪深300模拟 4569.33', "IO2604-P-4600.xlsx"],  //沪深300高位月9Up周日死叉
    //['2026-02-27', '2026-04-17', ' ↑ ', '4710.65 购沪深300模拟 4851.97', "IO2604-C-4800.xlsx"],  //上证低位_ma10UpMas低连空但 后来添加过滤上升日期区间过滤掉

    ['2025-11-25', '2026-01-16', ' ↑ ', '4490.4 购沪深300模拟 4625.112', "IO2601-C-4600.xlsx"],
    ['2025-10-28', '2025-12-19', '高位', '4691.97 沽沪深300模拟 4551.211', "IO2512-P-4600.xlsx"],

    ["2025-08-19", "2025-10-17", " ↑ ", "4223.37 购沪深300模拟 4350.071", "IO2510-C-4350.xlsx"],
    ["2025-08-11", "2025-09-19", " ↑ ", "4122.51 购沪深300模拟 4246.185", "IO2509-C-4200.xlsx"],
    ["2025-06-23", "2025-08-15", " ↑ ", "3857.9 购沪深300模拟 3973.637", "IO2508-C-3950.xlsx"],
    ["2025-05-29", "2025-07-18", " ↑ ", "3858.7 购沪深300模拟 3974.461", "IO2507-C-3950.xlsx"],
    ["2025-05-06", "2025-06-20", " ↑ ", "3808.54 购沪深300模拟 3922.796", "IO2506-C-3900.xlsx"],
    ["2025-04-07", "2025-05-16", " ↑ ", "3589.44 购沪深300模拟 3697.123", "IO2505-C-3650.xlsx"],
    ["2025-03-19", "2025-04-18", "高位", "4010.17 沽沪深300模拟 3889.865", "IO2504-P-3900.xlsx"],
    ["2025-01-13", "2025-02-21", " ↑ ", "3722.51 购沪深300模拟 3834.185", "IO2502-C-3800.xlsx"],

    ["2024-10-08", "2024-11-15", "高位", "4256.1 沽沪深300模拟 4128.417", "IO2411-P-4150.xlsx"],
    ['2024-09-30', '2024-11-15', '高位', '4017.85 沽沪深300模拟 3897.314', "IO2411-P-3900.xlsx"],

    ["2024-09-27", "2024-11-15", "低★", "3703.68 购沪深300模拟 3814.79", "IO2411-C-3800.xlsx"],
    ["2024-09-23", "2024-11-15", "低★", "3212.76 购沪深300模拟 3309.143", "IO2411-C-3300.xlsx"],
    ["2024-09-20", "2024-11-15", "低★", "3201.05 购沪深300模拟 3297.082", "IO2411-C-3250.xlsx"],
    //19
    ["2024-09-18", "2024-11-15", "低★", "3171.01 购沪深300模拟 3266.14", "IO2411-C-3250.xlsx"],
    ["2024-09-13", "2024-11-15", "低位", "3159.25 购沪深300模拟 3254.028", "IO2411-C-3250.xlsx"],
    //12
    ["2024-09-11", "2024-11-15", "低位", "3186.13 购沪深300模拟 3281.714", "IO2411-C-3250.xlsx"],
    ["2024-09-10", "2024-10-18", "低★", "3195.76 购沪深300模拟 3291.633", "IO2410-C-3300.xlsx"],
    ["2024-09-06", "2024-10-18", "低★", "3231.35 购沪深300模拟 3328.291", "IO2410-C-3300.xlsx"],
    ["2024-09-02", "2024-10-18", "低★", "3265.01 购沪深300模拟 3362.96", "IO2410-C-3350.xlsx"],
    ["2024-08-27", "2024-10-18", "低位", "3305.33 购沪深300模拟 3404.49", "IO2410-C-3400.xlsx"],
    ["2024-05-13", "2024-06-21", "高位", "3664.69 沽沪深300模拟 3554.749", "IO2406-P-3550.xlsx"],
    ["2024-04-16", "2024-06-21", " ↑ ", "3511.11 购沪深300模拟 3616.443", "IO2406-C-3550.xlsx"],
    ["2024-04-15", "2024-05-17", " ↑ ", "3549.08 购沪深300模拟 3655.552", "IO2405-C-3650.xlsx"],
    ["2024-02-05", "2024-03-15", "低★", "3200.42 购沪深300模拟 3296.433", "IO2403-C-3300.xlsx"],
    ["2024-02-02", "2024-03-15", "低★", "3179.63 购沪深300模拟 3275.019", "IO2403-C-3300.xlsx"],
    ["2024-01-22", "2024-03-15", "低★", "3218.9 购沪深300模拟 3315.467", "IO2403-C-3350.xlsx"],
    ["2024-01-18", "2024-03-15", "低★", "3274.73 购沪深300模拟 3372.972", "IO2403-C-3350.xlsx"],
    ["2023-12-27", "2024-02-19", " ↑ ", "3336.36 购沪深300模拟 3436.451", "IO2402-C-3400.xlsx"],
    ["2023-08-29", "2023-10-20", "高位", "3790.11 沽沪深300模拟 3676.407", "IO2310-P-3700.xlsx"],
    ["2023-04-11", "2023-05-19", "高位", "4100.15 沽沪深300模拟 3977.145", "IO2305-P-4000.xlsx"],
    ["2023-01-30", "2023-03-17", "高位", "4201.35 沽沪深300模拟 4075.31", "IO2303-P-4100.xlsx"],
    ["2022-12-27", "2023-02-17", " ↑ ", "3887.85 购沪深300模拟 4004.486", "IO2302-C-4000.xlsx"],

    ['2022-12-01', '2023-01-20', '低★', '3894.77 购沪深300模拟 4011.613', "IO2301-C-4000.xlsx"],
    ["2022-10-28", "2022-12-16", "低位", "3541.33 购沪深300模拟 3647.57", "IO2212-C-3600.xlsx"],
    ["2022-08-22", "2022-10-21", " ↓ ", "4181.4 沽沪深300模拟 4055.958", "IO2210-P-4100.xlsx"],
    ["2022-08-15", "2022-09-16", " ↓ ", "4185.68 沽沪深300模拟 4060.11", "IO2209-P-4100.xlsx"],
    ["2022-06-30", "2022-08-19", " ↓ ", "4485.01 沽沪深300模拟 4350.46", "IO2208-P-4350.xlsx"],
    ["2022-04-26", "2022-06-17", "低位", "3784.12 购沪深300模拟 3897.644", "IO2206-C-3900.xlsx"],
    ["2022-04-25", "2022-06-17", "低位", "3814.91 购沪深300模拟 3929.357", "IO2206-C-3900.xlsx"],
    ["2022-04-08", "2022-05-20", " ↓ ", "4230.77 沽沪深300模拟 4103.847", "IO2205-P-4100.xlsx"],
    ["2022-03-28", "2022-05-20", " ↓ ", "4148.47 沽沪深300模拟 4024.016", "IO2205-P-4100.xlsx"],
    ["2022-02-23", "2022-04-15", " ↓ ", "4623.05 沽沪深300模拟 4484.359", "IO2204-P-4500.xlsx"],
    ["2022-01-24", "2022-03-18", "高位", "4786.74 沽沪深300模拟 4643.138", "IO2203-P-4700.xlsx"],
    ["2022-01-21", "2022-03-18", "高位", "4779.31 沽沪深300模拟 4635.931", "IO2203-P-4700.xlsx"],
    ["2022-01-06", "2022-02-18", " ↓ ", "4818.23 沽沪深300模拟 4673.683", "IO2202-P-4700.xlsx"],
    ["2021-11-25", "2022-01-21", " ↓ ", "4896.44 沽沪深300模拟 4749.547", "IO2201-P-4800.xlsx"],

    ["2021-07-15", "2021-08-20", " ↓ ", "5151.46 沽沪深300模拟 4996.916", "IO2108-P-5000.xlsx"],
    ["2021-05-27", "2021-07-16", " ↓ ", "5338.23 沽沪深300模拟 5178.083", "IO2107-P-5200.xlsx"],
    ["2021-02-19", "2021-04-16", "高★", "5778.84 沽沪深300模拟 5605.475", "IO2104-P-5600.xlsx"],
    ["2021-02-18", "2021-03-19", "高★", "5768.38 沽沪深300模拟 5595.329", "IO2103-P-5600.xlsx"],
    ["2021-02-08", "2021-03-19", "高位", "5564.56 沽沪深300模拟 5397.623", "IO2103-P-5400.xlsx"],
    ["2020-12-28", "2021-02-19", " ↑ ", "5064.41 购沪深300模拟 5216.342", "IO2102-C-5200.xlsx"],
    ["2020-12-17", "2021-02-19", " ↑ ", "5017.48 购沪深300模拟 5168.004", "IO2102-C-5100.xlsx"],
    ["2020-12-01", "2021-01-15", " ↑ ", "5067.1 购沪深300模拟 5219.113", "IO2101-C-5200.xlsx"],
    ["2020-10-19", "2020-12-18", " ↑ ", "4755.49 购沪深300模拟 4898.155", "IO2012-C-4900.xlsx"],
    ["2020-10-09", "2020-11-20", " ↑ ", "4681.14 购沪深300模拟 4821.574", "IO2011-C-4800.xlsx"],
    ["2020-05-28", "2020-07-17", " ↑ ", "3856.63 购沪深300模拟 3972.329", "IO2007-C-3900.xlsx"],
    ["2020-03-23", "2020-05-15", " ↑ ", "3530.31 购沪深300模拟 3636.219", "IO2005-C-3600.xlsx"],

    //ETF分红派息导致不准确,不利于沽空,有利于购,这里只是模拟下。 ETF结束日期是第四个周三稍晚于指数的。 
    ["2019-11-25", "2019-12-25", " ↑ ", "2.726 购上证50ETF模拟 2.808", "2019-12-25购2800.xlsx"],
    ["2019-05-27", "2019-07-24", " ↑ ", "2.471 购上证50ETF模拟 2.545", "2019-07-24购2500.xlsx"],
    ["2019-04-19", "2019-06-26", "高位", "2.753 沽上证50ETF模拟 2.67", "2019-06-26沽2700.xlsx"],
    ["2019-04-08", "2019-05-22", "高位", "2.68 沽上证50ETF模拟 2.6", "2019-05-22沽2600.xlsx"],
];

//第一次按照[沽后N到期日]分类 全部策略By期权日 后查找
function 第一次按方向后N到期日分类查找标记yes1(全部策略By期权日) {

    for (let index = 0; index < 全部策略By期权日.length; index++) {
        let element = 全部策略By期权日[index]
        if (+element[1].at(-1)[0].substring(0, 4) < 2013) continue

        let count = 1
        let kInfoArr = []
        function upAllPre(curk) {
            let res = true
            for (var i = 0; i < kInfoArr.length; i++) {
                let preiK = kInfoArr[i]
                res = res && (preiK.close <= curk.close)
            }
            return res
        }
        function lowAllPre(curk) {
            let res = true
            for (var i = 0; i < kInfoArr.length; i++) {
                let preiK = kInfoArr[i]
                res = res && (preiK.close >= curk.close)
            }
            return res
        }
        function allow高位(curKInfo, trigArr, trigArrIndex) {
            //return true

            let 沪深300技术 = {};
            沪深300技术.dayDatas = 沪深300;
            沪深300技术 = calDayWeekMonthKline(沪深300技术, curKInfo.date);

            let pre2Week = 沪深300技术.currentWeekList.at(-3);
            let pre1Week = 沪深300技术.currentWeekList.at(-2);
            let curWeek = 沪深300技术.currentWeekList.at(-1);

            let pre2Day = 沪深300技术.currentDayList.at(-3);
            let pre1Day = 沪深300技术.currentDayList.at(-2);
            let curDay = 沪深300技术.currentDayList.at(-1);

            function highDay() {
                return (
                    curDay.close > curDay.mas || curDay.K > 50 || curDay.D > 50 || curDay.bar > 0 || curDay.bias.bias2 > 0 || curDay.cci.cci > 0 ||
                    curDay.bias.bias1 < curDay.bias.bias3 || curDay.bias.bias2 < curDay.bias.bias3
                )
            }

            let cond星plus = true &&
                trigArr[trigArrIndex][3] == "高★" &&
                (
                    (trigArr[trigArrIndex][1] + "").includes("VKM多叉") ||
                    (trigArr[trigArrIndex][1] + "").includes("Pmi股债")
                )
            if (cond星plus) return "cond星plus"


            let cond星up = true &&
                trigArr[trigArrIndex][3] == "高★" &&
                (upAllPre(curKInfo) || curtPercent(curKInfo) >= 0 || curKInfo.percent >= 0) &&
                trigArr[trigArrIndex][1].length >= 2
            if (cond星up) return "cond星up"

            let condUpAllpre = true &&
                upAllPre(curKInfo) &&
                (
                    trigArr.length >= 5 || //!!!!!!!!!!!!!!!!!!!!
                    trigArr[trigArrIndex][3].includes("高") ||
                    highDay()
                    // curtPercent(curKInfo) > 0 ||
                    // curKInfo.percent > 0 ||
                    // curKInfo.index - kInfoArr.at(-1).index > 5 ||
                    // trigArr[trigArrIndex][1].length >= 3
                )
                && (
                    trigArr[trigArrIndex][3].includes("高") || //仅箭头？
                    curWeek.bias.bias3 > curWeek.bias.bias1 || curWeek.bias.bias3 > curWeek.bias.bias2 || curWeek.bar > 0 ||
                    (preNHighestAttr(沪深300技术.currentWeekList, 3, "J") > 100 && pre1Week.J > curWeek.J) || (pre1Week.D > curWeek.D && pre1Week.K > curWeek.K && pre1Week.K > 50) ||
                    KDJ死叉(沪深300技术.currentWeekList) || MACD死叉attr(沪深300技术.currentWeekList) || MACD死叉attr(沪深300技术.currentWeekList, "diff") ||
                    BIAS金叉attr(沪深300技术.currentWeekList) || BIAS金叉attr(沪深300技术.currentWeekList, "bias2") ||
                    volMa死叉(沪深300技术.currentWeekList) || volMa死叉(沪深300技术.currentWeekList, 5, 20) || volMa死叉(沪深300技术.currentWeekList, 10, 20) ||
                    kdjAllDown(沪深300技术.currentWeekList) || macdAllDown(沪深300技术.currentWeekList) || biasAllDown(沪深300技术.currentWeekList)
                )
            if (condUpAllpre) return "condUpAllpre"



            let monthAllDownArr = 0;
            [
                volAllDown(沪深300技术.currentMonthList),
                kdjAllDown(沪深300技术.currentMonthList),
                macdAllDown(沪深300技术.currentMonthList),
                biasAllDown(沪深300技术.currentMonthList),
            ].forEach(e => { if (e) monthAllDownArr++ });

            let cond月周AllDown = true &&
                monthAllDownArr >= 3 &&
                (
                    kdjAllDown(沪深300技术.currentMonthList) ||
                    macdAllDown(沪深300技术.currentMonthList) ||
                    biasAllDown(沪深300技术.currentMonthList)
                ) &&
                pre1Week.K > curWeek.K && pre1Week.D > curWeek.D

            if (cond月周AllDown) return "cond月周AllDown"



            let cond日回调 = true &&
                highDay() &&
                (curtPercent(curKInfo) > 0 && curKInfo.percent > 0) &&
                KDJ死叉(沪深300技术.currentDayList, 6) && pre1Day.D > curDay.D &&
                (pre1Week.J > curWeek.J || pre1Week.bias.bias1 > curWeek.bias.bias1 || pre1Week.bias.bias2 > curWeek.bias.bias2) &&
                (curWeek.bias.bias3 > curWeek.bias.bias1 || curWeek.bias.bias3 > curWeek.bias.bias2 || curWeek.bar > 0)
            if (cond日回调) return "cond日回调"

            return false
        }
        function allow低位(curKInfo, trigArr, trigArrIndex) {

            let 沪深300技术 = {};
            沪深300技术.dayDatas = 沪深300;
            沪深300技术 = calDayWeekMonthKline(沪深300技术, curKInfo.date);
            let pre2Week = 沪深300技术.currentWeekList.at(-3);
            let pre1Week = 沪深300技术.currentWeekList.at(-2);
            let curWeek = 沪深300技术.currentWeekList.at(-1);
            let pre2Day = 沪深300技术.currentDayList.at(-3);
            let pre1Day = 沪深300技术.currentDayList.at(-2);
            let curDay = 沪深300技术.currentDayList.at(-1);
            function lowDay() {
                return (
                    curDay.close < curDay.mas || curDay.K < 50 || curDay.D < 50 || curDay.bar < 0 || curDay.bias.bias2 < 0 || curDay.cci.cci < 0 ||
                    curDay.bias.bias1 > curDay.bias.bias3 || curDay.bias.bias2 > curDay.bias.bias3
                )
            }
            //return true

            let cond星plus = true &&
                trigArr[trigArrIndex][3] == "低★" &&
                (
                    (trigArr[trigArrIndex][1] + "").includes("Pmi股债") ||
                    (trigArr[trigArrIndex][1] + "").includes("VKM多叉") ||
                    (
                        (trigArr[trigArrIndex][1] + "").includes("ths") &&
                        (
                            !(trigArr[trigArrIndex][1] + "").includes(":") || //止损跌停
                            trigArr[trigArrIndex][1].length >= 3
                        )
                    ) ||
                    (
                        (trigArr[trigArrIndex][1] + "").includes("PK") && //基金
                        (
                            (trigArr[trigArrIndex][1] + "").includes("低位B") ||
                            trigArr[trigArrIndex][1].length >= 3
                        )
                    )
                )
            if (cond星plus) return "cond星plus"


            let cond星low = true &&
                trigArr[trigArrIndex][3] == "低★" &&
                (lowAllPre(curKInfo) || curtPercent(curKInfo) <= 0 || curKInfo.percent <= 0 || lowDay())
            if (cond星low) return "cond星low"


            let condLowAllpre = true &&
                lowAllPre(curKInfo) &&
                (
                    trigArr.length >= 5 ||
                    trigArr[trigArrIndex][3].includes("低") ||
                    lowDay() ||
                    绿空绿红(沪深300技术.currentDayList)
                    // (curtPercent(curKInfo) < 0 && curDay.close < curDay.mas) ||
                    // (curKInfo.percent < 0 && curDay.close < curDay.mas) ||
                    // curKInfo.index - kInfoArr.at(-1).index > 5 ||
                    // trigArr[trigArrIndex][1].length >= 3
                )
            if (condLowAllpre) return "condLowAllpre"


            let cond周月bb金叉 = true &&
                (
                    MACD金叉attr(沪深300技术.currentWeekList, "bar", 2) ||
                    BIAS金叉attr(沪深300技术.currentWeekList, "bias1", 2) || BIAS金叉attr(沪深300技术.currentWeekList, "bias2", 2)
                ) &&
                (
                    MACD金叉attr(沪深300技术.currentMonthList, "bar", 2) ||
                    BIAS金叉attr(沪深300技术.currentMonthList, "bias1", 2) || BIAS金叉attr(沪深300技术.currentMonthList, "bias2", 2)
                )
            if (cond周月bb金叉) return "cond周月bb金叉"


            let cond日周金叉up = true &&
                lowDay() &&
                (
                    KDJ金叉(沪深300技术.currentDayList) ||
                    BIAS金叉attr(沪深300技术.currentDayList, "bias1") || BIAS金叉attr(沪深300技术.currentDayList, "bias2")
                ) &&
                (
                    (kdjAllUp(沪深300技术.currentWeekList) && macdAllUp(沪深300技术.currentWeekList) && biasAllUp(沪深300技术.currentWeekList))
                ) &&
                (
                    KDJ金叉(沪深300技术.currentMonthList) || MACD金叉attr(沪深300技术.currentMonthList, "bar") ||
                    BIAS金叉attr(沪深300技术.currentMonthList, "bias1") || BIAS金叉attr(沪深300技术.currentMonthList, "bias2") ||
                    kdjAllUp(沪深300技术.currentMonthList) || macdAllUp(沪深300技术.currentMonthList) || biasAllUp(沪深300技术.currentMonthList)
                )
            if (cond日周金叉up) return "cond日周金叉up"


            let cond日绿周9 = true &&
                lowDay() &&
                (
                    curtPercent(curKInfo) < 0 && curKInfo.percent < 0 &&
                    (
                        KDJ金叉(沪深300技术.currentDayList, 6) ||
                        BIAS金叉attr(沪深300技术.currentDayList, "bias1", 6) || BIAS金叉attr(沪深300技术.currentDayList, "bias2", 6)
                    )
                ) &&
                (
                    lastN九转(沪深300技术.currentWeekList, "is9转down", N = 3) &&
                    curWeek.bar < 0 && (curWeek.bias.bias1 < 0 || curWeek.bias.bias2 < 0)
                )
            if (cond日绿周9) return "cond日绿周9"


            return false
        }

        for (let idx = element[1].length - 1; idx >= 0; idx--) {
            let curKInfo = get标的资产ByDate(期权标的资产, element[1][idx][0])
            kInfoArr.unshift(curKInfo)
            if (idx == element[1].length - 1) {
                element[1][idx].yes1 = 1
                continue
            } else {
                if (element[2].includes("↓") || element[2].includes("高")) {
                    element[1][idx].yes1 = allow高位(curKInfo, element[1], idx)
                } else {
                    element[1][idx].yes1 = allow低位(curKInfo, element[1], idx)
                }
                if (element[1][idx].yes1) count++
            }
        }
        element.count = count
    }

}

function 附加xls过滤时间(期权建议ByDay) {
    let 期权startDate = decodeURI(getQueryVariable("optStartDate"));
    let 期权endDate = decodeURI(getQueryVariable("optEndDate"));
    if (期权startDate == "false") 期权startDate = "2020-01-01" //默认设置开始日期同时减小计算量
    if (期权endDate == "false") 期权endDate = "9999-09-09" //默认结束
    return structuredClone(期权建议ByDay)
        .filter(ele => 期权startDate <= ele[0] && ele[0] <= 期权endDate)
        .filter(ele => !(ele[0].includes("2024-09") || ele[0].includes("2024-08")))
        .map((ele, index) => {
            let s1 = 模拟买卖.find((e) => ele[0] + ele[1] + ele[2].unif高低位() == e[0] + e[1] + e[2].unif高低位());
            if (s1) { ele[3] = s1[3]; ele[4] = s1[4]; return ele; }//模拟
            else {
                s1 = 模拟买卖.find((e) => ele[1] + ele[2].unif高低位() == e[1] + e[2].unif高低位());
                if (s1) { ele[3] = s1[3]; ele[4] = s1[4]; return ele; }//模拟
                else if (ele[3].includes("ETF")) {
                    s1 = 模拟买卖.find((e) => ele[0] + ele[1].substring(0, 7) + ele[2].unif高低位() == e[0] + e[1].substring(0, 7) + e[2].unif高低位());
                    if (s1) { ele[1] = s1[1]; ele[3] = s1[3]; ele[4] = s1[4]; return ele; }//模拟ETF
                }
            }

            let s2 = 手动买卖.find((e) => ele[0] + ele[1] + ele[2].unif高低位() == e[0] + e[1] + e[2].unif高低位());
            if (s2) { s2.tAr = ele.tAr; s2.yes1 = ele.yes1; return s2 }//手动
            else {
                s2 = 手动买卖.find((e) => ele[0] + ele[1].substring(0, 0) + ele[2].unif高低位() == e[0] + e[1].substring(0, 0) + e[2].unif高低位());
                if (s2) { s2.tAr = ele.tAr; s2.yes1 = ele.yes1; return s2 }//手动
            }

            if (ele[0] < "2020-01-01" && ele[3].includes("ETF")) return null
            return ele //未决
        })
        .filter(e => e !== null)
}

//第二次按照[沽到期日]分类 期权建议ByDay->期权买卖List 后查找    
function 第二次按方向到期日分类查找标记ok2(期权买卖List, N) {
    // 用于记录每个第二个元素值在从后往前遍历中的遇到次数
    const countMap = {};
    // 初始化一个布尔数组，标记每个索引是否保留
    const keepFlags = new Array(期权买卖List.length).fill(false);

    // 从后往前遍历数组（从最后一个元素到第一个元素）
    for (let i = 期权买卖List.length - 1; i >= 0; i--) {
        const trigDate = 期权买卖List[i][0];
        const endDate = 期权买卖List[i][1];
        const direct = 期权买卖List[i][2].unif高低位()
        const endDateDirect = endDate + direct
        // 初始化计数（如果未遇到过该值）
        if (!countMap.hasOwnProperty(endDateDirect)) {
            countMap[endDateDirect] = [];
        }
        // 增加遇到次数
        if (countMap[endDateDirect].length < 1) {
            countMap[endDateDirect].push(期权买卖List[i][2]);
            keepFlags[i] = countMap[endDateDirect].length;//第一次肯定要
        }
        else if (countMap[endDateDirect].length < N && (期权买卖List[i][2].includes("★") || 期权买卖List[i][2].includes("位"))) {
            countMap[endDateDirect].push(期权买卖List[i][2]);
            keepFlags[i] = countMap[endDateDirect].length + "★位";//第2到N次后要★和位 最多N次
        }

        else if (countMap[endDateDirect].length < N) {//第2到N次后要箭头满足条件的 最多N次
            let curKInfo = get标的资产ByDate(期权标的资产, trigDate)
            let preSame方向到期日arr = 期权买卖List.filter((ele, index) => { return i < index && endDate == ele[1] && direct == ele[2].unif高低位() })
            function upAllPre() {
                let res = true
                for (var i = preSame方向到期日arr.length - 1; i >= 0; i--) {
                    let preKInfo = get标的资产ByDate(期权标的资产, preSame方向到期日arr[i][0])
                    res = res && (preKInfo.close < curKInfo.close)
                }
                return res
            }
            function lowAllPre() {
                let res = true
                for (var i = preSame方向到期日arr.length - 1; i >= 0; i--) {
                    let preKInfo = get标的资产ByDate(期权标的资产, preSame方向到期日arr[i][0])
                    res = res && (preKInfo.close > curKInfo.close)
                }
                return res
            }
            countMap[endDateDirect].push(期权买卖List[i][2]);
            if (期权买卖List[i][2].includes("↓") && (upAllPre() || 期权买卖List[i]?.yes1 != "condUpAllpre")) keepFlags[i] = countMap[endDateDirect].length + "箭AllPre";
            else if (期权买卖List[i][2].includes("↑") && (lowAllPre() || 期权买卖List[i]?.yes1 != "condLowAllpre")) keepFlags[i] = countMap[endDateDirect].length + "箭AllPre";

        }
    }

    // 从前往后收集保留的子数组，以保持原始顺序
    //const result = [];
    for (let i = 0; i < 期权买卖List.length; i++) {
        期权买卖List[i].ok2 = keepFlags[i]
    }
    return 期权买卖List;
}


第一次按方向后N到期日分类查找标记yes1(全部策略By期权日)
let 期权建议ByDay = []
for (let index = 全部策略By期权日.length - 1; index >= 0; index--) {
    const element = 全部策略By期权日[index]
    let endDate = element[0].substring(5)

    if (+endDate.substring(0, 4) < 2015) continue
    if (endDate < "2020-02-21") { cur期权标的资产 = 上证50ETF; cur期权标的资产Name = "上证50ETF"; }
    else { cur期权标的资产 = 期权标的资产; cur期权标的资产Name = 期权标的资产Name; }

    for (let atId = -1; atId >= (0 - element[1].length); atId--) {
        const eleArr = element[1]

        if (!eleArr.at(atId).yes1) continue //

        let startDate = eleArr.at(atId)[0]
        let startClose = get标的资产ByDate(cur期权标的资产, startDate).close
        startClose = +startClose.toFixed(3)

        let 星位箭 = eleArr.at(atId)[3]
        let direType = "购"
        let excpEndClose = +(startClose * 1.03).toFixed(3)
        if (星位箭.includes("↓") || 星位箭.includes("高")) {
            direType = "沽"
            excpEndClose = +(startClose * 0.97).toFixed(3)
        }

        let pushArr = [startDate, endDate, 星位箭, `${startClose} ${direType}${cur期权标的资产Name} ${excpEndClose}`]
        pushArr.tAr = eleArr.at(atId)[1] + ""
        pushArr.yes1 = eleArr.at(atId).yes1
        期权建议ByDay.unshift(pushArr)
    }
}
期权建议ByDay = Array.from(new Map(
    期权建议ByDay.map(item => [`${item[0]}-${item[1]}`, item])
).values())


let 期权买卖List = 附加xls过滤时间(期权建议ByDay)
期权买卖List = 第二次按方向到期日分类查找标记ok2(期权买卖List, 5).filter((ele, index) => ele.ok2)


console.groupCollapsed("全部策略ByDay      全部策略By期权日")
console.log(全部策略ByDay, changeShowLog((全部策略ByDay)), 全部策略By期权日, "=>期权建议ByDay", 期权建议ByDay, "=>期权买卖List", 期权买卖List)
console.groupEnd()
console.log("    ");


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


String.prototype.leftAppend = function () {
    var target = this;
    return "           " + target;
};
let randomProfileArr = [];

/**
 * 生成服从截断正态分布的随机数，范围严格限制在 [-m, n]
 * @param {number} m - 负向边界绝对值（需 > 0）
 * @param {number} n - 正向边界（需 > 0）
 * @param {number} [sigmaRatio=6] - 控制分布宽度的比例参数（默认6，表示 ±3σ 覆盖整个区间）
 * @returns {number}
 */
function randomNormalInRange(m, n, sigmaRatio = 6) {
    if (m < 0) m = -m
    if (m <= 0 || n <= 0) throw new Error("m 和 n 必须为正数");

    const lower = -m;
    const upper = n;
    if (lower >= upper) throw new Error("范围无效：-m 必须小于 n");

    // 均值设在区间中心
    const mu = (lower + upper) / 2;
    // 标准差由区间宽度决定，默认 sigmaRatio=6 意味着 99.7% 的数据自然落在区间内
    const sigma = (upper - lower) / sigmaRatio;

    let x;
    let attempts = 0;
    const MAX_ATTEMPTS = 1000; // 安全保护，防止极端参数下的理论死循环

    do {
        // Box-Muller 变换：生成标准正态分布 N(0,1)
        const u1 = 1 - Math.random(); // 映射为 (0, 1]，避免 Math.log(0)
        const u2 = Math.random();     // [0, 1)
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

        // 缩放并平移到目标分布 N(mu, sigma^2)
        x = mu + sigma * z;
        attempts++;
    } while ((x < lower || x > upper) && attempts < MAX_ATTEMPTS);

    return x;
}
function gerRandomProfile(priceProfile, mean = 0, stdDev = 0.3) {

    // if (priceProfile > 2) return 2
    // if (priceProfile < 0) return priceProfile
    // return priceProfile

    //return +(Math.random() * 2 - 1).toFixed(4) //[-1,1) 随机 -1到2-1之间

    return randomNormalInRange(-1, 1)
}

function cloneAsset(asset, hastAr = true) {
    if (hastAr) return structuredClone(asset)
    else return JSON.parse(JSON.stringify(asset))
}
function excelSerialToDate(excelSerial) {
    // Excel 日期序列从 1900-01-01 开始为 1，但 JavaScript 使用 1970-01-01 为基准
    // Excel 的 1900 年被错误视为闰年，因此使用 1899-12-30 作为基准可自动处理该问题
    const baseDate = new Date("1899-12-30");
    const resultDate = new Date(baseDate.getTime() + excelSerial * 24 * 60 * 60 * 1000);

    // 格式化为 YYYY-MM-DD
    const year = resultDate.getFullYear();
    const month = String(resultDate.getMonth() + 1).padStart(2, "0");
    const day = String(resultDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


let liveServerUrl = "https://oowuyue.github.io/notebook/"
if (devTestEnv) liveServerUrl = `http://127.0.0.1:${window.location.port ? window.location.port : 5500}/tempData/`
let liveServerOk = true
async function readExcel(excelFileName) {
    try {
        let dir = excelFileName.includes("IO") ? "指数期权excel" : "ETF期权excel"
        const fileUrl = `${liveServerUrl}${dir}/${excelFileName}`
        const file = await (await fetch(fileUrl)).arrayBuffer();
        const fileContent = XLSX.read(file);
        const sheetName = fileContent.SheetNames[0]; // 获取第一张 sheet 的名字
        const sheet = fileContent.Sheets[sheetName]; // 获取第一张 sheet 的数据
        const jsonData = XLSX.utils.sheet_to_json(sheet); // 将数据转换为 JSON 格式
        jsonData.pop();
        return jsonData.map((ele, index) => {
            ele.交易时间 = excelSerialToDate(ele.交易时间);
            return ele;
        });
    } catch (error) {
        return false
    }
}

let asset = {
    现金: 0,
    期权: [],
};

let 总入金 = 0;
let 总buyCash = 0;
let 总sellCash = 0;
let 总费用 = 0;
let need入金 = {};
let preStartDate;
let preEndDate;

const 模拟盈亏 = false
const 默认卖出到期类型 = -2 //默认0最后一天 -N提前N 卖出
const 默认卖出开or收 = "开盘价" //默认开收卖出

const 单次抽取百分比 = 0.05;
const 单次最小投资 = 3000;
const 单次最大投资 = 50000;
const 总持仓限制 = 0.15;
const etf费用 = 5
const etf倍数 = 10000
const 指数费用 = 15
const 指数倍数 = 100

const optionContractIndex = 4;
const profileIndex = 5;
const buyDateIndex = 6;
const buyPriceIndex = 7;
const buyCashIndex = 8;
const sellDateIndex = 9;
const sellPriceIndex = 10;
const sellCashIndex = 11;

function need入金groupByYear(need入金) {
    const result = {};
    for (const [key, value] of Object.entries(need入金)) {
        // 提取键中的起始年份（第一个日期的前4个字符）
        const startDate = key.split(' ')[0];
        const year = startDate.substring(0, 4);

        // 如果年份组不存在，则初始化一个对象，包含 sum 属性
        if (!result[year]) {
            result[year] = { sum: 0 };
        }

        // 将当前键值对添加到年份组中
        result[year][key] = value;

        // 更新总和
        result[year].sum += value;
        result[year].sum = +result[year].sum.toFixed(2)
    }
    return result;
}
function groupListByYear(asset期权list) {
    let yearToList = {}
    for (let index = 0; index < asset期权list.length; index++) {
        const element = asset期权list[index];
        const startYear = element[0].substring(0, 4)
        if (!yearToList?.[startYear]) yearToList[startYear] = []
        yearToList?.[startYear].push(element)
    }
    return yearToList
}
function getAsset持仓量额() {
    let 期权持仓量 = 0
    let 期权持仓额 = 0
    for (let index = 0; index < asset.期权.length - 1; index++) {
        const ele期权 = asset.期权[index];
        if (!ele期权[profileIndex]) {
            期权持仓量++
            期权持仓额 = 期权持仓额 + ele期权[buyCashIndex]
        }
    }
    return [期权持仓量, 期权持仓额]
}
function getBuyCashAnd入金(curBuy, 预估type = "") {
    let 单张费用 = curBuy[3].includes("ETF") ? etf费用 : 指数费用
    let 期权倍数 = curBuy[3].includes("ETF") ? etf倍数 : 指数倍数

    if (预估type == "预估ETF") {
        单张费用 = etf费用
        期权倍数 = etf倍数
    }
    if (预估type == "预估指数") {
        单张费用 = 指数费用
        期权倍数 = 指数倍数
    }

    let buyCash = 0;
    let curBuy入金 = 0;

    if (asset.现金 * 单次抽取百分比 > 单次最大投资) buyCash = 单次最大投资;
    else if (asset.现金 * 单次抽取百分比 >= 单次最小投资 && asset.现金 * 单次抽取百分比 <= 单次最大投资) buyCash = roundToHighestPlace(asset.现金 * 单次抽取百分比);
    else buyCash = 单次最小投资;

    let [期权持仓量, 期权持仓额] = getAsset持仓量额()
    if (期权持仓额 / (期权持仓额 + asset.现金) > 总持仓限制) { //限制总持仓
        buyCash = 单次最小投资;
    }

    let buyCount;
    if (curBuy.length >= buyPriceIndex) {
        let optionStartPrice = curBuy[buyPriceIndex] * 期权倍数;
        buyCount = +(buyCash / optionStartPrice).toFixed(2); //精确张数 允许小数测试
        if (buyCount > 1) buyCount = Math.ceil(buyCash / optionStartPrice); //向xia取整
        buyCash = buyCount * optionStartPrice + buyCount * 单张费用;//包含手续费
        总费用 = 总费用 + buyCount * 单张费用
    }

    if (asset.现金 < buyCash) {
        curBuy入金 = buyCash - asset.现金;
    }

    return [buyCash, curBuy入金, buyCount];
}
function get持仓日数(curSell) {
    let startDate = curSell[buyDateIndex].substring(0, 10);
    let startIndex = 沪深300ETF.findIndex((e) => e.date == startDate);
    let endDate = extractDate(curSell[sellDateIndex]);
    let endIndex = 沪深300ETF.findIndex((e) => e.date == endDate);
    return endIndex - startIndex;
}
function getCurDate区间类型(curDate) {
    let curDate日期区间 = ""
    Object.keys(triggerLogObj区间.上升日期区间).forEach(key => {
        let dateRange = key.split("=>");
        let startDate = dateRange[0];
        let endDate = dateRange[1];
        if (startDate <= curDate && curDate <= endDate) {
            curDate日期区间 = "上升日期区间"
            return
        }
    });
    Object.keys(triggerLogObj区间.下降日期区间).forEach(key => {
        let dateRange = key.split("=>");
        let startDate = dateRange[0];
        let endDate = dateRange[1];
        if (startDate <= curDate && curDate <= endDate) {
            curDate日期区间 = "下降日期区间"
            return false;
        }
    });
    return curDate日期区间
}
function getKeyId(期权arr) {
    return 期权arr[0] + "," + 期权arr[1] + "," + 期权arr[2];
}
function extr张数(str) {
    // 1. 以"张"分割，取其前部分（确保"张"存在）
    const prefix = str.split('张')[0];
    if (!prefix) return NaN;

    // 2. 从分割结果末尾匹配连续的数字/小数点（自动跳过末尾空格等非数字字符）
    const match = prefix.match(/[\d.]+$/);
    let res = match ? +match[0] : NaN;
    //console.log("extr张数:", str, "=>", res);
    return res;

}
function extractDate(str) {
    if (!str) return null;
    // 正则表达式匹配 YYYY-MM-DD 格式的日期
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    const match = str.match(dateRegex);

    if (match) {
        return match[0];
        // 验证日期是否有效
        //const date = new Date(match[0]);
        //if (date instanceof Date && !isNaN(date)) {
        //    return match[0]; // 返回匹配到的日期字符串
        //}
    }

    return null; // 如果没有找到有效日期，返回null
}
function preNext交易日(curDate, preNext = -1) {
    if (preNext === 0) return curDate;
    let curDateIndex = 沪深300.findIndex(e => e.date == curDate)
    if (curDateIndex > -1 && curDateIndex + preNext <= 沪深300.length - 1)
        return 沪深300[curDateIndex + preNext].date
    else {
        let resDate = stampToDate(dateToStamp(curDate) + preNext * 86400000)
        while (
            new Date(resDate).getDay() == 0 ||
            new Date(resDate).getDay() == 6 ||
            (resDate <= 沪深300.at(-1).date && !沪深300.find(e => e.date == resDate))
        ) {
            preNext > 0 ? resDate = stampToDate(dateToStamp(resDate) + 86400000) : resDate = stampToDate(dateToStamp(resDate) - 86400000)
        }
        return resDate;
    }
}
function countWeekdays(startDateStr, endDateStr) {
    /**
    * 计算两个日期之间（包含两端）非周六、周日的天数
    * @param {string} startDateStr - 开始日期，格式 'YYYY-MM-DD'
    * @param {string} endDateStr - 结束日期，格式 'YYYY-MM-DD'
    * @returns {number} 工作日天数（周一至周五）
    */
    // 安全解析日期字符串为 UTC 日期对象
    const parseUTCDate = (str) => {
        const [year, month, day] = str.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        if (isNaN(date.getTime())) {
            throw new Error(`无效日期: ${str}`);
        }
        return date;
    };

    try {
        const start = parseUTCDate(startDateStr);
        const end = parseUTCDate(endDateStr);

        // 处理开始日期晚于结束日期的情况
        if (start > end) return 0;

        // 计算总天数（包含两端）
        const totalDays = Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;

        // 获取开始日期的星期（UTC时间，0=周日，6=周六）
        const startDay = start.getUTCDay();

        // 计算完整周数和剩余天数
        const fullWeeks = Math.floor(totalDays / 7);
        const remainingDays = totalDays % 7;

        // 计算完整周贡献的周末天数
        let weekendDays = fullWeeks * 2;

        // 计算剩余天数中的周末天数
        for (let i = 0; i < remainingDays; i++) {
            const currentDay = (startDay + i) % 7;
            if (currentDay === 0 || currentDay === 6) { // 周日或周六
                weekendDays++;
            }
        }

        // 工作日 = 总天数 - 周末天数
        return totalDays - weekendDays;
    } catch (error) {
        console.error('日期处理错误:', error.message);
        return 0; // 发生错误时返回0
    }
}
function extractFirstNumber(str) {
    // 使用正则表达式匹配第一个数字（包括小数）
    const match = str.match(/^-?\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
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
        console.log("沪深300行业割裂大标准差", sqrvariance, 同比涨跌幅Arr[0] * 同比涨跌幅Arr.at(-1))
        return true
    }

    return false
}

function get深度恐贪old(curDate) {
    let curDate恐贪指数Index = 恐贪指数.findIndex(ele => ele.date == curDate)
    if (curDate恐贪指数Index < 0) curDate恐贪指数 = { "jiucaishuo": "", "baifenwei": "", "miumiu": "" }
    else curDate恐贪指数 = 恐贪指数[curDate恐贪指数Index]

    let preN5HigJC = -1000
    for (let ii = 0; ii < 6; ii++) {
        const ele = 恐贪指数[curDate恐贪指数Index - ii];
        if (ele?.jiucaishuo > preN5HigJC) preN5HigJC = ele?.jiucaishuo
    }

    let 深度贪婪count = 0
    if (curDate恐贪指数?.jiucaishuo > 79 || (curDate恐贪指数?.jiucaishuo > 71 && preN5HigJC > 79)) 深度贪婪count++
    if (curDate恐贪指数?.baifenwei > 74) 深度贪婪count++
    if (curDate恐贪指数?.miumiu > 84) 深度贪婪count++

    let 深度恐惧count = 0
    if (curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 8) 深度恐惧count++
    if (curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 25) 深度恐惧count++
    if (curDate恐贪指数?.miumiu && curDate恐贪指数?.miumiu < 15) 深度恐惧count++


    if (深度贪婪count == 3) return "深度贪婪"
    if (深度贪婪count >= 2 && 深度恐惧count == 0 && (curDate恐贪指数?.jiucaishuo > 90 || curDate恐贪指数?.baifenwei > 75 || curDate恐贪指数?.miumiu > 85)) return "深度贪婪"


    if (深度恐惧count == 3) return "深度恐惧"
    if (深度恐惧count >= 2 && 深度贪婪count == 0) return "深度恐惧"

    return ""
}
function get深度恐贪(curDate) {
    let curDate恐贪指数Index = 恐贪指数.findIndex(ele => ele.date == curDate)
    if (curDate恐贪指数Index < 0) curDate恐贪指数 = { "jiucaishuo": "", "baifenwei": "", "ashare": "", "miumiu": "" }
    else curDate恐贪指数 = 恐贪指数[curDate恐贪指数Index]

    let preN5HigJC = -1000
    let preN5HigASH = -1000
    for (let ii = 1; ii < 7; ii++) {
        const ele = 恐贪指数[curDate恐贪指数Index - ii];
        if (ele?.jiucaishuo > preN5HigJC) preN5HigJC = ele?.jiucaishuo
        if (ele?.ashare > preN5HigASH) preN5HigASH = ele?.ashare
    }

    let 深度贪婪count = 0
    if (curDate恐贪指数?.jiucaishuo > 79 || (curDate恐贪指数?.jiucaishuo > 71 && preN5HigJC > 79)) 深度贪婪count++
    if (curDate恐贪指数?.baifenwei > 74) 深度贪婪count++
    if (curDate恐贪指数?.ashare > 95 && preN5HigASH > 99) 深度贪婪count++
    if (curDate恐贪指数?.miumiu > 85) 深度贪婪count++

    let 深度恐惧count = 0
    if (curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 8) 深度恐惧count++
    if (curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 20) 深度恐惧count++
    if (curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 15) 深度恐惧count++
    if (curDate恐贪指数?.miumiu && curDate恐贪指数?.miumiu < 10) 深度恐惧count++


    ////////////////////////////////////
    if (深度贪婪count >= 3 && 深度恐惧count == 0) return "深度贪婪"

    if (
        curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo > 79 &&
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei > 74 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare > 95 && preN5HigASH > 99 &&
        深度恐惧count == 0
    ) return "深度贪婪"


    ////////////////////////////////////
    if (深度恐惧count >= 3 && 深度贪婪count == 0) return "深度恐惧"
    if (
        curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 8 &&
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 30 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 15 &&
        深度贪婪count == 0
    ) return "深度恐惧"

    if (
        curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 15 &&
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 20 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 15 &&
        深度贪婪count == 0
    ) return "深度恐惧"

    if (
        curDate恐贪指数?.jiucaishuo && curDate恐贪指数?.jiucaishuo < 8 &&
        curDate恐贪指数?.baifenwei && curDate恐贪指数?.baifenwei < 30 &&
        curDate恐贪指数?.ashare && curDate恐贪指数?.ashare < 0 &&
        深度贪婪count == 0
    ) return "深度恐惧"


    return ""
}

function check沽提前卖出(沪深300技术, curDate, asset期权, trigBuy = null) {

    let pre1Month = 沪深300技术.currentMonthList.at(-2);
    let curMonth = 沪深300技术.currentMonthList.at(-1);

    let pre1Week = 沪深300技术.currentWeekList.at(-2);
    let curWeek = 沪深300技术.currentWeekList.at(-1);

    let pre3Day = 沪深300技术.currentDayList.at(-4);
    let pre2Day = 沪深300技术.currentDayList.at(-3);
    let pre1Day = 沪深300技术.currentDayList.at(-2);
    let curDay = 沪深300技术.currentDayList.at(-1);


    let res = ""
    function 区间反向() {

        // let pmiValue
        // if (cn_pmi_平均.at(-1)[0].substring(0, 7) == curDate.substring(0, 7)) pmiValue = cn_pmi_平均.at(-1)
        // else pmiValue = cn_pmi_平均.find(e => e[0].substring(0, 7) == getPreMonth(curDate).substring(0, 7))
        // pmiValue[1] <= -9.5

        let curDate日期区间 = getCurDate区间类型(curDate)
        if (
            curDate日期区间 == "上升日期区间" &&
            (
                (curDay.close < curDay.lows && curDay.D < 41 && curWeek.close < curWeek.mas && curWeek.J < 20 && pre1Week.close > pre1Week.mas) ||
                (ocHighest(curDay) < curDay.lows && curDay.J < 0 && curWeek.low < curWeek.mas && curtPercent(curWeek) < 0 && curWeek.J < 0 && curWeek.bar < 0)  //2025-11-24
                || (
                    pre1Day.low > curDay.high && ocHighest(curDay) < curDay.lows &&
                    curDay.bar <= 0 && curDay.bias.bias3 < -3 && curDay.cci.cci < -200 &&
                    (PtPPercent(沪深300技术.currentDayList.at(-20), curDay) < -6 || lastN九转(沪深300技术.currentDayList) || preN十字星(沪深300技术.currentDayList)) &&
                    curWeek.J < curWeek.D && curWeek.bar < 0 && curWeek.bias.bias2 < 0 && curWeek.cci.cci < 0  //2026-06-08 
                )
            )
            &&
            !(KDJ死叉(沪深300技术.currentDayList) && MACD死叉attr(沪深300技术.currentDayList)) &&
            !(KDJ死叉(沪深300技术.currentDayList) && MACD死叉attr(沪深300技术.currentDayList)) &&
            !(
                (沪深300技术.currentMonthList.at(-1)?.is9转up == 9 || pre1Month.K > curMonth.K) &&
                (KDJ死叉(沪深300技术.currentMonthList) || BIAS死叉attr(沪深300技术.currentMonthList)) &&
                curWeek.close > curWeek.lows && curWeek.cci.cci > 0
            )
        ) return true
    }
    if (区间反向()) res += "P0."


    if (
        绿绿(沪深300技术.currentDayList) &&
        ocLowest(curDay) < curDay.lows &&
        (
            (curDay.bias.bias3 < -8 && pre1Day.bias.bias3 >= curDay.bias.bias3) ||
            (pre1Day.bias.bias3 - curDay.bias.bias3 > 4)
        )
    ) res += 'P1.'   //2022-03-15 2022-04-26 极低


    if (
        绿空绿绿(沪深300技术.currentDayList) &&
        curDay.close < curDay.lows &&
        curDay.cci.cci < -230 &&
        pre2Day.cci.cci - pre1Day.cci.cci > pre1Day.cci.cci - curDay.cci.cci &&
        curDay.J < -3 && curDay.bar < -20 &&
        (
            (curDay.bias.bias3 < -7 && pre1Day.bias.bias3 >= curDay.bias.bias3) ||
            (pre1Day.bias.bias3 - curDay.bias.bias3 > 3)
        )
    ) {
        res += 'P2.'   //2021-07-28 极低  
    }

    if (
        curtPercent(pre2Day) < 0 && curtPercent(pre1Day) < 0 && curtPercent(curDay) < 0 &&
        pre1Day.low > curDay.high &&
        ocHighest(curDay) < curDay.lows &&
        curDay.J < -5 && curDay.D < 41 &&
        (
            (curDay.bias.bias3 < -5 && pre1Day.bias.bias3 >= curDay.bias.bias3) ||
            (pre1Day.bias.bias3 - curDay.bias.bias3 > 3) ||
            curDay.cci.cci < -230
        )
    ) res += 'P3.'   //2026-03-23 极低  


    if (
        绿空绿红(沪深300技术.currentDayList) &&
        (pre1Day.high < pre1Day.lows || curDay.high < curDay.lows) &&
        curDay.bias.bias3 < -3 &&
        curDay.J < 10 && pre1Day.J < curDay.J
    ) res += 'P4.'   //` ${curDay.date}绿空绿红` //2021-08-20  低位可能转向


    if (
        绿空绿绿红(沪深300技术.currentDayList) &&
        pre1Day.close < pre1Day.lows && curDay.open < curDay.lows &&
        (pre2Day.cci.cci < -230 || pre1Day.cci.cci < -230 || curDay.cci.cci < -200) && pre1Day.cci.cci <= curDay.cci.cci &&
        curDay.J < -3 && curDay.bar < -20 &&
        (curDay.bias.bias3 < -3 || curWeek.bias.bias3 < -3 || curWeek.cci.cci < -100)
    ) {

        res += 'P5.'   //2021-06-18  2023-04-26 低位可能转向  
    }


    if (
        绿空绿(沪深300技术.currentDayList) &&
        33 > curDay.D && curDay.D > curDay.J &&
        curDay.bias.bias3 < -3 &&
        0 > curDay.bias.bias1 && curDay.bias.bias1 > curDay.bias.bias2 && curDay.bias.bias2 > curDay.bias.bias3 &&
        !(
            KDJ死叉(沪深300技术.currentDayList) &&
            MACD死叉attr(沪深300技术.currentDayList)
        ) &&
        !(
            KDJ死叉(沪深300技术.currentWeekList, 2) &&
            MACD死叉attr(沪深300技术.currentWeekList, "bar", 1)
        ) &&
        1 < countWeekdays(curDay.date, asset期权[1]) &&
        countWeekdays(curDay.date, asset期权[1]) < 7
    ) res += 'P6.'   //` ${curDay.date}绿空绿7` //2022-01-21  2022-02-18  低位快到期


    if (
        asset期权[buyPriceIndex] / extractFirstNumber(asset期权[3]) > 0.045 &&
        curtPercent(curDay) < 0 &&
        (curDay.J < 0 || 绿空绿(沪深300技术.currentDayList)) &&
        (curDay.bias.bias1 < 0 || curDay.bias.bias2 < 0) &&
        pre1Day.mas < curDay.mas &&
        沪深300技术.currentWeekList.at(-2).D < 沪深300技术.currentWeekList.at(-1).D &&
        沪深300技术.currentMonthList.at(-2).D < 沪深300技术.currentMonthList.at(-1).D
    ) res += 'P7.'   //` ${curDay.date}波动率太贵绿` //2024-11-15 低位太贵


    return res;
}

function check购提前卖出(沪深300技术, curDate, asset期权, trigBuy = null) {

    let currentMonthList = 沪深300技术.currentMonthList
    let pre1Month = 沪深300技术.currentMonthList.at(-2);
    let curMonth = 沪深300技术.currentMonthList.at(-1);

    let currentWeekList = 沪深300技术.currentWeekList
    let pre3Week = 沪深300技术.currentWeekList.at(-4);
    let pre2Week = 沪深300技术.currentWeekList.at(-3);
    let pre1Week = 沪深300技术.currentWeekList.at(-2);
    let curWeek = 沪深300技术.currentWeekList.at(-1);

    let currentDayList = 沪深300技术.currentDayList
    let pre3Day = 沪深300技术.currentDayList.at(-4);
    let pre2Day = 沪深300技术.currentDayList.at(-3);
    let pre1Day = 沪深300技术.currentDayList.at(-2);
    let curDay = 沪深300技术.currentDayList.at(-1);

    let res = ""

    if (
        !(
            countWeekdays(curDay.date, asset期权[1]) >= 20 &&
            (bollAllUp(沪深300技术.currentDayList) || volAllUp(沪深300技术.currentDayList)) &&
            pre1Day.dea < curDay.dea &&
            !preN矩形穿ups(沪深300技术.currentDayList) &&

            pre1Week.D < curWeek.D &&
            pre1Week.dea < curWeek.dea &&
            pre1Week.diff < curWeek.diff &&
            pre1Week.bar < curWeek.bar &&
            curWeek.dea < curWeek.bar &&

            pre3Week.volume < pre2Week.volume && pre2Week.volume < pre1Week.volume &&
            volMa(5, 沪深300技术.currentWeekList, -4) < volMa(5, 沪深300技术.currentWeekList, -3) &&
            volMa(5, 沪深300技术.currentWeekList, -3) < volMa(5, 沪深300技术.currentWeekList, -2) &&
            volMa(10, 沪深300技术.currentWeekList, -4) < volMa(10, 沪深300技术.currentWeekList, -3) &&
            volMa(10, 沪深300技术.currentWeekList, -3) < volMa(10, 沪深300技术.currentWeekList, -2) &&
            volMa(20, 沪深300技术.currentWeekList, -4) < volMa(20, 沪深300技术.currentWeekList, -3) &&
            volMa(20, 沪深300技术.currentWeekList, -3) < volMa(20, 沪深300技术.currentWeekList, -2) &&

            bollAllUp(沪深300技术.currentMonthList) &&
            kdjAllUp(沪深300技术.currentMonthList) &&
            macdAllUp(沪深300技术.currentMonthList)
        ) &&

        pre1Day.volume > curDay.volume &&
        curDay.bias.bias3 > curDay.bias.bias2 && curDay.bias.bias2 > curDay.bias.bias1 && curDay.bias.bias2 > 0 &&
        (pre1Day.J > curDay.J || pre1Day.K > curDay.K) &&

        红空红绿(沪深300技术.currentWeekList) &&
        pre1Week.close > pre1Week.ups && ocHighest(curWeek) > curWeek.ups &&
        curWeek.bias.bias3 > curWeek.bias.bias2 && curWeek.bias.bias2 > curWeek.bias.bias1 && curWeek.bias.bias1 > 0 &&
        (pre1Week.J > curWeek.J || pre1Week.K > curWeek.K) &&
        (
            lastN九转(沪深300技术.currentWeekList, "is9转up") ||
            (pre2Week.volume > pre1Week.volume && pre1Week.volume > curWeek.volume) ||
            curWeek.low >= curWeek.ups ||
            KDJ死叉(沪深300技术.currentWeekList) ||
            MACD死叉attr(沪深300技术.currentWeekList)
        )
    ) {
        res += "C0."
    }

    if (
        curDay.J > 100 && pre1Day.J > curDay.J &&
        红空红绿(沪深300技术.currentDayList) && curDay.ups < curDay.low &&
        红空红绿(沪深300技术.currentWeekList) && curWeek.ups < curWeek.low
    ) res += "C1."


    if (
        !(
            countWeekdays(curDay.date, asset期权[1]) >= 20 &&
            (bollAllUp(沪深300技术.currentDayList) || volAllUp(沪深300技术.currentDayList)) &&
            pre1Day.dea < curDay.dea &&
            !preN矩形穿ups(沪深300技术.currentDayList) &&

            pre1Week.D < curWeek.D &&
            pre1Week.dea < curWeek.dea &&
            pre1Week.diff < curWeek.diff &&
            pre1Week.bar < curWeek.bar &&
            curWeek.dea < curWeek.bar &&

            pre3Week.volume < pre2Week.volume && pre2Week.volume < pre1Week.volume &&
            volMa(5, 沪深300技术.currentWeekList, -4) < volMa(5, 沪深300技术.currentWeekList, -3) &&
            volMa(5, 沪深300技术.currentWeekList, -3) < volMa(5, 沪深300技术.currentWeekList, -2) &&
            volMa(10, 沪深300技术.currentWeekList, -4) < volMa(10, 沪深300技术.currentWeekList, -3) &&
            volMa(10, 沪深300技术.currentWeekList, -3) < volMa(10, 沪深300技术.currentWeekList, -2) &&
            volMa(20, 沪深300技术.currentWeekList, -4) < volMa(20, 沪深300技术.currentWeekList, -3) &&
            volMa(20, 沪深300技术.currentWeekList, -3) < volMa(20, 沪深300技术.currentWeekList, -2) &&

            bollAllUp(沪深300技术.currentMonthList) &&
            kdjAllUp(沪深300技术.currentMonthList) &&
            macdAllUp(沪深300技术.currentMonthList)
        ) &&
        !(
            pre1Day.dea < curDay.dea &&
            pre1Day.diff < curDay.diff &&
            pre1Day.bar < curDay.bar &&
            curDay.dea < curDay.bar
        ) &&

        curtPercent(pre2Week) >= 0 && curtPercent(pre1Week) >= 0 && curtPercent(curWeek) >= 0 &&
        lastN九转(沪深300技术.currentWeekList, "is9转up") &&
        (
            (
                volMa(5, 沪深300技术.currentWeekList, -3) > volMa(5, 沪深300技术.currentWeekList, -2) &&
                volMa(5, 沪深300技术.currentWeekList, -2) > volMa(5, 沪深300技术.currentWeekList, -1)
            ) ||
            volMa死叉(沪深300技术.currentWeekList) || volMa死叉(沪深300技术.currentWeekList, 5, 20)
        ) &&
        (pre2Week.volume > pre1Week.volume && pre1Week.volume > curWeek.volume)

    ) res += "C2."



    if (
        (
            curtPercent(pre1Day) < 0 ||
            PtPPercent(pre2Day, pre1Day) < 0 ||
            pre2Day.J > pre1Day.J
        ) &&
        (
            pre2Day.high > pre2Day.ups ||
            pre1Day.high > pre1Day.ups
        ) &&

        curtPercent(curDay) > 0 &&
        PtPPercent(pre1Day, curDay) > 0 &&
        curDay.close > curDay.ups &&
        ocLowest(curDay) > ocHighest(pre1Day) &&

        (pre1Day.J > curDay.J || pre1Day.D > curDay.D) &&
        (pre1Day.J > 100 || curDay.J > 100) &&
        curDay.bias.bias3 > curDay.bias.bias2 && curDay.bias.bias2 > curDay.bias.bias1 && curDay.bias.bias1 > 0 &&

        curWeek.close > curWeek.ups &&
        curWeek.J > 100 &&
        curWeek.bias.bias3 > curWeek.bias.bias2 && curWeek.bias.bias2 > curWeek.bias.bias1 && curWeek.bias.bias1 > 0 &&

        1 < countWeekdays(curDay.date, asset期权[1]) &&
        countWeekdays(curDay.date, asset期权[1]) < 11

    ) res += 'C3.'   //'2020-10-09', '2020-11-20', ' ↑ ' 快到期



    if (
        curtPercent(pre1Day) > 0 && PtPPercent(pre2Day, pre1Day) > 0 &&
        pre1Day.close < curDay.open &&
        curtPercent(curDay) > 0 && PtPPercent(pre1Day, curDay) > 0 &&
        curDay.close > curDay.ups &&
        curDay.cci.cci > 120 &&

        curWeek.close > curWeek.ups &&
        curWeek.cci.cci > 120
        && (
            (pre2Day.volume > pre1Day.volume && pre1Day.volume > curDay.volume) ||
            (pre3Week.volume > pre2Week.volume && pre2Week.volume > pre1Week.volume && pre1Week.volume > curWeek.volume) ||
            沪深300行业割裂大标准差(curDate)
        )
    ) res += 'C4.'


    let prehsl = pre1Day?.turnoverRate ?? pre1Day.hsl
    let hsl = curDay?.turnoverRate ?? curDay.hsl

    curDay.percent = curDay?.percent ?? curDay.changePercent

    let prezf = (pre1Day.high - pre1Day.low) / pre2Day.close * 100
    let zf = (curDay.high - curDay.low) / pre1Day.close * 100

    if (
        (
            (hsl > 1.85 && curDay.cci.cci > 100 && curDay.percent >= 0 && curWeek.close > curWeek.mas) ||
            (hsl > 1.55 && curDay.cci.cci > 200 && curDay.percent >= 0 && curWeek.close > curWeek.mas) ||
            (zf >= 7 && curDay.cci.cci > 100 && curDay.percent >= 0 && curWeek.close > curWeek.mas) ||
            (zf >= 6 && curDay.cci.cci > 200 && curDay.percent >= 0 && curWeek.close > curWeek.mas) ||
            (
                (hsl / prehsl > 1.1) && hsl >= 0.75 &&
                (zf / prezf > 1.5) && zf >= 1.5 &&
                (curDay.cci.cci > 120)
                && curDay.high > curDay.ups && curDay.close > curDay.mas
                && curWeek.high > curWeek.ups && curWeek.close > curWeek.mas
            )
        )
        && (
            (pre2Week.volume >= pre1Week.volume && pre1Week.volume >= curWeek.volume) ||
            (volMaPre(10, currentWeekList, -2) >= volMaPre(10, currentWeekList, -1) && volMaPre(5, currentWeekList, -2) >= volMaPre(5, currentWeekList, -1)) ||
            (pre2Day.volume >= pre1Day.volume && pre1Day.volume >= curDay.volume && volMaPre(5, currentDayList, -2) >= volMaPre(5, currentDayList, -1)) ||
            (pre1Day.cci.cci > curDay.cci.cci && pre1Day.cci.cci > 200) ||
            (curtPercent(curDay) > 0 && (pre1Day.J >= curDay.J || pre1Day.bias.bias1 >= curDay.bias.bias1 || pre1Day.bar >= curDay.bar))
        )
        && curMonth.D > 50 && curMonth.cci.cci > 50
        && (curWeek.cci.cci > 230 || (curWeek.D > 50 && curWeek.cci.cci > 60)) //100
        && !(
            volAllUp(currentDayList) && pre2Day.volume < pre1Day.volume && pre1Day.volume < curDay.volume
            && pre3Week.volume < pre2Week.volume && pre2Week.volume < pre1Week.volume
            && pre1Day.cci.cci <= curDay.cci.cci
            && pre1Week.cci.cci <= curWeek.cci.cci
        )
    ) res += 'C5.'


    return res;
}

function check提前卖出(curDate, asset期权, trigBuy = null) {
    let res = ""

    //#region type2高位当周2
    /////////////暂时只能买etf期权
    // let profileN3 = afterDayProfileW3(asset期权[0], [], 沪深300)
    // if (
    //     profileN3?.nextSecondDelivery周三 &&
    //     +profileN3?.nextSecondDelivery周三?.close.split("->")[0] > 20
    // ) {
    //     asset期权.N周三 = profileN3?.nextSecondDelivery周三?.close.split("->")[1].split(",")[0]
    //     if (profileN3?.nextSecondDelivery周三?.close.split("->")[1].split(",")[0] == curDate)
    //         res += "2Etf周三"
    // }
    // else if (
    //     profileN3?.nextThirdDelivery周三 &&
    //     +profileN3?.nextThirdDelivery周三?.close.split("->")[0] > 20
    // ) {
    //     asset期权.N周三 = profileN3?.nextThirdDelivery周三?.close.split("->")[1].split(",")[0]
    //     if (profileN3?.nextThirdDelivery周三?.close.split("->")[1].split(",")[0] == curDate)
    //         res += "3Etf周三"
    // }

    ///////////反向
    // if (
    //     trigBuy
    //     && (
    //         ((trigBuy[2].includes("高") || trigBuy[2].includes("↓")) && (asset期权[2].includes("低") || asset期权[2].includes("↑"))) ||
    //         ((trigBuy[2].includes("低") || trigBuy[2].includes("↑")) && (asset期权[2].includes("高") || asset期权[2].includes("↓")))
    //     ) && dateToStamp(trigBuy[0]) < dateToStamp(asset期权[1])
    // ) {
    //     res += "A" //反向
    // }
    //#endregion 

    if (
        asset期权[2].unif高低位() == "低位" &&
        全部策略ByDay.find(ele => ele[3].unif高低位() == "高位" && curDate == ele[0] && asset期权[0] <= ele[0] && ele[0] < asset期权[1])
    ) res += "反向."
    if (
        asset期权[2].unif高低位() == "高位" &&
        全部策略ByDay.find(ele => ele[3].unif高低位() == "低位" && curDate == ele[0] && asset期权[0] <= ele[0] && ele[0] < asset期权[1])
    ) res += "反向."

    let 美股策略byDay = Object.entries(triggerLogObj美股指数.按日期排序)
    if (
        asset期权[2].includes("↑") &&
        美股策略byDay.filter(ele => ele[1][0].includes("高位") && curDate == ele[0] && asset期权[0] <= ele[0] && ele[0] < asset期权[1]).length > 2
    ) res += "区美反."
    if (
        asset期权[2].includes("↓") &&
        美股策略byDay.filter(ele => ele[1][0].includes("低位") && curDate == ele[0] && asset期权[0] <= ele[0] && ele[0] < asset期权[1]).length > 2
    ) res += "区美反."



    let 沪深300技术 = {};
    沪深300技术.dayDatas = 沪深300;
    沪深300技术 = calDayWeekMonthKline(沪深300技术, curDate);
    let pre3Week = 沪深300技术.currentWeekList.at(-4);
    let pre2Week = 沪深300技术.currentWeekList.at(-3);
    let pre1Week = 沪深300技术.currentWeekList.at(-2);
    let curWeek = 沪深300技术.currentWeekList.at(-1);
    let pre2Day = 沪深300技术.currentDayList.at(-3);
    let pre1Day = 沪深300技术.currentDayList.at(-2);
    let curDay = 沪深300技术.currentDayList.at(-1);

    if (
        asset期权[2].unif高低位() == "低位" &&
        get深度恐贪(curDate) == "深度贪婪"
        && (pre1Day.J > 100 || curDay.J > 100) && curDay.bar > 0
        && curDay.bias.bias3 > curDay.bias.bias1 && curDay.bias.bias2 > curDay.bias.bias1 && curDay.bias.bias1 > 0
        && curDay.cci.cci > 120
        && (pre1Week.D > 70 || curWeek.D > 70) && curWeek.bar > 0
        && curWeek.bias.bias3 > curWeek.bias.bias1 && curWeek.bias.bias2 > curWeek.bias.bias1 && curWeek.bias.bias1 > 0
        && curWeek.cci.cci > 120
        && (
            (pre2Day.volume > pre1Day.volume && pre1Day.volume > curDay.volume) ||
            (pre3Week.volume > pre2Week.volume && pre2Week.volume > pre1Week.volume && pre1Week.volume > curWeek.volume) ||
            沪深300行业割裂大标准差(curDate)
            //2026-06-22 触发收盘通知下个交易日2026-06-23(深贪>提前)卖出[2026-06-08,2026-07-17,低位]
        )
    ) res += "深贪."

    if (
        asset期权[2].unif高低位() == "高位" &&
        get深度恐贪(curDate) == "深度恐惧" &&
        ocLowest(curDay) < curDay.lows && curDay.bias.bias3 < -3 && curDay.cci.cci < -120 &&
        (
            (curDay.bias.bias3 <= -5 && pre1Day.bias.bias3 >= curDay.bias.bias3) ||
            (pre1Day.bias.bias3 - curDay.bias.bias3 >= 3) ||
            curDay.cci.cci <= -210 ||
            沪深300行业割裂大标准差(curDate)
        ) &&
        curWeek.J < curWeek.D && curWeek.bar < 0 && curWeek.bias.bias2 < 0 && curWeek.cci.cci < 0
    ) res += "深恐."


    if (asset期权[3].includes("沽")) res += check沽提前卖出(沪深300技术, curDate, asset期权)
    if (asset期权[3].includes("购")) res += check购提前卖出(沪深300技术, curDate, asset期权)


    if (res != "") return res.slice(0, -1); //删除最后的.
    return false
}


async function 模拟交易(期权买卖List) {

    let todayNearMailMsg = ""

    if (沪深300.at(-1).date !== currentDayYMD) 沪深300.push({ "date": `${currentDayYMD}` })//for本地
    const startOldestIndex = 沪深300.findIndex(e => e.date == 期权买卖List.at(-1)[0]);

    for (let i = startOldestIndex; i < 沪深300.length; i++) {
        let cur沪深300Date = 沪深300[i].date;
        let curDateHasConsole = false;

        //当日卖出
        let curAllSell入金;
        let curAllSellCash;
        let curAllSellCount = 0;
        let curAllNeed入金Count = 0;
        let 模拟or手动 = "模拟"
        for (let index = asset.期权.length - 1; index >= 0; index--) {
            let asset期权 = asset.期权[index];
            if (cur沪深300Date !== extractDate(asset期权[sellDateIndex])) { continue; }

            let 单张费用 = asset期权[3].includes("ETF") ? etf费用 : 指数费用
            let 期权倍数 = asset期权[3].includes("ETF") ? etf倍数 : 指数倍数
            let 张数 = extr张数(asset期权[4]);

            if (asset期权[3].includes("手动")) {
                let sellDate = extractDate(asset期权[sellDateIndex]);
                let sellPrice = asset期权[sellPriceIndex];
                let sellCash = asset期权[sellCashIndex];

                let curSell入金;
                if (sellCash < 0 && asset.现金 + sellCash < 0) {
                    curSell入金 = 0 - (asset.现金 + sellCash);
                    总入金 = 总入金 + curSell入金;
                    curAllSell入金 = curSell入金 + (curAllSell入金 ?? 0);
                    asset.现金 = asset.现金 + curSell入金;
                    need入金[asset期权[0] + " " + asset期权[1] + " sell "] = curSell入金;
                    curAllNeed入金Count++;
                }
                总费用 = 总费用 + 张数 * 单张费用;

                curAllSellCash = sellCash + (curAllSellCash ?? 0);
                curAllSellCount++;

                asset期权[4] = asset期权[4] + ":" + get持仓日数(asset期权) + "日" + (curSell入金 > 0 ? ":入金卖" : ""); //

                asset.现金 = asset.现金 + sellCash;
                asset.现金 = +asset.现金.toFixed(2);

                模拟or手动 = "手动"
                continue
            }

            if (arrayHasIndex(asset期权, sellPriceIndex)) { continue; }
            if (arrayHasIndex(asset期权, sellCashIndex)) { continue; }
            if (!liveServerOk) { continue; }
            let excelFileName = asset期权[4].includes(".xlsx") ? asset期权[4] : asset期权[4].split(":")[0] + ".xlsx";
            let excelFileData = await readExcel(excelFileName);
            if (!excelFileData) { console.error(`模拟卖出${excelFileName}文件缺失`); continue }
            let excelSellDateIndex = excelFileData.findIndex((e) => e.交易时间 == extractDate(asset期权[sellDateIndex]));
            if (excelSellDateIndex == -1) excelSellDateIndex = excelFileData.length - 1;
            let sellDate = excelFileData[excelSellDateIndex].交易时间;
            let 卖出开or收 = asset期权[sellDateIndex].includes("提前") ? "开盘价" : 默认卖出开or收;
            let sellPrice = excelFileData[excelSellDateIndex][卖出开or收];

            let buyPrice = asset期权[buyPriceIndex];
            let priceProfile = +((sellPrice - buyPrice) / buyPrice).toFixed(2);

            //收益率为负 继续拖
            if (priceProfile <= 0 && excelFileData.at(-1).交易时间 != cur沪深300Date) {
                asset期权[sellDateIndex] = null;
                continue;
            }
            //最后三天  如果期权 开盘价 < ocHighest(上一天) 或 ocHighest(买入日) 继续拖
            let excelBuyDateIndex = excelFileData.findIndex((e) => e.交易时间 == extractDate(asset期权[buyDateIndex]));
            if (
                !asset期权[sellDateIndex].includes("提前") &&
                默认卖出到期类型 != 0 && excelFileData.at(-1).交易时间 != cur沪深300Date &&
                (
                    ocHighest(excelFileData[excelBuyDateIndex]) > excelFileData[excelSellDateIndex].开盘价 ||
                    ocHighest(excelFileData[excelSellDateIndex - 1]) > excelFileData[excelSellDateIndex].开盘价
                )
            ) {
                asset期权[sellDateIndex] = null;
                continue;
            }

            if (!asset期权[sellDateIndex].includes(sellDate)) asset期权[sellDateIndex] = sellDate;
            asset期权[sellDateIndex] += 卖出开or收.substring(0, 1)
            asset期权[sellPriceIndex] = +sellPrice.toFixed(2);
            asset期权[profileIndex] = +priceProfile.toFixed(2);

            if (模拟盈亏) {
                priceProfile = gerRandomProfile(priceProfile)
                sellPrice = buyPrice * (1 + priceProfile)
                asset期权[sellPriceIndex] = +sellPrice.toFixed(2);
                asset期权[profileIndex] = +priceProfile.toFixed(2);
            }

            let sellCash = (asset期权[buyCashIndex] - 张数 * 单张费用) * (1 + priceProfile);
            sellCash = sellCash - 张数 * 单张费用;

            curAllSellCash = sellCash + (curAllSellCash ?? 0);
            总sellCash += sellCash;
            总费用 = 总费用 + 张数 * 单张费用;

            let curSell入金;
            if (sellCash < 0 && asset.现金 + sellCash < 0) {
                curSell入金 = 0 - (asset.现金 + sellCash);
                总入金 = 总入金 + curSell入金;
                curAllSell入金 = curSell入金 + (curAllSell入金 ?? 0);
                asset.现金 = asset.现金 + curSell入金;
                need入金[asset期权[0] + " " + asset期权[1] + " sell "] = curSell入金;
                curAllNeed入金Count++;
            }

            sellCash = +sellCash.toFixed(2)
            asset期权[sellCashIndex] = sellCash;
            asset期权[4] = asset期权[4] + ":" + get持仓日数(asset期权) + "日" + (curSell入金 > 0 ? ":入金卖" : ""); //

            ////从后往前所以可以删除而不影响索引！！！！！！
            //asset.期权 = asset.期权.filter((item) => getKeyId(item) != getKeyId(asset期权))
            asset.现金 = asset.现金 + sellCash;
            asset.现金 = +asset.现金.toFixed(2);
            curAllSellCount++;
        }
        if (isNumber(curAllSellCash)) {
            if (curAllSell入金 > 0) {
                curAllSell入金 = +curAllSell入金.toFixed(2)
                console.log(curDateHasConsole ? "补足卖手续费入金".leftAppend() + curAllNeed入金Count : `${cur沪深300Date} 补足卖手续费入金${curAllNeed入金Count}`, curAllSell入金, "=>", cloneAsset(asset));
                curDateHasConsole = true;
            }
            curAllSellCash = +curAllSellCash.toFixed(2)
            console.log(curDateHasConsole ? `${模拟or手动}卖出`.leftAppend() + curAllSellCount : `${cur沪深300Date} ${模拟or手动}卖出` + curAllSellCount, curAllSellCash, "=>", cloneAsset(asset));
            curDateHasConsole = true;
        }

        //当日收盘触发下日买入,写入下个交易日买入日期.
        let curTrigBuy = 期权买卖List.find((e) => e[0] == cur沪深300Date && !arrayHasIndex(e, buyDateIndex));
        if (curTrigBuy) {
            if (!curTrigBuy[3].includes("手动") && !curTrigBuy[3].includes("模拟")) {
                let [buyCash, curbuy入金, buyCount] = getBuyCashAnd入金(curTrigBuy, "预估ETF");
                let msg = `${cur沪深300Date} 触发收盘通知下个交易日${preNext交易日(cur沪深300Date, 1)}开盘买入 [${getKeyId(curTrigBuy)}] 预估买ETF期权${buyCash}`
                console.log(msg);
                curDateHasConsole = true;
                if (isSendMail(cur沪深300Date, "五天之内")) todayNearMailMsg += (msg + "\r\n" + "&nbsp;".repeat(35))//pageSendMail(msg)
            }
            if (curTrigBuy[3].includes("手动")) { };
            if (curTrigBuy[3].includes("模拟")) curTrigBuy[buyDateIndex] = preNext交易日(cur沪深300Date, 1);
        }

        //当日买入
        let curBuy = 期权买卖List.find((e) => e[buyDateIndex] == cur沪深300Date);
        if (curBuy) {
            let 单张费用 = curBuy[3].includes("ETF") ? etf费用 : 指数费用
            let 期权倍数 = curBuy[3].includes("ETF") ? etf倍数 : 指数倍数
            if (curBuy[3].includes("手动")) {
                let buyPrice = curBuy[buyPriceIndex];
                let buyCash = curBuy[buyCashIndex];
                if (asset.现金 < buyCash) {
                    let curbuy入金 = buyCash - asset.现金
                    总入金 = 总入金 + curbuy入金;
                    asset.现金 = asset.现金 + curbuy入金;
                    need入金[curBuy[0] + " " + curBuy[1] + " buy"] = curbuy入金;
                    console.log(curDateHasConsole ? "手动补足买入金".leftAppend() : `${cur沪深300Date} 手动补足买入金 `, curbuy入金, "=>", cloneAsset(asset));
                    curDateHasConsole = true;
                }
                let 张数 = extr张数(curBuy[4]);
                总费用 = 总费用 + 张数 * 单张费用;

                总buyCash = 总buyCash + buyCash
                asset.现金 = asset.现金 - buyCash;
                asset.现金 = +asset.现金.toFixed(2);
                asset.期权.unshift(curBuy);

                console.log(curDateHasConsole ? "手动买入 ".leftAppend() : `${cur沪深300Date} 手动买入 `, buyCash, "=>", cloneAsset(asset));
                curDateHasConsole = true;
            }
            if (curBuy[3].includes("模拟") && !arrayHasIndex(curBuy, buyPriceIndex) && liveServerOk) {
                let excelFileName = curBuy[4].includes(".xlsx") ? curBuy[4] : curBuy[4].split(":")[0] + ".xlsx";
                let excelFileData = await readExcel(excelFileName);
                if (!excelFileData) { console.error(`模拟买入${excelFileName}文件缺失`); continue }
                let excelBuyDateIndex = excelFileData.findIndex((e) => e.交易时间 == curBuy[buyDateIndex]);
                if (excelBuyDateIndex == -1) excelBuyDateIndex = 0;
                let buyDate = excelFileData[excelBuyDateIndex].交易时间;
                let buyPrice = excelFileData[excelBuyDateIndex]["开盘价"];
                curBuy[buyDateIndex] = buyDate;
                curBuy[buyPriceIndex] = buyPrice;

                let [buyCash, curbuy入金, buyCount] = getBuyCashAnd入金(curBuy);
                if (curbuy入金 > 0) {
                    总入金 = 总入金 + curbuy入金;
                    asset.现金 = asset.现金 + curbuy入金;
                    need入金[curBuy[0] + " " + curBuy[1] + " buy"] = curbuy入金;
                    console.log(curDateHasConsole ? "补足买入金".leftAppend() : `${cur沪深300Date} 补足买入金 `, curbuy入金, "=>", cloneAsset(asset));
                    curDateHasConsole = true;
                }

                总buyCash = 总buyCash + buyCash
                buyCash = +buyCash.toFixed(2)
                curBuy[buyCashIndex] = buyCash;
                curBuy[4] = curBuy[4].replace(".xlsx", "") + (curbuy入金 > 0 ? ":入金买" : "") + ":" + buyCount + "张"; //购买张数

                asset.现金 = asset.现金 - buyCash;
                asset.现金 = +asset.现金.toFixed(2);
                asset.期权.unshift(curBuy);

                console.log(curDateHasConsole ? "模拟买入 ".leftAppend() : `${cur沪深300Date} 模拟买入 `, buyCash, "=>", cloneAsset(asset));
                curDateHasConsole = true;
            }
        }


        //当日收盘触发下日卖出,写入下个交易日卖出日期.
        for (let index = asset.期权.length - 1; index >= 0; index--) {
            let asset期权 = asset.期权[index];
            if (!arrayHasIndex(asset期权, buyDateIndex)) continue;
            if (arrayHasIndex(asset期权, sellDateIndex)) continue;

            let curNextOne交易日 = preNext交易日(cur沪深300Date, 1)
            let sellDateStr
            let need提前卖出 = check提前卖出(cur沪深300Date, asset期权);
            if (need提前卖出 && curNextOne交易日 !== asset期权[1])
                sellDateStr = `${curNextOne交易日}(${need提前卖出}>提前)`;
            else {
                for (let preDay = 默认卖出到期类型; preDay <= 0; preDay++) {
                    if ((asset期权.tAr === "月KM死叉副高位右侧" || asset期权.tAr === "高位Pmi股债") && preDay != 0) {
                        continue  //单独的月KM死叉副高位右侧 高位Pmi股债 到最后一天
                    }
                    if (curNextOne交易日 == preNext交易日(asset期权[1], preDay)) {
                        sellDateStr = `${curNextOne交易日}`;
                        break
                    }
                }
            }

            if (!sellDateStr) continue

            if (asset期权[3].includes("手动")) {
                let msg = `${cur沪深300Date} 触发收盘通知下个交易日${sellDateStr}卖出[${getKeyId(asset期权)}]`
                console.log(curDateHasConsole ? msg.substring(11).leftAppend() : msg);
                curDateHasConsole = true;
                if (isSendMail(cur沪深300Date, "五天之内")) {
                    if (!todayNearMailMsg.includes(`${cur沪深300Date} 触发收盘通知下个交易日${sellDateStr}卖出`)) todayNearMailMsg += msg//pageSendMail(msg)
                    else todayNearMailMsg += msg.split("卖出")[1]
                }
            };
            if (asset期权[3].includes("模拟")) asset期权[sellDateIndex] = sellDateStr;
        }

    }

    return todayNearMailMsg
};


(async () => {
    if (期权买卖List.length == 0) return
    console.groupCollapsed("模拟真实");
    if (liveServerOk) await fetch(liveServerUrl).catch(err => { liveServerOk = false })


    let todayNearMailMsg = await 模拟交易(期权买卖List);

    console.log("")
    console.log(`模拟真实${单次最小投资}到${单次最大投资}: `, "总入金:", +总入金.toFixed(2), "总buyCash:", +总buyCash.toFixed(2), "总sellCash:", +总sellCash.toFixed(2), "asset现金:", +asset.现金.toFixed(2), "总入金收益率:", +(((asset.现金 - 总入金) / 总入金) * 100).toFixed(4) + "%", "总buyCash收益率:", +(((asset.现金 - 总buyCash) / 总buyCash) * 100).toFixed(4) + "%");

    let test总buyCash = 0;
    let test总sellCash = 0;
    asset.期权.forEach((ele) => {
        test总buyCash += ele[buyCashIndex];
        test总sellCash = test总sellCash + (ele[sellCashIndex] ?? 0)
    });
    console.log("总buyCash", +test总buyCash.toFixed(2), "总sellCash", +test总sellCash.toFixed(2), "总sellCash-总sellCash+总入金", +(test总sellCash - test总buyCash + 总入金).toFixed(2));

    let need入金统计 = need入金groupByYear(need入金)
    if (need入金统计[currentDayYMD.substring(0, 4)]?.sum > 31000) todayNearMailMsg = todayNearMailMsg + `。${currentDayYMD.substring(0, 4)}年入金已超30000 `//pageSendMail(currentDayYMD.substring(0, 4) + "年入金已超30000")
    console.log("总费用", 总费用, "need入金统计", need入金统计);

    let 持仓buyYear = groupListByYear(asset.期权)
    console.log("持仓buyYear", 持仓buyYear);

    let profile平均数 = calAvgProf(asset.期权, 5)
    let profile中位数 = calMedianProf(asset.期权, 5)
    console.log("收益中位数", profile中位数, "收益平均数", profile平均数);

    const endJs = performance.now();
    window.asset = asset

    //, asset现金:${+asset.现金.toFixed(2)} 
    // ${(() => { let cur策略 = 全部策略ByDay.find(e => e[0] == preDayYMD); return cur策略 ? `昨日${preDayYMD}策略汇总：(${cur策略[1].length})[${cur策略[1].toString()}]` : "" })()} \r\n 
    await pageSendMail(`
最新策略运行日期(恐贪指数):${window?.恐贪writeDateTime} ${JSON.stringify(window?.恐贪指数.at(-1))}
${(() => { let cur策略 = 全部策略ByDay.find(e => e[0] == currentDayYMD); return cur策略 ? `当日${currentDayYMD}全部策略汇总：(${cur策略[1].length})[${cur策略[1].toString()}]` : "" })()}

当日${currentDayYMD}期权交易：
代码运行时间: ${(endJs - startJs).toFixed(2)} 毫秒 。 
当日及五天内收盘通知:${todayNearMailMsg.trim()} 。
asset持仓:${asset.期权.filter(ele => arrayHasIndex(ele, buyDateIndex) && !arrayHasIndex(ele, sellDateIndex)).map(ele => `[${getKeyId(ele)}]`).join(`\r\n${"&nbsp;".repeat(16)}`)} 。
asset现金:${+asset.现金.toFixed(2)} 。
`
        , () => { window.optionRunEnd = true });


    let profileArr = []
    asset.期权 = asset.期权.map(ele => {
        ele[3] = ele[3].replace("沪深300", "300")
        ele[4] = ele[4].substring(7)
        profileArr.push(ele[profileIndex])
        return ele
    })
    let 购期权 = asset.期权.filter((ele, index) => {
        return ele[3].includes("购");
    });
    购期权.sort((a, b) => b[profileIndex] - a[profileIndex]);
    console.log(购期权);

    let 沽期权 = asset.期权.filter((ele, index) => {
        return ele[3].includes("沽");
    });
    沽期权.sort((a, b) => b[profileIndex] - a[profileIndex]);
    console.log(沽期权);

    asset.期权.sort((a, b) => b[profileIndex] - a[profileIndex]);
    console.log(asset.期权)//, profileArr);

    console.groupEnd();


})();


/*

信号 && 无反向亏损持仓  =》买入

买入的是ETF期权，策略js是按照股指期权。   股指期权到日期 之后5天左右 ETF期权到日期。

提前信号 && 盈利                               =》卖出 

股指期权倒数三天信号 && 盈利 && 期权开盘价上跳空  =》卖出 
股指期权最后一天 && 盈利                        =》卖出 
 
ETF期权 && 盈利                                =》卖出 

*/