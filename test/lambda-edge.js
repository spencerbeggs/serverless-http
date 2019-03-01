const express = require('express'),
    expect = require('chai').expect,
    request = require('./util/request'),
    events = require("./events"),
    onHeaders = require('on-headers'),
    serverless = require('../serverless-http');

 describe('lambda-edge', () => {
  describe("viewer-request", () => {
  });

  describe("viewer-response", () => {
  });

  describe("origin-request", () => {
    let app;
    beforeEach(function() {
      app = express();
    });
    it("returns 200 for a valid request", () => {
      app.use("/foobar", function(req, res) {
        res.status(200).send("<h1>Hello, world!</h1>");
      });
      return request(app, events.aws.edge.origin.request.basic, {
        platform: "aws",
        type: "edge-origin-request"
      })
      .then(response => {
        expect(response.status).to.equal("200");
        expect(response.body).to.equal("H4sIAAAAAAAAE7PJMLTzSM3JyddRKM8vyklRtNEHigAAc3GIjBYAAAA=");
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