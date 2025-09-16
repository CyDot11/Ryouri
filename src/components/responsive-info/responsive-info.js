import "./responsive-info.scss";
import closeIcon from "./close.svg";
import infoIcon from "./info.svg";
import { _math } from "../../js/utils.js";
import inertResize from "../../js/inert-events/inert-resize.js";
import breakpoints from "../../js/breakpoints/breakpoints.js";
import SlideBox from "../slide-box/slide-box.js";

const $WIN = $(window);
const MEDIA_LABEL = $("html").data("media-label");
const CLASS_NAME = {
  content: "ri-content",
  close_button: "close-button",
  info_button: "info-button",
  hidden: "hidden",
};
const ID = {
  main: "Responsive-Info",
  info_button: "RI-Info-Button",
  close_button: "RI-Close-Button",
};

const responsiveInfo = (function () {
  let $container = null,
    $content = null,
    breakpointEntries = [...breakpoints],
    $closeButton,
    $infoButton,
    slideBox;

  function show(e) {
    if (!$container) _init();
    slideBox.show();
    $infoButton.fadeOut(240);
    inertResize.addCallback(_update);
    _update();
  }

  function hide(e) {
    if (!$container) return false;
    inertResize.removeCallback(_update);
    slideBox.hide();
  }

  function onSlide(e) {
    console.log("responsiveInfo onSlide", e);
    if (e.mode === "hide") $infoButton.fadeIn(240);
  }

  function initButtons() {
    $infoButton = $("#RI-Info-Button").fadeOut(1);
    $closeButton = $("#RI-Close-Button");

    $infoButton.on("click", show);
    $closeButton.on("click", hide);
  }

  function _update(e) {
    const w = $WIN.width(),
      h = $WIN.height();
    $content.html(
      "width: " +
        w +
        "<br>" +
        "height: " +
        h +
        "<br>" +
        "aspect ratio: " +
        _math.decimals(w / h, 3) +
        "<br>" +
        "breakpoint: " +
        _currentBreakpoint() +
        "<br>" +
        "media label: " +
        MEDIA_LABEL,
    );
  }

  function _currentBreakpoint() {
    for (let i = 0; i < breakpointEntries.length; i++) {
      const entry = breakpointEntries[i];

      if (window.innerWidth <= entry[1]) {
        return breakpointEntries[i - 1][0];
      }
    }
  }

  function _init() {
    breakpointEntries.push(["ex", Infinity]);
    $container = $('<div id="' + ID.main + '">').appendTo("body");
    $content = $('<p id="RI-Content"class="ri-content">').appendTo($container);

    $closeButton = $('<img class="isvg" src="' + closeIcon + '">')
      .addClass(CLASS_NAME.close_button)
      .attr("id", ID.close_button)
      .prependTo($container);

    $infoButton = $('<img class="isvg" src="' + infoIcon + '">')
      .addClass(CLASS_NAME.info_button)
      .attr("id", ID.info_button)
      .appendTo($("body"));

    slideBox = new SlideBox("#Responsive-Info", {
      callback: onSlide,
      hidden: false,
    });
  }

  return {
    show: show,
    hide: hide,
    initButtons: initButtons,
  };
})();

export default responsiveInfo;
