import fetchProxy from '../lib/fetchProxy';
import {increment} from '../lib/watcher';
import logger from '../lib/logger';


module.exports = {
    summary: '重定向请求到另外的代理服务器',
    *beforeSendRequest(requestDetail) {
        console.log("requestDetail:", requestDetail.url);
        increment('qps.http');
        logger.info(`${requestDetail.requestOptions.method} ${requestDetail.url}`);
        // 健康检查
        if (requestDetail.url === '/healthcheck.html') {
            const localResponse = {
                statusCode: 200,
                header: {'Content-Type': 'application/json'},
                body: 'ok'
            };
            return {
                response: localResponse
            };
        }
        // 获取header的proxy参数
        const headerProxyHost = requestDetail.requestOptions.headers['proxy-host'];
        const headerProxyPort = requestDetail.requestOptions.headers['proxy-port'];

        logger.info(`headerProxyHost: ${headerProxyHost || ''} headerProxyPort: ${headerProxyPort || ''}`);

        if (headerProxyHost && headerProxyPort) {
            newRequestOptions.hostname = headerProxyHost;
            newRequestOptions.port = headerProxyPort;
            newRequestOptions.path = requestDetail.url;
            return requestDetail;
        } else {
            fetchProxy().then(function (proxy) {
                logger.info(`fetchProxyHost: ${proxy.host || ''} fetchProxyHost: ${proxy.port || ''}`);
                const newRequestOptions = requestDetail.requestOptions;
                newRequestOptions.hostname = proxy.host;  //'10.89.72.95';
                newRequestOptions.port = proxy.port;//'6791';
                newRequestOptions.path = requestDetail.url;
                return requestDetail;
            });
        }

    }
};