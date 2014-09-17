
var common = require('../common');
var helpers = require('./helpers');
var assert = common.assert;

var CustomData = require('../../lib/resource/CustomData');
var Application = require('../../lib/resource/Application');

describe('Application',function(){

  var client, app, creationResult;

  before(function(done){
    helpers.getClient(function(_client){
      client = _client;
      client.createApplication(
        {name: helpers.uniqId()},
        function(err, _app) {
          creationResult = [err,_app];
          app = _app;
          done();
        }
      );
    });
  });

  after(function(done){
    app.delete(done);
  });

  it('should be create-able',function(){
    assert.equal(creationResult[0],null); // did not error
    assert.instanceOf(app,Application);
  });

  describe('custom data',function(){

    describe('via getCustomData',function(){
      var customData;

      before(function(done){
        app.getCustomData(function(err,_customData){
          if(err){ throw err; }
          customData = _customData;
          done();
        });
      });

      it('should be get-able',function(){
        assert.instanceOf(customData,CustomData);
        assert.equal(customData.href,app.href+'/customData');
      });

      describe('when saved and re-fetched',function(){
        var customDataAfterGet;
        var propertyName = helpers.uniqId();
        var propertyValue = helpers.uniqId();
        before(function(done){
          customData[propertyName] = propertyValue;
          customData.save(function(err){
            if(err){ throw err; }
            app.getCustomData(function(err,customData){
              if(err){ throw err; }
              customDataAfterGet = customData;
              done();
            });
          });
        });
        it('should have the new property persisted',function(){
          assert.equal(customDataAfterGet[propertyName],propertyValue);
        });
      });
    });

    // TODO bring back this test once the application
    // expansion issue is fixed in the API

    // describe('via resource expansion',function(){

    //   function getExpandedApplication(cb){
    //     client.getApplication(
    //       { expand: 'customData' },
    //       function(err, app){
    //         if(err){ throw err; }
    //         cb(app);
    //       }
    //     );
    //   }

    //   var customData;

    //   before(function(done){
    //     getExpandedApplication(function(app){
    //       customData = app.customData;
    //       done();
    //     });
    //   });

    //   it('should be get-able',function(){
    //     assert.instanceOf(customData,CustomData);
    //     assert.equal(customData.href,app.href+'/customData');
    //   });

    //   describe('when saved and re-fetched',function(){
    //     var customDataAfterGet;
    //     var propertyName = helpers.uniqId();
    //     var propertyValue = helpers.uniqId();
    //     before(function(done){
    //       customData[propertyName] = propertyValue;
    //       customData.save(function(err){
    //         if(err){ throw err; }
    //         getExpandedApplication(function(tenant){
    //           customDataAfterGet = tenant.customData;
    //           done();
    //         });
    //       });
    //     });
    //     it('should have the new property persisted',function(){
    //       assert.equal(customDataAfterGet[propertyName],propertyValue);
    //     });
    //   });
    // });
  });


});
