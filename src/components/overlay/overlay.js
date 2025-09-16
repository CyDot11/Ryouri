/*
Overlay
2022 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.04.09
*/

import "./overlay.scss";
import "../../js/jq/jq-class-transition.js";
import { _is } from "../../js/utils.js";
import Scroll from "../../js/scroll/scroll-controller.js";

const VERSION = "1.1.1",
  NAME = "Overlay",
  CLASS_NAME = {
    main: "overlay",
    active: "active",
    registered: "overlay-registered",
  },
  SELECTOR = {
    main: "." + CLASS_NAME.main,
    active: "." + CLASS_NAME.active,
  },
  DEFAULT = {
    lock: true,
    autoHide: true,
    delay: 220,
  };

let instanceCount = 0;

class Overlay_Class {
  // @ params options keys: lock, autoHide, delay, callback
  constructor(parentSelector, options) {
    options = { ...DEFAULT, ...options };
    instanceCount++;

    this._$parent = $(parentSelector).eq(0);
    this._$element = this._preprocessElement();

    this._lock = options.lock;
    this._locked = false;
    this._autoHide = options.autoHide;
    this._delay = options.delay;
    this._active = false;
    this._listening = false;
    this._callbacks = new Set();
    this._fire = this._fire.bind(this);

    this.onClick(options.callback);
  }

  // Public methods -----------------------------------

  lock(boolean) {
    if (!arguments.length) return this._lock;
    if (typeof boolean === "boolean") this._lock = !!boolean;

    return this;
  }

  autoHide(delay) {
    if (!arguments.length) this._autoHide = true;
    else if (typeof delay === "boolean") this._autoHide = !!delay;
    else if (_is.numeric(delay)) {
      delay = Number(delay);
      this._autoHide = true;
    }

    return this;
  }

  show() {
    if (this._active) return this;

    this._$element.classTransition(CLASS_NAME.active, "block");

    if (this._lock) this._disableScroll();
    this._listen();

    this._active = true;

    return this;
  }

  hide() {
    if (!this._active) return this;

    this._stopListening();
    this._enableScroll();

    this._$element.classTransition(CLASS_NAME.active, "none");
    this._active = false;

    return this;
  }

  onClick(callback) {
    if (typeof callback === "function") {
      this._callbacks.add(callback);
    }

    return this;
  }

  offClick(callback) {
    if (!arguments.length) this._callbacks.clear();
    else if (typeof callback === "function") this._callbacks.delete(callback);
    if (!this._callbacks.size) this._stopListening();

    return this;
  }

  // Support -------------------------------------------

  _listen() {
    if (this._callbacks.size && !this._listening) {
      this._$element.on("click", this._fire);
      this._listening = true;
    }
  }

  _stopListening() {
    if (this._listening) {
      this._$element.off("click", this._fire);
      this._listening = false;
    }
  }

  _fire(e) {
    this._callbacks.forEach((fn) => fn(e));

    if (this._autoHide) {
      this._stopListening();
      setTimeout(() => this.hide(), this._delay);
    }
  }

  _disableScroll() {
    if (!this._locked) {
      Scroll.disable();
      this._locked = true;
    }
  }

  _enableScroll() {
    if (this._locked) {
      Scroll.enable();
      this._locked = false;
    }
  }

  _preprocessElement() {
    this._$element = this._$parent.children(SELECTOR.main).eq(0);

    if (!this._$element.length) {
      this._$element = $("<div>")
        .addClass(CLASS_NAME.main)
        .appendTo(this._$parent);
    }

    this._$element[0].id = this._$element[0].id || NAME + "-" + instanceCount;
    this._$element.addClass(CLASS_NAME.registered).data(CLASS_NAME.main, this);

    return this._$element;
  }
}

function Overlay(parentSelector = "body", options) {
  const parent = $(parentSelector)[0];
  if (!parent) {
    throw new Error(
      'Overlay: parentSelector "' +
        parentSelector +
        '" does not select an element',
    );
    return null;
  }
  const $overlay = $(parent).children(CLASS_NAME.registered);

  return $overlay.length
    ? $overlay.data(CLASS_NAME.main)
    : new Overlay_Class(parent, options);
}

export default Overlay;
