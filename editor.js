/* ------------------------------
   Editor Mode Toggle
------------------------------ */
const params = new URLSearchParams(window.location.search);
const isEditor = params.get("edit") === "true";

if (!isEditor) {
  // Do nothing for normal visitors
  return;
}

/* ------------------------------
   Editor Banner
------------------------------ */
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
banner.style.borderRadius = "2px";

document.body.appendChild(banner);

/* ------------------------------
   Drag & Drop Reordering
------------------------------ */
const gallery = document.querySelector(".gallery");
let draggedItem = null;

gallery.querySelectorAll(".image-item").forEach(item => {
  item.setAttribute("draggable", "true");

  item.addEventListener("dragstart", () => {
    draggedItem = item;
    item.style.opacity = "0.5";
  });

  item.addEventListener("dragend", () => {
    draggedItem = null;
    item.style.opacity = "1";
  });

  item.addEventListener("dragover", e => {
    e.preventDefault();
  });

  item.addEventListener("drop", e => {
    e.preventDefault();
    if (draggedItem && draggedItem !== item) {
      const items = Array.from(gallery.children);
      const draggedIndex = items.indexOf(draggedItem);
      const targetIndex = items.indexOf(item);

      if (draggedIndex < targetIndex) {
        gallery.insertBefore(draggedItem, item.nextSibling);
      } else {
        gallery.insertBefore(draggedItem, item);
      }
    }
  });
});

/* ------------------------------
   Fullscreen Image Viewer
------------------------------ */
document.querySelectorAll(".image-item img").forEach(img => {
  img.addEventListener("click", e => {
    // Prevent editor drag interference
    e.stopPropagation();

    const overlay = document.createElement("div");
    overlay.className = "fullscreen-overlay";

    const fullscreenImg = document.createElement("img");
    fullscreenImg.src = img.src;
    fullscreenImg.alt = img.alt;

    overlay.appendChild(fullscreenImg);
    document.body.appendChild(overlay);

    // Close on click
    overlay.addEventListener("click", () => {
      overlay.remove();
    });

    // Close on ESC
    document.addEventListener("keydown", function escHandler(ev) {
      if (ev.key === "Escape") {
        overlay.remove();
        document.removeEventListener("keydown", escHandler);
      }
    });
  });
});

