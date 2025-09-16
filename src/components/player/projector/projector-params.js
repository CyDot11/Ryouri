const CLASS = {
  main: "projector",
  registered: "projector-registered",
  fadeMode: "fade",
  slideMode: "slide",
  slideVerticalMode: "vertical",
  stack: "projector-stack",
  item: "projector-item",
  active: "active",
  right: "projector-item-right",
  left: "projector-item-left",
  next: "projector-item-next projector-item-right",
  prev: "projector-item-prev projector-item-left",
  ready: "ready",
  cleared: "cleared",
  beacon: "projector-beacon",
  beaconX: "projector-beacon-x",
  indicators: "indicators",
  mutedArea: "muted-area",
};

function SELECTOR(className) {
  return "." + CLASS[className];
}

const DATA = {
  // Layout
  mutedArea: "muted-area",
  autoResize: "auto-resize",
  aspectRatio: "aspect-ratio",
  cover: "cover",

  // Player
  mode: "mode",
  startIndex: "start-index",
  autoplay: "autoplay",
  direction: "direction",

  // User Interface
  indicators: "indicators",
  directionalPointer: "directional-pointer",
  tap: "tap",
  tapFX: "tap-fx",
  swipe: "swipe",
  keys: "keys",

  // Playlist
  src: "src",
  path: "path",
  mediaLabel: "media-label",
};

const LAYOUT_DEFAULT = {
  mutedArea: 0.33,
  aspectRatio: 16 / 9,
  cover: false,
};

const PLAYER_DEFAULT = {
  // mode: 'fade', 'slide', 'slide-vertical'
  mode: "slide",
  autoplay: false,
  // direction: 1 (right), -1 (left)
  direction: 1,
};

const UI_DEFAULT = {
  // 'none' or false, 'append', 'after' or container element
  indicators: false,
  customCursor: true,
  tap: true,
  swipe: true,
  keys: true,
};

export { CLASS, SELECTOR, DATA, LAYOUT_DEFAULT, PLAYER_DEFAULT, UI_DEFAULT };
