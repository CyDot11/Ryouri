/*
CustomButton
2025 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.08.25
*/

import "./custom-button.scss";

const VERSION = "1.0.1";
const NAME = "CustomButton";

const CLASS = {
  main: "custom-button",
  selected: "selected",
  disabled: "disabled",
  registered: "cb-registered",
};

const DATA = {
  instance: CLASS.main,
  index: "cb-index",
};

let count = 0;

class CustomButton {
  constructor(selector, callback) {
    this._el = $(selector)[0];
    this._$el = $(this._el)
      .addClass(CLASS.main)
      .addClass(CLASS.registered)
      .data(DATA.instance, this)
      .vhover();
    if (this._el.tagName !== "BUTTON") {
      this._$el.attr("role", "button").attr("tabindex", "0");
    }
    this._vhover = true;
    count++;
    if (!this._el.id) this._el.id = "CustomButton_" + count;
    this._index = null;

    this._callbacks = new Set();
    this._listening = false;
    this._count = 0;
    this._callback = this._callback.bind(this);
    if (callback) this.addCallback(callback);
  }

  get element() {
    return this._el;
  }

  get index() {
    return this._index;
  }

  set index(int) {
    this._index = Number(int);
  }

  set vhover(boolean) {
    boolean = !!boolean;
    if (this._vhover !== boolean) {
      if (boolean) this._$el.vhover();
      else this._$el.unvhover();
      this._vhover = boolean;
    }
  }

  addCallback(callback) {
    if (typeof callback !== "function") {
      console.error(
        'TypeError: CustomButton "addCallback": argument is not a function',
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
        'TypeError: CustomButton "removeCallback": argument is not a function',
      );
    }
    if (!this.size) this.ignore();
    return this;
  }

  listen() {
    if (this._listening || !this._callbacks.size) return this;
    this._$el.on("click", this._callback).removeClass(CLASS.disabled);
    this._listening = true;
    return this;
  }

  ignore() {
    if (!this._listening) return this;
    this._$el.off("click", this._callback).addClass(CLASS.disabled);
    this._listening = false;
    return this;
  }

  destroy() {
    this._$el
      .removeData(DATA.instance)
      .removeAttr(DATA.instance)
      .removeAttr("role");
    this._callbacks.clear();
    this._el = this._$el = null;
  }

  _callback(e) {
    this._count++;
    this._callbacks.forEach((fn) => {
      fn({
        jqEvent: e,
        type: "oncbclick",
        count: this._count,
        customButton: this,
        target: this._el,
        index: this._index,
      });
    });
  }

  static get CLASS() {
    return { ...CLASS };
  }

  static get DATA() {
    return { ...DATA };
  }

  static isCustomButton(selector) {
    const $el = $(selector).eq(0);
    return (
      $el.hasClass(CLASS.main) &&
      $el.data(DATA.instance) instanceof CustomButton
    );
  }

  static getInstance(selector) {
    const el = $(selector)[0];
    if (!(el instanceof HTMLElement)) {
      console.error(
        "CustomButton.getInstance: argument is not a valid selector",
        selector,
      );
      return null;
    }
    const instance = $(el).data(DATA.instance);
    if (!instance) {
      console.error(
        "CustomButton.getInstance: No instance found for",
        selector,
      );
      return null;
    } else return instance;
  }

  static register(selector = "." + CLASS.main, callback) {
    return $(selector)
      .not("." + CLASS.registered)
      .each((i, el) => {
        new CustomButton(el, callback);
      });
  }
}

export default CustomButton;
