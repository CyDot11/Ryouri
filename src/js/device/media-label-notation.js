import Device from "./device.js";

$("html")
  .addClass("media-label-" + Device.mediaLabel)
  .data("media-label", Device.mediaLabel);
