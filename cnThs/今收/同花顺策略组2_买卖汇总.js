var runDateTime组2 = "2024-12-13 20:18:20"
var 最近实际收盘日期组2 = "2024-12-13"

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
        "触发买入": [
            [
                "000404",
                "长虹华意",
                "检测失效!"
            ]
        ]
    },
    "macd底背七日": {
        "触发卖出": [],
        "触发买入": []
    },
    "六均线两日": {
        "触发卖出": [
            [
                "000017",
                "深中华A",
                "2024-12-12",
                "2024-12-13",
                "7.43",
                "7.46",
                "0.40%"
            ]
        ],
        "触发买入": [
            [
                "000607",
                "华媒控股",
                "危险公告!",
                "华媒控股：关于诉讼事项进展的公告 12-11 15:46"
            ]
        ]
    }
}

exports.同花顺策略组2A买卖汇总 = 同花顺策略组2A买卖汇总
exports.同花顺策略组2B买卖汇总 = 同花顺策略组2B买卖汇总
exports.同花顺策略组2C买卖汇总 = 同花顺策略组2C买卖汇总