/*
  Cleaned client script: modal, registration, simple localStorage docs, admin CRUD.
*/

const questions = document.querySelectorAll('.question');
questions.forEach(q => q.addEventListener('click', () => {
  const plus = q.querySelector('span');
  if (plus) plus.textContent = plus.textContent === '+' ? '-' : '+';
}));

const STORAGE_KEY = 'clientDocs';

// Ensure critical listeners are attached after load (fixes race on some hosts)
window.addEventListener('load', () => {
  try {
    const btn = document.getElementById('register-toggle');
    const modal = document.getElementById('register-modal');
    const closeBtn = document.getElementById('register-close');
    if (btn && modal && !btn._initAttached) {
      btn.addEventListener('click', () => { modal.style.display = 'flex'; const first = document.getElementById('client-name'); if (first) first.focus(); });
      if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
      modal.addEventListener('click', ev => { if (ev.target === modal) modal.style.display = 'none'; });
      btn._initAttached = true;
    }
  } catch (e) {
    console.warn('Error attaching load listeners', e);
  }
});

function loadDocs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveDocs(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

// Register modal
const registerToggle = document.getElementById('register-toggle');
const registerModal = document.getElementById('register-modal');
const registerClose = document.getElementById('register-close');
const clientForm = document.getElementById('client-register-form');
const clientPhotoInput = document.getElementById('client-photo');
const clientPhotoPreview = document.getElementById('client-photo-preview');
const registerMessage = document.getElementById('register-message');

let clientPhotoData = '';

if (registerToggle && registerModal) {
  registerToggle.addEventListener('click', () => {
    registerModal.style.display = 'flex';
    const first = document.getElementById('client-name'); if (first) first.focus();
  });
}
if (registerClose && registerModal) registerClose.addEventListener('click', () => registerModal.style.display = 'none');
if (registerModal) registerModal.addEventListener('click', ev => { if (ev.target === registerModal) registerModal.style.display = 'none'; });

if (clientPhotoInput) {
  clientPhotoInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) { clientPhotoData = ''; if (clientPhotoPreview) clientPhotoPreview.style.display = 'none'; return; }
    if (!file.type.startsWith('image/')) { clientPhotoData = ''; if (clientPhotoPreview) clientPhotoPreview.style.display = 'none'; return; }
    const r = new FileReader();
    r.onload = () => { clientPhotoData = r.result; if (clientPhotoPreview) { clientPhotoPreview.src = clientPhotoData; clientPhotoPreview.style.display = 'block'; } };
    r.readAsDataURL(file);
  });
}

if (clientForm) {
  clientForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = (document.getElementById('client-name')||{}).value || '';
    const age = (document.getElementById('client-age')||{}).value || '';
    const gender = (document.getElementById('client-gender')||{}).value || '';
    const email = (document.getElementById('client-email')||{}).value || '';
    const phone = (document.getElementById('client-phone')||{}).value || '';
    const dob = (document.getElementById('client-dob')||{}).value || '';
    const place = (document.getElementById('client-place')||{}).value || '';
    const country = (document.getElementById('client-country')||{}).value || '';
    const passport = (document.getElementById('client-passport')||{}).value || '';

    if (!name||!age||!gender||!email||!phone||!dob||!place||!country||!passport) {
      if (registerMessage) registerMessage.innerText = 'Please fill all required fields.';
      return;
    }

    const docs = loadDocs();
    let otp;
    do { otp = Math.floor(100000 + Math.random()*900000).toString(); } while (docs[otp]);

    docs[otp] = {
      name, age, gender, email, phone, dob, place, country, passport,
      photo: clientPhotoData || '', submittedAt: new Date().toISOString()
    };

    saveDocs(docs);
    if (registerMessage) registerMessage.innerText = `Submitted. OTP: ${otp} — saved.`;
    if (registerModal) registerModal.style.display = 'none';
    clientForm.reset();
    if (clientPhotoPreview) { clientPhotoPreview.src=''; clientPhotoPreview.style.display='none'; }
    setTimeout(() => { window.location.href = 'index.html'; }, 700);
  });
}

// Admin document manager (simple localStorage)
const adminForm = document.getElementById('admin-doc-form');
const adminMessage = document.getElementById('admin-message');
const adminList = document.getElementById('admin-list');
const adminPhotoInput = document.getElementById('admin-photo');
const adminPhotoPreview = document.getElementById('admin-photo-preview');
let adminPhotoData = '';

if (adminPhotoInput) {
  adminPhotoInput.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f || !f.type.startsWith('image/')) { adminPhotoData=''; if (adminPhotoPreview) adminPhotoPreview.style.display='none'; return; }
    const r = new FileReader(); r.onload = () => { adminPhotoData = r.result; if (adminPhotoPreview) { adminPhotoPreview.src = adminPhotoData; adminPhotoPreview.style.display='block'; } }; r.readAsDataURL(f);
  });
}

function renderAdminList(){
  if (!adminList) return;
  const docs = loadDocs();
  const keys = Object.keys(docs);
  if (!keys.length) { adminList.innerHTML = '<p>No client docs saved yet.</p>'; return; }
  adminList.innerHTML = keys.map(otp => {
    const d = docs[otp];
    return `<div class="admin-item"><div><strong>OTP:</strong> ${otp}</div><div><p><strong>Name:</strong> ${d.name}</p><p>${d.content||''}</p>${d.photo?`<img src="${d.photo}" style="max-width:160px"/>`:''}<p><button class="admin-delete-button" data-otp="${otp}">Delete</button></p></div></div>`;
  }).join('');
}

if (adminList) {
  adminList.addEventListener('click', e => {
    const t = e.target;
    if (t.matches && t.matches('.admin-delete-button')) {
      const otp = t.getAttribute('data-otp'); if (!otp) return; const docs = loadDocs(); delete docs[otp]; saveDocs(docs); renderAdminList();
    }
  });
}

if (adminForm) {
  adminForm.addEventListener('submit', e => {
    e.preventDefault();
    const otp = (document.getElementById('admin-otp')||{}).value || '';
    const name = (document.getElementById('admin-client-name')||{}).value || '';
    const title = (document.getElementById('admin-doc-title')||{}).value || '';

  } else {
    docTitle.innerText = "Document Not Found";
    docClient.innerText = "Invalid or expired OTP.";
    if (docPhoto) {
      docPhoto.style.display = "none";
    }
    docBody.innerText = "Please go back and enter a valid OTP.";
  }
}
