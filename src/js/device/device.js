/*
Device
2021 Michael Schwarz - cydot.de / grafic, web, media
Last update 2025.01.04
*/

import device from "current-device";

const VERSION = "1.1.0",
  DEVICE = device.type,
  TOUCHABLE =
    "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0,
  MAX_SCREEN_SIZE =
    window.screen.width > window.screen.height
      ? window.screen.width
      : window.screen.height,
  MediaLabels = {
    mobile: "ph",
    tablet: "ta",
    desktop: "de",
    large: "dx",
  },
  MEDIA_LABEL =
    MAX_SCREEN_SIZE >= 2500 ? MediaLabels.large : MediaLabels[DEVICE];

const Device = {
  type: DEVICE,
  touch: TOUCHABLE,
  maxSize: MAX_SCREEN_SIZE,
  mediaLabel: MEDIA_LABEL,
  version: VERSION,
};

export default Device;
