/*
InertViewport
2023 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.03.25
*/

import inertScroll from "./inert-scroll.js";
import { _math, _is } from "../utils.js";

const VERSION = "1.2.0";
const DEFAULT = {
  tolerance: 1,
};

class InertViewport {
  constructor() {
    this._callbacks = new Set();
    this._scoped = new Set();
    this._inScope = new Set();
    this._outScope = new Set();
    this._tolerance = DEFAULT.tolerance;
    this._reference = null;
    this._count = 0;
    this._listening = false;
    this._paused = false;
    this._timerID = null;

    this._check = this._check.bind(this);
    this._init();
  }

  get size() {
    return this._callbacks.size;
  }

  get listening() {
    return this._listening;
  }

  get tolerance() {
    return this._tolerance;
  }

  set tolerance(factor) {
    this._tolerance = _math.clip(Number(factor), 0, 1);
  }

  addScope(selector) {
    if (!($(selector)[0] instanceof HTMLElement)) {
      console.error(
        'TypeError: InertViewport "addScope": argument does not select an element',
      );
    } else {
      $(selector).each((i, el) => {
        this._scoped.add(el);
      });
      this.listen();
    }
    return this;
  }

  removeScope(selector) {
    if (!arguments.length) this._scoped.clear();

    if (!($(selector)[0] instanceof HTMLElement)) {
      console.error(
        'TypeError: InertViewport "removeScope": argument does not select an element',
      );
    } else
      $(selector).each((i, el) => {
        this._scoped.delete(el);
      });
    if (!this._scoped.size) this.stopListening();
    return this;
  }

  addCallback(callback) {
    if (typeof callback !== "function") {
      console.error(
        'TypeError: InertViewport "addCallback": argument is not a function',
      );
    } else {
      this._callbacks.add(callback);
      this.listen();
    }
    return this;
  }

  removeCallback(callback) {
    if (!arguments.length) this._callbacks.clear();
    else if (typeof callback === "function") {
      this._callbacks.delete(callback);
    } else {
      console.error(
        'TypeError: InertViewport "removeCallback": argument is not a function',
      );
    }
    if (!this.size) this.stopListening();
    return this;
  }

  add(selector, callback) {
    if (arguments.length === 1) {
      if (typeof selector === "function") this.addCallback(selector);
      else this.addScope(selector);
    } else if (arguments.length >= 1) {
      if (selector) this.addScope(selector);
      if (callback) this.addCallback(callback);
    }
    return this;
  }

  remove(selector, callback) {
    if (arguments.length === 1) {
      if (typeof selector === "function") this.removeCallback(selector);
      else this.removeScope(selector);
    } else if (arguments.length > 1) {
      if (selector) this.removeScope(selector);
      if (callback) this.removeCallback(callback);
    } else {
      this.removeScope();
      this.removeCallback();
    }
    return this;
  }

  listen() {
    if (this._listening || this._paused || !this.size || !this._scoped.size)
      return this;
    inertScroll.addCallback(this._check);
    this._assignScoped();
    this._listening = true;
    return this;
  }

  stopListening() {
    if (!this._listening) return this;
    inertScroll.removeCallback(this._check);
    this._listening = false;
    return this;
  }

  pause() {
    this._paused = true;
    return this.stopListening();
  }

  resume() {
    this._paused = false;
    return this.listen();
  }

  _assignScoped() {
    this._scoped.forEach((el) => {
      if ($(el).inViewport(this._tolerance)) {
        this._outScope.delete(el);
        this._inScope.add(el);
      } else {
        this._inScope.delete(el);
        this._outScope.add(el);
      }
    });
  }

  _check(e) {
    if (this._timerID) {
      clearTimeout(this._timerID);
      this._timerID = null;
    }
    this._scoped.forEach((el) => {
      const wasInScope = this._inScope.has(el),
        isInScope = $(el).inViewport(this._tolerance);

      if (!wasInScope && isInScope) {
        const evtObj = { ...e };
        evtObj.type = "inertViewport";
        evtObj.element = el;
        evtObj.mode = "enter";

        this._outScope.delete(el);
        this._inScope.add(el);
        this._run(evtObj);
      } else if (wasInScope && !isInScope) {
        const evtObj = { ...e };
        evtObj.type = "inertViewport";
        evtObj.element = el;
        evtObj.mode = "leave";

        this._inScope.delete(el);
        this._outScope.add(el);
        this._run(evtObj);
      }
    });
  }

  _run(e) {
    e.count = ++this._count;
    this._callbacks.forEach((fn) => {
      fn(e);
    });
  }

  _init() {
    window.onload = (e) => {
      if (!this._count) {
        this._timerID = setTimeout(() => {
          this._assignScoped();
        }, 150);
      }
    };
  }
}

const inertViewport = new InertViewport();

export default inertViewport;
