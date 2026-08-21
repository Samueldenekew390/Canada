// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  SUPABASE_URL: "https://fzwhfooxwmosoucbynad.supabase.co",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6d2hmb294d21vc291Y2J5bmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjA0NzUsImV4cCI6MjEwMjc5NjQ3NX0.0gL9k7ihJ5SIueVvpKWGuTE_P_6e9cm32uPpJWd5Jc8",
  TABLE_NAME: "client_docs",
  BUCKET_NAME: "client-photos",
};

// ============================================
// SUPABASE INITIALIZATION
// ============================================
let supabaseClient = null;

function initSupabase() {
  try {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      supabaseClient = window.supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY,
      );
      console.log("[App] Supabase initialized successfully");
    } else {
      console.error(
        "[App] Supabase library not found. " +
          "Make sure the script is loaded before this file.",
      );
    }
  } catch (error) {
    console.error("[App] Failed to initialize Supabase:", error);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function requireSupabase(messageElement) {
  if (supabaseClient) return true;

  const message = "Supabase is not configured. Check console for details.";
  if (messageElement) messageElement.innerText = message;
  console.error("[App]", message);
  return false;
}

function showMessage(element, message, isError = false) {
  if (!element) return;
  element.innerText = message;
  element.style.color = isError ? "#dc3545" : "#0057a8";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// FAQ ACCORDION
// ============================================
function initFaq() {
  const questions = document.querySelectorAll(".question");
  questions.forEach((question) => {
    question.addEventListener("click", () => {
      const plusIcon = question.querySelector("span");
      if (plusIcon) {
        plusIcon.textContent = plusIcon.textContent === "+" ? "−" : "+";
      }
    });
  });
}

// ============================================
// MODAL CONTROLS
// ============================================
function initModal() {
  const toggleBtn = document.getElementById("register-toggle");
  const modal = document.getElementById("register-modal");
  const closeBtn = document.getElementById("register-close");

  if (toggleBtn && modal) {
    toggleBtn.addEventListener("click", () => {
      modal.style.display = "flex";
      const firstInput = document.getElementById("client-name");
      if (firstInput) firstInput.focus();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }
}

// ============================================
// PHOTO PREVIEW
// ============================================
function initPhotoPreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if (!input || !preview) return null;

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      preview.style.display = "none";
      preview.src = "";
      return null;
    }

    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);

    return file;
  });

  return input;
}

// ============================================
// SUPABASE HELPERS
// ============================================
async function uploadPhoto(file, keyHint) {
  if (!file || !supabaseClient) return "";

  const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${keyHint}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabaseClient.storage
    .from(CONFIG.BUCKET_NAME)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.warn("[App] Photo upload failed:", uploadError);
    return "";
  }

  const { data } = supabaseClient.storage
    .from(CONFIG.BUCKET_NAME)
    .getPublicUrl(path);

  return data?.publicUrl || "";
}

async function generateUniqueOtp() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabaseClient
      .from(CONFIG.TABLE_NAME)
      .select("otp")
      .eq("otp", otp)
      .maybeSingle();

    if (!error && !data) return otp;
  }

  throw new Error("Could not generate a unique OTP. Please try again.");
}

// ============================================
// CLIENT REGISTRATION
// ============================================
async function handleClientRegistration(event) {
  event.preventDefault();

  const messageEl = document.getElementById("register-message");
  if (!requireSupabase(messageEl)) return;

  // Get form values
  const formData = {
    name: document.getElementById("client-name")?.value || "",
    age: document.getElementById("client-age")?.value || "",
    gender: document.getElementById("client-gender")?.value || "",
    email: document.getElementById("client-email")?.value || "",
    phone: document.getElementById("client-phone")?.value || "",
    dob: document.getElementById("client-dob")?.value || "",
    place: document.getElementById("client-place")?.value || "",
    country: document.getElementById("client-country")?.value || "",
    passport: document.getElementById("client-passport")?.value || "",
  };

  // Validate required fields
  const requiredFields = [
    "name",
    "age",
    "gender",
    "email",
    "phone",
    "dob",
    "place",
    "country",
    "passport",
  ];
  const missingField = requiredFields.find((field) => !formData[field]);

  if (missingField) {
    showMessage(
      messageEl,
      `Please fill all required fields. (Missing: ${missingField})`,
      true,
    );
    return;
  }

  const submitBtn = event.target.querySelector('[type="submit"]');
  const photoInput = document.getElementById("client-photo");
  const photoFile = photoInput?.files?.[0] || null;

  if (submitBtn) submitBtn.disabled = true;
  showMessage(messageEl, "Submitting...", false);

  try {
    const otp = await generateUniqueOtp();
    const photoUrl = photoFile ? await uploadPhoto(photoFile, otp) : "";

    const { error } = await supabaseClient.from(CONFIG.TABLE_NAME).insert({
      otp,
      ...formData,
      photo_url: photoUrl,
      submitted_at: new Date().toISOString(),
    });

    if (error) throw error;

    showMessage(messageEl, `✅ Submitted successfully! Your OTP: ${otp}`);

    // Reset form
    event.target.reset();
    const preview = document.getElementById("client-photo-preview");
    if (preview) {
      preview.src = "";
      preview.style.display = "none";
    }

    // Close modal and redirect
    const modal = document.getElementById("register-modal");
    if (modal) modal.style.display = "none";

    await sleep(700);
    window.location.href = "index.html";
  } catch (error) {
    console.error("[App] Registration error:", error);
    showMessage(
      messageEl,
      `❌ Error: ${error.message || "Could not save."}`,
      true,
    );
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================
async function renderAdminList() {
  const listEl = document.getElementById("admin-list");
  if (!listEl) return;

  if (!supabaseClient) {
    listEl.innerHTML = "<p>⚠️ Supabase is not configured.</p>";
    return;
  }

  listEl.innerHTML = "<p>Loading...</p>";

  try {
    const { data, error } = await supabaseClient
      .from(CONFIG.TABLE_NAME)
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      listEl.innerHTML = "<p>No client documents found.</p>";
      return;
    }

    // Show every field that exists on the record, not just OTP/name/photo.
    const field = (label, value) => {
      if (value === undefined || value === null || value === "") return "";
      return `<p><strong>${label}:</strong> ${value}</p>`;
    };

    listEl.innerHTML = data
      .map(
        (item) => `
            <div class="admin-item">
                <div><strong>OTP:</strong> ${item.otp}</div>
                <div>
                    ${field("Name", item.name)}
                    ${field("Title", item.title)}
                    ${field("Age", item.age)}
                    ${field("Gender", item.gender)}
                    ${field("Email", item.email)}
                    ${field("Phone", item.phone)}
                    ${field("Date of Birth", item.dob)}
                    ${field("Place", item.place)}
                    ${field("Country", item.country)}
                    ${field("Passport", item.passport)}
                    ${item.content ? `<p><strong>Content:</strong><br>${item.content.replace(/\n/g, "<br>")}</p>` : ""}
                    ${field("Submitted", item.submitted_at)}
                    ${field("Updated", item.updated_at)}
                    ${item.photo_url ? `<img src="${item.photo_url}" style="max-width:160px" alt="Client photo" />` : ""}
                    <p><button class="admin-delete-button" data-otp="${item.otp}">Delete</button></p>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("[App] Error loading admin list:", error);
    listEl.innerHTML = `<p>❌ Error loading documents: ${error.message}</p>`;
  }
}

async function handleAdminDelete(event) {
  const target = event.target;
  if (!target.matches?.(".admin-delete-button")) return;

  const otp = target.getAttribute("data-otp");
  if (!otp || !supabaseClient) return;

  if (!confirm(`Are you sure you want to delete document with OTP: ${otp}?`))
    return;

  target.disabled = true;

  try {
    const { error } = await supabaseClient
      .from(CONFIG.TABLE_NAME)
      .delete()
      .eq("otp", otp);

    if (error) throw error;

    await renderAdminList();
  } catch (error) {
    console.error("[App] Delete error:", error);
    alert(`Could not delete: ${error.message}`);
    target.disabled = false;
  }
}

async function handleAdminSubmit(event) {
  event.preventDefault();

  const messageEl = document.getElementById("admin-message");
  if (!requireSupabase(messageEl)) return;

  const formData = {
    otp: document.getElementById("admin-otp")?.value || "",
    name: document.getElementById("admin-client-name")?.value || "",
    title: document.getElementById("admin-doc-title")?.value || "",
    content: document.getElementById("admin-doc-content")?.value || "",
  };

  const requiredFields = ["otp", "name", "title", "content"];
  const missingField = requiredFields.find((field) => !formData[field]);

  if (missingField) {
    showMessage(
      messageEl,
      `Please fill all required fields. (Missing: ${missingField})`,
      true,
    );
    return;
  }

  const submitBtn = event.target.querySelector('[type="submit"]');
  const photoInput = document.getElementById("admin-photo");
  const photoFile = photoInput?.files?.[0] || null;

  if (submitBtn) submitBtn.disabled = true;
  showMessage(messageEl, "Saving...", false);

  try {
    const photoUrl = photoFile
      ? await uploadPhoto(photoFile, `admin-${formData.otp}`)
      : undefined;

    const payload = {
      otp: formData.otp,
      name: formData.name,
      title: formData.title,
      content: formData.content,
      updated_at: new Date().toISOString(),
    };

    if (photoUrl) payload.photo_url = photoUrl;

    const { error } = await supabaseClient
      .from(CONFIG.TABLE_NAME)
      .upsert(payload, { onConflict: "otp" });

    if (error) throw error;

    showMessage(messageEl, `✅ Saved document for OTP ${formData.otp}`);

    event.target.reset();
    const preview = document.getElementById("admin-photo-preview");
    if (preview) {
      preview.src = "";
      preview.style.display = "none";
    }

    await renderAdminList();
  } catch (error) {
    console.error("[App] Admin save error:", error);
    showMessage(
      messageEl,
      `❌ Error: ${error.message || "Could not save."}`,
      true,
    );
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ============================================
// OTP LOOKUP
// ============================================
async function handleOtpLookup(event) {
  event.preventDefault();

  const messageEl = document.getElementById("otp-message");
  if (!requireSupabase(messageEl)) return;

  const code = document.getElementById("otp-code")?.value || "";
  if (!code) {
    showMessage(messageEl, "Please enter an OTP code.", true);
    return;
  }

  showMessage(messageEl, "Checking...", false);

  try {
    const { data, error } = await supabaseClient
      .from(CONFIG.TABLE_NAME)
      .select("otp")
      .eq("otp", code)
      .maybeSingle();

    if (!error && data) {
      window.location.href = `doc.html?otp=${encodeURIComponent(code)}`;
    } else {
      showMessage(messageEl, "❌ Invalid or expired OTP.", true);
    }
  } catch (error) {
    console.error("[App] OTP lookup error:", error);
    showMessage(messageEl, "❌ An error occurred. Please try again.", true);
  }
}

// ============================================
// DOCUMENT RENDER
// ============================================
async function renderDocumentFromQuery() {
  try {
    const params = new URLSearchParams(location.search);
    const code = params.get("otp");

    if (!code) return;

    const docTitle = document.getElementById("doc-title");
    const docClient = document.getElementById("doc-client");
    const docPhoto = document.getElementById("doc-photo");
    const docBody = document.getElementById("doc-body");

    if (!supabaseClient) {
      if (docTitle) docTitle.innerText = "Configuration Error";
      if (docClient) docClient.innerText = "Supabase is not configured.";
      if (docPhoto) docPhoto.style.display = "none";
      return;
    }

    const { data, error } = await supabaseClient
      .from(CONFIG.TABLE_NAME)
      .select("*")
      .eq("otp", code)
      .maybeSingle();

    if (error || !data) {
      if (docTitle) docTitle.innerText = "Document Not Found";
      if (docClient) docClient.innerText = "Invalid or expired OTP.";
      if (docPhoto) docPhoto.style.display = "none";
      if (docBody) docBody.innerText = "Please go back and enter a valid OTP.";
      return;
    }

    if (docTitle) docTitle.innerText = data.title || "Client Document";
    if (docClient) {
      const date = data.submitted_at || data.updated_at || "";
      docClient.innerText = data.name ? `${data.name} — Submitted ${date}` : "";
    }
    if (docBody) {
      docBody.innerText =
        data.content ||
        `Passport: ${data.passport || ""}\nAge: ${data.age || ""}\nPhone: ${data.phone || ""}`;
    }
    if (docPhoto) {
      if (data.photo_url) {
        docPhoto.src = data.photo_url;
        docPhoto.style.display = "block";
      } else {
        docPhoto.style.display = "none";
      }
    }
  } catch (error) {
    console.warn("[App] Error rendering document:", error);
  }
}

// ============================================
// ✅ FIXED RECEIPT SUBMIT FUNCTION
// ============================================
async function handleReceiptSubmit(event) {
  event.preventDefault();

  const messageEl = document.getElementById("receipt-message");
  if (!requireSupabase(messageEl)) return;

  const params = new URLSearchParams(location.search);
  const otp = params.get("otp");

  if (!otp) {
    showMessage(messageEl, "❌ Missing OTP in the page URL.", true);
    return;
  }

  const fileInput = document.getElementById("receipt-photo");
  const file = fileInput?.files?.[0] || null;

  if (!file) {
    showMessage(messageEl, "Please choose a receipt photo first.", true);
    return;
  }

  const submitBtn = event.target.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  showMessage(messageEl, "Uploading...", false);

  try {
    const receiptUrl = await uploadPhoto(file, `receipt-${otp}`);

    if (!receiptUrl) {
      throw new Error("Photo upload failed. Please try again.");
    }

    // ✅ FIXED: Only update receipt_url - removed receipt_submitted_at
    const { error } = await supabaseClient
      .from(CONFIG.TABLE_NAME)
      .update({
        receipt_url: receiptUrl,
        // ✅ receipt_submitted_at removed - this column doesn't exist in your table
      })
      .eq("otp", otp);

    if (error) throw error;

    showMessage(messageEl, "✅ Receipt submitted. Thank you!");
    event.target.reset();
    const preview = document.getElementById("receipt-preview");
    if (preview) {
      preview.src = "";
      preview.style.display = "none";
    }
  } catch (error) {
    console.error("[App] Receipt upload error:", error);
    showMessage(
      messageEl,
      `❌ Error: ${error.message || "Could not submit receipt."}`,
      true,
    );
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
  // Initialize Supabase
  initSupabase();

  // Initialize UI components
  initFaq();
  initModal();

  // Initialize photo previews
  initPhotoPreview("client-photo", "client-photo-preview");
  initPhotoPreview("admin-photo", "admin-photo-preview");
  initPhotoPreview("receipt-photo", "receipt-preview");

  // Form handlers
  const registerForm = document.getElementById("client-register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleClientRegistration);
  }

  const adminForm = document.getElementById("admin-doc-form");
  if (adminForm) {
    adminForm.addEventListener("submit", handleAdminSubmit);
  }

  const otpForm = document.getElementById("otp-form");
  if (otpForm) {
    otpForm.addEventListener("submit", handleOtpLookup);
  }

  const receiptForm = document.getElementById("receipt-form");
  if (receiptForm) {
    receiptForm.addEventListener("submit", handleReceiptSubmit);
  }

  // Admin list handlers
  const adminList = document.getElementById("admin-list");
  if (adminList) {
    adminList.addEventListener("click", handleAdminDelete);
  }

  // Render content on page load
  renderDocumentFromQuery();
  renderAdminList();

  console.log("[App] Application initialized successfully");
}

// Start the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
