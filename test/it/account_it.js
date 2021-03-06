'use strict';

var assert = require('assert');

var uuid = require('uuid');

var helpers = require('./helpers');

var Account = require('../../lib/resource/Account');
var CustomData = require('../../lib/resource/CustomData');

describe('Account', function() {
  var client, directory, account, creationResult;

  before(function(done) {
    helpers.getClient(function(_client) {
      client = _client;

      client.createDirectory({ name: uuid.v4() }, function(err, _directory) {
        if (err) {
          return done(err);
        }

        directory = _directory;
        directory.createAccount(helpers.fakeAccount(), function(err,_account) {
          account = _account;
          creationResult = [err, _account];
          done();
        });
      });
    });
  });

  after(function(done) {
    account.delete(function(err) {
      if (err) {
        return done(err);
      }

      directory.delete(done);
    });
  });

  it('should be create-able from a directory instance', function() {
    assert.equal(creationResult[0], null); // did not error
    assert(account instanceof Account);
  });

  it('should be retrievable by URI fragment', function(done) {
    var hrefParts = account.href.split('/');
    var uriFragment = '/' + hrefParts.slice(Math.max(hrefParts.length - 2, 1)).join('/');

    client.getAccount(uriFragment, function(err, _account) {
      if (err) {
        return done(err);
      }

      assert.equal(account.href, _account.href);
      done();
    });
  });

  describe('customData', function() {
    describe('via getCustomData', function() {
      var customData;

      before(function(done) {
        account.getCustomData(function(err, _customData) {
          if (err) {
            return done(err);
          }

          customData = _customData;
          done();
        });
      });

      it('should be get-able', function() {
        assert(customData instanceof CustomData);
        assert.equal(customData.href, account.href + '/customData');
      });

      describe('when saved and re-fetched', function() {
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();

        before(function(done) {
          customData[propertyName] = propertyValue;

          customData.save(function(err) {
            if (err) {
              return done(err);
            }

            account.getCustomData(function(err, customData) {
              if (err) {
                return done(err);
              }

              customDataAfterGet = customData;
              done();
            });
          });
        });

        it('should have the new property persisted', function() {
          assert.equal(customDataAfterGet[propertyName], propertyValue);
        });
      });
    });

    describe('via resource expansion', function() {
      function getExpandedAccount(cb) {
        client.getAccount(account.href, { expand: 'customData' }, function(err, account) {
          if (err) {
            throw err;
          }

          cb(account);
        });
      }

      var customData;

      before(function(done) {
        getExpandedAccount(function(account) {
          customData = account.customData;
          done();
        });
      });

      it('should be get-able', function() {
        assert(customData instanceof CustomData);
        assert.equal(customData.href, account.href + '/customData');
      });

      describe('when saved and re-fetched', function() {
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();

        before(function(done) {
          customData[propertyName] = propertyValue;

          customData.save(function(err) {
            if (err) {
              return done(err);
            }

            getExpandedAccount(function(account) {
              customDataAfterGet = account.customData;
              done();
            });
          });
        });

        it('should have the new property persisted', function() {
          assert.equal(customDataAfterGet[propertyName], propertyValue);
        });
      });
    });
  });
});
