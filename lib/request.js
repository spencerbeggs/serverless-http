'use strict';

const http = require('http');

function getHeaders(event) {
  return Object.keys(event.headers).reduce((headers, key) => {
    headers[key.toLowerCase()] = event.headers[key];
    return headers;
  }, {});
}


function getBody(event, headers) {
  if (typeof event.body === 'string') {
    return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  } else if (Buffer.isBuffer(event.body)) {
    return event.body;
  } else if (typeof event.body === 'object') {
    const contentType = headers['content-type'];

    if (contentType && contentType.indexOf('application/json') === 0) {
      return Buffer.from(JSON.stringify(event.body));
    } else {
      throw new Error('event.body was an object but content-type is not json');
    }
  }

  throw new Error(`Unexpected event.body type: ${typeof event.body}`);
}

module.exports = class ServerlessRequest extends http.IncomingMessage {
  constructor(event, ip, requestId, options) {
    super({
      encrypted: true,
      readable: false,
      remoteAddress: ip,
      address: () => {
        return { port: 443 };
      },
      end: Function.prototype
    });

    const headers = getHeaders(event);
    const body = getBody(event, headers);

    if (typeof headers['content-length'] === 'undefined') {
      headers['content-length'] = Buffer.byteLength(body);
    }

    if (typeof options.requestId === 'string' && options.requestId.length > 0 && requestId) {
      const key = options.requestId.toLowerCase();
      headers[key] = requestId;
    }

    Object.assign(this, {
      ip: ip,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method: event.httpMethod,
      headers,
      body,
      baseUrl: event.baseUrl,
      originalUrl: event.originalUrl,
      url: event.url
    });

    this.push(body);
    this.push(null);
  }

}
