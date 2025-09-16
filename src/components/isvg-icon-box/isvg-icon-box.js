import "./isvg-icon-box.scss";
import ISVG from "../../js/isvg.js";
import { _is, _math } from "../../js/utils.js";

const VERSION = "1.0.0";
const NAME = "IsvgButton";

const CLASS = {
  main: "isvg-icon-box",
  registered: "isvg-icon-box-registered",
  pending: "isvg-icon-box-pending",
};

const DATA = {
  src: "isvg-src",
  alt: "alt",
  instance: "isvg-icon-box-instance",
};

const SHAPES = ["round", "rounded", "square"];

const DEFAULT = {
  shape: "round",
  shadow: false,
  figureSize: 0.7, // factor (0.1 - 1.0)
};

// @param options:
// - shape: 'round' | 'rounded' | 'square'
// - shadow: boolean
// - figureSize: factor (0.1 - 1.0)
class IsvgIconBox_Class {
  constructor(selector, options = {}) {
    this._$container = null;
    this._$isvg = null;
    //options = {...DEFAULT, ...options}

    this._compose(selector);
    this._style(options);
  }

  get box() {
    return this._$container[0];
  }

  get isvg() {
    return this._$isvg[0];
  }

  _compose(selector) {
    const $el = $(selector).eq(0);
    const src = $el.data(DATA.src) || $el.attr("src") || "";
    const alt = $el.data(DATA.alt) || $el.attr("alt") || "";
    const classes = $el.attr("class") || "";
    const id = $el.attr("id") || "";
    if (!src) {
      console.error("ISVGButton: No SVG source provided for", $el[0]);
      return false;
    }
    this._$container = $("<div>")
      .addClass(CLASS.main)
      .addClass(CLASS.pending)
      .addClass(classes)
      .attr("id", id)
      .data(DATA.instance, this);

    $el.replaceWith(this._$container);

    this._$isvg = $("<img>")
      .addClass("isvg")
      .attr("src", src)
      .attr("alt", alt)
      .appendTo(this._$container);

    new ISVG(this._$isvg[0], (e) => {
      console.log("ISVGButton: ISVG replaced", e);
      this._$isvg = this._$container.children(".isvg").eq(0);
      this._$container
        .removeClass(CLASS.pending)
        .addClass(CLASS.registered)
        .vhover();
    });
  }

  _style(options) {
    if (options.shape && SHAPES.includes(options.shape)) {
      if (options.shape === "round") {
        this._$container.addClass("round").removeClass("rounded");
      } else if (options.shape === "rounded") {
        this._$container.addClass("rounded").removeClass("round");
      } else if (options.shape === "square") {
        this._$container.removeClass("round").removeClass("rounded");
      } else {
        console.warn("ISVGButton: Invalid shape option:", options.shape);
      }
    }

    if (options.shadow === true) this._$container.addClass("shadow");
    else if (options.shadow === false) this._$container.removeClass("shadow");

    if (_is.numeric(options.figureSize)) {
      const size = _math.clip(options.figureSize, 0.1, 1) * 100 + "%";
      this._$isvg.css({
        width: size,
        height: size,
      });
    }
  }
}

function IsvgIconBox(selector, options) {
  const $el = $(selector).eq(0);
  if (!$el.length) {
    console.error("ISVGIconBox: No element found for selector:", selector);
    return null;
  }
  if ($el.data(DATA.instance)) {
    return $el.data(DATA.instance);
  } else return new IsvgIconBox_Class(selector, options);
}

export default IsvgIconBox;
