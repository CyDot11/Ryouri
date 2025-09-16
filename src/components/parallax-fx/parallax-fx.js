/*
ParallaxFX
2023 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.06.13
*/

import "./parallax-fx.scss";
import { _math, _is, _load } from "../../js/utils.js";
import inertResize from "../../js/inert-events/inert-resize.js";

const VERSION = "2.1.0",
  $WIN = $(window),
  DEFAULT = {
    factor: 0.3,
    align: 0,
    cover: true,
    justify: 0,
  },
  CLASS_NAME = {
    container: "pfx-container",
    target: "pfx-target",
    cover: "pfx-cover",
    fixed: "pfx-fixed",
  },
  DATA_NAME = "parallax-fx";

class ParallaxFX_Class {
  constructor($target, options) {
    this._$target = $target.addClass(CLASS_NAME.target);
    this._$container = this._$target.parent().addClass(CLASS_NAME.container);
    this._aspectRatio = this._$target.width() / this._$target.height();
    this._tagName = this._$target[0].tagName.toLowerCase();

    this._M = this._$container.height();
    this._T = this._$container.offset().top;
    this._V = $WIN.height();
    this._S = $WIN.scrollTop();
    this._D = this._V - this._M;
    this._H = this._M + this._factor * this._D;
    this._W = this._H * this._aspectRatio;
    this._finalH = this._H;
    this._finalW = this._W;

    // 0 = no effect (static), 1 = full effect (fixed)
    this._factor = 0;

    this._overhang = 0;
    this._offset = 0;
    // -1 to 1, -1 = top, 0 = middle, 1 = bottom
    this._align = 0;

    this._contW = this._$container.width();
    this._justify = 0;

    this._active = false;
    this._listeningResize = false;
    this._listeningScroll = false;

    this._$container.data(DATA_NAME, this);
    this._init({ ...DEFAULT, ...options });
  }

  get container() {
    return this._$container[0];
  }

  get target() {
    return this._$target[0];
  }

  set cover(boolean) {
    boolean = !!boolean;
    if (this._cover !== boolean) {
      this._cover = boolean;
      if (this._cover) this._$target.addClass(CLASS_NAME.cover);
      else this._$target.removeClass(CLASS_NAME.cover);
    }
  }

  get factor() {
    return this._factor;
  }

  set factor(nr) {
    if (!_is.numeric(nr)) {
      console.error("TypeError. ParallaxFx set factor: value is not numeric");
    }
    nr = _math.clip(Number(nr), 0, 1);
    if (this._factor !== nr) {
      this._factor = nr;
      if (nr === 0) this.deactivate();
      else this.activate();
    }
  }

  get align() {
    return this._align;
  }

  set align(nr) {
    if (!_is.numeric(nr)) {
      console.error("TypeError. ParallaxFx set align: value is not numeric");
    }
    nr = _math.clip(Number(nr), -1, 1);
    if (this._align !== nr) {
      this._align = nr;
      this._size();
      if (this._active) this._position();
      else this.alignFixed();
    }
  }

  activate() {
    if (this._active) return this;
    this.adjust();
    this._listenScroll();
    this._listenResize();
    this._active = true;
    return this;
  }

  deactivate() {
    if (!this._active) return this;
    this._stopListeningScroll();
    this._stopListeningResize();
    this.alignFixed();
    this._active = false;
    return this;
  }

  adjust() {
    this._size();
    this._position();
    return this;
  }

  alignFixed() {
    const d = ((this._finalH - this._M) / 2) * (this._align - 1);
    this._$target.css("top", d + "px");
    return this;
  }

  get justify() {
    return this._justify;
  }
  // @param factor: -1 to 1, -1 = left, 0 = center, 1 = right
  set justify(factor = 0) {
    this._justify = _math.clip(Number(factor), -1, 1);
    const pc = (factor + 1) * 50;
    this._$target.css({
      left: pc + "%",
      transform: "translateX(-" + pc + "%)",
    });
  }

  _measure() {
    this._M = this._$container.height();
    this._T = this._$container.offset().top;
    this._V = $WIN.height();
    this._S = $WIN.scrollTop();
    this._D = this._V - this._M;
    this._H = this._M + this._factor * this._D;
    this._W = this._H * this._aspectRatio;

    this._finalH = this._H;
    this._finalW = this._W;

    this._contW = this._$container.width();
    this._overhang = 0;
    this._offset = 0;
  }

  _size() {
    this._measure();

    if (this._cover) {
      if (this._W < this._contW) {
        this._finalW = this._contW;
        this._finalH = this._finalW / this._aspectRatio;
        this._overhang = this._finalH - this._H;
        this._offset = (this._overhang / 2) * (this._align - 1);
      }
      this.justify = this._justify;
    }

    this._$target.css({
      height: this._finalH + "px",
      width: this._finalW + "px",
    });
  }

  _position() {
    const p = ($WIN.scrollTop() - this._T) * this._factor + this._offset;
    this._$target.css("top", p + "px");
  }

  _init(opts) {
    opts = { ...DEFAULT, ...opts };
    this._onResize = this._onResize.bind(this);
    this._onScroll = this._onScroll.bind(this);

    this.cover = opts.cover;
    this.factor = opts.factor;
    this.align = opts.align;
    this.justify = opts.justify;
  }

  _onResize(e) {
    this.adjust();
  }

  _onScroll(e) {
    this._position();
  }

  _listenResize() {
    if (!this._cover || this._listeningResize) return;
    inertResize.addCallback(this._onResize);
    this._listeningResize = true;
  }

  _stopListeningResize() {
    if (!this._listeningResize) return;
    inertResize.removeCallback(this._onResize);
    this._listeningResize = false;
  }

  _listenScroll() {
    if (this._listeningScroll) return;
    $WIN.on("scroll", this._onScroll);
    this._listeningScroll = true;
  }

  _stopListeningScroll() {
    if (!this._listeningScroll) return;
    $WIN.off("scroll", this._onScroll);
    this._listeningScroll = false;
  }
}

function ParallaxFX(selector, options) {
  const $target = $($(selector)[0]);

  if ($target.length === 0) {
    console.error("ParallaxFX: Target not found", selector);
    return null;
  }
  if ($target.data(DATA_NAME)) {
    console.warn("ParallaxFX: Target already initialized", selector);
    return $target.data(DATA_NAME);
  }
  if ($target[0].tagName.toLowerCase() === "img") {
    _load
      .image($target[0].src)
      .then(() => {
        return new ParallaxFX_Class($target, options);
      })
      .catch((err) => {
        console.error("ParallaxFX: Image load error", err);
        return null;
      });
  } else return new ParallaxFX_Class($target, options);
}

export default ParallaxFX;
