var runDateTime组2 = "2024-09-09 19:34:05"
var 最近实际收盘日期组2 = "2024-09-09"

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
        "触发卖出": [
            [
                "600033",
                "福建高速",
                "2024-08-29",
                "2024-09-09",
                "3.53",
                "3.28",
                "-7.08%"
            ]
        ],
        "触发买入": []
    },
    "macd底背七日": {
        "触发卖出": [
            [
                "002484",
                "江海股份",
                "2024-08-30",
                "2024-09-09",
                "12.24",
                "12.35",
                "0.90%"
            ]
        ],
        "触发买入": [
            [
                "301048",
                "金鹰重工",
                "正常"
            ]
        ]
    },
    "六均线两日": {
        "触发卖出": [
            [
                "000929",
                "兰州黄河",
                "2024-09-06",
                "2024-09-09",
                "5.80",
                "5.93",
                "2.24%"
            ]
        ],
        "触发买入": [
            [
                "000518",
                "四环生物",
                "检测失效!"
            ]
        ]
    }
}

exports.同花顺策略组2A买卖汇总 = 同花顺策略组2A买卖汇总
exports.同花顺策略组2B买卖汇总 = 同花顺策略组2B买卖汇总
exports.同花顺策略组2C买卖汇总 = 同花顺策略组2C买卖汇总