/*
scroll-controller.js
By gblazex, https://github.com/gblazex
2022 Michael Schwarz - cydot.de / grafic, web, media
Last update 2023.07.25
*/

const VERSION = "1.0.1";

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
const Keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
let enabled = true;

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (Keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires {passive: false} when adding event
let supportsPassive = false;

try {
  window.addEventListener(
    "test",
    null,
    Object.defineProperty({}, "passive", {
      get: () => (supportsPassive = true),
    }),
  );
} catch (e) {}

const WheelOpt = supportsPassive ? { passive: false } : false;
const WheelEvent =
  "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

function disableScroll() {
  if (!enabled) return;

  window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
  window.addEventListener(WheelEvent, preventDefault, WheelOpt); // modern desktop
  window.addEventListener("touchmove", preventDefault, WheelOpt); // mobile
  window.addEventListener("keydown", preventDefaultForScrollKeys, false);

  enabled = false;
}

function enableScroll() {
  if (enabled) return;

  window.removeEventListener("DOMMouseScroll", preventDefault, false);
  window.removeEventListener(WheelEvent, preventDefault, WheelOpt);
  window.removeEventListener("touchmove", preventDefault, WheelOpt);
  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);

  enabled = true;
}

const Scroll = {
  disable: disableScroll,
  enable: enableScroll,
};

export default Scroll;
