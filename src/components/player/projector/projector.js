import ProjectorPlayer from "./projector-player.js";
import Indicators from "../../button/indicators/indicators.js";
import DirectionalPointer from "../directional-pointer/directional-pointer.js";
import Touchable from "../../touch/touchable.js";
import { SELECTOR, UI_DEFAULT } from "./projector-params.js";
import { _is, _sup, _obj } from "../../../js/utils.js";

const VERSION = "1.1.1";
const NAME = "ProjectorUI";

const $WIN = $(window);

class ProjectorUI extends ProjectorPlayer {
  constructor(selector, options = {}) {
    super(selector, options);
    this._bindUIHandlers();

    this._pointer = null;
    if (_sup.pointer) this._enablePointer();

    this._touches = null;
    if (_sup.touch) this._initTouches();

    this._keys = null;
    // arrow left and right
    this._keyCodePrevious = 37;
    this._keyCodeNext = 39;

    const params = _obj.matchedParametersOf(
      Object.keys(UI_DEFAULT),
      options,
      this._$container.data(),
      UI_DEFAULT,
    );
    for (const prop in params) {
      if (params[prop] !== undefined) this[prop] = params[prop];
    }
  }

  get indicators() {
    return this._indicators;
  }

  // @param value: 'none' or false, 'append', 'after' or container element
  set indicators(value) {
    if (!value || value === "none") {
      if (this._indicators) $(this._indicators.container).remove();
      this._indicators = null;
    } else if (!this._indicators) {
      this._indicators = new Indicators($("<div>"), this.size);
      const $ind = $(this._indicators.container);

      if (value === "append") $ind.appendTo(this._$container);
      else if (value === "after") $ind.insertAfter(this._$container);
      else if (_is.htmlElement(value)) $ind.appendTo($(value));
      else {
        console.error("TypeError. Indicators argument: " + value);
        $ind.appendTo(this._$container);
      }
      this._indicators.addCallback(this._handleIndicator);
    }
  }

  set customCursor(boolean) {
    if (this._pointer) this._pointer.customCursor = boolean;
  }

  get tap() {
    return _sup.touch ? this._touches.enabled("tap") : false;
  }

  set tap(boolean) {
    if (!_sup.touch) return;
    if (boolean === false) this._touches.disable("tap");
    else if (boolean === true || !arguments.length) this._touches.enable("tap");
  }

  get swipe() {
    return _sup.touch ? this._touches.enabled("swipe") : false;
  }

  set swipe(boolean) {
    if (!_sup.touch) return;
    if (boolean === false) this._touches.disable("swipe");
    else if (boolean === true || !arguments.length)
      this._touches.enable("swipe");
  }

  get keys() {
    return !!this._keys;
  }

  set keys(boolean) {
    if (boolean === true && !this._keys) {
      this._keys = true;
      $WIN.on("keyup", this._handleKey);
    } else if (boolean === false && this._keys) {
      this._keys = false;
      $WIN.off("keyup", this._handleKey);
    }
  }

  // UI handler -----------------------------

  _handlePointer(e) {
    this._checkUserInterference();
    this[e.direction]();
  }

  _handleSwipe(e) {
    this._checkUserInterference();

    const dir = e.offsetDirection;

    if (dir === 2) this.next();
    else if (dir === 4) this.previous();
    else this._userInterference = false;
  }

  _handleTap(e) {
    this._checkUserInterference();

    const center = this._$container.width() / 2;
    const x = e.srcEvent.offsetX;
    const y = e.srcEvent.offsetY;

    if (x < center) this.next();
    else if (x > center) this.previous();
    else this._userInterference = false;
  }

  _handleIndicator(e) {
    this._checkUserInterference();
    this.to(e.index);
  }

  _handleKey(e) {
    this._checkUserInterference();

    switch (e.originalEvent.keyCode) {
      case this._keyCodePrevious:
        this.previous();
        break;
      case this._keyCodeNext:
        this.next();
        break;
      default:
        this._userInterference = false;
    }
    e.preventDefault();
  }

  // ----------------------------------

  _checkUserInterference() {
    if (this._autoplay) {
      this._userInterference = true;
      this.pause();
    }
  }

  _enablePointer() {
    this._pointer = new DirectionalPointer(this._$container);
    this._pointer.on(this._handlePointer).enable();
  }

  _initTouches() {
    this._touches = new Touchable(this._$container);
    this._touches.on("tap", this._handleTap);
    this._touches.on("swipe", this._handleSwipe);
  }

  _bindUIHandlers() {
    this._handlePointer = this._handlePointer.bind(this);
    this._handleSwipe = this._handleSwipe.bind(this);
    this._handleTap = this._handleTap.bind(this);
    this._handleIndicator = this._handleIndicator.bind(this);
    this._handleKey = this._handleKey.bind(this);
  }
}

const ProjectorInstances = new Map();

function Projector(selector, options) {
  const container = $(selector)[0];
  let instance = ProjectorInstances.get(container);

  if (!instance) {
    instance = new ProjectorUI(selector, options);
    ProjectorInstances.set(container, instance);
  }
  return instance;
}

Projector.register = function (options) {
  $(SELECTOR("projector"))
    .not(SELECTOR("registered"))
    .each(function (e, i) {
      Projector(this, options);
    });
};

export default Projector;
