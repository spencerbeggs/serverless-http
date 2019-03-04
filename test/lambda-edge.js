const express = require('express'),
    expect = require('chai').expect,
    request = require('./util/request'),
    events = require("./events"),
    onHeaders = require('on-headers'),
    serverless = require('../serverless-http'),
    zlib = require("zlib"),
    compression = require("compression");

 describe('lambda-edge', () => {
  describe("viewer-request", () => {
  });

  describe("viewer-response", () => {
  });

  describe("origin-request", () => {
    let app, htmlString = "<h1>Hello, world!</h1>";
    beforeEach(function() {
      app = express();
    });
    it("returns 200 for a valid request", () => {
      app.use("/foobar", function(req, res) {
        res.status(200).send(htmlString);
      });
      return request(app, events.aws.edge.origin.request.basic, {
        platform: "aws",
        type: "edge-origin-request"
      })
      .then(response => {
        expect(response.status).to.equal("200");
        expect(zlib.gunzipSync(Buffer.from(response.body, "base64")).toString("utf8")).to.equal(htmlString);
      });
    });

    it("it compresses the body if it is not already compressed", () => {
      app.use("/foobar", function(req, res) {
        res.status(200).send(htmlString);
      });
      return request(app, events.aws.edge.origin.request.basic, {
        platform: "aws",
        type: "edge-origin-request"
      })
      .then(response => {
        expect(response.status).to.equal("200");
        expect(zlib.gunzipSync(Buffer.from(response.body, "base64")).toString("utf8")).to.equal(htmlString);
      });
    });

    it("it passes through the body if it is already compressed", () => {
      app.use(compression({
        threshold: 0
      }));
      app.use("/foobar", function(req, res) {
        res.status(200).send(htmlString);
      });
      return request(app, events.aws.edge.origin.request.basic, {
        platform: "aws",
        type: "edge-origin-request"
      })
      .then(response => {
        expect(response.status).to.equal("200");
        expect(zlib.gunzipSync(Buffer.from(response.body, "base64")).toString("utf8")).to.equal(htmlString);
      });
    });

    it('should set custom requestId', (done) => {
      let called;
      const handler = serverless((req, res) => {
        onHeaders(res, () => {
          called = req;
        });
        res.end('');
      }, { requestId: 'Custom-Request-ID' });
  
      handler({ requestContext: { requestId: 'bar' } }, {}, () => {
        expect(!!called).to.be.true;
        expect(called.headers['custom-request-id']).to.eql('bar');
        done();
      });
    });

  });

  describe("origin-response", () => {
  });
});