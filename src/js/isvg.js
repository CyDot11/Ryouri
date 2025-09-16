/*
ISVG class
2021 Michael Schwarz - cydot.de / grafic, web, media
Last update 2023.07.24
*/

const VERSION = "1.9.1";
const NAME = "ISVG";

const ClassName = {
  MAIN: "isvg",
  PENDING: "isvg-pending",
  REPLACED: "isvg-replaced",
  REJECTED: "isvg-rejected",
};

const Selector = {
  MAIN: "." + ClassName.MAIN,
  PENDING: "." + ClassName.PENDING,
  REPLACED: "." + ClassName.REPLACED,
  REJECTED: "." + ClassName.REJECTED,
};

const CustomEvent = "isvgReady";

const Replaced = new Set();
const Rejected = new Set();

const StaticCallbacks = new Set();

let instanceCount = 0;
let svgCount = 0;
let timestamp = 0;

function getISVGUrl(el) {
  const $el = $(el);
  return $el.attr("src") || $el.data("src") || "";
}

function copyAttributes(from, to) {
  svgCount++;
  if (from.id) to.id = from.id;
  else to.id = NAME + "-" + svgCount;

  to.classList.add(...from.classList);
}

function removeSizeAttributes(svg) {
  svg.removeAttribute("width");
  svg.removeAttribute("height");
}

function isISVGApt(el, report) {
  const $el = $(el),
    src = $el.attr("src"),
    data = $el.data("src"),
    apt = (src && src.endsWith(".svg")) || (data && data.endsWith(".svg"));

  if (report && !apt) {
    $el.addClass(ClassName.REJECTED);
    throw new Error(
      "ISVG: element is unapt to be replaced by inline svg: " + (el.id || el),
    );
  }

  return apt;
}

function isISVGProcessed(el) {
  const $el = $(el);
  return (
    $el.hasClass(ClassName.REPLACED) ||
    $el.hasClass(ClassName.REJECTED) ||
    $el.hasClass(ClassName.PENDING)
  );
}

// Inline SVG
class ISVG {
  constructor(selector, callback) {
    timestamp = Date.now();
    this._id = NAME + "-Instance-" + ++instanceCount;

    if (arguments.length === 1 && typeof selector === "function") {
      callback = selector;
      selector = Selector.MAIN;
    } else if (!arguments.length) selector = Selector.MAIN;

    this._pending = [];
    this._replaced = [];
    this._rejected = [];

    $(selector)
      .not((i, el) => isISVGProcessed(el))
      .each((i, el) => {
        if (isISVGApt(el, true)) this._pending.push(el);
        else this._rejected.push(el);
      });

    const $pending = $(this._pending).addClass(ClassName.PENDING);

    this._waiting = $pending.length;
    this._callback = typeof callback === "function" ? callback : null;

    if (!this._waiting) this._end();
    else $pending.each((i, el) => this._replace(el));
  }

  // -----------------------------------------------------

  _replace(el) {
    const url = getISVGUrl(el),
      xhr = $.get(url, null, "json");

    xhr.done((data) => this._done(data, el));
    xhr.fail((response) => this._fail(response, el, url));
  }

  _done(data, el) {
    if (typeof data === "string") data = $.parseXML(data);

    const svg = data.getElementsByTagName("svg")[0];

    copyAttributes(el, svg);
    removeSizeAttributes(svg);
    $(el).replaceWith(svg).remove();

    this._replaced.push(svg);
    Replaced.add(svg);

    $(svg)
      .removeClass(ClassName.PENDING)
      .addClass(ClassName.MAIN)
      .addClass(ClassName.REPLACED);

    if (!--this._waiting) this._end();
  }

  _fail(response, el, url) {
    $(el)
      .removeClass(ClassName.PENDING)
      .removeClass(ClassName.MAIN)
      .addClass(ClassName.REJECTED);

    this._rejected.push(el);
    Rejected.add(el);

    throw new Error(
      "ISVG: svg file not found: " + (el.id || el) + ". URL: " + url,
    );

    if (!--this._waiting) this._end();
  }

  _end() {
    const e = this._eventObject();

    if (this._callback) this._callback(e);
    StaticCallbacks.forEach((fn) => fn({ ...e }));

    this._destroy();
  }

  _eventObject() {
    return {
      type: CustomEvent,
      id: this._id,
      elapsed: Date.now() - timestamp + "ms",
      replaced: [...this._replaced],
      rejected: [...this._rejected],
      total: this._replaced.length + this._rejected.length,
      complete: !this._rejected.length,
    };
  }

  _destroy() {
    this._pending =
      this._replaced =
      this._rejected =
      this._callback =
        undefined;
  }

  // -----------------------------------------------------

  static ready(callback) {
    if (typeof callback === "function") {
      StaticCallbacks.add(callback);
    }

    return ISVG;
  }

  static off(callback) {
    if (!arguments.length) StaticCallbacks.clear();
    else if (typeof callback === "function") {
      StaticCallbacks.delete(callback);
    }

    return ISVG;
  }

  static replaced() {
    return $([...Replaced]);
  }

  static rejected() {
    return $([...Rejected]);
  }

  static isPending(selector) {
    return $(selector).hasClass(ClassName.PENDING);
  }

  static isReplaced(selector) {
    return $(selector).hasClass(ClassName.REPLACED);
  }

  static isRejected(selector) {
    return $(selector).hasClass(ClassName.REJECTED);
  }

  static isApt(selector, report) {
    return isISVGApt(selector, report);
  }
}

export default ISVG;
