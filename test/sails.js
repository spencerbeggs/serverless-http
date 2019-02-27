'use strict';

const Sails = require('sails').constructor,
  expect = require('chai').expect,
  request = require('./util/request');

describe('sails', () => {
  let app;

  beforeEach(function(done) {
    this.timeout(10000);
    app = new Sails().load({
      hooks: {
        session: false
      }
    }, err => err ? done(err) : done());
  });

  afterEach(function(done) {
    app.lower(done);
  });

  it('basic unconfigured should set 404 statusCode and default body', () => {
    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(404);
      expect(response.body).to.equal('Not Found');
    }).catch(err => {
      console.log(err);
      Promise.reject(err);
    });
  });
});
