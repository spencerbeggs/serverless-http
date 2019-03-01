'use strict';

const url = require('url');

function cleanupAWSEvent(evt, options) {
  var event;
  switch (options.type) {
    case "edge-origin-request":
      var { cf: { request, config } } = evt.Records[0];
      event = {};
      event.httpMethod = request.method;
      event.path = request.uri;
      event.body = request.body.data
      event.headers = Object.keys(request.headers).reduce((acc, headerType) => {
        let group = request.headers[headerType];
        acc[headerType.toLowerCase()] = group[group.length - 1].value;
        return acc;
      }, {});
      if (typeof options.requestId === 'string' && options.requestId.length > 0) {
        const key = options.requestId.toLowerCase();
        const value = event.headers[options.requestId] || config.requestId;
        if (value) {
          event.headers[key] = value;
        }
      }
      event.ip = request.clientIp;
      event.originalUrl = url.format({
        pathname: request.uri,
        query: request.querystring
      });
      event.url = url.format({
        pathname: request.uri,
        query: request.querystring
      });
      event.baseUrl = request.uri.slice(0, -request.uri.length);
      event.isBase64Encoded = request.body.encoding === "base64";
      break;
    default:
      event = evt || {};
      event.httpMethod = event.httpMethod || 'GET';
      event.path = event.path || '/';
      event.body = event.body || '',
      event.headers = Object.keys(event.headers || {}).reduce((headers, key) => {
        headers[key.toLowerCase()] = event.headers[key];
        return headers;
      }, {});
      event.requestContext = event.requestContext || {};
      event.requestContext.path = event.requestContext.path || event.path;
      event.requestContext.identity = event.requestContext.identity || {};
      event.ip = event.requestContext.identity.sourceIp;
      if (typeof options.requestId === 'string' && options.requestId.length > 0) {
        const key = options.requestId.toLowerCase();
        const value = event.headers[key] || event.requestContext.requestId;
        if (value) {
          event.headers[key] = value;
        }
      }
      event.originalUrl = url.format({
        pathname: event.requestContext.path,
        query: event.multiValueQueryStringParameters || event.queryStringParameters
      }),
      event.url = url.format({
        pathname: event.path,
        query: event.multiValueQueryStringParameters || event.queryStringParameters
      });
      event.baseUrl = event.requestContext.path.slice(0, -event.path.length);
      break;
  }
  return event;
}

module.exports = function(evt, options) {
  switch (options.platform) {
    case "aws":
      return cleanupAWSEvent(evt, options);
  }
}
