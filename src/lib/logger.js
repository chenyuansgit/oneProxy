/**
 * 日志模块
 * 对tracer的功能进行了限制，只输出特定格式的日志。
 */
const tracer = require('tracer');
const mkdir = require('mkdir').mkdirsSync;
const path = require('path');


const {
  LOG_ROOT,
  NODE_ENV
} = process.env;

//const logRoot = path.join(__dirname, '../../..', LOG_ROOT);
const logRoot = LOG_ROOT;
console.log('logRoot::', logRoot);

mkdir(logRoot); // 创建日志的根文件夹

// 创建每一种类型日志的格式
function createLogHandler(fname, maxLogFiles) {
  const logOption = {
    root: logRoot,
    format: '{{timestamp}} {{message}}',
    dateformat: 'HH:MM:ss',
    splitFormat: 'yyyymmdd',
    allLogsFileName: fname,
    maxLogFiles: maxLogFiles || 5,
    filters(s) {
      if (NODE_ENV !== 'prod') {
        // 开发环境:写入文件 +  输出到控制台
        console.log(`${fname}: ${s}`);
      }
      return s;
    }
  };

  return tracer.dailyfile(logOption);
}

// 预先创建好相应类型的日志
[
  'info',
  'error',
  'debug'
]
  .forEach((name) => {
    module.exports[name] = createLogHandler(name, 5).log; // 导出预定义的格式
  });

[
  'processError' // 进程异常
]
  .forEach((name) => {
    module.exports[name] = createLogHandler(name, 5).log; // 导出预定义的格式
  });


// 导出创建方法
module.exports.createLogHandler = createLogHandler;
