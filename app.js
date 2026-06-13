(function () {
  "use strict";

  const config = window.PORTFOLIO_CONFIG;

  document.querySelectorAll("[data-config]").forEach((element) => {
    const path = element.dataset.config.split(".");
    const value = path.reduce((current, key) => current && current[key], config);

    if (!value) return;
    if (element.tagName === "A") element.href = value;
    if (element.dataset.configText !== "false") element.textContent = value;
  });

  document.querySelectorAll("[data-email]").forEach((element) => {
    element.href = `mailto:${config.email}`;
    element.textContent = config.email;
  });

  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = new Date().getFullYear();

  const typingTarget = document.querySelector("[data-typing]");
  if (!typingTarget || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (typingTarget) typingTarget.textContent = "Penetration Tester | CS Student";
    return;
  }

  const phrases = [
    "Penetration Tester",
    "Computer Science Student",
    "Security Researcher",
    "Always learning. Always testing."
  ];
  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;

  function type() {
    const phrase = phrases[phraseIndex];
    characterIndex += deleting ? -1 : 1;
    typingTarget.textContent = phrase.slice(0, characterIndex);

    let delay = deleting ? 42 : 72;
    if (!deleting && characterIndex === phrase.length) {
      deleting = true;
      delay = 1200;
    } else if (deleting && characterIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 260;
    }

    window.setTimeout(type, delay);
  }

  type();
})();
