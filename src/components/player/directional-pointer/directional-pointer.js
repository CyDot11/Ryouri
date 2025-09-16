/*
DirectionalPointer
2020 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.05.30
*/

import PointerLeft from "./pointerLeft.png";
import PointerRight from "./pointerRight.png";
//import inertResize from '../../../js/inert-events/inert-resize'

const VERSION = "1.3.1";
const $WIN = $(window);

class DirectionalPointer {
  constructor(selector) {
    this._$container = $($(selector)[0]);

    this._log = {
      delta: 0,
      lastPointX: 0,
      center: 0,
    };
    this._callbacks = new Set();
    this._enabled = false;
    this._customCursor = true;

    this._bindHandler();
  }

  // Public Interface ------------------------

  enable() {
    if (this.enabled) return this;

    this._$container
      .on("click", this._clickHandler)
      .on("mousemove", this._selectCursor);

    //inertResize.add(this._updateCenter)
    $WIN.on("resize", this._updateCenter);
    this._updateCenter();
    this._enabled = true;

    return this;
  }

  disable() {
    if (!this.enabled) return this;

    this._$container
      .off("click", this._clickHandler)
      .off("mousemove", this._selectCursor)
      .css("cursor", "default");

    //inertResize.remove(this._updateCenter)
    $WIN.off("resize", this._updateCenter);
    this._log.delta = 0;
    this._enabled = false;

    return this;
  }

  get enabled() {
    return this._enabled;
  }

  set customCursor(boolean) {
    this._customCursor = !!boolean;
  }

  on(callback) {
    this._callbacks.add(callback);
    return this;
  }

  off(callback) {
    if (!arguments.length) this._callbacks.clear();
    else this._callbacks.delete(callback);
    return this;
  }

  // Private Methods -------------------------

  _bindHandler() {
    this._clickHandler = this._clickHandler.bind(this);
    this._selectCursor = this._selectCursor.bind(this);
    this._updateCenter = this._updateCenter.bind(this);
  }

  _clickHandler(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const x = (this._log.lastPointX = e.originalEvent.offsetX);
    const y = e.originalEvent.offsetY;
    let dir;

    if (this._log.delta < 0) {
      dir = "previous";
    } else if (this._log.delta > 0) {
      dir = "next";
    }
    this._callbacks.forEach((fn) => fn(this._eventObj(x, y, dir)));
  }

  _eventObj(x, y, dir) {
    return {
      instance: this,
      delta: this._log.delta,
      direction: dir,
      type: "onDirectionalClick",
      x: x,
      y: y,
    };
  }

  _selectCursor(e) {
    const x = e.originalEvent.offsetX,
      d = this._log.delta,
      c = this._log.center;

    if (d >= 0 && x < c) {
      if (this._customCursor)
        this._$container.css(
          "cursor",
          "url(" + PointerLeft + ") 9 18, w-resize",
        );
      this._log.delta = -1;
    } else if (d <= 0 && x > c) {
      if (this._customCursor)
        this._$container.css(
          "cursor",
          "url(" + PointerRight + ") 27 18, e-resize",
        );
      this._log.delta = 1;
    }
  }

  _updateCenter(e) {
    this._log.center = this._$container.width() / 2;
  }
}

export default DirectionalPointer;
