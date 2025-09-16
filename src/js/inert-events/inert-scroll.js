/*
InertScroll
2023 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.03.22
*/

const VERSION = "1.2.0",
  $WIN = $(window),
  DEFAULT = {
    inertia: 150,
  };

class InertScroll {
  constructor() {
    this._callbacks = new Set();
    this._inertia = DEFAULT.inertia;
    this._timerID = null;
    this._cached = null;
    this._reference = 0;
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
        'TypeError: InertScroll "addCallback": argument is not a function',
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
        'TypeError: InertScroll "removeCallback": argument is not a function',
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
    $WIN.on("scroll", this._observe);
    this._reference = $WIN.scrollTop();
    this._listening = true;
    return this;
  }

  stopListening() {
    if (!this._listening) return this;
    $WIN.off("scroll", this._observe);
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
    this._cached = null;
  }

  _observe(e) {
    clearTimeout(this._timerID);
    this._cached = $WIN.scrollTop();
    this._timerID = setTimeout(() => this._check(e), this._inertia);
  }

  _check(e) {
    if ($WIN.scrollTop() === this._cached) {
      this._run(e);
      this._reference = this._cached;
    }
  }

  _run(e) {
    const evtObj = {
      jqEvent: e,
      type: "inertScroll",
      scrollTop: this._cached,
      scrollBy: this._cached - this._reference,
      count: ++this._count,
    };
    this._callbacks.forEach((fn) => {
      fn(Object.assign({}, evtObj));
    });
  }
}

const inertScroll = new InertScroll();

export default inertScroll;
