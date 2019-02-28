const express = require('express'),
    expect = require('chai').expect,
    request = require('./util/request'),
    events = require("./events");

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
        res.status(200).send(`I'm a teapot`);
      });
      return request(app, events.aws.edge.origin.request.basic, {
        platform: "aws",
        type: "edge-origin-request"
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.equal(`I'm a teapot`)
      });
    });
  });

  describe("origin-response", () => {
  });
});