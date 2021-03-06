var common = require('../common');
var uuid = common.uuid;
var stormpath = common.Stormpath;

function loadApiKey(cb) {
  var id = process.env.STORMPATH_CLIENT_APIKEY_ID;
  var secret = process.env.STORMPATH_CLIENT_APIKEY_SECRET;
  var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')] || '';
  var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

  if (id && secret) {
    return process.nextTick(function() {
      cb(new stormpath.ApiKey(id, secret));
    });
  }

  stormpath.loadApiKey(apiKeyFilePath, function(err, apiKey) {
    if (err) {
      throw err;
    }

    cb(apiKey);
  });
}

function getClient(cb) {
  loadApiKey(function(apiKey) {
    cb(new stormpath.Client({ apiKey: apiKey }));
  });
}

function uniqId(){
  return 'it-'+uuid();
}

function fakeAccount(){
  return {
    givenName: uniqId(),
    surname: uniqId(),
    username: uniqId(),
    email: uniqId() + '@mailinator.com',
    password: 'Changeme1!' + uuid()
  };
}

/**
 * Create a new Stormpath Application for usage in tests.
 *
 * @function
 *
 * @param {Function} callback - A callback to run when done.
 */
function createApplication(callback) {
  var prefix = uuid.v4();
  var appData = { name: prefix };
  var opts = { createDirectory: true };

  getClient(function(client){
    client.createApplication(appData, opts, callback);
  });
}


function fakeDirectory(){
  return {
    name: uniqId()
  };
}

module.exports = {
  createApplication: createApplication,
  loadApiKey: loadApiKey,
  getClient: getClient,
  uniqId: uniqId,
  fakeAccount: fakeAccount,
  fakeDirectory: fakeDirectory
};
