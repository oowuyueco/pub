
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
        nameCode.currentDayList = calculationCci(nameCode.currentDayList)

        let weekDayStart = (currentDayIndex + 1) - 500 > 0 ? (currentDayIndex + 1) - 500 : 0 //week最近100周500天
        nameCode.currentWeekList = dayToPeriod(nameCode.dayDatas.slice(weekDayStart, currentDayIndex + 1), "week")
            .calBoll().cal9转(kline交易日, "week").calKdj().calMacd().maN(10, 'close')
        nameCode.currentWeekList = calculationBias(nameCode.currentWeekList)
        nameCode.currentWeekList = calculationCci(nameCode.currentWeekList)

        let monthDayStart = 0 //month全部
        nameCode.currentMonthList = dayToPeriod(nameCode.dayDatas.slice(monthDayStart, currentDayIndex + 1), "month")
            .calBoll().cal9转(kline交易日, "month").calKdj().calMacd()
            .maN(3, 'close').maN(5, 'close').maN(10, 'close').maN(80, 'close')
        nameCode.currentMonthList = calculationBias(nameCode.currentMonthList)
        nameCode.currentMonthList = calculationCci(nameCode.currentMonthList)
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
    return period.open > period.close ? period.open : period.close
}
function ocLowest(period) {
    return period.open < period.close ? period.open : period.close
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



//////////////////////////////////////////////////////////////////////////////////////////////////////



function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
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
String.prototype.unif高低位 = function (search, replacement) {
    var target = this;
    target = target.replace("★", "位").replace(" ↓ ", "高位").replace(" ↑ ", "低位").substring(0, 2);
    return target;
};


let 手动买卖 = [
    ["2025-11-25", "2026-01-16", " ↑ ", '4490.4 购沪深300手动 4625.112', 'io2601购4600:53张', 2.3, '2025-11-26', 57.4, 3837, '2026-01-16开', 182, 8851],
    ['2025-10-28', '2025-12-24', '高位', '4.802 沽沪深300ETF手动 4.658', '2025-12-24沽4700:34张', 1.91, '2025-10-29', 0.0888, 30532, '提前P1:2025-11-25开', 0.1701, 58485],
]
let 模拟买卖 = [
    ["2025-08-19", "2025-10-17", " ↑ ", "4223.37 购沪深300模拟 4350.071", "IO2510-C-4350.xlsx"],
    ["2025-08-11", "2025-09-19", " ↑ ", "4122.51 购沪深300模拟 4246.185", "IO2509-C-4200.xlsx"],
    ["2025-06-23", "2025-08-15", " ↑ ", "3857.9 购沪深300模拟 3973.637", "IO2508-C-3950.xlsx"],
    ["2025-05-29", "2025-07-18", " ↑ ", "3858.7 购沪深300模拟 3974.461", "IO2507-C-3950.xlsx"],
    ["2025-05-06", "2025-06-20", " ↑ ", "3808.54 购沪深300模拟 3922.796", "IO2506-C-3900.xlsx"],
    ["2025-04-07", "2025-05-16", " ↑ ", "3589.44 购沪深300模拟 3697.123", "IO2505-C-3650.xlsx"],
    ["2025-03-19", "2025-04-18", "高位", "4010.17 沽沪深300模拟 3889.865", "IO2504-P-3900.xlsx"],
    ["2025-01-13", "2025-02-21", " ↑ ", "3722.51 购沪深300模拟 3834.185", "IO2502-C-3800.xlsx"],

    ["2024-10-08", "2024-11-15", "高位", "4256.1 沽沪深300模拟 4128.417", "IO2411-P-4150.xlsx"],

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
function 第一次按方向后N到期日分类查找标记yes1备份(全部策略By期权日) {

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
            //空 十字 

            let cond_3 = true &&
                trigArr[trigArrIndex][3] == "高★" &&
                (upAllPre(curKInfo) || curtPercent(curKInfo) >= 0 || curKInfo.percent >= 0) &&
                trigArr[trigArrIndex][1].length >= 10
            if (cond_3) return true

            let cond_2 = true &&
                trigArr[trigArrIndex][3] == "高★" &&
                curtPercent(curKInfo) > 0 &&
                curKInfo.percent > 0 &&
                (
                    upAllPre(curKInfo) ||
                    curKInfo.index - kInfoArr.at(-1).index > 5 ||
                    trigArr[trigArrIndex][1].length >= 3
                )
            if (cond_2) return true

            let cond_1 = true &&
                trigArr[trigArrIndex][3] == "高★" &&
                (trigArr[trigArrIndex][1] + "").includes("Pmi股债")
            if (cond_1) return true

            let cond0 = true &&
                trigArr[trigArrIndex][3] == "高★" &&
                (trigArr[trigArrIndex][1] + "").includes("VKM多叉")
            if (cond0) return true

            let cond2 = true &&
                upAllPre(curKInfo) &&
                curtPercent(curKInfo) > 0 &&
                curKInfo.percent > 0 &&
                (
                    curKInfo.index - kInfoArr.at(-1).index > 5 ||
                    trigArr[trigArrIndex][1].length >= 3
                )
            if (cond2) return true

            let cond3 = true &&
                upAllPre(curKInfo) &&
                (curtPercent(curKInfo) > 0 || curKInfo.percent > 0) &&
                (
                    curKInfo.index - kInfoArr.at(-1).index > 7 ||
                    trigArr[trigArrIndex][1].length >= 4
                )
            if (cond3) return true


        }
        function allow低位(curKInfo, trigArr, trigArrIndex) {

            let cond_3 = true &&
                trigArr[trigArrIndex][3] == "低★" &&
                (trigArr[trigArrIndex][1] + "").includes("Pmi股债")
            if (cond_3) return true

            let cond_2 = true &&
                trigArr[trigArrIndex][3] == "低★" &&
                (trigArr[trigArrIndex][1] + "").includes("VKM多叉")
            if (cond_2) return true

            let cond_1 = true &&
                trigArr[trigArrIndex][3] == "低★" &&
                (trigArr[trigArrIndex][1] + "").includes("PK") && //基金
                (
                    (trigArr[trigArrIndex][1] + "").includes("低位B") ||
                    trigArr[trigArrIndex][1].length >= 3
                )
            if (cond_1) return true


            let cond_0 = true &&
                trigArr[trigArrIndex][3] == "低★" &&
                (lowAllPre(curKInfo) || curtPercent(curKInfo) <= 0 || curKInfo.percent <= 0) &&
                trigArr[trigArrIndex][1].length >= 10
            if (cond_0) return true

            let cond0 = true &&
                trigArr[trigArrIndex][3] == "低★" &&
                curtPercent(curKInfo) <= 0 &&
                curKInfo.percent <= 0 &&
                (
                    lowAllPre(curKInfo) ||
                    curKInfo.index - kInfoArr.at(-1).index > 5 ||
                    trigArr[trigArrIndex][1].length >= 3
                )
            if (cond0) return true


            let cond1 = true &&
                lowAllPre(curKInfo) &&
                curtPercent(curKInfo) < 0 &&
                curKInfo.percent < 0 &&
                (
                    curKInfo.index - kInfoArr.at(-1).index > 5 ||
                    trigArr[trigArrIndex][1].length >= 3
                )
            if (cond1) return true

            let cond2 = true &&
                lowAllPre(curKInfo) &&
                (curtPercent(curKInfo) < 0 || curKInfo.percent < 0) &&
                (
                    curKInfo.index - kInfoArr.at(-1).index > 7 ||
                    trigArr[trigArrIndex][1].length >= 4
                )//2022-10-31
            if (cond2) return true
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
                    count++
                } else {
                    element[1][idx].yes1 = allow低位(curKInfo, element[1], idx)
                    count++
                }
            }
        }
        element.count = count
    }

}

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
        //.filter(ele => !(ele[0].includes("2024-09") || ele[0].includes("2024-08")))
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
            if (s2) { s2.tAr = ele.tAr; return s2 }//手动
            else {
                s2 = 手动买卖.find((e) => ele[0] + ele[1].substring(0, 7) + ele[2].unif高低位() == e[0] + e[1].substring(0, 7) + e[2].unif高低位());
                if (s2) { s2.tAr = ele.tAr; return s2 }//手动
            }

            if (ele[0] < "2020-01-01" && ele[3].includes("ETF")) return null
            return ele //未决
        })
        .filter(e => e !== null)
}

//第二次按照[沽到期日]分类 期权建议ByDay->期权买卖List 后查找    
function 第二次按方向到期日分类查找标记ok2备份(期权买卖List, N) {
    // 用于记录每个第二个元素值在从后往前遍历中的遇到次数
    const countMap = {};
    // 初始化一个布尔数组，标记每个索引是否保留
    const keepFlags = new Array(期权买卖List.length).fill(false);

    // 从后往前遍历数组（从最后一个元素到第一个元素）
    for (let i = 期权买卖List.length - 1; i >= 0; i--) {
        const endDate = 期权买卖List[i][1];
        const direct = 期权买卖List[i][2].unif高低位()
        const endDateDirect = endDate + direct
        // 初始化计数（如果未遇到过该值）
        if (!countMap.hasOwnProperty(endDateDirect)) {
            countMap[endDateDirect] = [];
        }
        // 增加遇到次数
        if (countMap[endDateDirect].length == 0) {
            countMap[endDateDirect].push(期权买卖List[i][2]);
            keepFlags[i] = true;//第一次肯定要
        }
        else if (countMap[endDateDirect].length == 1 && (期权买卖List[i][2].includes("位") || 期权买卖List[i][2].includes("★"))) {
            countMap[endDateDirect].push(期权买卖List[i][2]);
            keepFlags[i] = true;//第2次后只要 位 和 ★
        }
        else if (countMap[endDateDirect].length < N && 期权买卖List[i][2].includes("★")) {
            countMap[endDateDirect].push(期权买卖List[i][2]);
            keepFlags[i] = true;//第3到N次后只要★ 最多N次
        }
    }

    // 从前往后收集保留的子数组，以保持原始顺序
    //const result = [];
    for (let i = 0; i < 期权买卖List.length; i++) {
        if (keepFlags[i]) {
            期权买卖List[i].ok2 = true
            //result.push(期权买卖List[i]);
        } else {
            期权买卖List[i].ok2 = false
            //result.push(期权买卖List[i]);
        }
    }
    return 期权买卖List;
}

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


//////////////////////////////////////////////////////////////////////////////////////////////////////

String.prototype.leftAppend = function () {
    var target = this;
    return "           " + target;
};
let randomProfileArr = [];
function gerRandomProfile(priceProfile, mean = 0, stdDev = 0.3) {
    if (priceProfile > 1) return 1
    if (priceProfile < 0) return -1
    return priceProfile

    let result;
    do {
        // Box-Muller变换生成标准正态分布
        const u1 = Math.random();
        const u2 = Math.random();

        // 避免除零错误
        if (u1 === 0) continue;

        // 生成标准正态分布随机数
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        // 应用均值和标准差
        result = mean + z0 * stdDev;

        // 循环直到值落在[-1, 1]区间内
    } while (result < -1 || result > 1);
    randomProfileArr.push(result);
    return result;


    return +(Math.random() * 2 - 1).toFixed(4) //[-1,1) 随机 -1到2-1之间
}
function isNumber(value) {
    return typeof value === "number" && !isNaN(value);
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
if (devTestEnv) liveServerUrl = "http://127.0.0.1:5500/tempData/"
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


function need入金groupByYear(input) {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
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
    let 百分比 = 0.1;

    if (asset.现金 * 百分比 > 单次最大投资) buyCash = 单次最大投资;
    else if (asset.现金 * 百分比 >= 单次最小投资 && asset.现金 * 百分比 <= 单次最大投资) buyCash = roundToHighestPlace(asset.现金 * 百分比);
    else buyCash = 单次最小投资;

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
function check沽提前卖出(curDate, asset期权, trigBuy) {

    let 沪深300技术 = {};
    沪深300技术.dayDatas = 沪深300;
    沪深300技术 = calDayWeekMonthKline(沪深300技术, curDate);

    let pre1Week = 沪深300技术.currentWeekList.at(-2);
    let curWeek = 沪深300技术.currentWeekList.at(-1);

    let pre3Day = 沪深300技术.currentDayList.at(-4);
    let pre2Day = 沪深300技术.currentDayList.at(-3);
    let pre1Day = 沪深300技术.currentDayList.at(-2);
    let curDay = 沪深300技术.currentDayList.at(-1);


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

    let res = ""
    function 区间反向() {
        // return false //todo!!!!
        // let pmiValue
        // if (cn_pmi_平均.at(-1)[0].substring(0, 7) == curDate.substring(0, 7)) pmiValue = cn_pmi_平均.at(-1)
        // else pmiValue = cn_pmi_平均.find(e => e[0].substring(0, 7) == getPreMonth(curDate).substring(0, 7))
        // pmiValue[1] <= -9.5
        let curDate日期区间 = getCurDate区间类型(curDate)
        if (
            curDate日期区间 == "上升日期区间" &&
            (
                (curDay.close < curDay.lows && curWeek.close < curWeek.mas && curWeek.J < 20 && pre1Week.close > pre1Week.mas) ||
                (ocHighest(curDay) < curDay.lows && curDay.J < 0 && curWeek.low < curWeek.mas && curtPercent(curWeek) < 0 && curWeek.J < 0 && curWeek.bar < 0) //2025-11-24
            ) &&
            !(
                KDJ死叉(沪深300技术.currentDayList) &&
                MACD死叉attr(沪深300技术.currentDayList)
            ) &&
            !(
                KDJ死叉(沪深300技术.currentDayList) &&
                MACD死叉attr(沪深300技术.currentDayList)
            )
        ) return true
    }
    if (区间反向()) res += "P1"


    if (
        绿绿(沪深300技术.currentDayList) &&
        ocLowest(curDay) < curDay.lows &&
        (
            (curDay.bias.bias3 < -8 && pre1Day.bias.bias3 >= curDay.bias.bias3) ||
            (pre1Day.bias.bias3 - curDay.bias.bias3 > 4)
        )
    ) res += 'P2'   //` ${curDay.date}绿绿` //2022-03-18 极低


    if (
        asset期权[buyPriceIndex] / extractFirstNumber(asset期权[3]) > 0.05 &&
        curtPercent(curDay) < 0 &&
        (curDay.J < 0 || 绿空绿(沪深300技术.currentDayList)) &&
        (curDay.bias.bias1 < 0 || curDay.bias.bias2 < 0) &&
        pre1Day.mas < curDay.mas &&
        沪深300技术.currentWeekList.at(-2).D < 沪深300技术.currentWeekList.at(-1).D &&
        沪深300技术.currentMonthList.at(-2).D < 沪深300技术.currentMonthList.at(-1).D
    ) res += 'P3'   //` ${curDay.date}波动率太贵绿` //2024-11-15 低位太贵


    if (
        绿空绿红(沪深300技术.currentDayList) &&
        (pre1Day.high < pre1Day.lows || curDay.high < curDay.lows) &&
        curDay.bias.bias3 < -3 &&
        curDay.J < 10 && pre1Day.J < curDay.J
    ) res += 'P4'   //` ${curDay.date}绿空绿红` //2021-08-20  低位可能转向

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
    ) res += 'P5'   //` ${curDay.date}绿空绿7` //2022-01-21  2022-02-18  低位快到期

    return res;
}
function check提前卖出(curDate, asset期权, trigBuy) {
    let res = ""

    /////
    let profileN3 = afterDayProfileW3(asset期权[0], [], 沪深300)
    if (
        profileN3?.nextSecondDelivery周三 &&
        +profileN3?.nextSecondDelivery周三?.close.split("->")[0] > 20
    ) {
        asset期权.N周三 = profileN3?.nextSecondDelivery周三?.close.split("->")[1].split(",")[0]
        if (profileN3?.nextSecondDelivery周三?.close.split("->")[1].split(",")[0] == curDate)
            res += "2Etf周三"
    }
    else if (
        profileN3?.nextThirdDelivery周三 &&
        +profileN3?.nextThirdDelivery周三?.close.split("->")[0] > 20
    ) {
        asset期权.N周三 = profileN3?.nextThirdDelivery周三?.close.split("->")[1].split(",")[0]
        if (profileN3?.nextThirdDelivery周三?.close.split("->")[1].split(",")[0] == curDate)
            res += "3Etf周三"
    }
    /////


    if (
        trigBuy
        && (
            ((trigBuy[2].includes("高") || trigBuy[2].includes("↓")) && (asset期权[2].includes("低") || asset期权[2].includes("↑"))) ||
            ((trigBuy[2].includes("低") || trigBuy[2].includes("↑")) && (asset期权[2].includes("高") || asset期权[2].includes("↓")))
        ) && dateToStamp(trigBuy[0]) < dateToStamp(asset期权[1])
    ) {
        res += "A" //反向
    }

    if (asset期权[3].includes("沽")) {
        res += check沽提前卖出(curDate, asset期权, trigBuy)
    }

    if (res != "") return res
    return false
}