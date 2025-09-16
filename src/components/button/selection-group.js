/*
SelectionGroup
2025 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.04.20
*/

import CustomButton from "./custom-button/custom-button.js";
import { _is } from "../../js/utils.js";

const VERSION = "1.1.1";
const NAME = "SelectionGroup";

const CB_CLASS = CustomButton.CLASS;
const CB_DATA = CustomButton.DATA;

class SelectionGroup {
  constructor(selector) {
    this._members = new Set();
    this._selected = null;
    this._select = this._select.bind(this);
    this._callbacks = new Set();

    this._addMember(selector);
  }

  get members() {
    return [...this._members];
  }

  addMember(selector) {
    this._addMember(selector);
    return this;
  }

  _addMember(selector) {
    if (_is.htmlElement(selector)) {
      let cb;
      $(selector).each((i, el) => {
        if (!this._members.has(el)) {
          cb = this._cbInstance(el) || new CustomButton(el);
          cb.addCallback(this._select);
          this._members.add(el);
        }
      });
    }
  }

  removeMember(selector) {
    $(selector).each((i, el) => {
      if (this._members.has(el)) {
        if (el === this._selected) this.deselect();
        this._cbInstance(el).removeCallback(this._select);
        this._members.delete(el);
      }
    });
    return this;
  }

  addCallback(callback) {
    if (typeof callback !== "function") {
      console.error(
        'TypeError: SelectionGroup "addCallback": argument is not a function',
      );
    } else {
      this._callbacks.add(callback);
    }
    return this;
  }

  removeCallback(callback) {
    if (!arguments.length) this._callbacks.clear();
    else if (typeof callback === "function") {
      this._callbacks.delete(callback);
    } else {
      console.error(
        'TypeError: SelectionGroup "removeCallback": argument is not a function',
      );
    }
    return this;
  }

  select(selector, e) {
    const el = $(selector)[0];

    if (this._selected !== el && this._members.has(el)) {
      this.deselect(this._selected);
      this._selected = el;

      const cb = $(el)
        .addClass(CB_CLASS.selected)
        .data(CB_DATA.instance)
        .ignore();

      if (this._callbacks.size) {
        e = e || {
          name: NAME,
          type: "onselect",
          customButton: cb,
          target: el,
          index: cb.index,
        };
        e.selectionGroup = this;
        this._callback(e);
      }
    }
    return this;
  }

  _select(e) {
    this.select(e.target, e);
  }

  _callback(e) {
    this._callbacks.forEach((fn) => {
      fn(e);
    });
  }

  deselect() {
    if (!this._selected) return this;

    $(this._selected)
      .removeClass(CB_CLASS.selected)
      .data(CB_DATA.instance)
      .listen();

    this._selected = null;
    return this;
  }

  _cbInstance(el) {
    return $(el).data(CB_DATA.instance);
  }
}

export default SelectionGroup;
