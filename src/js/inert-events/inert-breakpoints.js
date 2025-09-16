/*
InertResize
2023 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.03.25
*/

import inertResize from "./inert-resize.js";
import breakpoints from "../../js/breakpoints/breakpoints.js";

const VERSION = "1.2.0",
  $WIN = $(window);

class InertBreakpoints {
  constructor() {
    this._callbacks = new Set();
    this._breakpoints = [...breakpoints];
    this._reference = null;
    this._count = 0;
    this._listening = false;
    this._paused = false;

    this._check = this._check.bind(this);
  }

  get size() {
    return this._callbacks.size;
  }

  get listening() {
    return this._listening;
  }

  get breakpoints() {
    return [...this._breakpoints];
  }

  get breakpoint() {
    return this._reference;
  }

  addCallback(callback) {
    if (typeof callback !== "function") {
      console.error(
        'TypeError: InertBreakpoints "addCallback": argument is not a function',
      );
    } else {
      this._callbacks.add(callback);
      this.listen();
    }
    return this;
  }

  add(callback) {
    return this.addCallback(callback);
  }

  removeCallback(callback) {
    if (!arguments.length) this._callbacks.clear();
    else if (typeof callback === "function") {
      this._callbacks.delete(callback);
    } else {
      console.error(
        'TypeError: InertBreakpoints "removeCallback": argument is not a function',
      );
    }
    if (!this.size) this.stopListening();
    return this;
  }

  remove(callback) {
    this.removeCallback.call(arguments);
    return this;
  }

  listen() {
    if (this._listening || this._paused || !this.size) return this;
    inertResize.addCallback(this._check);
    this._reference = this._currentBreakpoint();
    this._listening = true;
    return this;
  }

  stopListening() {
    if (!this._listening) return this;
    inertResize.removeCallback(this._check);
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

  _currentBreakpoint() {
    const w = $WIN.width(),
      size = this._breakpoints.length;
    let index;

    for (let i = 0; i < size; i++) {
      if (w < this._breakpoints[i][1]) {
        index = i - 1;
        break;
      } else if (i === size - 1) index = i;
    }
    return {
      index: index,
      entry: this._breakpoints[index],
    };
  }

  _check(e) {
    const bp = this._currentBreakpoint();
    const deltaIndex = bp.index - this._reference.index;

    if (deltaIndex) {
      const newEvt = {
        type: "inertBreakpoint",
        breakpoint: bp.entry,
        breakpoints: this._breakpoints,
        name: bp.entry[0],
        minWidth: bp.entry[1],
        maxWidth: this._breakpoints[bp.index + 1][1] - 0.01,
        width: e.size.width,
        index: bp.index,
        change: deltaIndex,
        count: ++this._count,
      };
      this._run(e, newEvt);
      this._reference = bp;
    }
  }

  _run(e, newEvt) {
    this._callbacks.forEach((fn) => {
      fn({ ...e, ...newEvt });
    });
  }
}

const inertBreakpoints = new InertBreakpoints();

export default inertBreakpoints;
