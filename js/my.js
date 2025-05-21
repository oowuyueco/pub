//html
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return false;
}

function checkOrTryHttp(dataName, site, fuc,) {
    var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement
    var JS1 = document.createElement("script")
    if (site == "sinaF") {
        JS1.src = `./cn/新浪期货行情/${dataName}.js`
    }
    if (site == "sina") {
        JS1.src = `./cn/新浪行情/${dataName}.js`
    }
    if (site == "xueqiu") {
        JS1.src = `./cn/雪球行情/${dataName}.js`
        if (dataName.includes("标普") || dataName.includes("纳指") || dataName.includes("道琼斯"))
            JS1.src = `./us/雪球行情/${dataName}.js`
    }
    if (site == "ths") {
        JS1.src = `./cn/同花顺行情/${dataName}.js`
    }
    JS1.onload = function () { fuc() }
    JS1.onerror = function (e) { console.log(e) }
    head.insertBefore(JS1, head.firstChild);
}

//毫秒=>2008-08-09
function stampToDate(stamp) {
    let date1 = new Date(stamp);
    let y = date1.getFullYear(),
        m = date1.getMonth() + 1,
        d = date1.getDate();

    if (m < 10)
        m = '0' + m;
    if (d < 10)
        d = '0' + d;

    return y + '-' + m + '-' + d;
}

//2008-08-09=>毫秒
function dateToStamp(date) {
    return new Date(date).getTime()
}

//获取当前时间2008-08-09 12:10:10  preNDay前N天
function getDateTime(preNDay = 0) {
    //本机的日期时间
    let stamp = new Date().getTime() + preNDay * 24 * 60 * 60 * 1000;
    let localDate = new Date(stamp);
    let Y = localDate.getFullYear(),
        M = localDate.getMonth() + 1,
        D = localDate.getDate(),

        h = localDate.getHours(), // 获取当前小时数(0-23)
        m = localDate.getMinutes(), // 获取当前分钟数(0-59)
        s = localDate.getSeconds(); // 获取当前秒数(0-59)

    if (M < 10) M = '0' + M;
    if (D < 10) D = '0' + D;

    if (h < 10) h = '0' + h;
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;

    return Y + '-' + M + '-' + D + " " + h + ':' + m + ":" + s;
}

//获取当前指定时区的时间2008-08-09 12:10:10  preNDay前N天
function getDateTimeByZone(timezone = 8, preNDay = 0) {
    //指定时区的日期时间前N天默认北京

    //本地时间距离（GMT时间）毫秒数
    let nowDate = new Date().getTime() + preNDay * 24 * 60 * 60 * 1000
    // 本地时间和格林威治时间差，单位分钟
    let offset_GMT = new Date().getTimezoneOffset()
    //  反推到格林尼治时间
    let GMT = nowDate + offset_GMT * 60 * 1000
    //  获取指定时区时间
    let targetDate = new Date(GMT + timezone * 60 * 60 * 1000)

    let Y = targetDate.getFullYear(),
        M = targetDate.getMonth() + 1,
        D = targetDate.getDate(),

        h = targetDate.getHours(), // 获取当前小时数(0-23)
        m = targetDate.getMinutes(), // 获取当前分钟数(0-59)
        s = targetDate.getSeconds(); // 获取当前秒数(0-59)

    if (M < 10) M = '0' + M;
    if (D < 10) D = '0' + D;

    if (h < 10) h = '0' + h;
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;

    return Y + '-' + M + '-' + D + " " + h + ':' + m + ":" + s;
    //.substring(0,10) YMD
}

let currentDayYMD = stampToDate(new Date().getTime())
let currentDayYM = currentDayYMD.substring(0, 7)
let preDayYMD = stampToDate(new Date().getTime() - 24 * 60 * 60 * 1000)

//统一显示格式 DateTime [date,data]
function unifyDate(site, date, dataName = "") {
    if (false
        || dataName.includes("Day")
        || dataName.includes("日")
        || dataName.includes("Week")
        || (dataName.includes("周") && !dataName.includes("周期"))
    ) return unifyDayDate(site, date)

    if (dataName.includes("Quarter") || dataName.includes("季"))
        return unifyQuarterDate(site, date)

    return unifyMonthDate(site, date) //默认月
}

//month 统一显示格式 +统一日期28(1,28,monthLastDay)
function unifyMonthDate(site, date) {

    if (typeof date === 'number') date = stampToDate(date)

    let resultDate
    if (site == "macromicro") {//2023-05-01
        resultDate = date.substring(0, 7) + "-28"
    }
    if (site == "macroview") {//2023-11-28
        resultDate = date.substring(0, 7) + "-28"
    }
    if (site == "legulegu") {//stampToDate(毫秒)=>2008-08-09  or 200001 
        resultDate = date.includes("-") ? date.substring(0, 7) + "-28" : date.slice(0, 4) + "-" + date.slice(4, 6) + '-28';
    }

    if (site == "value500") {//2006年01月
        let month = date.split("年")[1].split("月")[0]
        if (month.length == 1) month = '0' + month
        resultDate = date.slice(0, 4) + "-" + month + '-28'
    }
    if (site == "woniu500") { //200801
        resultDate = date.slice(0, 4) + "-" + date.slice(4, 6) + '-28'
    }
    if (site == "fredDown") {//2019-09-01
        resultDate = date.substring(0, 7) + "-28"
    }

    if (resultDate.substring(0, 7) == currentDayYM) return preDayYMD //当月返回昨日或今日或不处理
    return resultDate
}

//day week 统一显示格式
function unifyDayDate(site, date) {
    if (typeof date === 'number') date = stampToDate(date)

    if (site == "macromicro") return date
    if (site == "macroview") return date
    if (site == "legulegu") return date
    if (site == "value500") {//2006年01月03日
        if (date.includes("日")) return date.slice(0, 4) + "-" + date.split("年")[1].split("月")[0] + "-" + date.substring(8, 10)
        if (date.includes("/")) return date.replaceAll('/', '-')
    }
    if (site == "woniu500") {//20080122
        return date.slice(0, 4) + "-" + date.slice(4, 6) + '-' + date.slice(6, 8);
    }
    if (site == "fredDown") return date
}

//Quarter 统一显示格式 +统一日期28(1,28,monthLastDay)
function unifyQuarterDate(site, date) {
    if (site == "fredDown") {
        //2023-01-01 2019-04-01  2023-07-01  2023-10-01
        //     03-28      06-28       09-28       12-28  
        let month = parseInt(date.substring(5, 7)) + 2
        month = month < 10 ? "0" + month : "" + month
        return date.substring(0, 4) + "-" + month + "-28"
    }
}


//获取日期dateStr 所在周的周weekDay 的日期
function getDateInWeekDay(dateStr, weekDay = 5) {
    let day = new Date(dateStr).getDay() || 7
    let date = new Date(dateStr)
    let restlDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + weekDay - day)
    return stampToDate(restlDate.getTime())
}

function findSameTime(array, time) {
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element[0] == time) return element
    }
    return null
}

function isSameWeek(d1, d2) {
    if (d1 == "" || d2 == "") return false
    d1 = new Date(d1)
    d2 = new Date(d2)
    const ONE_DAY = 1000 * 60 * 60 * 24
    const difftime = Math.abs(d2 - d1)
    let bigDay = (d1 > d2 ? d1.getDay() : d2.getDay()) || 7
    let smallDay = (d1 < d2 ? d1.getDay() : d2.getDay()) || 7
    return !(difftime >= ONE_DAY * 7 || bigDay < smallDay || (bigDay === smallDay && difftime > ONE_DAY))
}

function isSameMonth(date1, date2) {
    if (!date2) date2 = new Date()
    else date2 = new Date(date2)

    var date2_y = date2.getFullYear(),
        date2_m = date2.getMonth() + 1,
        date2_d = date2.getDate();
    if (date2_m < 10)
        date2_m = '0' + date2_m;
    if (date2_d < 10)
        date2_d = '0' + date2_d;

    if (date1.substring(0, 7) == (date2_y + '-' + date2_m)) { //当月不处理
        return true
    } else {
        return false
    }
}

function isMonthLastDay(ymd) {
    //"2000-01-09" 传入年份和月份 获取该年对应月份的天数 第三个参数是0，第二个参数是人类意识中的月份
    let monthDays = new Date(ymd.substring(0, 4), ymd.substring(5, 7), 0).getDate() //月的天数
    return monthDays == parseInt(ymd.substring(8, 10))
}

function pre5Month(ym) {
    //"2000-09"
    let result = []
    let year = parseInt(ym.substring(0, 4))
    let month = parseInt(ym.substring(5, 7))
    if (month >= 5) {
        for (var i = 4; i >= 0; i--) {
            let m = (month - i) >= 10 ? "" + (month - i) : "0" + (month - i)
            result.push("" + year + "-" + m)
        }
    } else {
        // 11 12   1 2 3
        let preYCount = 5 - month
        for (var i = preYCount; i > 0; i--) {
            let m = (13 - i) >= 10 ? "" + (13 - i) : "0" + (13 - i)
            result.push("" + (year - 1) + "-" + m)
        }
        for (var i = 1; i <= month; i++) {
            let m = i >= 10 ? "" + i : "0" + i
            result.push("" + (year) + "-" + m)
        }

    }
    return result
}


/**
    * 获取上一个月
    *
    * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
*/
function getPreMonth(date) {
    var arr = date.split('-');
    var year = arr[0]; //获取当前日期的年份
    var month = arr[1]; //获取当前日期的月份
    var day = arr[2]; //获取当前日期的日
    var days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中月的天数
    var year2 = year;
    var month2 = parseInt(month) - 1;
    if (month2 == 0) {
        year2 = parseInt(year2) - 1;
        month2 = 12;
    }
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    }
    if (month2 < 10) {
        month2 = '0' + month2;
    }
    var t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
}

/**
 * 获取下一个月
 *
 * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
 */
function getNextMonth(date) {
    var arr = date.split('-');
    var year = arr[0]; //获取当前日期的年份
    var month = arr[1]; //获取当前日期的月份
    var day = arr[2]; //获取当前日期的日
    var days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中的月的天数
    var year2 = year;
    var month2 = parseInt(month) + 1;
    if (month2 == 13) {
        year2 = parseInt(year2) + 1;
        month2 = 1;
    }
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    }
    if (month2 < 10) {
        month2 = '0' + month2;
    }

    var t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
}

function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(true), ms))
}

//格式数据
//DateTime [date, o, h, l, c]
function xueqiuFormatDate(stamp, period = "month") {
    var date = new Date(stamp);
    var y = date.getFullYear(),
        m = date.getMonth() + 1,
        d = date.getDate();
    if (m < 10)
        m = '0' + m;
    if (d < 10)
        d = '0' + d;

    if (period == "month") {
        var current_date = new Date();
        var current_y = current_date.getFullYear(),
            current_m = current_date.getMonth() + 1,
            current_d = current_date.getDate();
        if (current_m < 10)
            current_m = '0' + current_m;
        if (current_d < 10)
            current_d = '0' + current_d;

        if ((y + '-' + m) == (current_y + '-' + current_m)) { //当月不处理
            var t = y + '-' + m + '-' + d;
        } else {
            var t = y + '-' + m + '-28';
        }
    }

    if (period == "day") {
        var t = y + '-' + m + '-' + d;
    }


    return t;
}

Array.prototype.akData2Obj = function (period = "day") {
    let dataList = this
    dataList = dataList.map((data, index) => {
        if (data.日期 || data.开盘) {
            return {
                "date": data.日期.substring(0, 10),
                "open": data.开盘,
                "high": data.最高,
                "low": data.最低,
                "close": data.收盘,
                "volume": data.成交量,
                "hsl": data?.换手率,
                "zgs": data.成交量 / data?.换手率,
                "zf": data?.振幅,
                "percent": data?.涨跌幅 ?? PtPPercent(dataList[index - 1], data),
                "timestamp": "",
            }
        }

        data.date = data.date.substring(0, 10)
        data.timestamp = ""//未用到
        data.percent = PtPPercent(dataList[index - 1], data)
        return data
    })
    return dataList
}

Array.prototype.xueqiuData2Obj = function (period = "day") {
    let dataList = this
    if (dataList[1].close) return dataList //兼容
    dataList = dataList.map((data, index) => {
        return {
            date: xueqiuFormatDate(data[0], period),
            timestamp: data[0],
            open: data[2],
            high: data[3],
            low: data[4],
            close: data[5],
            percent: data[7],
            volume: Math.ceil(+data[1]),
            hsl: data[8], //turnoverrate
            zgs: data[1] / data[8]  //换手率hsl = 成交量volume / 总股数zgs × 100%
        }
    })
    return dataList
}

Array.prototype.kLineObjYoY = function (period = "day") {
    let dataList = this
    dataList = dataList.map((ele, index, dataList) => {

        let preItem
        if (period == "month") {
            preItem = dataList.find(element => {
                let preYearMonth = '' + (parseInt(ele.date.slice(0, 4)) - 1) + "-" + ele.date.substring(5, 7)
                return preYearMonth == '' + parseInt(element.date.slice(0, 4)) + "-" + element.date.substring(5, 7)
            })
        }

        if (period == "week" || period == "day") {
            let currentDayInt = parseInt(ele[0].substring(8, 10))
            let preYearMonth = '' + (parseInt(ele[0].substring(0, 4)) - 1) + ele[0].substring(4, 7)
            let n = 3
            while (-5 < n) { //向前查找
                let dayInt = currentDayInt + n
                let dayStr = dayInt >= 10 ? '' + dayInt : "0" + dayInt
                let preYearMonthDay = '' + preYearMonth + "-" + dayStr
                preItem = dataList.find(element => {
                    return element[0] == preYearMonthDay
                })
                if (preItem) break
                n--
            }
        }

        if (preItem) {
            let openYoY = (ele.open - preItem.open) / preItem.open
            let closeYoY = (ele.close - preItem.close) / preItem.close
            let highYoY = (ele.high - preItem.high) / preItem.high
            let lowYoY = (ele.low - preItem.low) / preItem.low
            ele.openYoY = openYoY
            ele.closeYoY = closeYoY
            ele.highYoY = highYoY
            ele.lowYoY = lowYoY
        } else {
            ele.openYoY = ""
            ele.closeYoY = ""
            ele.highYoY = ""
            ele.lowYoY = ""
        }
        return ele
    })
    return dataList
}

Array.prototype.chartDataMaN = function (MA, dataIndex = 1) {
    let dataList = this
    dataList = dataList.map((item, index) => {
        const copyItem = [...item];
        if (index < MA) {
            return copyItem
        }

        let sum = 0
        for (let i = index - (MA - 1); i <= index; i++) {
            sum += parseFloat(dataList[i][dataIndex])
        }
        let avg = (sum / MA).toFixed(2)

        copyItem[1] = avg
        return copyItem
    })
    return dataList
}
Array.prototype.chartDataDayFilterToPeriod = function (toPeriod = "month") {
    let dataList = this

    if (toPeriod == "week") {
        dataList = dataList.filter((ele, index, datasArr) => {
            var d = new Date(ele[0])
            var n = d.getDay()
            if (n == 5) return true //周5
            if (datasArr.length - 1 == index) return true  //保留最后一天
        })
    }
    else if (toPeriod == "month") {
        dataList = dataList.filter((ele, index, datasArr) => {
            currentMonth = ele[0].substring(5, 7)//月最后一天
            if (index < datasArr.length - 1) {
                let nextMonth = datasArr[index + 1][0].substring(5, 7)
                return currentMonth != nextMonth
            } else {
                return true  //保留最后一天
            }
        })
    }

    return dataList
}
Array.prototype.chartDataYoY = function (dataPeriod = "month") {
    let dataList = this

    if (dataPeriod == "day" || dataPeriod == "week")
        dataList = dataList.map((ele, index, datasArr) => { // yoY 同比
            let preYearMonthDay = '' + (parseInt(ele[0].substring(0, 4)) - 1) + ele[0].substring(4, 10)
            let preItem = datasArr.find(element => {
                return element[0] == preYearMonthDay
            })
            if (!preItem) { //去原始数据找
                let currentDayInt = parseInt(ele[0].substring(8, 10))
                let preYearMonth = '' + (parseInt(ele[0].substring(0, 4)) - 1) + ele[0].substring(4, 7)
                let n = 3
                while (-5 < n) { //向前查找
                    let dayInt = currentDayInt + n
                    let dayStr = dayInt >= 10 ? '' + dayInt : "0" + dayInt
                    let preYearMonthDay = '' + preYearMonth + "-" + dayStr
                    preItem = datasArr.find(element => {
                        return element[0] == preYearMonthDay
                    })
                    if (preItem) break
                    n--
                }
            }
            let yoY = ""
            if (preItem) {
                preItem[1] = parseFloat(preItem[1])
                ele[1] = parseFloat(ele[1])
                yoY = preItem[1] ? ((ele[1] - preItem[1]) / preItem[1]) * 100 : ""
            }
            return [ele[0], yoY]
        })

    if (dataPeriod == "month")
        dataList = dataList.map((ele, index, datasArr) => { // yoY 同比
            let preYearMonth = '' + (parseInt(ele[0].substring(0, 4)) - 1) + ele[0].substring(4, 7)
            //console.log(preYearMonth)
            let preItem = datasArr.find(element => {
                return element[0].substring(0, 7) == preYearMonth
            })
            let yoY = ""
            if (preItem) {
                preItem[1] = parseFloat(preItem[1])
                ele[1] = parseFloat(ele[1])
                yoY = preItem[1] ? ((ele[1] - preItem[1]) / preItem[1]) * 100 : ""
            }
            return [ele[0], yoY]
        })


    return dataList
}

//标准kline to echartKline
Array.prototype.ohlc2oclh = function () {
    let dataList = this
    if (dataList.length == 0) return dataList

    if (dataList[0]?.open === undefined) {
        dataList = dataList.map((item, index) => {
            let tmp = []
            tmp[0] = item[0] //date
            tmp[1] = item[1] //open
            tmp[2] = item[4] //close
            tmp[3] = item[3] //low
            tmp[4] = item[2] //high
            for (let ii = 5; ii < item.length; ii++) {
                tmp[ii] = item[ii]
            }
            return tmp
        })
    }
    else {

        let keys = Object.keys(dataList[0])
        dataList = dataList.map((item, index) => {
            let tmp = []
            tmp[0] = item.date
            tmp[1] = item.open ? item.open : ""
            tmp[2] = item.close ? item.close : ""
            tmp[3] = item.low ? item.low : ""
            tmp[4] = item.high ? item.high : ""
            for (let ii = 5; ii < keys.length; ii++) {
                tmp[ii] = item[keys[ii]]
            }
            return tmp
        })
    }

    return dataList
}


//--------------------------quotechart2022/src/modules/tools/indicator/cyq.ts----------
//--------------------------webpack://quotechart2022/src/modules/kline/calculate.ts----
//--------------------------webpack://quotechart2022/src/modules/kline/cyq.ts----------
function myCYQCalculator(allklinedata, allindex) {

    //随着视图放大缩小k线数量变化！！！！！ 这里取东财网页默认的
    if (allklinedata.length >= 210) {
        var klinedata = allklinedata.slice(allindex - 209, allindex + 1)
        var index = 209
    } else {
        var klinedata = allklinedata
        var index = allindex
    }

    //

    var maxprice = 0;
    var minprice = 0;

    var factor = 150;
    var start = 0;

    /**
     * K图数据[time,open,close,high,low,volume,amount,amplitude,turnoverRate]
     */
    var kdata = klinedata.slice(start, Math.max(1, index + 1));
    if (kdata.length === 0) throw "invaild index";
    for (var i = 0; i < kdata.length; i++) {
        var elements = kdata[i];
        maxprice = !maxprice ? elements.high : Math.max(maxprice, elements.high);
        minprice = !minprice ? elements.low : Math.min(minprice, elements.low);
    }

    // 精度不小于0.01 产品逻辑
    var accuracy = Math.max(0.01, (maxprice - minprice) / (factor - 1));
    /**
     * 值域
     * @type {Array.<number>}
     */
    var yrange = [];
    for (var i = 0; i < factor; i++) {
        yrange.push((minprice + accuracy * i).toFixed(2) / 1);
    }
    /**
     * 横轴数据
     */
    var xdata = createNumberArray(factor);

    for (var i = 0; i < kdata.length; i++) {
        var eles = kdata[i];
        var open = eles.open,
            close = eles.close,
            high = eles.high,
            low = eles.low,
            avg = (open + close + high + low) / 4,
            turnoverRate = Math.min(1, eles.hsl / 100 || 0);
        var H = Math.floor((high - minprice) / accuracy),
            L = Math.ceil((low - minprice) / accuracy),
            // G点坐标, 一字板时, X为进度因子
            GPoint = [
                high == low ? factor - 1 : 2 / (high - low),
                Math.floor((avg - minprice) / accuracy),
            ];
        // 衰减
        for (var n = 0; n < xdata.length; n++) {
            xdata[n] *= 1 - turnoverRate;
        }
        if (high == low) {
            // 一字板时，画矩形面积是三角形的2倍
            xdata[GPoint[1]] += (GPoint[0] * turnoverRate) / 2;
        } else {
            for (var j = L; j <= H; j++) {
                var curprice = minprice + accuracy * j;
                if (curprice <= avg) {
                    // 上半三角叠加分布分布
                    if (Math.abs(avg - low) < 1e-8) {
                        xdata[j] += GPoint[0] * turnoverRate;
                    } else {
                        xdata[j] +=
                            ((curprice - low) / (avg - low)) * GPoint[0] * turnoverRate;
                    }
                } else {
                    // 下半三角叠加分布分布
                    if (Math.abs(high - avg) < 1e-8) {
                        xdata[j] += GPoint[0] * turnoverRate;
                    } else {
                        xdata[j] +=
                            ((high - curprice) / (high - avg)) * GPoint[0] * turnoverRate;
                    }
                }
            }
        }
    }

    var currentprice = klinedata[index].close;
    var totalChips = 0;
    for (var i = 0; i < factor; i++) {
        var x = xdata[i].toPrecision(12) / 1;
        //if (x < 0) xdata[i] = 0;
        totalChips += x;
    }
    var result = new CYQData();
    result.x = xdata;
    result.y = yrange;
    result.benefitPart = result.getBenefitPart(currentprice);
    result.avgCost = getCostByChip(totalChips * 0.5).toFixed(2);
    result.percentChips = {
        90: result.computePercentChips(0.9),
        70: result.computePercentChips(0.7),
    };
    return result;

    /**
     * 获取指定筹码处的成本
     * @param {number} chip 堆叠筹码
     */
    function getCostByChip(chip) {
        var result = 0,
            sum = 0;
        for (var i = 0; i < factor; i++) {
            var x = xdata[i].toPrecision(12) / 1;
            if (sum + x > chip) {
                result = minprice + i * accuracy;
                break;
            }
            sum += x;
        }
        return result;
    }

    /**
     * 筹码分布数据
     */
    function CYQData() {
        /**
         * 筹码堆叠
         * @type {Array.<number>}
         */
        this.x = arguments[0];
        /**
         * 价格分布
         * @type {Array.<number>}
         */
        this.y = arguments[1];
        /**
         * 获利比例
         * @type {number}
         */
        this.benefitPart = arguments[2];
        /**
         * 平均成本
         * @type {number}
         */
        this.avgCost = arguments[3];
        /**
         * 百分比筹码
         * @type {{Object.<string, {{priceRange: number[], concentration: number}}>}}
         */
        this.percentChips = arguments[4];
        /**
         * 计算指定百分比的筹码
         * @param {number} percent 百分比大于0，小于1
         */
        this.computePercentChips = function (percent) {
            if (percent > 1 || percent < 0) throw 'argument "percent" out of range';
            var ps = [(1 - percent) / 2, (1 + percent) / 2];
            var pr = [
                getCostByChip(totalChips * ps[0]),
                getCostByChip(totalChips * ps[1]),
            ];
            return {
                priceRange: [pr[0].toFixed(2), pr[1].toFixed(2)],
                concentration:
                    pr[0] + pr[1] === 0 ? 0 : (pr[1] - pr[0]) / (pr[0] + pr[1]),
            };
        };
        /**
         * 获取指定价格的获利比例
         * @param {number} price 价格
         */
        this.getBenefitPart = function (price) {
            var below = 0;
            for (var i = 0; i < factor; i++) {
                var x = xdata[i].toPrecision(12) / 1;
                if (price >= minprice + i * accuracy) {
                    below += x;
                }
            }
            return totalChips == 0 ? 0 : below / totalChips;
        };
    }
}
function createNumberArray(count) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array.push(0);
    }
    return array;
}
Array.prototype.mapCYQCalculator = function () {
    let dataList = this;
    dataList = dataList.map((data, index) => {
        let CYQ = myCYQCalculator(dataList, index);
        data.CYQ = [
            +(CYQ.benefitPart * 100).toFixed(2),
            +(CYQ.percentChips["70"].concentration * 100).toFixed(2),
            +(CYQ.percentChips["90"].concentration * 100).toFixed(2),
            +CYQ.avgCost,
        ]
        return data;
    });
    return dataList;
}
function getDWMbenfPart(currentDayList, currentWeekList, currentMonthList) {
    let dayCYQ = myCYQCalculator(currentDayList, currentDayList.length - 1)
    let weekCYQ = myCYQCalculator(currentWeekList, currentWeekList.length - 1)
    let monthCYQ = myCYQCalculator(currentMonthList, currentMonthList.length - 1)

    function reFormat(CYQ) {
        return [
            +(CYQ.benefitPart * 100).toFixed(2),
            +(CYQ.percentChips["70"].concentration * 100).toFixed(2),
            +(CYQ.percentChips["90"].concentration * 100).toFixed(2),
            +CYQ.avgCost,
        ]
    }

    return {
        日: reFormat(dayCYQ),
        周: reFormat(weekCYQ),
        月: reFormat(monthCYQ)
    }
}


//技术指标https://github.com/kimboqi/stock-indicators
function dayToPeriod(dayIndexList, period) {
    let open, high, low, close, volume
    let preDayIndexDate = ""
    let periodIndexList = []
    let dayIndexListLastIndex = dayIndexList.length - 1

    dayIndexList.forEach((dayIndex, i, dayIndexList) => {

        //统一数据
        currentDate = dayIndex.date
        currentOpen = parseFloat(dayIndex.open)
        currentHigh = parseFloat(dayIndex.high)
        currentLow = parseFloat(dayIndex.low)
        currentClose = parseFloat(dayIndex.close)
        currentVolume = parseFloat(dayIndex.volume)


        let samePeriod
        if (period == "week")
            samePeriod = isSameWeek(preDayIndexDate, currentDate)
        if (period == "month")
            samePeriod = preDayIndexDate.substring(0, 7) == currentDate.substring(0, 7) ? true : false

        if (!samePeriod) {
            let prPeriodIndex = {
                "date": preDayIndexDate,
                "timestamp": new Date(preDayIndexDate).getTime(),
                "open": open,
                "high": high,
                "low": low,
                "close": close,
                "volume": volume,
                "hsl": volume / dayIndex.zgs, //turnoverrate
                "zgs": dayIndex.zgs,  //换手率hsl = 成交量volume / 总股数zgs × 100%
                "period": period
            }
            periodIndexList.push(prPeriodIndex)

            open = currentOpen
            high = currentHigh
            low = currentLow
            close = currentClose
            volume = currentVolume
            preDayIndexDate = currentDate
        }

        if (samePeriod) {
            high = currentHigh > high ? currentHigh : high
            low = currentLow < low ? currentLow : low
            close = currentClose
            volume = volume + currentVolume
            preDayIndexDate = currentDate
        }
        if (dayIndexListLastIndex == i) {
            let currentPeriodIndex = {
                "date": currentDate,
                "timestamp": new Date(currentDate).getTime(),
                "open": open,
                "high": high,
                "low": low,
                "close": close,
                "volume": volume,
                "hsl": volume / dayIndex.zgs, //turnoverrate
                "zgs": dayIndex.zgs,  //换手率hsl = 成交量volume / 总股数zgs × 100%
                "period": period
            }
            periodIndexList.push(currentPeriodIndex)
        }
    })

    periodIndexList.shift()
    return periodIndexList
}

var ema = function (lastEma, closePrice, units) {
    return (lastEma * (units - 1) + closePrice * 2) / (units + 1);
}
var dea = function (lastDea, curDiff) {
    return (lastDea * 8 + curDiff * 2) / 10;
}
Array.prototype.calMacd = function () {

    var candleList = this;

    var ema12 = [],
        ema26 = [],
        diffs = [],
        deas = [],
        bars = [];
    for (var i = 0; i < candleList.length; i++) {
        var c = candleList[i].close;
        if (i == 0) {
            ema12.push(c);
            ema26.push(c);
            deas.push(0);
        } else {
            ema12.push(ema(ema12[i - 1], c, 12));
            ema26.push(ema(ema26[i - 1], c, 26));
        }
        diffs.push(ema12[i] - ema26[i]);
        if (i != 0) {
            deas.push(dea(deas[i - 1], diffs[i]));
        }
        bars.push((diffs[i] - deas[i]) * 2);
    }

    candleList = candleList.map((ele, index) => {
        ele.diff = diffs[index]
        ele.dea = deas[index]
        ele.bar = bars[index]
        return ele
    })
    return candleList

}

Array.prototype.calKdj = function () {
    var getMaxHighAndMinLow = function (ticks) {
        var maxHigh = ticks[0].high,
            minLow = ticks[0].low;
        for (var i = 0; i < ticks.length; i++) {
            var t = ticks[i],
                high = t.high,
                low = t.low;
            if (high > maxHigh) {
                maxHigh = high;
            }
            if (low < minLow) {
                minLow = low;
            }
        }
        return [maxHigh, minLow];
    };
    let candleList = this
    var nineDaysTicks = [],
        days = 9,
        rsvs = [];
    var lastK, lastD, curK, curD;
    var maxAndMin, max, min;
    for (var i = 0; i < candleList.length; i++) {

        if (candleList[i].K instanceof Number) continue

        var t = candleList[i],
            close = t.close;
        nineDaysTicks.push(t);
        maxAndMin = getMaxHighAndMinLow(nineDaysTicks);
        max = maxAndMin[0];
        min = maxAndMin[1];
        if (max == min) {
            rsvs.push(0);
        } else {
            rsvs.push((close - min) / (max - min) * 100);
        }
        if (nineDaysTicks.length == days) {
            nineDaysTicks.shift();
        }
        if (i == 0) {
            lastK = lastD = rsvs[i];
        }

        curK = 2 / 3 * lastK + 1 / 3 * rsvs[i];
        lastK = curK;

        curD = 2 / 3 * lastD + 1 / 3 * curK;
        lastD = curD;

        curJ = 3 * curK - 2 * curD;

        candleList[i].K = curK
        candleList[i].D = curD
        candleList[i].J = curJ
    }

    return candleList;
}

Array.prototype.calBoll = function () {
    let candleList = this
    var maDays = 20, tickBegin = maDays - 1, maSum = 0, p = 0;
    for (var i = 0; i < candleList.length; i++) {

        if (candleList[i].ups instanceof Number) continue

        var c = candleList[i].close, ma, md, bstart, mdSum;
        maSum += c;

        if (i >= tickBegin) {
            maSum = maSum - p;
            ma = maSum / maDays;

            candleList[i].mas = ma;

            bstart = i - tickBegin;
            p = candleList[bstart].close;
            mdSum = candleList.slice(bstart, bstart + maDays).map((item) => { return item.close }).reduce(function (a, b) { return a + Math.pow(b - ma, 2); }, 0);
            md = Math.sqrt(mdSum / maDays);

            candleList[i].ups = ma + 2 * md;
            candleList[i].lows = ma - 2 * md;
        }
        else {
            candleList[i].ups = null
            candleList[i].mas = null
            candleList[i].lows = null
        }
    }
    return candleList;
}


Array.prototype.maN = function (MA, Attribute) {

    let candleList = this

    for (let index = 0; index < candleList.length; index++) {
        let item = candleList[index]
        if (index < MA) continue
        if (item[`ma${MA}`] instanceof Number) continue

        let sum = 0
        for (let i = index - (MA - 1); i <= index; i++) {
            sum += parseFloat(candleList[i][Attribute])
        }
        let avg = +(sum / MA).toFixed(2)

        candleList[index][`ma${MA}`] = avg
    }

    return candleList
}

Array.prototype.maN_oldWrong = function (MA, Attribute) {
    let dataList = this
    dataList = dataList.map((item, index) => {
        if (index < MA) return item
        if (item[`ma${MA}`] instanceof Number) return item

        let copyItem = Object.assign({}, item)
        let sum = 0
        for (let i = index - MA; i < index; i++) {
            sum += parseFloat(dataList[i][Attribute])
        }
        let avg = (sum / MA).toFixed(2)

        copyItem[`ma${MA}`] = avg
        return copyItem
    })
    return dataList
}

//当期涨跌幅 阳线阴线
function getDayPercent(dayItem) {
    return parseFloat(((dayItem.close - dayItem.open) / dayItem.open * 100).toFixed(2))
}

//当期涨跌幅 阳线阴线
function curtPercent(periodItem) {
    return parseFloat(((periodItem.close - periodItem.open) / periodItem.open * 100).toFixed(2))
}

//同比涨跌幅 昨收买-今收卖 / 昨收买   标准
function PtPPercent(prePeriodItem, currentPeriodItem) {

    if (!prePeriodItem) return 0
    if (prePeriodItem.收盘) prePeriodItem.close = prePeriodItem.收盘
    if (currentPeriodItem.收盘) currentPeriodItem.close = currentPeriodItem.收盘

    return parseFloat(((currentPeriodItem.close - prePeriodItem.close) / prePeriodItem.close * 100).toFixed(2))
}

//同比涨跌幅 今日开收最高-昨日开收最低 = 差 < 0  下空
function myPtPPercent(prePeriodItem, currentPeriodItem) {
    let preOCLow = prePeriodItem.close > prePeriodItem.open ? prePeriodItem.open : prePeriodItem.close
    let curtOCHigh = currentPeriodItem.close > currentPeriodItem.open ? currentPeriodItem.close : currentPeriodItem.open
    return curtOCHigh - preOCLow
}
//同比涨跌幅 今日开收最低-昨日开收最高 = 差 > 0  上空
function myPtPPercent2(prePeriodItem, currentPeriodItem) {
    let preOCHigh = prePeriodItem.close > prePeriodItem.open ? prePeriodItem.close : prePeriodItem.open
    let curtOCLow = currentPeriodItem.close > currentPeriodItem.open ? currentPeriodItem.open : currentPeriodItem.close
    return curtOCLow - preOCHigh
}

//当期振幅 开收/高低长度占比
function curtAmp(periodItem) {
    return +((periodItem.close - periodItem.open) / (periodItem.high - periodItem.low) * 100).toFixed(2)
}

//同比振幅 标准
function PtPAmp(prePeriodItem, currentPeriodItem) {
    return +((currentPeriodItem.high - currentPeriodItem.low) / prePeriodItem.close * 100).toFixed(2)
}


//js垫片扩展
if (!Array.prototype.toSpliced) {
    Array.prototype.toSpliced = function (start, deleteCount, ...items) {
        const copy = this.slice();
        copy.splice(start, deleteCount, ...items);
        return copy;
    };
}
//平均
function calAvgProf(filterArr, calIndex = 4) {
    let sum = 0
    let avg = 0
    for (let index = 0; index < filterArr.length; index++) {
        const element = filterArr[index];
        sum = sum + element[calIndex]
    }
    avg = sum / filterArr.length

    return parseFloat(avg.toFixed(2))
}

//最大 最小
function cal极值(filterArr, calIndex = 4) {

    let max = Number.NEGATIVE_INFINITY
    let min = Number.POSITIVE_INFINITY
    for (const element of filterArr) {
        if (element[calIndex] > max) max = element[calIndex]
        if (element[calIndex] < min) min = element[calIndex]
    }
    return {
        min: min,
        max: max
    }

}

//中位
function calMedianProf(filterArr, calIndex = 4) {

    let arr = filterArr.map((item) => {
        return item[calIndex]
    })
    const mid = Math.floor(arr.length / 2);
    const sortedArr = arr.sort((a, b) => a - b);

    if (arr.length % 2 === 0) {
        return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
    } else {
        return sortedArr[mid];
    }
}

//nodejs 导出
if (typeof module !== "undefined" && module.exports) {
    const fs = require('fs');
    const os = require('os');
    const nodemailer = require("nodemailer");


    const globalConfigStartDate组1 = "2024-01-01"
    const globalConfigStartDate组2 = "2024-01-01"
    const globalConfigOnlySendOnTrigBuySell = true ////单个策略 false每天发送,true只有触发买卖才发送邮件
    const devTestEnv = os.version().includes("Windows 10") ? true : false  //本机 ：gitaction  //Windows Server  Darwin Kernel Version

    function isSendMail(trigDate, sendMailDate = "五天之内") { //发送邮件周期！！！！！
        if (sendMailDate == "五天之内") {
            return dateToStamp(trigDate) >= dateToStamp(currentDayYMD) - 5 * 86400000
        }
        if (sendMailDate == "三天之内") {
            return dateToStamp(trigDate) >= dateToStamp(currentDayYMD) - 3 * 86400000
        }

        if (sendMailDate == "curWeek-email") {
            return getDateInWeekDay(trigDate, 7) == getDateInWeekDay(currentDayYMD, 7)
        }
        if (sendMailDate == "curYM-email") return trigDate.substring(0, 7) == currentDayYM
        if (sendMailDate == "curY-email") return trigDate.substring(0, 4) == currentDayYM.substring(0, 4)
        return false
    }

    async function mySendMail(subject, msgHtml = "", toMails = "851616860@qq.com") {
        if (devTestEnv) {
            return { response: `mailDevTest ${subject}` }
        }

        let promise = new Promise(async (resolve, reject) => {
            try {
                const transporter = nodemailer.createTransport({
                    pool: true,
                    host: "smtp.163.com",
                    port: 465,
                    secure: true, // Use `true` for port 465, `false` for all other ports
                    secureConnection: true,
                    auth: {
                        user: "oowuyue@163.com",
                        pass: "AEUORGVIOHTDGDGZ",  //qq8516 的：swvwmndqaedjbfii 
                    },
                });
                transporter.sendMail({
                    from: '"oowuyue" <oowuyue@163.com>', // sender address
                    to: toMails,//"3434384699@qq.com, 851616860@qq.com", // list of receivers
                    subject: subject, // Subject line
                    text: "", // plain text body
                    html: msgHtml == "" ? subject : msgHtml, // html body
                }, (err, info) => {
                    if (err) reject(err)
                    else resolve(info)
                });

            } catch (error) {
                reject(error)
            }
        });
        return promise
    }

    function writeDataToFile(dataName, dayDatas, folder = "./data/") {
        let promise = new Promise((resolve, reject) => {
            fs.writeFile(`${folder}${dataName}.js`, `var ${dataName} = ` + JSON.stringify(dayDatas, null, 2), 'utf8', (err) => {
                if (err) {
                    console.log(`${dataName}写入失败${err}`)
                    resolve(false)
                    return
                }
                console.log(`${dataName}写入成功`)
                resolve(true)
            })
        })
        return promise
    }
    function getDataFromFile(dataName, folder = "./data/", forceNew = true, format = "json") {
        let promise = new Promise((resolve, reject) => {
            fs.readFile(`${folder}${dataName}.js`, 'utf8', (err, data) => {
                if (err) {
                    console.log(dataName, "文件不存在")
                    resolve(false)
                    return
                }
                if (forceNew) {
                    if (devTestEnv) {//本机 当天的即可
                        let stat = fs.statSync(`${folder}${dataName}.js`)
                        //let modifyDate = stat.mtime.toISOString().substring(0, 10)
                        let modifyDate = stampToDate(parseInt(stat.mtimeMs)).substring(0, 10)
                        if (currentDayYMD !== modifyDate) {
                            console.log(dataName, "文件数据不是当天的")
                            resolve(false)
                            return
                        } else {
                            console.log("本机当天的即可")
                        }
                    } else {//githubAction 强制更新
                        resolve(false)
                        return
                    }
                }

                try {
                    console.log(`${dataName} getDataFromFile`)
                    if (format == "json") {
                        if (data.indexOf("=") >= 0)
                            data = data.substring(data.indexOf("=") + 1)
                        resolve(JSON.parse(data))//返回json
                    } else {
                        resolve(data)//返回str
                    }
                } catch (error) {
                    resolve(false)
                }

            })
        })
        return promise
    }

    function isFileExit(filePaht) {
        let promise = new Promise((resolve, reject) => {
            fs.access(filePaht, fs.constants.F_OK, (err) => {
                if (err) resolve(false)
                else resolve(true)
            })
        })
        return promise
    }

    async function check股票IsOk(股票Info, browser) {

        //["002812", "恩捷股份"]
        let 股票代码 = 股票Info[0]
        let 股票名称 = 股票Info[1]
        let result = [股票代码, 股票名称, "正常"]

        try {
            let startCode = 股票代码.substring(0, 1)
            let 雪球股票代码
            if (startCode == "6") 雪球股票代码 = "SH" + 股票代码
            if (startCode == "0" || startCode == "3") 雪球股票代码 = "SZ" + 股票代码
            if (startCode == "4" || startCode == "8") 雪球股票代码 = "BJ" + 股票代码

            let page = await browser.newPage()
            await page.goto('https://xueqiu.com/S/' + 雪球股票代码, { waitUntil: 'networkidle0' })

            await page.waitForSelector('div.modal.modal__login a.close')
            await page.$eval('div.modal.modal__login a.close', el => el.click())

            await wait(500)
            if (await page.$('div.modal.modal__login.modal__login__jianlian a.close.close_jianlian')) {
                await page.$eval('div.modal.modal__login.modal__login__jianlian a.close.close_jianlian', el => el.click())
            }

            await page.waitForSelector('div.stock-timeline-tabs a:nth-child(5)')
            await page.$eval('div.stock-timeline-tabs a:nth-child(5)', el => el.click())

            await wait(1000)
            await page.waitForSelector('div.status-list div.timeline__item__main div.content.content--description div')
            let 公告列表P1 = await page.$$eval('div.status-list article.timeline__item', divItems => {
                //Array.from(document.querySelectorAll(selector)) puppter自动转换了
                let 公告列表 = divItems.map(ele => { return ele.querySelector("div.content.content--description div").innerText + ele.querySelector("a.date-and-source").innerText })
                公告列表 = 公告列表.map((item) => { return item.replace("网页链接", "").replace("· 来自公告", "") })
                return 公告列表

            });

            await page.$eval('div.pagination a.pagination__next', el => el.click())
            await wait(1500)
            await page.waitForSelector('div.status-list div.timeline__item__main div.content.content--description div')
            let 公告列表P2 = await page.$$eval('div.status-list article.timeline__item', divItems => {
                let 公告列表 = divItems.map(ele => { return ele.querySelector("div.content.content--description div").innerText + ele.querySelector("a.date-and-source").innerText })
                公告列表 = 公告列表.map((item) => { return item.replace("网页链接", "").replace("· 来自公告", "") })
                return 公告列表

            });

            await page.$eval('div.pagination a.pagination__next', el => el.click())
            await wait(1500)
            await page.waitForSelector('div.status-list div.timeline__item__main div.content.content--description div')
            let 公告列表P3 = await page.$$eval('div.status-list article.timeline__item', divItems => {
                let 公告列表 = divItems.map(ele => { return ele.querySelector("div.content.content--description div").innerText + ele.querySelector("a.date-and-source").innerText })
                公告列表 = 公告列表.map((item) => { return item.replace("网页链接", "").replace("· 来自公告", "") })
                return 公告列表
            });
            公告列表 = [...公告列表P1, ...公告列表P2, ...公告列表P3]

            for (let index = 0; index < 公告列表.length; index++) {
                let val = 公告列表[index];
                if (
                    val.includes("ST")
                    || val.includes("st")
                    || val.includes("退市")
                    || val.includes("异常波动")
                    || val.includes("风险提示")
                    || val.includes("风险警示")
                    || val.includes("警示函")
                    || val.includes("关注函")
                    || val.includes("司法")
                    || val.includes("冻结")
                    || val.includes("违规")
                    || val.includes("诉讼")
                    || val.includes("立案")
                ) {
                    result = [股票代码, 股票名称, "危险公告!", val]
                    break
                }
            }
            console.log("check股票IsOk_result:", result)
            return result

        } catch (error) {
            result = [股票代码, 股票名称, "检测失效!"]
            console.log("check股票IsOk_error:", error)
            return result
        }
    }

    function getRandom登陆名(登陆名StrStr) {
        let 登陆名Arr = 登陆名StrStr.split(":")
        return 登陆名Arr[Math.floor(Math.random() * 登陆名Arr.length)]
    }


    //exports.sendMailDate = sendMailDate
    exports.globalConfigStartDate组1 = globalConfigStartDate组1
    exports.globalConfigStartDate组2 = globalConfigStartDate组2
    exports.globalConfigOnlySendOnTrigBuySell = globalConfigOnlySendOnTrigBuySell
    exports.devTestEnv = devTestEnv

    exports.stampToDate = stampToDate
    exports.dateToStamp = dateToStamp
    exports.getDateInWeekDay = getDateInWeekDay

    exports.unifyDate = unifyDate
    exports.findSameTime = findSameTime
    exports.isSameWeek = isSameWeek
    exports.isSameMonth = isSameMonth
    exports.isMonthLastDay = isMonthLastDay
    exports.pre5Month = pre5Month
    exports.wait = wait
    exports.xueqiuFormatDate = xueqiuFormatDate

    exports.dayToPeriod = dayToPeriod
    exports.getDayPercent = getDayPercent
    exports.curtPercent = curtPercent
    exports.PtPPercent = PtPPercent
    exports.myPtPPercent = myPtPPercent
    exports.myPtPPercent2 = myPtPPercent2
    exports.curtAmp = curtAmp
    exports.PtPAmp = PtPAmp

    exports.writeDataToFile = writeDataToFile
    exports.getDataFromFile = getDataFromFile
    exports.mySendMail = mySendMail
    exports.isSendMail = isSendMail
    exports.check股票IsOk = check股票IsOk
    exports.isFileExit = isFileExit

    exports.getDateTime = getDateTime
    exports.getDateTimeByZone = getDateTimeByZone
    exports.getRandom登陆名 = getRandom登陆名

    exports.myjscurrentDayYMD = currentDayYMD

    exports.myCYQCalculator = myCYQCalculator
    exports.getDWMbenfPart = getDWMbenfPart


} 
