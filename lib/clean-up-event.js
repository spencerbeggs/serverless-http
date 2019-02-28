'use strict';

const url = require('url');

function cleanupAWSEvent(evt, options) {
  switch (options.type) {
    case "edge-origin-request":
      let { cf: { request } } = evt.Records[0];
      let event = {};
      event.httpMethod = request.method;
      event.path = request.uri;
      event.body = request.body.data;
      console.log(request);
      event.headers = Object.keys(request.headers).reduce((acc, headerGroupKey) => {
        if (!acc[headerGroupKey]) {
          acc[headerGroupKey] = request.headers[headerGroupKey].reduce((acc, header, idx, src) => {
            acc.push(header.value);
            return idx === src.length - 1 && acc.length === 1 ? acc[0] : acc;
          }, []);
        }
        return acc;
      }, {});
      event.originalUrl = url.format({
        pathname: request.url,
        query: request.querystring
      });
      event.url = url.format({
        pathname: request.url,
        query: request.querystring
      });
      event.requestContext = {
        path: request.uri,
        identity: {}
      };
      return event;
    case "edge-origin-response":
    default:
      let requestIdHeader = {};
      if (typeof options.requestId === 'string' && options.requestId.length > 0) {
        const requestId = options.requestId.toLowerCase();
        requestIdHeader.headers.requestId = requestId;
      }
      return {
        httpMethod: event.httpMethod || 'GET',
        path: event.path || '/',
        body: event.body || '',
        headers: Object.assign(requestIdHeader, event.headers || {}),
        originalUrl:url.format({
          pathname: event.requestContext.path,
          query: event.multiValueQueryStringParameters || event.queryStringParameters
        }),
        url: url.format({
          pathname: event.path,
          query: event.multiValueQueryStringParameters || event.queryStringParameters
        }),
        requestContext: Object.assign(event.requestContext ? event.requestContext : {}, {
          path: event.requestContext.path || event.path,
          identity: event.requestContext.identity || {}
        }),
        baseUrl: evt.requestContext.path.slice(0, -evt.path.length)
      };
  }
};

module.exports = function(evt, options) {
  switch (options.platform) {
    case "aws":
      return cleanupAWSEvent(evt, options);
  }
}
