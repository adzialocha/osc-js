/*! osc-js - v0.0.1 - 2014-02-28 by marmorkuchen.net */
(function(window, undefined) {
    "use strict";
    var OSC = function() {};
    OSC.prototype.testFunc = function() {
        console.log("saying what?!");
    };
    OSC.prototype.answer = function() {
        return 42;
    };
    window.OSC = OSC;
})(window);