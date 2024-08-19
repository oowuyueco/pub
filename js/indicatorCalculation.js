
//https://github.com/klinecharts/KLineChart/blob/v8.6.3/src/extension/technicalindicator/directionalmovement/movingAverageConvergenceDivergence.js

function calculationMacd(dataList, params = [12, 26, 9]) {
  let closeSum = 0
  let emaShort
  let emaLong
  let dif = 0
  let difSum = 0
  let dea = 0
  const maxPeriod = Math.max(params[0], params[1])
  return dataList.map((kLineData, i) => {
    const macd = {}
    const close = kLineData.close
    closeSum += close
    if (i >= params[0] - 1) {
      if (i > params[0] - 1) {
        emaShort = (2 * close + (params[0] - 1) * emaShort) / (params[0] + 1)
      } else {
        emaShort = closeSum / params[0]
      }
    }
    if (i >= params[1] - 1) {
      if (i > params[1] - 1) {
        emaLong = (2 * close + (params[1] - 1) * emaLong) / (params[1] + 1)
      } else {
        emaLong = closeSum / params[1]
      }
    }
    if (i >= maxPeriod - 1) {
      dif = emaShort - emaLong
      macd.dif = dif
      difSum += dif
      if (i >= maxPeriod + params[2] - 2) {
        if (i > maxPeriod + params[2] - 2) {
          dea = (dif * 2 + dea * (params[2] - 1)) / (params[2] + 1)
        } else {
          dea = difSum / params[2]
        }
        macd.macd = (dif - dea) * 2
        macd.dea = dea
      }
    }
    kLineData.macd = macd
    return kLineData
  })
}


function calculationCci(dataList, params = [20]) {
  const p = params[0] - 1
  let tpSum = 0
  const tpList = []
  return dataList.map((kLineData, i) => {
    const cci = {}
    const tp = (kLineData.high + kLineData.low + kLineData.close) / 3
    tpSum += tp
    tpList.push(tp)
    if (i >= p) {
      const maTp = tpSum / params[0]
      const sliceTpList = tpList.slice(i - p, i + 1)
      let sum = 0
      sliceTpList.forEach(tp => {
        sum += Math.abs(tp - maTp)
      })
      const md = sum / params[0]
      cci.cci = md !== 0 ? (tp - maTp) / md / 0.015 : 0
      const agoTp = (dataList[i - p].high + dataList[i - p].low + dataList[i - p].close) / 3
      tpSum -= agoTp
    }

    kLineData.cci = cci
    return kLineData
    return cci
  })
}

/**
 * 计算BIAS指标
 *
 * @param data
 * @return
 */
function calculationBias(data) {
  // 乖离率=[(当日收盘价-N日平均价)/N日平均价]*100%
  // 参数：6，12、24
  let bias1
  let bias2
  let bias3
  let closes1 = 0
  let closes2 = 0
  let closes3 = 0

  let totalTurnover = 0
  let totalVolume = 0

  for (let i = 0; i < data.length; i++) {
    let turnover = data[i].turnover
    totalVolume += data[i].volume
    totalTurnover += turnover
    if (totalVolume !== 0) {
      data[i].averagePrice = totalTurnover / totalVolume
    }

    let closePrice = data[i].close
    closes1 += closePrice
    closes2 += closePrice
    closes3 += closePrice

    if (i < 6) {
      let mean6 = closes1 / (i + 1)
      bias1 = ((closePrice - mean6) / mean6) * 100
    } else {
      closes1 -= data[i - 6].close
      let mean6 = closes1 / 6
      bias1 = ((closePrice - mean6) / mean6) * 100
    }

    if (i < 12) {
      let mean12 = closes2 / (i + 1)
      bias2 = ((closePrice - mean12) / mean12) * 100
    } else {
      closes2 -= data[i - 12].close
      let mean12 = closes2 / 12
      bias2 = ((closePrice - mean12) / mean12) * 100
    }

    if (i < 24) {
      let mean24 = closes3 / (i + 1)
      bias3 = ((closePrice - mean24) / mean24) * 100
    } else {
      closes3 -= data[i - 24].close
      let mean24 = closes3 / 24
      bias3 = ((closePrice - mean24) / mean24) * 100
    }

    data[i].bias = { bias1, bias2, bias3 }
  }
  return data
}


//nodejs 导出   https://github.com/ljhwh586/klineweb  https://github.com/klinecharts/KLineChart
if (typeof module !== "undefined" && module.exports) {
  exports.calculationMacd = calculationMacd
  exports.calculationBias = calculationBias
  exports.calculationCci = calculationCci
}