const http = require("http");
const zlib = require("zlib");

const Response = require('./response');
const isBinary = require('./is-binary');
const getBody = require('./get-body');

const readOnlyHeaders = [
    "accept-encoding",
    "content-length",
    "if-modified-since",
    "if-none-Match",
    "if-range",
    "if-unmodified-since",
    "range",
    "transfer-encoding",
    "via"
];

module.exports.lambdaOriginRequest = function(res, options) {
    const status = res.statusCode.toString();
    const resHeaders = Response.headers(res);
    const headers = Object.keys(resHeaders).reduce((acc, key) => {
        let normalizedKey = key.toLowerCase();
        if (!readOnlyHeaders.includes(normalizedKey)) {
            if (acc[normalizedKey]) {
                acc[normalizedKey].push({
                    key: normalizedKey,
                    value: resHeaders[key]
                });
            } else {
                acc[normalizedKey] = [{
                    key: normalizedKey,
                    value: resHeaders[key]
                }];
            }
        }
        return acc;
    }, { "content-encoding": [{ key: "content-encoding", value: "gzip" }] });
    const isBase64Encoded = isBinary(resHeaders, options);
    const body = getBody(res, resHeaders, isBase64Encoded);
    const base64EncodedBody = zlib.gzipSync(Buffer.from(body)).toString('utf8');
    console.log(JSON.stringify({
        status,
        statusDescription: http.STATUS_CODES[status],
        headers,
        body: base64EncodedBody,
        bodyEncoding: "text"
      }));
    return {
      status,
      statusDescription: http.STATUS_CODES[status],
      headers,
      body: base64EncodedBody,
      bodyEncoding: "text"
    };
}