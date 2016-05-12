var Firebase = require("firebase");

function JasmineFirebaseReporter(options) {
  var self = this;
  
  // set Options
  options = options || {};
  self.firebaseRoot = options.firebaseRoot;
  self.appFullName = options.appFullName === undefined ? 'Your App' : options.appFullName;
  self.appName = options.appName === undefined ? 'your_app' : options.appName;
  self.hasFailed = false;
  
  
  var root = new Firebase(self.firebaseRoot);
  var appRef = root.child(self.appName);
  
  browser.getCapabilities().then(function (capabilities) {
    self.os = capabilities.get('platform');
    self.browserName = capabilities.get('browserName');
    appRef.child(self.os).child(self.browserName).set({});
  });
    
  self.jasmineStarted = function(suiteInfo){
    console.log('sending info to firebase, fingers crossed...');
    appRef.update({
      appInfo: {
        appFullName: self.appFullName,
        numberOfSpecs: suiteInfo.totalSpecsDefined, // this might be useful now, but we don't need it at the end
        status: 'inProgress'
      }
    });
  },
  
  self.suiteStarted = function(result){
    console.log('suite started, I am not doing anything with this right now because it\'s hard and unnecessary');
    // appRef.child(result.id).update({
    //   description: result.description,
    //   fullName: result.fullName,
    //   failedExpectations: result.failedExpectations,
    //   status: 'inProgress'
    // });
  },
  
  self.specStarted = function(result){
    // console.log('spec started ' + result.description + ' ' + JSON.stringify(result));
    
    
    // var firebaseId = result.id + self.browserName + self.os;
    
    appRef.child(self.os).child(self.browserName).child(result.id).set({
      description: result.description,
      fullName: result.fullName,
      failedExpectations: result.failedExpectations,
      passedExpectations: result.passedExpectations,
      pendingReason: result.pendingReason,
      status: result.status || 'inProgress',
      browser: self.browserName,
      os: self.os
    });
  },
  
  self.specDone = function(result){
    // console.log('spec done ' + result.description + ' ' + self.browserName + ' ' + self.os);
    
    // var firebaseId = result.id + self.browserName + self.os;
    
    appRef.child(self.os).child(self.browserName).child(result.id).update({
      description: result.description,
      fullName: result.fullName,
      failedExpectations: result.failedExpectations,
      passedExpectations: result.passedExpectations,
      pendingReason: result.pendingReason,
      status: result.status || 'finished',
      browser: self.browserName,
      os: self.os
    });
    
    // if at any point there is a failed spec, we want to pass that on to firebase so we know there is a failure for the current test run
    if (result.status == 'failed'){
      self.hasFailed = true;
    }
  },
  
  self.suiteDone = function(result){
    // console.log('suite DONE here is the info:' + JSON.stringify(result));
  },
  
  self.jasmineDone = function(suiteInfo){
    console.log('Tests finished, telling firebase...');
    appRef.update({
      appInfo: {
        appFullName: self.appFullName,
        status: self.hasFailed ? 'failed' : 'passed'
      }
    });
    console.log('Done!')
  }
}

module.exports = JasmineFirebaseReporter;