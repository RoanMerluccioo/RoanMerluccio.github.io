/* ------------------------------
   CONFIG
------------------------------ */
const IMAGE_COUNT = 12;
const IMAGE_PATH = "images/";

/* ------------------------------
   Editor Mode Toggle
------------------------------ */
const params = new URLSearchParams(window.location.search);
const isEditor = params.get("edit") === "true";

/* ------------------------------
   Build Gallery Automatically
------------------------------ */
const gallery = document.querySelector(".gallery");

for (let i = 1; i <= IMAGE_COUNT; i++) {
  const num = String(i).padStart(2, "0");

  const item = document.createElement("div");
  item.className = "image-item";

  const img = document.createElement("img");
  img.src = `${IMAGE_PATH}${num}.jpg`;
  img.loading = "lazy";
  img.alt = `Photography work ${i}`;

  item.appendChild(img);
  gallery.appendChild(item);
}

/* ------------------------------
   Editor Banner
------------------------------ */
if (isEditor) {
  const banner = document.createElement("div");
  banner.textContent = "EDITOR MODE";
  banner.style.position = "fixed";
  banner.style.top = "16px";
  banner.style.right = "16px";
  banner.style.padding = "6px 10px";
  banner.style.fontSize = "0.7rem";
  banner.style.letterSpacing = "0.12em";
  banner.style.background = "rgba(255,255,255,0.08)";
  banner.style.color = "#fff";
  banner.style.zIndex = "9999";
  document.body.appendChild(banner);
}

/* ------------------------------
   Fullscreen Viewer
------------------------------ */
document.querySelectorAll(".image-item img").forEach(img => {
  img.addEventListener("click", e => {
    e.stopPropagation();

    const overlay = document.createElement("div");
    overlay.className = "fullscreen-overlay";

    const fullImg = document.createElement("img");
    fullImg.src = img.src;

    overlay.appendChild(fullImg);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", () => overlay.remove());

    document.addEventListener("keydown", function esc(ev) {
      if (ev.key === "Escape") {
        overlay.remove();
        document.removeEventListener("keydown", esc);
      }
    });
  });
});

/* ------------------------------
   Drag & Drop (EDITOR MODE ONLY)
------------------------------ */
if (isEditor) {
  let dragged = null;

  gallery.querySelectorAll(".image-item").forEach(item => {
    item.setAttribute("draggable", true);

    item.addEventListener("dragstart", () => {
      dragged = item;
      item.style.opacity = "0.5";
    });

    item.addEventListener("dragend", () => {
      dragged = null;
      item.style.opacity = "1";
    });

    item.addEventListener("dragover", e => e.preventDefault());

    item.addEventListener("drop", e => {
      e.preventDefault();
      if (dragged && dragged !== item) {
        const items = [...gallery.children];
        const draggedIndex = items.indexOf(dragged);
        const targetIndex = items.indexOf(item);

        if (draggedIndex < targetIndex) {
          gallery.insertBefore(dragged, item.nextSibling);
        } else {
          gallery.insertBefore(dragged, item);
        }
      }
    });
  });
}
