// ===== 全部挂载到 global，不再使用局部变量 =====

// 原生模块 & 第三方库
global.fs = require('fs');
global.args = require('minimist')(process.argv.slice(2));
global.XLSX = require("xlsx");

// 自定义工具模块（my.js 的全部导出挂载）
Object.assign(global, require("./my.js"));

// 指标计算模块（全部导出挂载）
Object.assign(global, require("./indicatorCalculation.js"));

// 各个行情/策略模块：直接挂载整个模块的导出，或只挂载需要的属性
global.金融地产ETF广发 = require("../cn/行情/金融地产ETF广发.js").金融地产ETF广发;
global.消费ETF华夏 = require("../cn/行情/消费ETF华夏.js").消费ETF华夏;
global.工业40LOF = require("../cn/行情/工业40LOF.js").工业40LOF;
global.TMTETF景顺 = require("../cn/行情/TMTETF景顺.js").TMTETF景顺;

global.上证50ETF = require("../cn/行情/上证50ETF.js").上证50ETF;
global.沪深300ETF = require("../cn/行情/沪深300ETF.js").沪深300ETF;

global.沪深300 = require("../cn/行情/沪深300.js").沪深300;
global.上证 = require("../cn/行情/上证.js").上证;
global.恒生 = require("../cn/行情/恒生.js").恒生;

// 恐贪指数模块（挂载两个需要的属性，也可用 Object.assign 全挂）
global.恐贪writeDateTime = require("../cn/行情/恐贪指数.js").恐贪writeDateTime;
global.恐贪指数 = require("../cn/行情/恐贪指数.js").恐贪指数;

// 策略模块（直接挂载需要的 triggerLogObj...）
global.triggerLogObj指数 = require("../cn/行情/指数策略.js").triggerLogObj指数;
global.triggerLogObj券商 = require("../cn/行情/券商策略.js").triggerLogObj券商;
global.triggerLogObj区间 = require("../cn/行情/区间策略.js").triggerLogObj区间;
global.triggerLogObj基金 = require("../cn/基金/基金策略.js").triggerLogObj基金;

global.triggerLogObjPmi股债 = require("../cn/pmiGZ策略.js").triggerLogObjPmi股债;
global.triggerLogObj同花顺 = require("../cnThs/今收/ths策略.js").triggerLogObj同花顺;

global.triggerLogObj大宗 = require("../cn/新浪期货行情/大宗策略.js").triggerLogObj大宗;
global.triggerLogObj美股指数 = require("../us/行情/美股指数策略.js").triggerLogObj美股指数;

// ==========
var startJs = performance.now();

var window = {};
window.恐贪指数 = 恐贪指数;
window.恐贪writeDateTime = 恐贪writeDateTime;
window.location = {};
window.location.port = devTestEnv ? "5507" : ""; //Object.assign(global, require("./my.js"))  5507 run-all.bat node;  5500 golive 浏览器；

var getQueryVariable = function (attr) {
    console.log(args?.[attr]);
    return args?.[attr] ?? "false";
};

var pageSendMail = async function (mailMsg, cbk) {
    console.info(mailMsg);

    mailMsg = mailMsg.replace(/\r\n|\n|\r/g, '<br>');
    let mailRes = await mySendMail("optionsStrategy", mailMsg).catch((error) => { console.log("mySendMail_error:", error); throw error })
    console.info(`发送邮件:${mailRes?.response?.substring(0, 23)}`)
};

global.startJs = startJs
global.window = window
global.getQueryVariable = getQueryVariable
global.pageSendMail = pageSendMail

global.console.log = () => { }; //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// 现在 optionsStrategy.js 里可以直接使用恒生、恐贪指数等全局变量
require("./optionsStrategy.js");