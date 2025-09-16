/*
scrollFx
2021 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.04.17
*/

/*
Usage:

html:
<button data-scroll-fx="to:#Section-2,duration:220">Section-2</button>
<button data-scroll-fx="to:#Section-2,speed:3.5">Section-2</button>
<button data-scroll-fx="by:400">Section-2</button>

js:
import ScrollFx from './js/fx/scroll-fx.js'

const $registered = $ScrollFx.register(null, {callback:callback})

const sfx1 = new ScrollFx('#Responsive-Grid-Section', 220, callback)
const sfx1 = new ScrollFx('#Responsive-Grid-Section', callback)
const sfx1 = new ScrollFx({to:'#Responsive-Grid-Section', duration:220, callback:callback})

setTimeout(() => {sfx1.scroll()}, 2000)
*/

import { _is, _to } from "../utils.js";
import CustomButton from "../../components/button/custom-button/custom-button.js";

const VERSION = "1.1.0";
const CLASS_NAME = {
  main: "scroll-fx",
  registered: "sfx-registered",
};
const DATA_NAME = "scroll-fx";
const EVENT_TYPE = "scrollFx";
const DEFAULTS = {
  to: null, // element, selector (string) or position (px)
  by: null,
  useBy: false,
  offset: 0,

  duration: 240, // ms
  speed: null, // px/ms
  useSpeed: false,
  easing: "easeOutSine",

  scrollport: "body, html",
  viewport: window,
  callback: null,
};

class ScrollFx {
  constructor(opts_or_trg, duration, callback) {
    this._options = setup.apply(null, arguments);
    this._paused = false;
  }

  get options() {
    return { ...this._options };
  }

  get target() {
    return this._options.target || this._options.to;
  }

  set callback(callback) {
    this._options.callback = callback;
  }

  set speed(speed) {
    this._options.speed = speed;
    this._options.useSpeed = true;
  }

  set duration(duration) {
    this._options.duration = this.duration;
    this._options.useSpeed = false;
  }

  scroll() {
    if (!this._paused) {
      scroll(this.options);
    }
    return this;
  }

  pause() {
    this._paused = true;
    return this;
  }

  resume() {
    this._paused = false;
    return this;
  }

  static register(selector, options) {
    return register.apply(null, arguments);
  }
}

function scroll(opts) {
  calculate(opts);

  opts.$scrollport.stop().animate(
    {
      scrollTop: opts.to,
    },
    opts.duration,
    opts.easing,
    (e) => {
      if (typeof opts.callback === "function") {
        opts.type = EVENT_TYPE;
        opts.jqEvent = e;
        opts.callback(opts);
        opts.$scrollport.stop();
      }
    },
  );
}

function register(selector, options = {}) {
  if (!selector) selector = "[data-" + DATA_NAME + "]";

  const $registered = $(selector).not("." + CLASS_NAME.registered);
  $registered.each((i, el) => {
    const $el = $(el);
    const data = _to.dataObject($el.data(DATA_NAME));
    data.trigger = el;
    const sfxInst = new ScrollFx(Object.assign(data, options));

    $el
      .addClass(CLASS_NAME.main)
      .addClass(CLASS_NAME.registered)
      .data(DATA_NAME, sfxInst);

    const cb = $el.data(CustomButton.DATA.instance) || new CustomButton(el);
    cb.addCallback(() => {
      sfxInst.scroll();
    });
  });
  return $registered;
}

function setup(opts_or_trg, duration, callback) {
  if (!_is.plainObject(opts_or_trg)) {
    opts_or_trg = { to: opts_or_trg };
    if (typeof duration === "function") opts_or_trg.callback = duration;
    else {
      if (_is.numeric(duration)) opts_or_trg.duration = Number(duration);
      if (typeof callback === "function") opts_or_trg.callback = callback;
    }
  }
  const opts = { ...DEFAULTS, ...opts_or_trg };

  opts.trigger = opts.trigger || null;

  opts.$scrollport = $(opts.scrollport);
  const sp0 = opts.$scrollport[0];
  if (sp0 !== $("body")[0] && sp0 !== $("html")[0]) {
    opts.viewport = opts.scrollport;
  }

  if (opts.to === null && opts.by) opts.useBy = true;
  else if (_is.numeric(opts.to)) opts.to = Number(opts.to);
  else {
    const $trg = $(opts.scrollport).find(opts.to);
    if (_is.htmlElement($trg[0])) opts.target = $trg[0];
    else {
      console.error(
        'scrollFx target "' + opts.to + '" is not a descendant of scrollport',
      );
      opts.target = false;
      opts.useBy = true;
      opts.by = 0;
    }
  }

  if (opts.speed) opts.useSpeed = true;

  return opts;
}

function calculate(opts) {
  opts.max = opts.$scrollport[0].scrollHeight - $(opts.viewport).outerHeight();
  opts.from = $(opts.viewport).scrollTop();

  if (opts.useBy) opts.to = opts.from + opts.by;
  else if (opts.target) calculateTarget(opts);

  opts.to += opts.offset;
  if (opts.to > opts.max) opts.to = opts.max;
  opts.by = opts.to - opts.from;

  if (opts.useSpeed) opts.duration = Math.abs(opts.by) / opts.speed;
  else opts.speed = Math.abs(opts.by) / opts.duration;
}

function calculateTarget(opts) {
  const portOffset = opts.$scrollport.offset().top;
  opts.to = $(opts.target).offset().top - portOffset;
}

export default ScrollFx;
