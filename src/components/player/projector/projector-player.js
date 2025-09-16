import ProjectorLayout from "./projector-layout.js";
import Playlist from "../playlist.js";
import { CLASS, PLAYER_DEFAULT } from "./projector-params.js";
import { _is, _obj } from "../../../js/utils.js";

const VERSION = "1.1.1";
const NAME = "ProjectorPlayer";

const TRANSITION_MODES = ["slide", "fade", "slide-vertical"];

class ProjectorPlayer extends ProjectorLayout {
  constructor(selector, options = {}) {
    super(selector, options);

    this._mode = null;
    this._direction = 1;
    this._autoplay = false;
    this._autoplayDelay = 4;
    this._autoplayID = null;

    this._startIndex = 0;
    this._activeIndex = null;
    this._nextIndex = null;

    this._$activeItem = null;
    this._$nextItem = null;

    this._dir_class = null;
    this._next_dir_class = null;

    this._delta = 0;
    this._transitionDelay = 20;
    this._transitionDelayID = null;
    this._transitioning = false;
    this._waiting = false;
    this._paused = false;

    this._playlist = null;
    this._indicators = null;

    this._callbacks = {
      playlist: new Set(),
      play: new Set(),
      start: new Set(),
      end: new Set(),
    };
    this._resolveEnd = null;
    this._userInterference = false;

    this._bindPlayerHandlers();

    const params = _obj.matchedParametersOf(
      Object.keys(PLAYER_DEFAULT),
      options,
      this._$container.data(),
      PLAYER_DEFAULT,
    );
    for (const prop in params) {
      if (params[prop] !== undefined) this[prop] = params[prop];
    }
  }

  get index() {
    return this._activeIndex;
  }

  get mode() {
    return this._mode;
  }

  set mode(name) {
    if (this._mode !== name && TRANSITION_MODES.includes(name)) {
      this.pause();
      if (this._transitioning) {
        this._promiseEnd().then(() => {
          this._setMode(name);
          this.resume(true);
        });
      } else {
        this._setMode(name);
        this.resume(true);
      }
    }
  }

  set direction(int) {
    if (_is.numeric(int)) {
      int = Number(int);
      this._direction = int / Math.abs(int);
    }
  }

  get autoplay() {
    return this._autoplay;
  }

  // @param value: boolean or number (delay in seconds)
  set autoplay(value) {
    if (value === false) {
      this._autoplay = false;
    } else if (value === true) {
      this._autoplay = true;
      this.play(this._autoplayDelay);
    } else if (_is.numeric(value)) {
      this._autoplay = true;
      this._autoplayDelay = Number(value);
      this.play(value);
    } else {
      console.error(
        "TypeError. Projector autoplay argument must be numeric or boolean. " +
          value,
      );
    }
  }

  get playlist() {
    return this._playlist;
  }

  set playlist(data) {
    if (this._transitioning) {
      this.pause();
      this._promiseEnd().then((e) => this._requestPlaylist(data));
    } else this._requestPlaylist(data);
  }

  // Controls -----------------------

  next() {
    return this.by(1);
  }

  previous() {
    return this.by(-1);
  }

  to(index) {
    return this.by(index - this._activeIndex);
  }

  by(delta) {
    this._delta = delta % this.size;
    if (!this._delta || this._transitioning || this._waiting) return this;

    this._nextIndex = (this._activeIndex + this._delta) % this.size;
    this._waiting = true;

    this._playlist
      .preload(this._nextIndex)
      .then((item) => this._handleItemLoad(item))
      .then((item) => this._start())
      .catch((item) => this._handleItemLoadError(item));

    return this;
  }

  // Autoplay -----------------------------

  play(value) {
    if (!this._playlist) return this;
    if (value === "toggle" && this._autoplay) return this.stop();

    this._autoplay = true;
    this._paused = false;

    if (_is.numeric(value)) {
      this._autoplayDelay = Number(value);
      this._delayNext();
    } else this.by(this._direction);

    this._fire("play");
    return this;
  }

  stop() {
    if (this._autoplayID) {
      clearTimeout(this._autoplayID);
      this._autoplayID = null;
    }
    this._autoplay = false;
    this._paused = false;

    return this;
  }

  pause() {
    if (!this._autoplay) return this;
    this._paused = true;

    if (this._autoplayID) {
      clearTimeout(this._autoplayID);
      this._autoplayID = null;
    }
    return this;
  }

  resume(delayed) {
    if (!this._autoplay) return this;
    this._paused = false;

    if (delayed) this._delayNext();
    else this.by(this._direction);

    this._fire("play");
    return this;
  }

  // Engine -----------------------

  _start() {
    this._waiting = false;
    this._transitioning = true;

    if (this._delta > 0) {
      this._dir_class = CLASS.left;
      this._next_dir_class = CLASS.next;
    } else {
      this._dir_class = CLASS.right;
      this._next_dir_class = CLASS.prev;
    }

    this._$nextItem = this.$items(this._nextIndex)
      .addClass(this._next_dir_class)
      .one("transitionend", this._end)
      .one("transitioncancel", this._cancel);

    this._transitionDelayID = setTimeout(() => {
      this._run();
    }, this._transitionDelay);
  }

  _run() {
    this._$activeItem.addClass(this._dir_class);
    this._$nextItem.removeClass(this._next_dir_class).addClass(CLASS.active);
    this._fire("start");
  }

  _end(e) {
    this._$nextItem.off("transitioncancel");
    this._$activeItem.removeClass(this._dir_class).removeClass(CLASS.active);
    this._$activeItem = this.$items(this._nextIndex).addClass(CLASS.active);
    this._activeIndex = this._nextIndex;
    this._transitioning = false;
    this._transitionDelayID = null;

    if (this._indicators) this._indicators.select(this._activeIndex);
    this._fire("end");

    if (this._userInterference) {
      this._userInterference = false;
      this.resume(true);
    } else if (this._autoplay && !this._paused) this._delayNext();
  }

  _delayNext(sec) {
    clearTimeout(this._autoplayID);
    sec = typeof sec === "number" ? sec : this._autoplayDelay;
    this._autoplayID = setTimeout(() => this.by(this._direction), sec * 1000);
  }

  _cancelTransitionDelay() {
    if (this._transitionDelayID) {
      clearTimeout(this._transitionDelayID);
      this._transitionDelayID = null;
      this._cancel();
    }
  }

  _cancel(e) {
    this._$activeItem.removeClass(this._dir_class);

    this._$nextItem
      .removeClass(CLASS.active)
      .removeClass(this._next_dir_class)
      .off("transitionend transitioncancel");

    this._waiting = false;
    this._transitioning = false;
  }

  _reset() {
    this._nextIndex = this._activeIndex = this._startIndex;
    this._$activeItem = this.$items(this._activeIndex).addClass(CLASS.active);
  }

  // @param name: 'fade', 'slide', 'slide-vertical'
  _setMode(name) {
    if (name === "fade") {
      this._$container.removeClass(CLASS.slideMode);
      this._$container.removeClass(CLASS.slideVerticalMode);
      this._$container.addClass(CLASS.fadeMode);
    } else if (name.startsWith("slide")) {
      this._$container.removeClass(CLASS.fadeMode);
      this._$container.addClass(CLASS.slideMode);

      if (name.endsWith("vertical")) {
        this._$container.addClass(CLASS.slideVerticalMode);
      } else this._$container.removeClass(CLASS.slideVerticalMode);
    }

    this._mode = name;
  }

  // Playlist ----------------------------

  _requestPlaylist(data) {
    let playlist;
    if (data instanceof Playlist) playlist = data;
    else playlist = new Playlist(data);

    playlist.initialRequest
      .then(() => {
        this._playlist = playlist;
        this.renewStack(playlist.size);
        this._fire("playlist");
        if (this._indicators) this._indicators.size = this.size;
        this._playlist.onItemLoad((e) => this._handleItemLoad(e.item));
        this._playlist
          .preload(this._startIndex)
          .then((item) => {
            this._reset();
            this._handleItemLoad(item);
            if (this._indicators) this._indicators.select(this._startIndex);
            if (this._autoplay) this.play(this._autoplayDelay);
          })
          .catch((item) => this._handleItemLoadError(item));
      })
      .catch(() => {});
  }

  _handleItemLoad(item) {
    if (!this.isReady(item.index)) {
      this.applyImage(item.index, item.url, item.data);
    }
    return item;
  }

  _handleItemLoadError(item) {}

  // Events -----------------------------

  onplaylist(callback) {
    return this.on("playlist", callback);
  }

  onplay(callback) {
    return this.on("play", callback);
  }

  onstart(callback) {
    return this.on("start", callback);
  }

  onend(callback) {
    return this.on("end", callback);
  }

  on(type, callback) {
    const cbSet = this._callbacks[type];
    if (cbSet && typeof callback === "function") {
      cbSet.add(callback);
    }
    return this;
  }

  off(type, callback) {
    if (!arguments.length) {
      for (const prop in this._callbacks) this._callbacks[prop].clear();
    } else {
      const cbSet = this._callbacks[type];
      if (cbSet && cbSet.size) {
        if (arguments.length === 1) cbSet.clear();
        else cbSet.delete(callback);
      }
    }
    return this;
  }

  _fire(type) {
    this._callbacks[type].forEach((fn) => fn(this._eventObject(type)));

    if (type === "end" && this._resolveEnd) {
      this._resolveEnd(type);
      this._resolveEnd = null;
    }
  }

  _promiseEnd() {
    return new Promise((resolve) => (this._resolveEnd = resolve));
  }

  _eventObject(type) {
    return {
      type: "on" + type,
      instance: this,
      mode: this._mode,
      index: this._activeIndex,
    };
  }

  _bindPlayerHandlers() {
    //this._handleItemLoad = this._handleItemLoad.bind(this)
    //this._handleItemLoadError = this._handleItemLoadError.bind(this)
    this._end = this._end.bind(this);
    this._cancel = this._cancel.bind(this);
  }
}

export default ProjectorPlayer;
