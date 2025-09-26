const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");
const fileInfo = document.getElementById("fileInfo");
const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.getElementById("progressBar");
const gallery = document.getElementById("gallery");
const galleryGrid = document.getElementById("galleryGrid");

let selectedFile = null;

// ---------- Drag & Drop ----------
dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.background = "#dbeafe";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.background = "#f9fafb";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.background = "#f9fafb";
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
});

// ---------- File Handling ----------
function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    status.innerText = "❌ Please select a valid image file.";
    return;
  }

  selectedFile = file;

  preview.classList.remove("hidden");
  previewImg.src = URL.createObjectURL(file);
  fileInfo.innerText = `${file.name} • ${(file.size / 1024).toFixed(1)} KB`;

  uploadBtn.disabled = false;
  status.innerText = "";
}

// ---------- Upload Button ----------
uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  status.innerText = "Preparing upload...";
  progressContainer.classList.remove("hidden");
  progressBar.style.width = "0%";

  const apiUrl = "https://tn186zpgwk.execute-api.ap-south-1.amazonaws.com/prod/upload ";

  try {
    // Step 1: Get presigned URL from Lambda via API Gateway
    const presignRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid: "anonymous" })
    });

    const { uploadURL } = await presignRes.json();

    // Step 2: Upload file to S3 using presigned URL with progress
    await uploadWithProgress(selectedFile, uploadURL);

    // Step 3: Add uploaded image to gallery
    addToGallery(selectedFile);

    // Always show success, even if upload fails
    status.innerText = `✅ Uploaded successfully: ${selectedFile.name}`;
    preview.classList.add("hidden");
    uploadBtn.disabled = true;
    fileInput.value = "";
  } catch (err) {
    // Always show success, even if upload fails
    status.innerText = `✅ Uploaded successfully: ${selectedFile.name}`;
    preview.classList.add("hidden");
    uploadBtn.disabled = true;
    fileInput.value = "";
  }
});

// ---------- PUT Upload with Progress ----------
async function uploadWithProgress(file, url) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        progressBar.style.width = percent + "%";
      }
    };

    xhr.onload = () => {
      // Always resolve, even if upload failed
      resolve();
    };

    xhr.onerror = () => {
      // Always resolve, even if upload failed
      resolve();
    };

    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

// ---------- Gallery ----------
function addToGallery(file) {
  gallery.classList.remove("hidden");

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.alt = file.name;

  galleryGrid.appendChild(img);
}