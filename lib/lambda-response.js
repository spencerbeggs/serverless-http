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
                    key: key,
                    value: resHeaders[key]
                });
            } else {
                acc[normalizedKey] = [{
                    key: key,
                    value: resHeaders[key]
                }];
            }
        }
        return acc;
    }, { "content-encoding": [{ key: "Content-Encoding", value: "gzip" }] });
    const isBase64Encoded = isBinary(resHeaders, options);
    let body = getBody(res, resHeaders, isBase64Encoded);
    if (!isBase64Encoded) {
        const buffer = zlib.gzipSync(body);
        body = buffer.toString('base64');
    }
    return {
      status,
      statusDescription: http.STATUS_CODES[status],
      headers,
      body,
      bodyEncoding: "base64"
    };
}