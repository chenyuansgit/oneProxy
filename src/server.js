const {PROXY_PORT, WEBINTERFACE_ENABLE, WEBINTERFACE_PORT, THROTTLE, FORCE_PROXY_HTTPS, SILENT, WSINTERCEPT} = process.env;

import AnyProxy from 'anyproxy';
import {increment} from './lib/watcher';
const ModifyRequestRule = require('./rules/modify_request_path');

const options = {
    port: PROXY_PORT,
    rule: ModifyRequestRule,
    webInterface: {
        enable: WEBINTERFACE_ENABLE === 'on',
        webPort: WEBINTERFACE_PORT
    },
    throttle: THROTTLE,
    forceProxyHttps: FORCE_PROXY_HTTPS === 'on',
    wsIntercept: WSINTERCEPT === 'on', // 不开启websocket代理
    silent: SILENT === 'on'
};
const proxyServer = new AnyProxy.ProxyServer(options);

proxyServer.on('ready', function () {
    console.log(`✅ proxy server listening on port ${PROXY_PORT}`);
});
proxyServer.on('error', function (e) {
    console.log("代理服务器出错:", e);
});
proxyServer.start();


process.on('uncaughtException', (err) => {
    // 打点
    increment('uncaughtException');
});

process.on('unhandledRejection', (err, p) => {
    // 打点
    increment('unhandledRejection');
});

// 加入以下代码，ctrl+c 程序才能正常结束。
process.on('SIGINT', () => {
    console.log('server shutdown');
    process.exit();
});