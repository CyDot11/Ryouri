/*
jq-aspect-ratio.js
Dependencies: jQuery
Designer: © Michael Schwarz, CyDot, info@cydot.de
Updated: 2025-04-08
*/

import inertResize from "../inert-events/inert-resize.js";
import { _is } from "../utils.js";

const VERSION = "1.0.0";
const NAME = "keep-aspect-ratio";
const INITAL_H = "initial-height";

let listening = false;
let $members = $();

$.fn.extend({
  keepAspectRatio: function (ratio) {
    const $els = $(this);
    let $el, currentHeight, currentRatio;

    $els.each(function () {
      $el = $(this).addClass(NAME);
      currentHeight = $el.css("height");
      currentRatio = $el.height() ? $el.width() / $el.height() : null;

      if (!$el.data(INITAL_H)) {
        $el.data(INITAL_H, currentHeight);
      }
      if (_is.numeric(ratio)) {
        ratio = Number(ratio);
        $el.data(NAME, ratio);
        $el.aspectRatio(ratio);
      } else if (!arguments.length || !$el.data(NAME)) {
        $el.data(NAME, currentRatio);
        if (currentRatio !== null) $el.aspectRatio(currentRatio);
      }
    });

    $members = $("." + NAME);
    activate();

    return $els;
  },

  freeAspectRatio: function () {
    const $els = $(this).filter("." + NAME);
    let $el;

    $els.each(function () {
      $el = $(this);
      $el.css("height", $el.data(INITAL_H));
      removeData($el);
    });

    $members = $("." + NAME);
    if (!$members.length) deactivate();

    return $(this);
  },

  aspectRatio: function (ratio) {
    const $els = $(this);
    let $el;

    if (!arguments.length) return $els.width() / $els.height();
    if (!_is.numeric(ratio)) return $els;

    ratio = Number(ratio);

    return $els.each(function () {
      $el = $(this);
      $el.height($el.width() / ratio);
    });
  },
});

$.aspectRatio = (function () {
  function register() {
    $("." + NAME + ", [data-aspect-ratio]").keepAspectRatio();
    return $.aspectRatio;
  }

  function update() {
    renderRatios();
    return $.aspectRatio;
  }

  function members() {
    return $members;
  }

  return {
    register: register,
    update: update,
    members: members,
  };
})();

// Utility methods -----------------

function activate() {
  if (!listening && $members.length) {
    listening = true;
    inertResize.addCallback(renderRatios);
  }
}

function deactivate() {
  if (listening) {
    listening = false;
    inertResize.removeCallback(renderRatios);
  }
}

function renderRatios(e) {
  let $el, ratio;

  $members.each(function () {
    $el = $(this);
    ratio = $el.data(NAME);

    if (_is.numeric(ratio)) $el.height($el.width() / ratio);
    else $el.css("height", $el.data(INITAL_H));
  });
}

function removeData($el) {
  $el.removeData(INITAL_H + " " + NAME).removeClass(NAME);
}
