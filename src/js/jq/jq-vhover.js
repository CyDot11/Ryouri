/*
JavaScript vhover
Dependencies: jQuery
Designer: 2022 © Michael Schwarz, CyDot, info@cydot.de
Updated: 2025-04-12
*/

const VERSION = "2.1.0";

const CLASS_NAME = {
  HOVER: "vhover",
  INACTIVE: "vhover-inactive",
  BOUND: "vhover-bound",
};

const CLASS_SELECTOR = {
  HOVER: "." + CLASS_NAME.HOVER,
  INACTIVE: "." + CLASS_NAME.INACTIVE,
  BOUND: "." + CLASS_NAME.BOUND,
};

const TOUCH_ENABLED =
  "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;

const ORIGINAL_EVENT = {
  START: TOUCH_ENABLED ? "touchstart" : "mouseenter",
  END: TOUCH_ENABLED ? "touchleave touchend touchcancel" : "mouseleave",
};

const CUSTOM_EVENT = {
  START: "vhoverstart",
  END: "vhoverend",
};

$.fn.extend({
  vhover: function (startCallback, endCallback) {
    const $e = $(this)
      .not(CLASS_SELECTOR.BOUND)
      .addClass(CLASS_NAME.BOUND)
      .addClass(CLASS_NAME.INACTIVE);

    if (typeof startCallback === "function") {
      $e.on(CUSTOM_EVENT.START, startCallback);
    }
    if (typeof endCallback === "function") {
      $e.on(CUSTOM_EVENT.END, endCallback);
    }

    $e.vhoverActivate();

    return $(this);
  },

  unvhover: function () {
    const $e = $(this)
      .filter(CLASS_SELECTOR.BOUND)
      .vhoverOff()
      .removeClass(CLASS_NAME.BOUND)
      .removeClass(CLASS_NAME.HOVER)
      .removeClass(CLASS_NAME.INACTIVE);

    return $(this);
  },

  vhoverOff: function (type, callback) {
    const $e = $(this).filter(CLASS_SELECTOR.BOUND);
    const size = arguments.length;

    if (!size) {
      $e.off(CUSTOM_EVENT.START).off(CUSTOM_EVENT.END);
    } else if (size === 1) {
      $e.off(CUSTOM_EVENT[type.toUpperCase()]);
    } else if (typeof callback === "function") {
      $e.off(CUSTOM_EVENT[type.toUpperCase()], callback);
    }

    return $(this);
  },

  vhoverActivate: function () {
    const $e = $(this)
      .filter(CLASS_SELECTOR.INACTIVE)
      .removeClass(CLASS_NAME.INACTIVE)
      .on(ORIGINAL_EVENT.START, __triggerStart)
      .on(ORIGINAL_EVENT.END, __triggerEnd);

    return $(this);
  },

  vhoverDeactivate: function () {
    const $e = $(this)
      .filter(CLASS_SELECTOR.BOUND)
      .not(CLASS_SELECTOR.INACTIVE)
      .addClass(CLASS_NAME.INACTIVE)
      .off(ORIGINAL_EVENT.START, __triggerStart)
      .off(ORIGINAL_EVENT.END, __triggerEnd);

    return $(this);
  },
});

$.vhover = function (selector, startCallback, endCallback) {
  $(selector).vhover(startCallback, endCallback);
};

function __triggerStart() {
  $(this).trigger(CUSTOM_EVENT.START).addClass(CLASS_NAME.HOVER);
}

function __triggerEnd() {
  $(this).trigger(CUSTOM_EVENT.END).removeClass(CLASS_NAME.HOVER);
}
