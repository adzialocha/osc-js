(function (window, undefined) {

  'use strict';

  var OSC = function() {

  };

  OSC.prototype.testFunc = function() {
    console.log('saying what?!');
  };

  OSC.prototype.answer = function() {
    return 42;
  };

  window.OSC = OSC;

}(window));
