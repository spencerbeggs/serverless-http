'use strict';

const http = require('http');

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

module.exports = function(event) {
  return new http.request();
}


class ServerlessRequest extends http.IncomingMessage {
  constructor(event) {
    super({
      encrypted: true,
      readable: false,
      remoteAddress: event.requestContext.identity.sourceIp,
      address: () => {
        return { port: 443 };
      },
      end: Function.prototype
    });

    const body = getBody(event, event.headers);

    if (typeof event.headers['content-length'] === 'undefined') {
      event.headers['content-length'] = Buffer.byteLength(body);
    }

    Object.assign(this, {
      ip: event.requestContext.identity.sourceIp,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method: event.httpMethod,
      body,
      baseUrl: event.baseUrl,
      originalUrl: event.originalUrl,
      url: event.url,
    });

    this.push(body);
    this.push(null);
  }

}
