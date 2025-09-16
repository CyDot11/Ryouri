/*
InertResize
2023 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.03.23
*/

const VERSION = "1.2.0",
  $WIN = $(window),
  DEFAULT = {
    inertia: 150,
  };

class InertResize {
  constructor() {
    this._callbacks = new Set();
    this._inertia = DEFAULT.inertia;
    this._timerID = null;
    this._cached = [];
    this._reference = [0, 0];
    this._count = 0;
    this._listening = false;
    this._paused = false;

    this._observe = this._observe.bind(this);
    this._check = this._check.bind(this);
  }

  get inertia() {
    return this._inertia;
  }

  set inertia(ms) {
    this._inertia = Number(ms);
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
        'TypeError: InertResize "addCallback": argument is not a function',
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
        'TypeError: InertResize "removeCallback": argument is not a function',
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
    $WIN.on("resize", this._observe);
    this._reference = [$WIN.width(), $WIN.height()];
    this._listening = true;
    return this;
  }

  stopListening() {
    if (!this._listening) return this;
    $WIN.off("resize", this._observe);
    this._reset();
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

  _reset() {
    clearTimeout(this._timerID);
    this._timerID = null;
    this._cached = [];
  }

  _observe(e) {
    clearTimeout(this._timerID);
    this._cached = [$WIN.width(), $WIN.height()];
    this._timerID = setTimeout(() => this._check(e), this._inertia);
  }

  _check(e) {
    if ($WIN.width() === this._cached[0] && $WIN.height() === this._cached[1]) {
      this._run(e);
      this._reference = this._cached;
    }
  }

  _run(e) {
    this._count++;
    this._callbacks.forEach((fn) => {
      fn({
        jqEvent: e,
        type: "inertResize",
        size: {
          width: this._cached[0],
          height: this._cached[1],
        },
        resizedBy: {
          width: this._cached[0] - this._reference[0],
          height: this._cached[1] - this._reference[1],
        },
        aspectRatio: this._cached[0] / this._cached[1],
        count: this._count,
      });
    });
  }
}

const inertResize = new InertResize();

export default inertResize;
