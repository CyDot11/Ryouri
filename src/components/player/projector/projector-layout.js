/*
ProjectorLayout
2025 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.05.27
*/

import "./projector.scss";
import { CLASS, DATA, LAYOUT_DEFAULT } from "./projector-params.js";
import { _is, _math, _iter, _sup, _to, _obj, _str } from "../../../js/utils.js";

const VERSION = "1.1.0";
const NAME = "ProjectorLayout";

class ProjectorLayout {
  // @param options: Objekt values:
  // mutedArea: ratio (number) 0 - 1
  // autoResize: true or false. Uses the aspect ratio of the current image
  // aspectRatio: 'auto' (string) or ratio (number) 1 = square, <1 = portrait, >1 = landscape
  // cover: boolean. Image size
  constructor(selector, options = {}) {
    this._$container = $($(selector)[0])
      .addClass(CLASS.main)
      .addClass(CLASS.registered);

    this._$stack = $("<div>").addClass(CLASS.stack).prependTo(this._$container);

    this._$mutedArea = $("<div>")
      .addClass(CLASS.mutedArea)
      .on("click tap mousemove", (e) => e.stopPropagation())
      .appendTo(this._$container);

    this._initialHeight = this._$container.css("height");
    this._aspectRatioOnResize = this._aspectRatioOnResize.bind(this);

    this._aspectRatio = null;
    this._cover = false;

    const params = _obj.matchedParametersOf(
      Object.keys(LAYOUT_DEFAULT),
      options,
      this._$container.data(),
      LAYOUT_DEFAULT,
    );
    for (const prop in params) {
      if (params[prop] !== undefined) this[prop] = params[prop];
    }
  }

  get container() {
    return this._$container[0];
  }

  get stack() {
    return this._$stack[0];
  }

  get size() {
    return this.$items().length;
  }

  set size(nr) {
    const d = nr - this.size;
    if (d > 0) this.addItems(d);
    else if (d < 0) this.removeItems(d * -1);
  }

  get mutedArea() {
    return this._$mutedArea[0];
  }

  set mutedArea(ratio) {
    if (_is.numeric(ratio)) ratio = Number(ratio) * 100 + "%";
    else if (!_is.string(ratio)) {
      console.error("TypeError. mutedArea invalid argument: " + ratio);
      return;
    }
    this._$mutedArea.css("width", ratio);
  }

  get aspectRatio() {
    return this._aspectRatio;
  }
  // @param ratio: number, null or 'unset'
  set aspectRatio(ratio) {
    let height = "auto";
    if (ratio === null || ratio === "unset") {
      ratio = "unset";
      height = this._initialHeight;
    } else {
      if (_is.numeric(ratio)) ratio = Number(ratio);
      else {
        console.error(
          'TypeError. Projector aspectRatio must be numeric, null or "unset".',
        );
        return;
      }
    }
    if (_sup.aspectRatio) {
      this._$container.css({
        height: height,
        aspectRatio: ratio,
      });
    } else if ($.aspectRatio) {
      if (ratio !== "unset") this._$container.keepAspectRatio(ratio);
      else {
        this._$container.freeAspectRatio();
        this._$container.css("height", height);
      }
    } else {
      if (ratio !== "unset") {
        $(window).off("resize", this._aspectRatioOnResize);
        $(window).on("resize", this._aspectRatioOnResize);
      } else {
        $(window).off("resize", this._aspectRatioOnResize);
        this._$container.css("height", height);
      }
    }
    this._aspectRatio = ratio;
  }

  get cover() {
    return this._cover;
  }

  set cover(boolean) {
    const value = !!boolean;
    let size = "contain";
    if (value !== this._cover) {
      this._cover = value;
      if (value) size = "cover";
      this.$items().css("background-size", size);
    }
  }

  // @param index: optional
  $items(index) {
    const $items = this._$stack.children();

    return index !== undefined
      ? $items.eq(_math.normalize(index, this.size))
      : $items;
  }

  // checks if image is loaded and placed
  isReady(index) {
    return arguments.length
      ? this.$items(index).hasClass(CLASS.ready)
      : !this.$items().find((el) => !$(el).hasClass(CLASS.ready));
  }

  renewStack(size) {
    this.removeItems();
    this.addItems(size);
  }

  addItems(amount) {
    _iter.times(amount, this.addItem, [], this);
    return this.size;
  }

  addItem() {
    const $item = $("<div>")
      .addClass(CLASS.item)
      .data("index", this.size)
      .appendTo(this._$stack);

    if (this._cover) $item.css("background-size", "cover");
    return $item;
  }

  removeItems(amount) {
    if (!arguments.length || amount >= this.size) {
      this._$stack.empty();
    } else _iter.times(amount, this.removeItem, [], this);

    return this.size;
  }

  removeItem() {
    if (this.size) {
      this.$items(this.size - 1)
        .removeClass(CLASS.item)
        .remove();

      return true;
    }
    return false;
  }

  applyImage(index, url, data) {
    const $item = this.$items(index);

    $item.css("background-image", "url(" + url + ")").addClass(CLASS.ready);

    if (_is.plainObject(data) && data.css) $item.css(data.css);

    return $item;
  }

  _aspectRatioOnResize() {
    this._$container.height = this._$container.width / ratio;
  }
}

export default ProjectorLayout;
