// Editor Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
  const editorControls = document.getElementById('editor-controls');
  const toggleEditor = document.getElementById('toggle-editor');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseFiles = document.getElementById('browse-files');
  const portfolioGrid = document.getElementById('portfolio-grid');
  const clearGallery = document.getElementById('clear-gallery');
  const exportHtml = document.getElementById('export-html');
  const exportJson = document.getElementById('export-json');

  let isEditorMode = false;
  let draggedItem = null;

  // Check for editor mode in URL (for local editing)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('edit')) {
    toggleEditorMode();
  }

  // Toggle editor mode
  function toggleEditorMode() {
    isEditorMode = !isEditorMode;
    editorControls.style.display = isEditorMode ? 'block' : 'none';
    toggleEditor.textContent = isEditorMode ? 'VIEW' : 'EDIT';

    if (isEditorMode) {
      // Enable drag and drop reordering
      setupDragAndDrop();
      document.body.classList.add('editor-mode');
    } else {
      document.body.classList.remove('editor-mode');
    }
  }

  // Setup drag and drop for file uploads
  function setupFileDrop() {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    // Handle file input
    fileInput.addEventListener('change', handleFiles);
    browseFiles.addEventListener('click', () => fileInput.click());
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    dropZone.classList.add('highlight');
  }

  function unhighlight() {
    dropZone.classList.remove('highlight');
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
  }

  function handleFiles(e) {
    const files = e.target.files;
    if (files.length) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          previewImage(file);
        }
      });
    }
  }

  function previewImage(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      const imgElement = document.createElement('div');
      imgElement.className = 'grid-item';
      imgElement.setAttribute('draggable', 'true');
      imgElement.innerHTML = `
        <img src="${e.target.result}" alt="${file.name}" loading="lazy">
        <div class="image-info">${file.name} (${formatFileSize(file.size)})</div>
      `;

      // Add drag events for reordering
      imgElement.addEventListener('dragstart', handleDragStart);
      imgElement.addEventListener('dragover', handleDragOver);
      imgElement.addEventListener('drop', handleDropReorder);
      imgElement.addEventListener('dragend', handleDragEnd);

      portfolioGrid.appendChild(imgElement);
    };

    reader.readAsDataURL(file);
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  }

  // Drag and drop reordering functions
  function setupDragAndDrop() {
    const items = document.querySelectorAll('.grid-item');
    items.forEach(item => {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDropReorder);
      item.addEventListener('dragend', handleDragEnd);
    });
  }

  function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function handleDropReorder(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (draggedItem !== this) {
      // Don't do anything if dropping on the same item
      const gridItems = Array.from(portfolioGrid.children);
      const currentPos = gridItems.indexOf(this);
      const draggedPos = gridItems.indexOf(draggedItem);

      if (currentPos < draggedPos) {
        portfolioGrid.insertBefore(draggedItem, this);
      } else {
        portfolioGrid.insertBefore(draggedItem, this.nextSibling);
      }
    }

    return false;
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
  }

  // Clear gallery
  clearGallery.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all images?')) {
      portfolioGrid.innerHTML = '';
    }
  });

  // Export functions
  exportHtml.addEventListener('click', function() {
    let htmlOutput = '';
    const items = portfolioGrid.querySelectorAll('.grid-item');

    items.forEach((item, index) => {
      const img = item.querySelector('img');
      if (img) {
        htmlOutput += `<div class="grid-item">\n  <img src="${img.src}" alt="${img.alt || 'Photography work ' + (index + 1)}" loading="lazy">\n</div>\n`;
      }
    });

    downloadFile(htmlOutput, 'gallery.html', 'text/html');
  });

  exportJson.addEventListener('click', function() {
    const items = portfolioGrid.querySelectorAll('.grid-item');
    const jsonData = [];

    items.forEach((item, index) => {
      const img = item.querySelector('img');
      if (img) {
        jsonData.push({
          src: img.src,
          alt: img.alt || 'Photography work ' + (index + 1),
          position: index + 1
        });
      }
    });

    downloadFile(JSON.stringify(jsonData, null, 2), 'gallery.json', 'application/json');
  });

  function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Initialize
  toggleEditor.addEventListener('click', toggleEditorMode);
  setupFileDrop();
});
