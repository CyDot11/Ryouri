import SlideBox from "../slide-box/slide-box.js";
import ScrollFx from "../../js/scroll/scroll-fx.js";
import CustomBotton from "../button/custom-button/custom-button.js";

const CLASS = {
  main: "slide-navigation",
};

const DATA = {
  main: CLASS.main,
};

const DEFAULT = {
  hidden: true,
  callback: null,
  overlay: true,
  targets: null,
  button: "#Slide-Navi-Button",
};

// @param options (Object):
// @param targets (Array): Array of objects with properties: text and data-scroll-fx opts
// example: [{text: 'Paragraph', to: '#Text-Section', offset: 24}, ...]
class SlideNavigation_Class {
  constructor(selector, options = {}) {
    options = { ...DEFAULT, ...options };
    this._slideBox = SlideBox(selector, options);
    this._$container = $(this._slideBox.element)
      .addClass(CLASS.main)
      .data(DATA.main, this);
    this._$targets = null;
    this._overlay = null;
    this._$button = null;

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);

    this._setupNavigation(options.targets);
    if (options.button) this._setupButton(options.button);
    if (options.overlay) this._setupOverlay();
  }

  hide(e) {
    this._slideBox.hide();
    if (this._overlay) this._overlay.hide();
  }

  show(e) {
    this._slideBox.show();
    if (this._overlay) this._overlay.show();
  }

  _setupNavigation(targets) {
    if (targets) {
      let $link;
      targets.forEach((obj) => {
        $('<div class="p">' + obj.text + "</div>")
          .data("scroll-fx", obj)
          .appendTo(this._$container);
      });
    }
    this._$targets = this._$container.children("[data-scroll-fx]");
    console.log("SlideNavigation._$targets", this._$targets);
    ScrollFx.register(this._$targets, { callback: this.hide });
  }

  _setupOverlay() {
    import("../overlay/overlay.js")
      .then((module) => {
        const Overlay = module.default;
        this._overlay = Overlay("body", { callback: this.hide });
        if (this._slideBox.hidden) this._overlay.hide();
        else this._overlay.show();
      })
      .catch((err) => {
        console.error("SlideNavigation: Error loading Overlay module", err);
      });
  }

  _setupButton(selector) {
    const $el = $(selector).eq(0);
    let cb;

    if (!($el[0] instanceof HTMLElement)) {
      console.error(
        'SlideNavigation: argument "options.button" does not select an element',
        selector,
      );
      return null;
    }
    if (CustomBotton.isCustomButton($el)) {
      this._$button = $el;
      cb = CustomBotton.getInstance($el);
    } else {
      cb = new CustomBotton($el);
      this._$button = $(cb.element);
    }

    cb.addCallback(this.show);
  }
}

function SlideNavigation(selector, options) {
  const $el = $(selector).eq(0);
  if (!$el.length) {
    console.error("SlideNavigation: No element found for selector:", selector);
    return null;
  }
  if ($el.data(DATA.main)) {
    return $el.data(DATA.main);
  } else {
    return new SlideNavigation_Class(selector, options);
  }
}
export default SlideNavigation;
