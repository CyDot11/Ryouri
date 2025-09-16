import { _url, _math, _is, _load } from "../../js/utils.js";
import Device from "../../js/device/device.js";

const VERSION = "1.5.0";
const NAME = "Playlist";

let mediaLabel = typeof Device !== "undefined" ? Device.mediaLabel : "";
let count = 0;

class Playlist {
  constructor(data) {
    this._id = NAME + "-" + ++count;
    // @param label: string. label = string
    // @param label: object. example {ph: 'ta'} , ta label will be used for ph
    this._label = mediaLabel;
    // stack item: {url: str, load: 0('not') 1('pending) 2('complete')}
    this._stack = [];
    // @param list: url(string), object({url:'...'}) or array

    this._autopreload = true;

    this._loadCallbacks = new Set();

    //return value e: Playlist instance (this)
    if (data)
      this._initialRequest = this.request(data)
        .then((e) => {
          if (this._autopreload) {
            this.preload(0)
              .then((item) => {})
              .catch((item) => {});
          }
        })
        .catch((e) => {});
  }

  get id() {
    return this._id;
  }

  get size() {
    return this._stack.length;
  }

  get stack() {
    return [...this._stack];
  }

  get label() {
    return this._label;
  }

  get initialRequest() {
    return this._initialRequest;
  }

  set autopreload(boolean) {
    this._autopreload = !!boolean;
  }

  item(index) {
    index = _math.normalize(index, this.size);
    const item = this._stack[index];
    item.index = index;
    return item;
  }

  url(index) {
    index = _math.normalize(index, this.size);
    return this._stack[index].url;
  }

  // status: -1: load error, 0: not loaded, 1: load pending, 2: load complete
  status(index) {
    return this.item(index).status;
  }

  onItemLoad(callback) {
    if (_is.function(callback)) {
      this._loadCallbacks.add(callback);
    }
  }

  _fireOnItemLoad(item) {
    this._loadCallbacks.forEach((fn) =>
      fn({
        from: "Playlist",
        type: "onItemLoad",
        inst: this,
        item: item,
      }),
    );
  }

  preload(index) {
    const item = this.item(index);

    if (item.status === 0) {
      this._preload(item);
      if (this._autopreload) this._autopreloadNeighboursOf(index);
    }

    return item.load;
  }

  _preload(item) {
    item.status = 1;
    item.load = new Promise((res, rej) => {
      _load
        .image(item.url)
        .then((img) => {
          item.status = 2;
          item.result = img;
          this._fireOnItemLoad(item);
          res(item);
        })
        .catch((e) => {
          item.status = -1;
          console.error("LoadError. Playlist Item: " + e.url);
          rej(item);
        });
    });
  }

  _autopreloadNeighboursOf(index) {
    const item1 = this.item(index + 1);
    if (item1.status === 0) this._preload(item1);

    const item2 = this.item(index - 1);
    if (item2.status === 0) this._preload(item2);
  }

  request(value, index) {
    return new Promise((resolve, reject) => {
      if (_is.string(value) && value.endsWith(".json")) {
        _load
          .json(value)
          .then((data) => {
            resolve(this.add(data, index));
          })
          .catch((e) => {
            console.log("request error", e);
            reject(this);
          });
      } else {
        resolve(this.add(value, index));
      }
    });
  }

  add(value, index = this.size) {
    if (_is.string(value) && value.endsWith(".json")) {
      return this.request(value, index);
    } else {
      value = this._toItems(value);

      if (_is.array(value) && value.length) {
        this._stack.splice(index, 0, ...value);
      }
    }
    return this;
  }

  remove(index) {
    index = !_is.numeric(index)
      ? this.size - 1
      : _math.normalize(index, this.size);
    this._stack.splice(index, 1);
    return this;
  }

  _toItems(value) {
    let commonPath = "",
      label = undefined;

    if (_is.plainObject(value) && _is.array(value.items)) {
      if (_is.string(value.commonPath)) {
        commonPath = value.commonPath;
      }
      if (value.labelDefinition) {
        label = _url.defineLabel(this._label, value.labelDefinition);
      }
      value = value.items;
    }
    if (_is.string(value)) value = [value];

    if (!_is.array(value)) {
      console.error('TypeError: Playlist "add": ' + value);
      return false;
    }
    const items = [];
    let item;
    for (const element of value) {
      item = this._toItem(element, commonPath, label);
      if (item) items.push(item);
    }
    return items;
  }

  _toItem(value, commonPath = "", label = this._label) {
    const isObj = _is.plainObject(value);
    const obj = isObj ? value : {};
    let url = isObj ? value.url : value;

    if (_is.imageURL(url)) {
      url = _url.infix(url, label);
      if (commonPath && !url.startsWith(commonPath)) {
        url = commonPath + url;
      }
      obj.url = url;
      obj.data = obj.data || "";
      obj.load = null;
      obj.status = 0;

      return obj;
    }
    console.error("Playlist item has no valid url: " + value);
    return null;
  }
}

export default Playlist;
