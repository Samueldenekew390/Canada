/*
  Cleaned client script: modal, registration, simple localStorage docs, admin CRUD.
*/

const questions = document.querySelectorAll(".question");
questions.forEach((q) =>
  q.addEventListener("click", () => {
    const plus = q.querySelector("span");
    if (plus) plus.textContent = plus.textContent === "+" ? "-" : "+";
  }),
);

const STORAGE_KEY = "clientDocs";

// Ensure critical listeners are attached after load (fixes race on some hosts)
window.addEventListener("load", () => {
  try {
    const btn = document.getElementById("register-toggle");
    const modal = document.getElementById("register-modal");
    const closeBtn = document.getElementById("register-close");
    if (btn && modal && !btn._initAttached) {
      btn.addEventListener("click", () => {
        modal.style.display = "flex";
        const first = document.getElementById("client-name");
        if (first) first.focus();
      });
      if (closeBtn)
        closeBtn.addEventListener(
          "click",
          () => (modal.style.display = "none"),
        );
      modal.addEventListener("click", (ev) => {
        if (ev.target === modal) modal.style.display = "none";
      });
      btn._initAttached = true;
    }
  } catch (e) {
    console.warn("Error attaching load listeners", e);
  }
});

function loadDocs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveDocs(d) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

// Register modal
const registerToggle = document.getElementById("register-toggle");
const registerModal = document.getElementById("register-modal");
const registerClose = document.getElementById("register-close");
const clientForm = document.getElementById("client-register-form");
const clientPhotoInput = document.getElementById("client-photo");
const clientPhotoPreview = document.getElementById("client-photo-preview");
const registerMessage = document.getElementById("register-message");

let clientPhotoData = "";

if (registerToggle && registerModal) {
  registerToggle.addEventListener("click", () => {
    registerModal.style.display = "flex";
    const first = document.getElementById("client-name");
    if (first) first.focus();
  });
}
if (registerClose && registerModal)
  registerClose.addEventListener(
    "click",
    () => (registerModal.style.display = "none"),
  );
if (registerModal)
  registerModal.addEventListener("click", (ev) => {
    if (ev.target === registerModal) registerModal.style.display = "none";
  });

if (clientPhotoInput) {
  clientPhotoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) {
      clientPhotoData = "";
      if (clientPhotoPreview) clientPhotoPreview.style.display = "none";
      return;
    }
    if (!file.type.startsWith("image/")) {
      clientPhotoData = "";
      if (clientPhotoPreview) clientPhotoPreview.style.display = "none";
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      clientPhotoData = r.result;
      if (clientPhotoPreview) {
        clientPhotoPreview.src = clientPhotoData;
        clientPhotoPreview.style.display = "block";
      }
    };
    r.readAsDataURL(file);
  });
}

if (clientForm) {
  clientForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.getElementById("client-name") || {}).value || "";
    const age = (document.getElementById("client-age") || {}).value || "";
    const gender = (document.getElementById("client-gender") || {}).value || "";
    const email = (document.getElementById("client-email") || {}).value || "";
    const phone = (document.getElementById("client-phone") || {}).value || "";
    const dob = (document.getElementById("client-dob") || {}).value || "";
    const place = (document.getElementById("client-place") || {}).value || "";
    const country =
      (document.getElementById("client-country") || {}).value || "";
    const passport =
      (document.getElementById("client-passport") || {}).value || "";

    if (
      !name ||
      !age ||
      !gender ||
      !email ||
      !phone ||
      !dob ||
      !place ||
      !country ||
      !passport
    ) {
      if (registerMessage)
        registerMessage.innerText = "Please fill all required fields.";
      return;
    }

    const docs = loadDocs();
    let otp;
    do {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    } while (docs[otp]);

    docs[otp] = {
      name,
      age,
      gender,
      email,
      phone,
      dob,
      place,
      country,
      passport,
      photo: clientPhotoData || "",
      submittedAt: new Date().toISOString(),
    };

    saveDocs(docs);
    if (registerMessage)
      registerMessage.innerText = `Submitted. OTP: ${otp} — saved.`;
    if (registerModal) registerModal.style.display = "none";
    clientForm.reset();
    if (clientPhotoPreview) {
      clientPhotoPreview.src = "";
      clientPhotoPreview.style.display = "none";
    }
    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  });
}

// Admin document manager (simple localStorage)
const adminForm = document.getElementById("admin-doc-form");
const adminMessage = document.getElementById("admin-message");
const adminList = document.getElementById("admin-list");
const adminPhotoInput = document.getElementById("admin-photo");
const adminPhotoPreview = document.getElementById("admin-photo-preview");
let adminPhotoData = "";

if (adminPhotoInput) {
  adminPhotoInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f || !f.type.startsWith("image/")) {
      adminPhotoData = "";
      if (adminPhotoPreview) adminPhotoPreview.style.display = "none";
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      adminPhotoData = r.result;
      if (adminPhotoPreview) {
        adminPhotoPreview.src = adminPhotoData;
        adminPhotoPreview.style.display = "block";
      }
    };
    r.readAsDataURL(f);
  });
}

function renderAdminList() {
  if (!adminList) return;
  const docs = loadDocs();
  const keys = Object.keys(docs);
  if (!keys.length) {
    adminList.innerHTML = "<p>No client docs saved yet.</p>";
    return;
  }
  adminList.innerHTML = keys
    .map((otp) => {
      const d = docs[otp];
      return `<div class="admin-item"><div><strong>OTP:</strong> ${otp}</div><div><p><strong>Name:</strong> ${d.name}</p><p>${d.content || ""}</p>${d.photo ? `<img src="${d.photo}" style="max-width:160px"/>` : ""}<p><button class="admin-delete-button" data-otp="${otp}">Delete</button></p></div></div>`;
    })
    .join("");
}

if (adminList) {
  adminList.addEventListener("click", (e) => {
    const t = e.target;
    if (t.matches && t.matches(".admin-delete-button")) {
      const otp = t.getAttribute("data-otp");
      if (!otp) return;
      const docs = loadDocs();
      delete docs[otp];
      saveDocs(docs);
      renderAdminList();
    }
  });
}

if (adminForm) {
  adminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const otp = (document.getElementById("admin-otp") || {}).value || "";
    const name =
      (document.getElementById("admin-client-name") || {}).value || "";
    const title =
      (document.getElementById("admin-doc-title") || {}).value || "";
    const content =
      (document.getElementById("admin-doc-content") || {}).value || "";

    if (!otp || !name || !title || !content) {
      if (adminMessage)
        adminMessage.innerText = "Please fill all required fields.";
      return;
    }

    const docs = loadDocs();
    docs[otp] = {
      name,
      title,
      content,
      photo: adminPhotoData || "",
      updatedAt: new Date().toISOString(),
    };
    saveDocs(docs);
    if (adminMessage) adminMessage.innerText = `Saved document for OTP ${otp}.`;
    adminForm.reset();
    adminPhotoData = "";
    if (adminPhotoPreview) {
      adminPhotoPreview.src = "";
      adminPhotoPreview.style.display = "none";
    }
    renderAdminList();
  });
}

// OTP lookup form on otp.html -> redirect to doc.html with query param
const otpForm = document.getElementById("otp-form");
const otpMessage = document.getElementById("otp-message");
if (otpForm) {
  otpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = (document.getElementById("otp-code") || {}).value || "";
    const docs = loadDocs();
    if (docs[code]) {
      window.location.href = `doc.html?otp=${encodeURIComponent(code)}`;
    } else {
      if (otpMessage) otpMessage.innerText = "Invalid or expired OTP.";
    }
  });
}

// Render document on doc.html when ?otp=... is present
function renderDocFromQuery() {
  try {
    const params = new URLSearchParams(location.search);
    const code = params.get("otp");
    const docTitle = document.getElementById("doc-title");
    const docClient = document.getElementById("doc-client");
    const docPhoto = document.getElementById("doc-photo");
    const docBody = document.getElementById("doc-body");
    if (!code) return;
    const docs = loadDocs();
    const d = docs[code];
    if (!d) {
      if (docTitle) docTitle.innerText = "Document Not Found";
      if (docClient) docClient.innerText = "Invalid or expired OTP.";
      if (docPhoto) docPhoto.style.display = "none";
      if (docBody) docBody.innerText = "Please go back and enter a valid OTP.";
      return;
    }

    if (docTitle) docTitle.innerText = d.title || "Client Document";
    if (docClient)
      docClient.innerText = d.name
        ? `${d.name} — Submitted ${d.submittedAt || d.updatedAt || ""}`
        : "";
    if (docBody)
      docBody.innerText =
        d.content ||
        `Passport: ${d.passport || ""}\nAge: ${d.age || ""}\nPhone: ${d.phone || ""}`;
    if (docPhoto) {
      if (d.photo) {
        docPhoto.src = d.photo;
        docPhoto.style.display = "block";
      } else docPhoto.style.display = "none";
    }
  } catch (e) {
    console.warn("Error rendering document", e);
  }
}

window.addEventListener("load", () => {
  renderDocFromQuery();
});
