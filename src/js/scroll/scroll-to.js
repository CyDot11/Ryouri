/*
scrollTo
2025 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.04.17
*/

/*
Usage:

<button data-scroll-to="to:#Section-2,duration:220">Section-2</button>

import scrollTo from './scroll-to.js'

const $registered = scrollTo.register(null, {callback:callback})


scrollTo('#Section-2', 220, callback)

*/

import "../jq/jq-easings.js";
import { _is, _to } from "../utils.js";
import CustomButton from "../../components/button/custom-button.js";

const VERSION = "1.1.0";
const CLASS_NAME = {
  main: "scroll-to",
  registered: "st-registered",
};
const DEFAULT = {
  duration: 240,
  easing: "easeOutSine",
};
const DATA_NAME = "scroll-to";
const $scrollport = $("body, html");
const $win = $(window);

function scrollTo(to, duration, callback) {
  let target = null;
  if (!_is.numeric(to)) {
    target = $(to);
    to = target.offset().top;
  }
  duration = duration || DEFAULT.duration;
  const max = $scrollport.outerHeight() - $win.height();
  const from = $win.scrollTop();
  if (to > max) to = max;

  $scrollport.stop().animate(
    {
      scrollTop: to,
    },
    duration,
    DEFAULT.easing,
    () => {
      if (typeof callback === "function") {
        callback({
          to: to,
          from: from,
          duration: duration,
          type: "scrollTo",
          scrollport: $scrollport[0],
          viewport: $win[0],
          target: target[0],
        });
        $scrollport.stop();
      }
    },
  );
}

scrollTo.register = function (selector, options = {}) {
  if (!selector) selector = "[data-" + DATA_NAME + "]";

  const $registered = $(selector).not("." + CLASS_NAME.registered);
  $registered.each((i, el) => {
    const $el = $(el);
    const opts = _to.dataObject($el.data(DATA_NAME));
    Object.assign(opts, options);

    $el
      .addClass(CLASS_NAME.main)
      .addClass(CLASS_NAME.registered)
      .data(DATA_NAME, opts);

    const cb = $el.data(CustomButton.DATA.instance) || new CustomButton(el);
    cb.addCallback(() => {
      scrollTo(opts.to, opts.duration, opts.callback);
    });
  });
  return $registered;
};

export default scrollTo;
