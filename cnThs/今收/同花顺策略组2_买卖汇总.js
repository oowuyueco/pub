var runDateTime组2 = "2025-02-08 20:15:39"
var 最近实际收盘日期组2 = "2025-02-07"

var 同花顺策略组2A买卖汇总 =  {
    "月周macd1": {
        "触发卖出": [],
        "触发买入": []
    },
    "月周macd2": {
        "触发卖出": [],
        "触发买入": []
    },
    "大市值趋势": {
        "触发卖出": [],
        "触发买入": []
    },
    "小市值低估": {
        "触发卖出": [],
        "触发买入": []
    },
    "大股东增持": {
        "触发卖出": [],
        "触发买入": []
    }
}
var 同花顺策略组2B买卖汇总 =  {
    "业绩预增menv": {
        "触发卖出": [],
        "触发买入": []
    },
    "绿空红": {
        "触发卖出": [],
        "触发买入": []
    },
    "绿空红menv": {
        "触发卖出": [],
        "触发买入": []
    },
    "均线集中度": {
        "触发卖出": [],
        "触发买入": []
    },
    "均线集中度menv": {
        "触发卖出": [],
        "触发买入": []
    }
}
var 同花顺策略组2C买卖汇总 =  {
    "近五日跌停": {
        "触发卖出": [],
        "触发买入": []
    },
    "跌停": {
        "触发卖出": [],
        "触发买入": []
    },
    "国企低pe高股息": {
        "触发卖出": [],
        "触发买入": []
    },
    "macd底背七日": {
        "触发卖出": [],
        "触发买入": []
    },
    "六均线两日": {
        "触发卖出": [
            [
                "000032",
                "深桑达A",
                "2025-02-06",
                "2025-02-07",
                "17.02",
                "18.28",
                "7.40%"
            ]
        ],
        "触发买入": [
            [
                "000534",
                "万泽股份",
                "正常"
            ]
        ]
    }
}

exports.同花顺策略组2A买卖汇总 = 同花顺策略组2A买卖汇总
exports.同花顺策略组2B买卖汇总 = 同花顺策略组2B买卖汇总
exports.同花顺策略组2C买卖汇总 = 同花顺策略组2C买卖汇总