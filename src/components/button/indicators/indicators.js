/*
Indicators
2025 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.08.25
*/

import SelectionGroup from "../selection-group.js";
import { _is } from "../../../js/utils.js";
import "./indicators.scss";

const VERSION = "1.0.1";
const NAME = "Indicators";
const CLASS = {
  container: "indicators",
  indicator: "indicator",
  bullets: "bullets",
  pipes: "pipes",
};
const DATA = {
  instance: "indicators",
};
const STYLES = ["bullets", "pipes"];
const DEFAULT = {
  style: "bullets",
};

class Indicators extends SelectionGroup {
  constructor(container, size) {
    super();

    this._$container = $($(container)[0])
      .empty()
      .addClass(CLASS.container)
      .addClass(CLASS[DEFAULT.style])
      .data(DATA.instance, this)
      .attr("role", "menubar");

    this._style = DEFAULT.style;
    this._indexedMembers = new Map();
    if (_is.numeric(size)) this.size = size;
  }

  get container() {
    return this._$container[0];
  }

  get style() {
    return this._style;
  }

  set style(type) {
    if (STYLES.includes(type) && this._style !== type) {
      this._$container.removeClass(CLASS[this._style]).addClass(CLASS[type]);
      this._style = type;
    }
  }

  get size() {
    return this._members.size;
  }

  set size(int) {
    const d = Number(int) - this.size;
    if (d > 0) this.addMember(d);
    else if (d < 0) this.removeMember(d);
  }

  select(index, e) {
    if (_is.numeric(index)) super.select(this.getMember(index));
    else super.select(index, e);
    return this;
  }

  getMember(index) {
    index %= this.size;
    if (index < 0) index = this.size + index;
    return this._indexedMembers.get(index);
  }

  getInstanceOf(index) {
    return this._cbInstance(this.getMember(index));
  }

  addMember(amount = 1) {
    if (_is.numeric(amount)) {
      let $el;
      for (let i = 0; i < amount; i++) {
        $el = $("<div>").appendTo(this._$container).addClass(CLASS.indicator);
        super.addMember($el);
      }
      this._indexMembers();
    }
    return this;
  }

  removeMember(amount = 1) {
    if (_is.numeric(amount)) {
      amount = Math.min(Math.abs(amount), this.size);
      let el;
      const size = this.size;
      for (let i = 0; i < amount; i++) {
        el = this._indexedMembers.get(size - 1 - i);
        super.removeMember(el);
        this._cbInstance(el).destroy();
        $(el).remove();
      }
      this._indexMembers();
    }
    return this;
  }

  _indexMembers() {
    let index = 0;

    this._indexedMembers.clear();

    this._members.forEach((el) => {
      this._indexedMembers.set(index, el);
      this._cbInstance(el).index = index++;
    });
  }
}

export default Indicators;
