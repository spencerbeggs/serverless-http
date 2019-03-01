'use strict';

const url = require('url');

function cleanupAWSEvent(evt, options) {
  var event, ip, requestId;
  console.log(options.type);
  switch (options.type) {
    case "edge-origin-request":
      var { cf: { request, config } } = evt.Records[0];
      ip = request.clientIp;
      requestId = config.requestId;
      event = {};
      event.httpMethod = request.method;
      event.path = request.uri;
      event.headers = Object.keys(event.headers).reduce((acc, headerGroup) => {
        acc[headerGroup.toLocaleLowerCase()] = headerGroup[headerGroup.length - 1].value;
        return acc;
      }, {});
      event.requestContext = {
        identity: undefined,
        path: undefined
      };
      event.originalUrl = url.format({
        pathname: request.uri,
        query: request.querystring
      });
      event.url = url.format({
        pathname: request.uri,
        query: request.querystring
      });
      event.baseUrl = request.uri.slice(0, -request.uri.length);
      break;
    default:
      event = {};
      event.httpMethod = event.httpMethod || 'GET';
      event.path = event.path || '/';
      event.headers = event.headers || {};
      event.requestContext = event.requestContext || {};
      event.requestContext.path = event.requestContext.path || event.path;
      event.requestContext.identity = event.requestContext.identity || {};
      requestId = evt.requestContext.requestId;
      event.originalUrl = url.format({
        pathname: event.requestContext.path,
        query: event.multiValueQueryStringParameters || event.queryStringParameters
      }),
      event.url = url.format({
        pathname: event.path,
        query: event.multiValueQueryStringParameters || event.queryStringParameters
      });
      event.baseUrl = event.requestContext.path.slice(0, -event.path.length);
  }

  if (typeof event.headers['content-length'] === 'undefined') {
    event.headers['content-length'] = Buffer.byteLength(event.body);
  }
  console.log(event);
  return { event, ip, requestId};
}

module.exports = function(evt, options) {
  switch (options.platform) {
    case "aws":
      return cleanupAWSEvent(evt, options);
  }
}
