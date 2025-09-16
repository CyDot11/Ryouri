const VERSION = "1.0.0";

$.fn.extend({
  classTransition: function (className, display, callback) {
    var $e = $(this),
      backup = null;

    $e.off("transitionend");

    if (typeof display === "function") {
      callback = display;
      display = undefined;
    } else {
      if (display === "none") {
        backup = callback;
        callback = (e) => {
          $e.css("display", "none");
          if (typeof backup === "function") backup(e);
        };
      } else if (display) $e.css("display", display);
    }

    if (typeof callback === "function") {
      $e.one("transitionend", (e) => callback(e));
    }

    if (display === "none") setTimeout(() => $e.removeClass(className), 2);
    else setTimeout(() => $e.addClass(className), 2);

    return $e;
  },
});
