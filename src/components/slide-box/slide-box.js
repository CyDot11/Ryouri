/*
SlideBox
2022 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.03.27
*/

import "./_slide-box.scss";
import { _str } from "../../js/utils.js";

const VERSION = "2.1.0";
const NAME = "SlideBox";

const CLASS_NAME = {
  main: "slide-box",
  hidden: "sb-hidden",
  registered: "sb-registered",
};

const DATA_NAME = CLASS_NAME.main;

const DEFAULT = {
  hidden: true,
  callback: null,
};

let count = 0;

class SlideBox_Class {
  constructor(selector, options) {
    count++;
    options = { ...DEFAULT, ...options };
    const el = $(selector)[0];

    this._$element = $(el)
      .addClass(CLASS_NAME.main)
      .addClass(CLASS_NAME.registered);
    if (!el.id) el.id = NAME + "-" + count;
    this._$element.data(DATA_NAME, this);

    this._count = 0;
    this._listening = false;
    this._transitioning = false;
    this._callbacks = new Set();
    if (options.callback) this.addCallback(options.callback);
    this._bindHandlers();

    this._displayStyle = this._$element.css("display");
    if (this._displayStyle === "none") this._displayStyle = "flex";
    this._hidden = options.hidden;
    if (this._hidden)
      this._$element.addClass(CLASS_NAME.hidden).css("display", "none");
    else
      this._$element
        .removeClass(CLASS_NAME.hidden)
        .css("display", this._displayStyle);
  }

  // Interface -----------------------------------

  get element() {
    return this._$element[0];
  }

  get hidden() {
    return this._hidden;
  }

  addCallback(callback) {
    if (typeof callback === "function") {
      this._callbacks.add(callback);
    }
    return this;
  }

  removeCallback(callback) {
    if (!arguments.length) this._callbacks.clear();
    else if (typeof callback === "function") this._callbacks.delete(callback);

    return this;
  }

  show() {
    if (!this._hidden) return this;

    this._$element
      .css("display", this._displayStyle)
      .off("transitionend")
      .one("transitionend", this._handleShown);
    setTimeout(() => this._$element.removeClass(CLASS_NAME.hidden), 1);

    this._hidden = false;
    this._transitioning = true;
    return this;
  }

  hide() {
    if (this._hidden) return this;

    this._$element
      .off("transitionend")
      .one("transitionend", this._handleHidden);
    setTimeout(() => this._$element.addClass(CLASS_NAME.hidden), 1);

    this._hidden = true;
    this._transitioning = true;
    return this;
  }

  toggle() {
    return this._hidden ? this.show() : this.hide();
  }

  // Support -------------------------------------

  _handleShown(e) {
    this._transitioning = false;
    this._callback(e, "show");
  }

  _handleHidden(e) {
    this._transitioning = false;
    this._$element.css("display", "none");
    this._callback(e, "hide");
  }

  _callback(e, type) {
    const evtObj = {
      jqEvent: e,
      type: "slideBox" + _str.firstUp(type),
      mode: type,
      count: ++this._count,
      instance: this,
      element: this.element,
    };
    this._callbacks.forEach((fn) => fn({ ...evtObj }));
  }

  _bindHandlers() {
    this._handleShown = this._handleShown.bind(this);
    this._handleHidden = this._handleHidden.bind(this);
  }

  static register(selector = CLASS_NAME.main, options) {
    const registered = [];

    $(selector).each(function () {
      $el = $(this);
      if (!$el.data(DATA_NAME)) {
        registered.push(new SlideBox_Class(this, options));
      }
    });
    return registered;
  }
}

function SlideBox(selector, options) {
  const $sb = $($(selector)[0]);
  if (!$sb.length) {
    console.error('SlideBox: argument "selector" does not select an element');
    return false;
  }
  let instance = $sb.data(DATA_NAME);
  if (instance) return instance;
  return new SlideBox_Class($sb, options);
}

SlideBox.register = SlideBox_Class.register;

export default SlideBox;
