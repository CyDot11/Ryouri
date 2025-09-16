/*
Utils
2021 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.05.25
*/

const VERSION = "1.7.2";
const DEFAULT_LABEL_SEPARATOR = "_";
const ASPECT_RATIO_SUPPORTED = CSS.supports
  ? CSS.supports("aspect-ratio", "1/1")
  : false;
const POINTER_EVENT = !!(window.PointerEvent || window.MSPointerEvent);
const TOUCHABLE =
  "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
const OBJ_DESCRIPTORS = ["enumerable", "writeable", "configurable"];
const IMAGE_SUFFIXES = [
  "jpg",
  "png",
  "apng",
  "gif",
  "svg",
  "tif",
  "bmp",
  "webp",
  "avif",
];

// Supports

const _sup = {
  aspectRatio: ASPECT_RATIO_SUPPORTED,
  touch: TOUCHABLE,
  pointer: POINTER_EVENT,
};

// Verifications

const _is = {
  imageURL: function (url) {
    if (
      typeof url === "string" &&
      url.length > 4 &&
      url.charAt(url.length - 4) === "."
    ) {
      const suffix = url.substring(url.length - 3).toLowerCase();
      return IMAGE_SUFFIXES.includes(suffix);
    }

    return false;
  },

  htmlElement: function (obj, tagName) {
    obj = $(obj)[0];

    if (obj instanceof HTMLElement) {
      if (arguments.length > 1) {
        return typeof tagName === "string"
          ? obj.tagName === tagName.toUpperCase()
          : false;
      }
      return true;
    }
    return false;
  },

  image: function (obj) {
    return _is.htmlElement(obj, "image");
  },

  childOf: function (el, parent) {
    return $(el).parent()[0] === $(parent)[0];
  },

  plainObject: function (val) {
    return _obj.type(val) === "object";
  },

  emptyObject: function (val) {
    return !Object.keys(val).length;
  },

  numeric: function (val) {
    return !isNaN(Number(val));
  },

  string: function (val) {
    return typeof val === "string";
  },

  function: function (val) {
    return typeof val === "function";
  },

  array: function (val) {
    return _obj.type(val) === "array";
  },

  map: function (val) {
    return _obj.type(val) === "map";
  },

  null: function (val) {
    return _obj.type(val) === "null";
  },
};

// Conversions

const _to = {
  dataObject: function (data) {
    if (_is.plainObject(data)) return data;
    if (typeof data === "string") {
      const pairs = data.split(","),
        obj = {};
      let pair;

      for (let i = 0; i < pairs.length; i++) {
        pair = pairs[i].split(":");
        obj[pair[0].trim()] = pair[1].trim();
      }
      return obj;
    }
    return {};
  },

  descriptorEntry: function (key) {
    if (typeof key !== "string") return null;
    key = key.trim().toLowerCase();

    const entry = new Array(2);

    if (key.startsWith("not-")) {
      entry[0] = _to.descriptorKey(key.charAt(3));
      entry[1] = false;
    } else {
      entry[0] = _to.descriptorKey(key);
      entry[1] = true;
    }

    return entry[0] ? entry : null;
  },

  descriptorKey: function (abbr) {
    return OBJ_DESCRIPTORS.find((name) => name.startsWith(abbr));
  },

  numericToNumber: function (value) {
    const nr = parseFloat(value);
    return isNaN(nr) ? value : nr;
  },

  hexToRGBA: function (hex, opacity) {
    hex = hex.replace("#", "");

    const r = parseInt(
      hex.length == 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2),
      16,
    );
    const g = parseInt(
      hex.length == 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4),
      16,
    );
    const b = parseInt(
      hex.length == 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6),
      16,
    );

    return "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
  },

  factorToPC: function (float) {
    return Number(float) * 100 + "%";
  },

  boolean: function (value) {
    if (["false", "undefined", "null", "0", "none", "no"].includes(value))
      return false;
    return !!value;
  },

  denotation: function (string) {
    switch (string) {
      case "false":
        return false;
      case "true":
        return true;
      case "null":
        return null;
      case "undefined":
        return undefined;
      default:
        return string;
    }
  },
};

// Utility methods for build in objects

const _css = {
  // returns the highest z value of el siblings
  highestZ: function (el) {
    let z,
      score = $(el).css("z-index");
    score = score === "auto" ? 0 : Number(score);

    $(el)
      .siblings()
      .each(function () {
        z = $(this).css("z-index");
        z = z === "auto" ? 0 : Number(z);

        if (z > score) score = z;
      });
    return score;
  },
};

const _obj = {
  // Example: returns 'array' for array, null for null, etc...
  type: function (value) {
    return {}.toString.call(value).slice(8, -1).toLowerCase();
  },

  // For arrays or plain objects
  deepCopy: function (src) {
    const type = this.type(src);
    let result, key, value;

    if (type !== "object" && type !== "array") return src;

    result = type === "array" ? [] : {};

    for (key in src) result[key] = _obj.deepCopy(src[key]);

    return result;
  },

  // For plain objects
  reject: function (obj, rejects) {
    const method = function (p) {
      return !rejects.includes(p);
    };

    switch (this.type(rejects)) {
      case "array":
        break;
      case "string":
        rejects = [rejects];
        break;
      case "object":
        rejects = Object.keys(rejects);
        break;
      case "function":
        method = rejects;
        break;

      default:
        new TypeError('_obj.reject: 2nd arg "rejects"');
        return Object.assign({}, obj);
    }

    return obj.filter(method);
  },

  // Sets object descriptors (d1, d2, d3) of obj properties selected by filter
  // get/set properties remain untouched
  // @param obj: plain object
  // @param filter: key, array of keys, object (for comparison), function (filter method) or null (without filter)
  // @params d1, d2, d3: strings: object descriptors
  // Values: 'enumerable'/'not-enumerable', 'writeable'/'not-writable', 'configurable'/'not-configurable' or shortcuts: 'e'/'no-e', 'w'/'no-w', 'c'/'no-c'
  // Example: _obj.defineDescriptors({a:1, b:2}, 'a', 'writable', 'not-enumerable')
  // Example result: property a of obj is now writeable and not enumerable
  defineDescriptors: function (obj, filter, d1, d2, d3) {
    let defined = [];
    let ruleDescr = {};
    let ruleKeys;
    let objDescr;
    let objDescrs = Object.getOwnPropertyDescriptors(obj);
    let entries = [...arguments].slice(2).map(_to.descriptorEntry);

    entries.forEach((entry) => {
      if (entry) ruleDescr[entry[0]] = entry[1];
    });

    switch (_obj.type(filter)) {
      case "array":
        ruleKeys = filter;
        break;
      case "string":
        ruleKeys = [filter];
        break;
      case "object":
        ruleKeys = Object.keys(filter);
        break;
      case "function":
        ruleKeys = Object.keys(objDescrs).filter(filter);
        break;
      case "null":
        ruleKeys = Object.keys(objDescrs);
        break;

      default:
        new TypeError('_obj.defineRuleDescriptors: 2nd arg "filter"');
        ruleKeys = Object.keys(objDescrs);
    }

    for (var p of ruleKeys) {
      if (
        objDescrs.hasOwnProperty(p) &&
        objDescrs[p].configurable &&
        !(objDescrs[p].get && ruleDescr.writable)
      ) {
        Object.defineProperty(obj, p, ruleDescr);
        defined.push(p);
      }
    }

    return defined;
  },

  // Sets object descriptors (d1, d2, d3) for obj properties without filtered
  defineDescriptorsExclude: function (obj, exclude, d1, d2, d3) {
    const filter = Object.keys(_obj.reject(obj, exclude));

    return filter.length
      ? _obj.defineDescriptors(obj, filter, d1, d2, d3)
      : filter;
  },

  // Returns an object with properties of options, dataObj or defaults (in this order)
  // @param keys: array of keys or key
  // Example: _obj.matchedParametersOf(['a', 'b'], {b:3}, {b:4, c:5}) returns {a:undefined, b:3, c:5}
  // Example: _obj.matchedParametersOf({a:1, b:2}, {b:3}, {b:4, c:5}) returns {a:1, b:2, c:5}
  matchedParametersOf: function (keys, options, dataObj, defaults) {
    const result = {};

    if (!Array.isArray(keys)) {
      if (typeof keys === "string") keys = [keys];
      else {
        console.error(
          'TypeError. First argument of "matchedParametersOf": ' + keys,
        );
        return result;
      }
    }
    keys.forEach((name) => {
      result[name] = _obj.matchedParameter(name, options, dataObj, defaults);
    });
    console.log("matchedParametersOf", result);
    return result;
  },

  // Returns the value of name in options, dataObj or defaults (in this order)
  matchedParameter: function (name, options = {}, dataObj = {}, defaults = {}) {
    let result = options[name];

    if (result === undefined) {
      result = dataObj[name] || dataObj[_str.decamelize(name, "-")];
      if (result === undefined) result = defaults[name];
    }
    return _to.denotation(result);
  },
};

const _arr = {
  cycle: function (array, steps) {
    return [...array.slice(steps), ...array.slice(0, steps)];
  },

  sortLike: function (array, compareArr) {
    return array.sort(function (a, b) {
      const ai = compareArr.indexOf(a);
      const bi = compareArr.indexOf(b);

      return ai > bi ? 1 : ai < bi ? -1 : 0;
    });
  },

  max: function (array) {
    return Math.max(...array);
  },

  min: function (array) {
    return Math.min(...array);
  },

  last: function (array) {
    return array[array.length - 1];
  },

  ofNumbers: function (n, start = 0, distance = 0) {
    const arr = [];

    for (let i = 0; i < n; i++) {
      arr.push(i + start + distance * i);
    }

    return arr;
  },

  without: function (array, value) {
    const arr = [];

    for (let i = 0; i < array.length; i++) {
      if (array[i] !== value) arr.push(array[i]);
    }

    return arr;
  },
};

const _math = {
  clip: function (nr, min, max) {
    return Math.max(min, Math.min(max, Number(nr)));
  },

  normalize: function (index, size) {
    if (typeof index !== "number") return index;
    index %= size;
    return index < 0 ? size + index : index;
  },

  decimals: function (nr, digits) {
    const f = Math.pow(10, digits);
    return Math.floor(nr * f) / f;
  },

  randomInt: function (min, max, includeMax) {
    if (includeMax === true) max += 1;
    return Math.floor(Math.random() * (max - min)) + min;
  },

  TAU: Math.PI * 2,

  rad: function (deg) {
    return (deg * _math.TAU) / 360;
  },

  deg: function (rad) {
    return (rad * 360) / _math.TAU;
  },

  cot: function (rad) {
    return 1 / Math.tan(rad);
  },
};

const _str = {
  camelize: function (str) {
    return str.replace(
      /^([A-Z])|[\s-_]+(\w)/g,
      function (match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
      },
    );
  },

  decamelize: function (str, separator = "_") {
    return str
      .replace(/([a-z\d])([A-Z])/g, "$1" + separator + "$2")
      .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1" + separator + "$2")
      .toLowerCase();
  },

  capitalize: function (str) {
    const words = str.split(" ");
    let ini;

    words.forEach(function (word, i, s) {
      word = word.trim();
      ini = word[0].toUpperCase();
      words[i] = ini + word.slice(1);
    });

    return words.join(" ");
  },

  firstUp: function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  strip: function (str) {
    return String.prototype.replaceAll
      ? str.replaceAll(" ", "")
      : str.replace(/\s/g, "");
  },
};

const _url = {
  parts: function (url) {
    let i = url.lastIndexOf("/");
    let path = "",
      name = "",
      suffix = "";

    if (i > -1) {
      path = url.substring(0, i + 1);
      name = url.substring(i + 1);
    } else name = url;

    i = name.lastIndexOf(".");

    if (i > -1) {
      suffix = name.substring(i);
      name = name.substring(0, i);
    }
    return { path: path, name: name, suffix: suffix };
  },

  infix: function (url, label, separator = DEFAULT_LABEL_SEPARATOR) {
    if (typeof url !== "string") {
      console.error("TypeError infix arg url: " + url + " is not a string");
      return url;
    }
    if (!label) return url;
    if (typeof label !== "string") {
      console.warn(`_url.infix. TypeError at argument label: ${label}.`);
      return url;
    }

    const parts = _url.parts(url);
    if (!parts.name.endsWith(separator + label)) {
      parts.name = parts.name + separator + label;
    }

    return parts.path + parts.name + parts.suffix;
  },

  unfix: function (url, label, separator = DEFAULT_LABEL_SEPARATOR) {
    if (typeof label !== "string" || !label.length) {
      console.warn(`_url.unfix. Wrong argument label: ${label}.`);
      return url;
    }

    const parts = _url.parts(url);
    const i = parts.name.lastIndexOf(separator);

    if (i) {
      const currLabel = parts.name.substring(i + 1);

      if (label === currLabel) {
        parts.name = parts.name.substring(0, i);
      }
    }

    return parts.path + parts.name + parts.suffix;
  },

  // @param label = suggested device labeled
  // @param def = converts label. Example: 'de:ta,ta:ph' or 'ta'
  defineLabel: function (label = "", def) {
    if (
      def === undefined ||
      def === null ||
      def === "auto" ||
      arguments.length < 2
    )
      return label;
    if (def === "" || def === false || def === "none") return "";

    if (typeof def === "string") {
      if (def.indexOf(":") > -1) {
        def = def.split(",");

        for (let strg of def) {
          const entry = strg.trim().split(":");

          if (entry.length && entry[0].trim() === label) {
            return entry[1].trim();
          }
        }
        return label;
      } else return def;
    }
    if (_is.plainObject(def) && typeof def[label] === "string") {
      return def[label];
    }
    console.error('TypeError. First argument of "defineLabel": ' + label);

    return label;
  },
};

// Iteration

const _iter = {
  // Executes n times method fn bound to reference or null with arguments args
  // @param args: value or array of values
  times: function (n, fn, args = [], reference = null) {
    args = Array.isArray(args) ? args : [args];

    for (let i = 0; i < n; i++) {
      fn.apply(reference, [i, ...args]);
    }
  },
};

// Load methods
// Returns a promise
const _load = {
  image: function (url) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = (e) => resolve(image);
      image.onerror = (e) => reject({ url: url, e: e });
      image.src = url;

      if (image.complete) {
        image.onload = undefined;
        resolve(image);
      }
    });
  },

  json: function (url) {
    return new Promise((resolve, reject) => {
      $.get(url)
        .done((result) => {
          resolve(JSON.parse(result));
        })
        .fail((e) => {
          console.error("JSON request: " + url + ", Error: " + e);
          reject(e);
        });
    });
  },
};

const _wait = (sec) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

export {
  _sup,
  _is,
  _to,
  _css,
  _obj,
  _arr,
  _math,
  _str,
  _url,
  _iter,
  _load,
  _wait,
};
