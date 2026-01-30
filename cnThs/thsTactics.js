var 策略集合 = {
    同花顺策略组1: [

        {
            name: "季月周日",
            query: `季kdj金叉；月macd金叉；周kdj底背离；日macd增大，量比大于1，振幅小于12，日kdjd值小于50`,
            daysForSaleStrategy: "20",
            stockHoldCount: 10,
            dayBuyStockNum: 3,
            upperIncome: 25,
            fallIncome: 5,
            lowerIncome: 7,
            stats: "策略回测"
        },

        {
            name: "月周日",
            query: `最近5天月线周期kdj金叉；周线周期kdj底背离；周线周期kdj金叉；周线周期kdjj值小于25；日线周期kdj金叉且d值小于35；pe<=120；pb>0；排除st`,
            daysForSaleStrategy: "20",
            stockHoldCount: 10,
            dayBuyStockNum: 3,
            upperIncome: 23,
            fallIncome: 3.5,
            lowerIncome: 5.5,
            stats: "策略回测"
        },
        {
            name: "左侧月周日",
            query: `
                  日kdj金叉d值小于37，当日涨幅大于0.5，最近5日涨跌幅小于-5大于-20，最近5日有≥2次的涨跌幅小于0，实际换手率大于1.7，最近10日收盘获利小于5%的天数>0，最近2日主力资金流入大于-50万，
                  周macd上移，周diff增长值>0.01，周kdjj值小于60，月kdj上移，pe<=120，pb>0，排除st
            `,
            daysForSaleStrategy: "20",
            stockHoldCount: 10,
            dayBuyStockNum: 3,
            upperIncome: 30,
            fallIncome: 7,
            lowerIncome: 7,
            stats: "策略回测"
        },

        {
            name: "周日",
            query: `
                  周kdj金叉且j值小于59；最近10日日kdj金叉出现>=1次；日kdjd值小于39；BIAS买入信号；实际换手率大于2.9；股价大于5日均线；
                  最近3日收盘获利小于5%的天数>0；最近3日主力资金流入大于-250万；振幅小于12；放量；pe<=120；roe>0；排除st；roe从大到小
            `,
            daysForSaleStrategy: "20",
            stockHoldCount: 10,
            dayBuyStockNum: 3,
            upperIncome: 33,
            fallIncome: 10,
            lowerIncome: 8.5,
            stats: "策略回测"
        },
        {
            name: "周日2",
            query: `周kdj底背离且金叉且j值小于25；kdj金叉且d值小于35；BIAS买入信号；振幅小于12；实际换手率大于2.9；上市天数大于30；roe>0；排除st；roe从大到小`,
            daysForSaleStrategy: "20",
            stockHoldCount: 10,
            dayBuyStockNum: 3,
            upperIncome: 33,
            fallIncome: 10,
            lowerIncome: 8.5,
            stats: "策略回测"
        },

        {
            name: "日信号",
            query: `
                  kdj买入信号，bias买入信号，wr信号买入，rsi买入信号，周kdj金叉，振幅小于12，cci大于-130小于97，
                  过去30个交易日涨跌幅大于-25%，最近3日主力资金流入大于-250万，实际换手率大于1，roe大于0，排除st，换手率从大到小
            `,
            daysForSaleStrategy: "20",
            stockHoldCount: 10,
            dayBuyStockNum: 3,
            upperIncome: 25,
            fallIncome: 10,
            lowerIncome: 12,
            stats: "策略回测"
        },
        {
            name: "日信号2",
            query: `kdj买入信号，bias买入信号，wr信号买入，macd买入信号，cci大于-120小于0，振幅小于12，股价低于压力位，实际换手率大于2.9，排除st，排除退市`,
            daysForSaleStrategy: "20",
            stockHoldCount: 10,
            dayBuyStockNum: 3,
            upperIncome: 20,
            fallIncome: 5.5,
            lowerIncome: 10.5,
            stats: "策略回测"
        },

        // {
        //     name: "六均线两日测试",
        //     query: `行情收盘价>6日的均线，收盘价>昨日的最高价，当日阳线，昨日的macd增长值<0，当日的macd增长值>0，最近7日放量，量比大于1，前7日的区间主力资金流向>0，17>pb>0`,
        //     daysForSaleStrategy: "2",
        //     stockHoldCount: 1,
        //     dayBuyStockNum: 1,
        //     upperIncome: 30,
        //     fallIncome: 9,
        //     lowerIncome: 13.5,
        //     stats: "策略回测"
        // },


    ],
    同花顺策略组2A: [
        // {
        //     name: "业绩预增menv",
        //     query: `业绩预增大于50%，年报收入同比增长大于10，最近10日放量，量比大于1，最近10日振幅大于10小于35，非ST股，非*ST股，非退市，非停牌，总市值从小到大排列
        //     `,
        //     daysForSaleStrategy: "50",
        //     stockHoldCount: 1,
        //     dayBuyStockNum: 1,
        //     upperIncome: 37,
        //     fallIncome: 5,
        //     lowerIncome: 15,
        //     buyPosition: 0,
        //     menv: "kdj1",
        //     stats: "策略回测"
        // },

        {
            name: "大股东增持",
            query: `今日大股东增持比例大于5%；sar红色；cci小于等于107；资金流入大于-150万；涨跌幅-5~5；排除st；上市天数>100；换手率从大到小 
            `,
            daysForSaleStrategy: "20",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 17,
            fallIncome: 5,
            lowerIncome: 10.5,
            stats: "策略回测"
        },

        {
            name: "绿空红",
            query: `昨日涨跌幅小于0.3大于-10.5，昨日阴线，当日涨跌幅小于-1大于-5，当日阳线，放量，最近5日涨跌幅小于-7大于-21，pe<=120，pb>0， roe大于0，股息大于0，cci大于-260，
                    最近3日收盘获利小于4.5%的天数>0，最近2日主力资金流入大于-200万，BIAS买入信号，kdjd值小于35，排除st，上市天数>100，换手率从大到小排列
            `,
            daysForSaleStrategy: "25",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 30,
            fallIncome: 5,
            lowerIncome: 12,
            stats: "策略回测"
        },
        {
            name: "绿空红menv",
            query: `昨日涨跌幅小于0.3大于-10.5，昨日阴线，当日涨跌幅小于-1大于-5，当日阳线，放量，最近5日涨跌幅小于-7大于-21，pe<=120，pb>0， roe大于0，股息大于0，cci大于-260，
                    最近3日收盘获利小于4.5%的天数>0，最近2日主力资金流入大于-200万，BIAS买入信号，kdjd值小于35，排除st，上市天数>100，换手率从大到小排列
            `,
            daysForSaleStrategy: "25",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 30,
            fallIncome: 5,
            lowerIncome: 12,
            buyPosition: 0,
            menv: "kdj1",
            stats: "策略回测"
        },

        {
            name: "均线集中度",
            query: `市值大于20亿小于350亿；5均线大于10均线；筹码集中度90小于10%；最近10日放量；最近20日换手率小于45；振幅小于10；涨跌幅大于-3.5小于5；排除st；排除*st；上市天数>100；0<pe<70；pb>0；roe从大到小排列  
            `,
            daysForSaleStrategy: "50",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 25,
            fallIncome: 7,
            lowerIncome: 13.5,
            stats: "策略回测"
        },
        {
            name: "均线集中度menv",
            query: `市值大于20亿小于350亿；5均线大于10均线；筹码集中度90小于10%；最近10日放量；最近20日换手率小于45；振幅小于10；涨跌幅大于-3.5小于5；排除st；排除*st；上市天数>100；0<pe<70；pb>0；roe从大到小排列  
            `,
            daysForSaleStrategy: "60",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 20,
            fallIncome: 7,
            lowerIncome: 12,
            buyPosition: 0,
            menv: "kdj1",
            stats: "策略回测"
        },
    ],
    同花顺策略组2B: [
        {
            name: "大市值趋势",
            query: `市值大于1000亿，非科创板，非创业板，同花顺二级行业龙头，细分行业龙头，过去3年的基本每股收益增长率>3%，过去30个交易日涨跌幅大于-5%小于23，
                    振幅小于8，股性评分大于12，上市日期从大到小排名， 总市值从小到大排列
            `,
            daysForSaleStrategy: "31",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 30,
            fallIncome: 7,
            lowerIncome: 13,
            stats: "策略回测"
        },
        {
            name: "小市值低估",
            query: `总市值大于等于7.5亿小于等于20亿； 0<pb<=2.5；0<=pe<=25；股息大于0； BIAS买入信号；放量；振幅小于10； 排除st；上市天数>100； 换手率从大到小排列   
            `,
            daysForSaleStrategy: "50",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 17,
            fallIncome: 5,
            lowerIncome: 13,
            stats: "策略回测"
        },

        {
            name: "月周macd1",
            query: `最近3天月线周期macd金叉；周线周期macd底背离； 最近10日周kdj金叉且j值小于79，  最近10日日kdj金叉且d值小于39 ，0<pe<=120；pb>0;  排除st；roe从大到小
            `,
            daysForSaleStrategy: "35",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 13,
            fallIncome: 1.3,
            lowerIncome: 12,
            stats: "策略回测"
        },
        {
            name: "月周macd2",
            query: `最近3天月线周期macd金叉；周线周期macd底背离； 周kdjj值小于75大于5，周kdj上移，最近10日日kdj金叉且d值小于39， 0<pe<=120；pb>0;  排除st；roe从大到小
            `,
            daysForSaleStrategy: "35",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 13,
            fallIncome: 1.3,
            lowerIncome: 12,
            stats: "策略回测"
        },

        {
            name: "近五日跌停",
            // query: `市值小于100亿，最近5日有跌停，换手率小于1.2%，当日涨跌幅小于-1大于-3.5，当日阳线，流动比率大于1，扣非净利润增速大于0.1， 负债率小于90，pb>0，0<pe<=120，
            //         非ST股，非*ST股，非退市，非停牌，roe从大到小
            // `,
            query: `市值小于200亿，速冻比率大于1，负债率小于70，净利润增速大于0，pb>0，0<pe<=70，bias买入信号，换手率小于1.2%，
                    最近5日有跌停，振幅小于12，主力资金流向>0万，涨跌幅大于-3.5小于-0.5，阳线，非ST股，非退市，非停牌，roe从大到小
            `,
            daysForSaleStrategy: "10",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 27,
            fallIncome: 5,
            lowerIncome: 11,
            stats: "策略回测"
        },
        {
            name: "跌停",
            // query: `市值小于100亿，跌停，换手率小于1%，bias买入信号，主力资金流向>22万，振幅小于10，流动比率大于1，扣非净利润增速大于-0.12，负债率小于90，pb>0，0<pe<=120，
            //         非ST股，非*ST股，非退市，非停牌，roe从大到小
            // `,
            query: `市值小于200亿，速冻比率大于1，负债率小于70，净利润增速大于0，pb>0，0<pe<=70，bias买入信号，换手率小于1.2%，
                    跌停，振幅小于10，主力资金流向>22万，放量，非ST股，非退市，非停牌，roe从大到小

            `,
            daysForSaleStrategy: "10",
            stockHoldCount: 1,
            dayBuyStockNum: 1,
            upperIncome: 27,
            fallIncome: 7,
            lowerIncome: 9.5,
            stats: "策略回测"
        },

    ],

}

exports.策略集合 = 策略集合
