// JQuery Easing Equations - Extraction from jQuery UI - v1.12.1 - by cydot
/*
Standard Easing Method:
linear, swing

Added Easing Methods:
Quad, Cubic, Quart, Quint, Expo, Sine, Circ, Elastic, Back, Bounce

Easing Modes:
easeIn, easeOut, easeInOut

Usage (Mode + Method):
'easeInSine', 'easeOutElastic', 'easeInOutExpo' etc.

Example:
$('.my-element').animate({width: '90%'}, 300, 'easeOutElastic', callback)
*/

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  $.ui = $.ui || {};

  var version = ($.ui.version = "1.12.1");

  (function () {
    // Based on easing equations from Robert Penner (http://www.robertpenner.com/easing)
    var baseEasings = {};

    $.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (i, name) {
      baseEasings[name] = function (p) {
        return Math.pow(p, i + 2);
      };
    });

    $.extend(baseEasings, {
      Sine: function (p) {
        return 1 - Math.cos((p * Math.PI) / 2);
      },
      Circ: function (p) {
        return 1 - Math.sqrt(1 - p * p);
      },
      Elastic: function (p) {
        return p === 0 || p === 1
          ? p
          : -Math.pow(2, 8 * (p - 1)) *
              Math.sin((((p - 1) * 80 - 7.5) * Math.PI) / 15);
      },
      Back: function (p) {
        return p * p * (3 * p - 2);
      },
      Bounce: function (p) {
        var pow2,
          bounce = 4;

        while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
        return (
          1 / Math.pow(4, 3 - bounce) -
          7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2)
        );
      },
    });

    $.each(baseEasings, function (name, easeIn) {
      $.easing["easeIn" + name] = easeIn;
      $.easing["easeOut" + name] = function (p) {
        return 1 - easeIn(1 - p);
      };
      $.easing["easeInOut" + name] = function (p) {
        return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn(p * -2 + 2) / 2;
      };
    });
  })();
});
