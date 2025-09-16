/*
InertOrientation
2023 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.03.24
*/

import inertResize from "./inert-resize.js";

const VERSION = "1.2.0",
  $WIN = $(window);

class InertOrientation {
  constructor() {
    this._callbacks = new Set();
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

  addCallback(callback) {
    if (typeof callback !== "function") {
      console.error(
        'TypeError: InertOrientation "addCallback": argument is not a function',
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
        'TypeError: InertOrientation "removeCallback": argument is not a function',
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
    this._reference = this._getOrientation();
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

  _check(e) {
    e.orientation = this._getOrientation(e.aspectRatio);
    if (e.orientation !== this._reference) {
      this._reference = e.orientation;
      this._run(e);
    }
  }

  _run(e) {
    e.count = ++this._count;
    e.type = "inertOrientation";
    this._callbacks.forEach((fn) => {
      fn(e);
    });
  }

  _getOrientation(aspectRatio) {
    aspectRatio = aspectRatio || $WIN.width() / $WIN.height();
    return aspectRatio > 1 ? "landscape" : "portrait";
  }
}

const inertOrientation = new InertOrientation();

export default inertOrientation;
