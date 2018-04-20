import fetchProxy from '../lib/fetchProxy';
import {increment} from '../lib/watcher';
import logger from '../lib/logger';


module.exports = {
    summary: '重定向请求到另外的代理服务器',
    *beforeSendRequest(requestDetail) {
        logger.info("requestDetail:" + requestDetail.url);
        increment('qps.http');
        logger.info(`${requestDetail.requestOptions.method} ${requestDetail.url}`);

        return new Promise((resolve, reject) => {
            // 健康检查
            if (requestDetail.url === '/healthcheck.html') {
                const localResponse = {
                    statusCode: 200,
                    header: {'Content-Type': 'application/json'},
                    body: 'ok'
                };
                return resolve({
                    response: localResponse
                });
            }

            // 获取header的proxy参数
            const headerProxyHost = requestDetail.requestOptions.headers['proxy-host'];
            const headerProxyPort = requestDetail.requestOptions.headers['proxy-port'];


            delete requestDetail.requestOptions.headers['proxy-host'];
            delete requestDetail.requestOptions.headers['proxy-port'];

            logger.info(`headerProxyHost: ${headerProxyHost || ''} headerProxyPort: ${headerProxyPort || ''}`);

            const newRequestOptions = requestDetail.requestOptions;

            if (headerProxyHost && headerProxyPort) {
                newRequestOptions.hostname =  headerProxyHost;
                newRequestOptions.port = headerProxyPort;
                newRequestOptions.path = requestDetail.url;

                requestDetail.protocol = 'http';
                requestDetail.requestOptions = newRequestOptions;

                return resolve(requestDetail);
            } else {
                fetchProxy().then(function (proxy) {
                    logger.info(`fetchProxyHost: ${proxy.host || ''} fetchProxyHost: ${proxy.port || ''}`);
                    newRequestOptions.hostname = proxy.host;
                    newRequestOptions.port = proxy.port;
                    newRequestOptions.path = requestDetail.url;

                    requestDetail.protocol = 'http';
                    requestDetail.requestOptions = newRequestOptions;

                    return resolve(requestDetail);
                });
            }
        })
    }
   /* *beforeSendRequest(requestDetail) {
        logger.info("requestDetail:" + requestDetail.url);
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


        delete requestDetail.requestOptions.headers['proxy-host'];
        delete requestDetail.requestOptions.headers['proxy-port'];

        logger.info(`headerProxyHost: ${headerProxyHost || ''} headerProxyPort: ${headerProxyPort || ''}`);

        const newRequestOptions = requestDetail.requestOptions;

        if (headerProxyHost && headerProxyPort) {
            newRequestOptions.hostname =  headerProxyHost;
            newRequestOptions.port = headerProxyPort;
            newRequestOptions.path = requestDetail.url;
            requestDetail.requestOptions = newRequestOptions;

            return  {
                protocol: 'http',
                requestOptions: newRequestOptions
            };
        } else {
            co(function *() {
                var proxy = yield fetchProxy();
                logger.info(`fetchProxyHost: ${proxy.host || ''} fetchProxyHost: ${proxy.port || ''}`);
                newRequestOptions.hostname = proxy.host;
                newRequestOptions.port = proxy.port;
                newRequestOptions.path = requestDetail.url;
                return  {
                    protocol: 'http',
                    requestOptions: newRequestOptions
                };
            });
            /!*fetchProxy().then(function (proxy) {
                console.log("设置代理");
                logger.info(`fetchProxyHost: ${proxy.host || ''} fetchProxyHost: ${proxy.port || ''}`);
                newRequestOptions.hostname = '10.89.72.95';
                newRequestOptions.port = 6791;
                newRequestOptions.path = requestDetail.url;
                return  {
                    protocol: 'http',
                    requestOptions: newRequestOptions
                };
            });*!/
        }
    }*/
};