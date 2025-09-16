import { _math, _sup } from "../utils.js";

$.fn.extend({
  orientation: function () {
    var $el = $(this),
      ratio = $el.aspectRatio();
    return ratio === 1 ? "square" : ratio > 1 ? "landscape" : "portrait";
  },

  aspectRatio: function (decimals = 3) {
    var $el = $(this),
      ratio = $el.width() / $el.height();
    return ratio === 1 || ratio === Infinity
      ? ratio
      : _math.decimals(ratio, decimals);
  },

  // Allows for more elements to be seen as one
  // @ param tolerance (factor of element height):
  // value 0: the hole element must be visible; no tolerance
  // value 1: at least 1px must be visible; max tolerance
  inViewport: function (tolerance) {
    if (!arguments.length) tolerance = 1;

    var $e = $(this),
      $win = $(window),
      winH = $win.height(),
      scroll = $win.scrollTop(),
      at = 1,
      a = 100000,
      h = 0,
      bt = 0,
      b = 0;

    if ($e.length > 1) {
      $e.each(function () {
        $_e = $(this);
        at = $_e.offset().top;
        h = $_e.height();
        bt = at + h;

        if (at < a) a = at;
        if (bt > b) b = bt;
      });

      h = b - a;
    } else if ($e.length) {
      a = $e.offset().top;
      h = $e.height();
      b = a + h;
    } else return false;

    var offset = h * tolerance;

    return scroll < a + offset && scroll > b - winH - offset;
  },

  fullscreen: function () {
    var el = $(this)[0];

    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }

    return $(this);
  },
});

if (_sup.aspectRatio) {
  import("./jq-aspect-ratio.js").then(() => {});
} else {
  $.fn.extend({
    aspectRatio: function (ratio) {
      var $els = $(this),
        $el;

      if (!arguments.length) return $els.width() / $els.height();
      if (!_is.numeric(ratio)) return $els;

      ratio = Number(ratio);

      return $els.each(function () {
        $el = $(this);
        $el.height($el.width() / ratio);
      });
    },
  });
}
