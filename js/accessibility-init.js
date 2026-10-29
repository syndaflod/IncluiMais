(() => {
  const root = document.documentElement;
  const savedScale = Number.parseInt(localStorage.getItem("incluimais-font-scale"), 10);
  const scale = [100, 112, 125, 150].includes(savedScale) ? savedScale : 100;
  const savedContrast = localStorage.getItem("incluimais-high-contrast");
  const contrast = savedContrast === null
    ? window.matchMedia("(prefers-contrast: more)").matches
    : savedContrast === "true";

  root.dataset.fontScale = String(scale);
  root.style.setProperty("--im-font-scale", String(scale / 100));
  root.classList.toggle("alto-contraste", contrast);
})();
