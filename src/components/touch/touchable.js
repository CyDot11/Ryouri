/*
Touchable
2022 Michael Schwarz - cydot.de / grafic, web, media
Last update 2023.05.23
*/

import Hammmer from "hammerjs/hammer.js";

const VERSION = "0.5.0";
const NAME = "Touchable";

const Default = {
  mc: {
    enable: true,
  },
  tap: {
    enable: true,
    taps: 1,
    interval: 300,
    time: 250,
    threshold: 2,
    posThreshold: 10,
  },
  swipe: {
    enable: true,
    pointers: 1,
    treshold: 10,
    direction: Hammer.DIRECTION_HORIZONTAL,
    velocity: 0.3,
  },
};

const Gestures = ["tap", "swipe"];

const Direction = {
  horizontal: Hammer.DIRECTION_HORIZONTAL,
  left: Hammer.DIRECTION_LEFT,
  right: Hammer.DIRECTION_RIGHT,
  vertical: Hammer.DIRECTION_VERTICAL,
  up: Hammer.DIRECTION_UP,
  down: Hammer.DIRECTION_DOWN,
  all: Hammer.DIRECTION_ALL,
};

let count = 0;

function objectType(value) {
  return {}.toString.call(value).slice(8, -1).toLowerCase();
}

class Touchable {
  constructor(target, options = { swipe: true, tap: true }) {
    this._$target = $(target);

    if (objectType(options) !== "object") {
      options = { swipe: false, tap: false };
      throw new TypeError(
        "Touchable: second argument options is not an object",
      );
    }

    this._mc = new Hammer.Manager(this._$target[0], { ...Default.mc });
    this._swipe = new Hammer.Swipe({
      ...Default.swipe,
      ...{ enable: options.swipe !== false },
    });
    this._tap = new Hammer.Tap({
      ...Default.tap,
      ...{ enable: options.tap !== false },
    });

    this._mc.add(this._swipe);
    this._mc.add(this._tap);
  }

  get target() {
    return this._$target[0];
  }

  set(type, options) {
    if (Gestures.includes(type) && objectType(options) === "object") {
      if (options.direction && Direction.hasOwnProperty(options.direction)) {
        options.direction = Direction[options.direction];
      }
      this["_" + type].set(options);
    }

    return this;
  }

  enabled(type) {
    if (!arguments.length) {
      return this._mc.get("enabled");
    } else if (Gestures.includes(type)) {
      return this["_" + type].get("enabled");
    }

    return undefined;
  }

  enable(type) {
    if (!arguments.length) this._mc.set({ enable: true });
    else if (Gestures.includes(type)) this["_" + type].set({ enable: true });

    return this;
  }

  disable(type) {
    if (!arguments.length) this._mc.set({ enable: false });
    else if (Gestures.includes(type)) this["_" + type].set({ enable: false });

    return this;
  }

  on(type_cb, callback) {
    if (typeof type_cb === "function") {
      this._mc.on("tap", type_cb);
      this._mc.on("swipe", type_cb);
    } else if (Gestures.includes(type_cb) && typeof callback === "function") {
      this._mc.on(type_cb, callback);
    }

    return this;
  }

  off(type, callback) {
    if (!arguments.length) {
      this._mc.off("tap");
      this._mc.off("swipe");
    }
    if (Gestures.includes(type)) {
      if (arguments.length === 1) {
        this._mc.off(type);
      } else if (typeof callback === "function") {
        this._mc.off(type, callback);
      }
    }

    return this;
  }
}

export default Touchable;
