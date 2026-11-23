import {
  mountConverterProgram,
  mountNumberProgram,
  mountPayrollProgram,
  mountTaxProgram,
} from "./programs.js";

const imageSources = {
  light: {
    contact: new URL("./assets/vaporeon.png", import.meta.url).href,
    contactAlt: "Vaporeon plush",
    theme: new URL("./assets/sun.jpg", import.meta.url).href,
    portrait: new URL("./assets/cinamoroll.jpg", import.meta.url).href,
    portraitAlt: "Cinamoroll close-up",
    landscape: new URL("./assets/sea.jpg", import.meta.url).href,
    landscapeAlt: "Sunlit sea",
  },
  dark: {
    contact: new URL("./assets/baymax.png", import.meta.url).href,
    contactAlt: "Baymax plush",
    theme: new URL("./assets/moon.jpg", import.meta.url).href,
    portrait: new URL("./assets/blue-pikmin-contemplating.jpg", import.meta.url).href,
    portraitAlt: "Blue Pikmin contemplating",
    landscape: new URL("./assets/jellyfish.jpg", import.meta.url).href,
    landscapeAlt: "Blue jellyfish",
  },
};

const toolDetails = {
  payroll: { title: "Simple Payroll", mount: mountPayrollProgram, width: 940 },
  numbers: { title: "Nth Number Lab", mount: mountNumberProgram, width: 760 },
  tax: { title: "Income Tax", mount: mountTaxProgram, width: 760 },
  converter: { title: "Unit Converter", mount: mountConverterProgram, width: 760 },
};

const themeToggle = document.querySelector("#theme-toggle");
let darkMode = false;

function replaceImage(image, source, alt = "") {
  const replacement = image.cloneNode();
  replacement.src = source;
  replacement.alt = alt;
  image.replaceWith(replacement);
  return replacement;
}

themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  const theme = darkMode ? "dark" : "light";
  const images = imageSources[theme];

  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", `Switch to ${darkMode ? "light" : "dark"} mode`);
  themeToggle.setAttribute("aria-pressed", String(darkMode));

  replaceImage(document.querySelector("#contact-image"), images.contact, images.contactAlt);
  const themeImage = replaceImage(themeToggle.querySelector("img"), images.theme);
  themeToggle.append(themeImage);
  replaceImage(document.querySelector("#portrait-image"), images.portrait, images.portraitAlt);
  replaceImage(document.querySelector("#landscape-image"), images.landscape, images.landscapeAlt);
});

function openTool(tool) {
  const details = toolDetails[tool];
  const preferredWidth = details.width;
  const windowWidth = Math.min(preferredWidth, window.innerWidth - 32);
  const position = {
    x: Math.max(16, (window.innerWidth - windowWidth) / 2),
    y: Math.max(16, (window.innerHeight - 620) / 2),
  };

  const layer = document.createElement("div");
  layer.className = "modal-layer";
  layer.setAttribute("role", "presentation");
  layer.innerHTML = `
    <section
      class="modal-window modal-window--${tool}"
      style="left: ${position.x}px; top: ${position.y}px"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <header class="modal-header">
        <div><h2 id="modal-title">${details.title}</h2></div>
        <button class="close-button" type="button" aria-label="Close window">
          <span></span><span></span>
        </button>
      </header>
      <div class="modal-content"></div>
    </section>
  `;

  document.querySelector(".modal-layer")?.remove();
  document.body.append(layer);
  const modal = layer.querySelector(".modal-window");
  const header = layer.querySelector(".modal-header");
  const closeButton = layer.querySelector(".close-button");
  let drag = null;

  const close = () => {
    window.removeEventListener("keydown", onKeyDown);
    layer.remove();
  };

  function onKeyDown(event) {
    if (event.key === "Escape") close();
  }

  header.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    header.setPointerCapture(event.pointerId);
    drag = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
  });

  header.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const maxX = Math.max(8, window.innerWidth - 120);
    const maxY = Math.max(8, window.innerHeight - 70);
    position.x = Math.min(maxX, Math.max(8, drag.originX + event.clientX - drag.startX));
    position.y = Math.min(maxY, Math.max(8, drag.originY + event.clientY - drag.startY));
    modal.style.left = `${position.x}px`;
    modal.style.top = `${position.y}px`;
  });

  const stopDragging = () => {
    drag = null;
  };

  header.addEventListener("pointerup", stopDragging);
  header.addEventListener("pointercancel", stopDragging);
  closeButton.addEventListener("click", close);
  window.addEventListener("keydown", onKeyDown);
  details.mount(layer.querySelector(".modal-content"));
}

document.querySelectorAll("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => openTool(button.dataset.tool));
});
