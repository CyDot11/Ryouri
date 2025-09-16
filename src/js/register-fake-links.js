const fakeLinks = document.querySelectorAll('[role="link"] [data-href]');

for (const link of fakeLinks) {
  link.addEventListener("click", navigateLink);
  link.addEventListener("keydown", navigateLink);
}

// handles click and keydown events on the link
function navigateLink(e) {
  if (e.type === "click" || e.key === "Enter") {
    const ref = e.target ?? e.srcElement;
    const target = ref.getAttribute("data-target") || "_blank";
    if (ref) window.open(ref.getAttribute("data-href"), target);
  }
}
