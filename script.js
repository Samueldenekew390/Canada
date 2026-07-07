const questions = document.querySelectorAll(".question");

if (questions.length) {
  questions.forEach((question) => {
    question.addEventListener("click", () => {
      alert("Answer will appear here");
    });
  });
}

const adminForm = document.getElementById("admin-doc-form");
const adminMessage = document.getElementById("admin-message");
const adminList = document.getElementById("admin-list");
const adminPhotoInput = document.getElementById("admin-photo");
const adminPhotoPreview = document.getElementById("admin-photo-preview");
const otpForm = document.getElementById("otp-form");
const otpMessage = document.getElementById("otp-message");
const docTitle = document.getElementById("doc-title");
const docClient = document.getElementById("doc-client");
const docBody = document.getElementById("doc-body");
const docPhoto = document.getElementById("doc-photo");
const receiptForm = document.getElementById("receipt-form");
const receiptPhotoInput = document.getElementById("receipt-photo");
const receiptPreview = document.getElementById("receipt-preview");
const receiptMessage = document.getElementById("receipt-message");

let adminPhotoData = "";
let receiptPhotoData = "";

const STORAGE_KEY = "clientDocs";

// Client registration handling
const registerToggle = document.getElementById("register-toggle");
const clientForm = document.getElementById("client-register-form");
const clientPhotoInput = document.getElementById("client-photo");
const clientPhotoPreview = document.getElementById("client-photo-preview");
const registerMessage = document.getElementById("register-message");

let clientPhotoData = "";

if (registerToggle && clientForm) {
  const registerModal = document.getElementById("register-modal");
  const registerClose = document.getElementById("register-close");

  // open modal
  registerToggle.addEventListener("click", () => {
    if (registerModal) {
      registerModal.style.display = "flex";
      // focus first input
      const first = document.getElementById("client-name");
      if (first) first.focus();
    }
  });

  // close modal handlers
  if (registerClose) {
    registerClose.addEventListener("click", () => {
      if (registerModal) registerModal.style.display = "none";
    });
  }

  if (registerModal) {
    registerModal.addEventListener("click", (ev) => {
      if (ev.target === registerModal) {
        registerModal.style.display = "none";
      }
    });
  }

  // preview client photo
  if (clientPhotoInput) {
    clientPhotoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          clientPhotoData = reader.result;
          if (clientPhotoPreview) {
            clientPhotoPreview.src = clientPhotoData;
            clientPhotoPreview.style.display = "block";
          }
        };
        reader.readAsDataURL(file);
      } else {
        clientPhotoData = "";
        if (clientPhotoPreview) {
          clientPhotoPreview.src = "";
          clientPhotoPreview.style.display = "none";
        }
      }
    });
  }

  clientForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("client-name").value.trim();
    const age = document.getElementById("client-age").value.trim();
    const gender = document.getElementById("client-gender").value;
    const email = document.getElementById("client-email").value.trim();
    const phone = document.getElementById("client-phone").value.trim();
    const dob = document.getElementById("client-dob").value;
    const place = document.getElementById("client-place").value.trim();
    const country = document.getElementById("client-country").value.trim();
    const passport = document.getElementById("client-passport").value.trim();

    if (!name || !age || !gender || !email || !phone || !dob || !place || !country || !passport) {
      if (registerMessage) registerMessage.innerText = "Please fill all required fields.";
      return;
    }

    // generate unique OTP
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
      photo: clientPhotoData,
      submittedAt: new Date().toISOString(),
    };

    saveDocs(docs);
    if (registerMessage) registerMessage.innerText = `Submitted. OTP: ${otp} — saved. You can visit the admin page to review.`;
    // close modal and stay on homepage
    if (registerModal) registerModal.style.display = "none";
    setTimeout(() => {
      window.location.href = `abusha.html`;
    }, 700);
  });
}

function loadDocs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (err) {
    return {};
  }
}

function saveDocs(docs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function deleteDoc(otp) {
  const docs = loadDocs();
  if (docs[otp]) {
    delete docs[otp];
    saveDocs(docs);
    renderAdminList();
  }
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
      const doc = docs[otp];
      const displayName = doc.name || doc.clientName || "Unnamed";
      const docTitle = doc.title || "Client Registration";
      const content = doc.content || "Client registration details.";
      const fields = [];
      if (doc.age) fields.push(`<strong>Age:</strong> ${doc.age}`);
      if (doc.gender) fields.push(`<strong>Gender:</strong> ${doc.gender}`);
      if (doc.email) fields.push(`<strong>Email:</strong> ${doc.email}`);
      if (doc.phone) fields.push(`<strong>Phone:</strong> ${doc.phone}`);
      if (doc.dob) fields.push(`<strong>DOB:</strong> ${doc.dob}`);
      if (doc.place) fields.push(`<strong>Place of Birth:</strong> ${doc.place}`);
      if (doc.country) fields.push(`<strong>Country:</strong> ${doc.country}`);
      if (doc.passport) fields.push(`<strong>Passport #:</strong> ${doc.passport}`);
      return `
        <div class="admin-item">
          <div class="admin-item-header">
            <strong>OTP:</strong> ${otp}
            <span class="admin-item-title">${docTitle}</span>
          </div>
          <div class="admin-item-body">
            <p><strong>Name:</strong> ${displayName}</p>
            ${fields.map((field) => `<p>${field}</p>`).join("")}
            <p><strong>Saved At:</strong> ${new Date(doc.savedAt || doc.submittedAt || Date.now()).toLocaleString()}</p>
            ${doc.photo ? `<img class="admin-item-photo" src="${doc.photo}" alt="Client photo" />` : ""}
            ${doc.receiptPhoto ? `<p><strong>Receipt Submitted:</strong> ${new Date(doc.receiptSubmittedAt || Date.now()).toLocaleString()}</p><img class="admin-item-photo" src="${doc.receiptPhoto}" alt="Receipt photo" />` : ""}
            <p>${content}</p>
            <button class="admin-delete-button" data-otp="${otp}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

if (adminPhotoInput) {
  adminPhotoInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        adminPhotoData = reader.result;
        if (adminPhotoPreview) {
          adminPhotoPreview.src = adminPhotoData;
          adminPhotoPreview.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    } else {
      adminPhotoData = "";
      if (adminPhotoPreview) {
        adminPhotoPreview.src = "";
        adminPhotoPreview.style.display = "none";
      }
    }
  });
}

if (adminForm) {
  adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const otp = document.getElementById("admin-otp").value.trim();
    const name = document.getElementById("admin-client-name").value.trim();
    const title = document.getElementById("admin-doc-title").value.trim();
    const content = document.getElementById("admin-doc-content").value.trim();

    if (!otp || !name || !title || !content) {
      adminMessage.innerText = "Please complete all fields.";
      return;
    }

    const docs = loadDocs();
    docs[otp] = {
      name,
      title,
      content,
      photo: adminPhotoData,
      savedAt: new Date().toISOString(),
    };
    saveDocs(docs);
    adminMessage.innerText = `Saved document for OTP ${otp}.`;
    renderAdminList();
    adminForm.reset();
    adminPhotoData = "";
    if (adminPhotoPreview) {
      adminPhotoPreview.src = "";
      adminPhotoPreview.style.display = "none";
    }
  });
  renderAdminList();

  if (adminList) {
    adminList.addEventListener("click", (event) => {
      const target = event.target;
      if (target.matches && target.matches(".admin-delete-button")) {
        const otp = target.getAttribute("data-otp");
        if (otp) {
          deleteDoc(otp);
        }
      }
    });
  }
}

if (otpForm) {
  otpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const otp = document.getElementById("otp-code").value.trim();
    const docs = loadDocs();
    if (otp && docs[otp]) {
      window.location.href = `doc.html?otp=${encodeURIComponent(otp)}`;
    } else {
      otpMessage.innerText = "OTP not found. Please check the number.";
    }
  });
}

if (docTitle && docClient && docBody) {
  const params = new URLSearchParams(window.location.search);
  const otp = params.get("otp");
  const docs = loadDocs();
  if (otp && docs[otp]) {
    const doc = docs[otp];
    docTitle.innerText = doc.title || "Client Document";
    docClient.innerText = `Name: ${doc.name || "Unknown"}`;
    if (docPhoto) {
      if (doc.photo) {
        docPhoto.src = doc.photo;
        docPhoto.style.display = "block";
      } else {
        docPhoto.style.display = "none";
      }
    }
    docBody.innerText = doc.content || "Client document details are available here.";

    if (receiptPreview && doc.receiptPhoto) {
      receiptPreview.src = doc.receiptPhoto;
      receiptPreview.style.display = "block";
      if (receiptMessage) receiptMessage.innerText = "A receipt has already been submitted. You may upload a new one if needed.";
    }

    if (receiptPhotoInput) {
      receiptPhotoInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            receiptPhotoData = reader.result;
            if (receiptPreview) {
              receiptPreview.src = receiptPhotoData;
              receiptPreview.style.display = "block";
            }
          };
          reader.readAsDataURL(file);
        } else {
          receiptPhotoData = "";
          if (receiptPreview) {
            receiptPreview.style.display = "none";
          }
        }
      });
    }

    if (receiptForm) {
      receiptForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!receiptPhotoData) {
          if (receiptMessage) receiptMessage.innerText = "Please choose a receipt photo before submitting.";
          return;
        }

        const docs = loadDocs();
        docs[otp] = {
          ...doc,
          receiptPhoto: receiptPhotoData,
          receiptSubmittedAt: new Date().toISOString(),
        };
        saveDocs(docs);
        if (receiptMessage) receiptMessage.innerText = "Receipt submitted successfully.";
        receiptPhotoData = "";
        if (receiptPreview) {
          receiptPreview.src = "";
          receiptPreview.style.display = "none";
        }
        if (receiptForm) {
          receiptForm.reset();
        }
      });
    }
  } else {
    docTitle.innerText = "Document Not Found";
    docClient.innerText = "Invalid or expired OTP.";
    if (docPhoto) {
      docPhoto.style.display = "none";
    }
    docBody.innerText = "Please go back and enter a valid OTP.";
  }
}
