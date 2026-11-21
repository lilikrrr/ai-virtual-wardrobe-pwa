
const photoInput = document.getElementById("photo");
const preview = document.getElementById("photo-preview");
const originalImage = document.getElementById("original-image");
const removeButton = document.getElementById("remove-photo");
const promptInput = document.getElementById("prompt");
const ratioInput = document.getElementById("ratio");
const generateButton = document.getElementById("generate");
const resultImage = document.getElementById("result-image");
const emptyResult = document.getElementById("empty");
const message = document.getElementById("message");
const downloadButton = document.getElementById("download");
const status = document.getElementById("status");

let selectedPhoto = null;
let selectedCategory = "Kebaya";

function showMessage(text) {
  if (message) message.textContent = text;
}

function setStatus(text) {
  if (status) status.textContent = text;
}

// Upload foto model
photoInput?.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showMessage("Pilih file gambar JPG, PNG atau WebP.");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showMessage("Ukuran foto maksimal 10 MB.");
    return;
  }

  selectedPhoto = file;

  const reader = new FileReader();

  reader.onload = () => {
    originalImage.src = reader.result;
    preview.hidden = false;
    setStatus("Foto model siap digunakan");
    showMessage("Foto berhasil diunggah.");
  };

  reader.readAsDataURL(file);
});

// Hapus foto
removeButton?.addEventListener("click", () => {
  selectedPhoto = null;
  photoInput.value = "";
  originalImage.src = "";
  preview.hidden = true;
  setStatus("Belum ada foto");
  showMessage("Foto dihapus.");
});

// Pilihan kategori pakaian
document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;

    document.querySelectorAll(".category").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    showMessage("Kategori dipilih: " + selectedCategory);
  });
});

// Generate gambar AI
generateButton?.addEventListener("click", async () => {
  if (!selectedPhoto) {
    showMessage("Silakan unggah foto model terlebih dahulu.");
    return;
  }

  const description = promptInput.value.trim();

  if (!description) {
    showMessage("Masukkan deskripsi pakaian terlebih dahulu.");
    return;
  }

  const formData = new FormData();

  formData.append("photo", selectedPhoto);

  formData.append(
    "prompt",
    "Virtual try-on pakaian kategori " +
    selectedCategory +
    ". " +
    description +
    ". Pertahankan identitas wajah, ekspresi, dan karakter model asli."
  );

  formData.append(
    "ratio",
    ratioInput?.value || "9:16"
  );

  generateButton.disabled = true;
  generateButton.textContent = "Sedang membuat gambar...";
  showMessage("AI sedang memproses foto Anda.");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Gagal membuat gambar.");
    }

    if (!data.image) {
      throw new Error("Hasil gambar tidak ditemukan.");
    }

    resultImage.src = data.image;
    resultImage.hidden = false;

    if (emptyResult) emptyResult.hidden = true;

    downloadButton.href = data.image;
    downloadButton.download = "AI-Virtual-Wardrobe.png";
    downloadButton.hidden = false;

    showMessage("Berhasil! Gambar AI sudah dibuat.");
  } catch (error) {
    showMessage("Terjadi kesalahan: " + error.message);
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "Buat Gambar AI";
  }
});

setStatus("AI Virtual Wardrobe siap digunakan");
