(function () {
  const authCard = document.getElementById("admin-auth-card");
  const adminDashboard = document.getElementById("admin-dashboard");
  const authMessage = document.getElementById("admin-auth-message");
  const changePasswordForm = document.getElementById("admin-change-password-form");
  const logoutButton = document.getElementById("admin-logout-button");
  const authGate = document.createElement("div");

  const PASSWORD_STORAGE_KEY = "adminPasswordHash";
  const AUTH_SESSION_KEY = "adminAuthSession";

  authGate.className = "auth-shell";

  function showMessage(message, isError = false) {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.className = `auth-message${isError ? " error" : ""}`;
  }

  function validatePassword(password) {
    if (!password || password.trim().length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return "Password must include at least one uppercase letter and one number.";
    }
    return "";
  }

  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i += 1) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }

  function hasPassword() {
    return Boolean(localStorage.getItem(PASSWORD_STORAGE_KEY));
  }

  function isAuthenticated() {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
  }

  function setDashboardVisible(isVisible) {
    if (adminDashboard) {
      adminDashboard.style.display = isVisible ? "block" : "none";
    }
    if (changePasswordForm) {
      changePasswordForm.style.display = isVisible ? "grid" : "none";
    }
    if (logoutButton) {
      logoutButton.style.display = isVisible ? "inline-block" : "none";
    }
  }

  function renderAuthGate() {
    if (authGate.parentNode) {
      authGate.parentNode.removeChild(authGate);
    }

    if (isAuthenticated()) {
      setDashboardVisible(true);
      showMessage("You are logged in as admin.");
      return;
    }

    setDashboardVisible(false);

    const needsSetup = !hasPassword();
    const form = document.createElement("form");
    form.className = "auth-card auth-form";
    form.innerHTML = `
      <h1>${needsSetup ? "Create Admin Password" : "Admin Login"}</h1>
      <p>${needsSetup ? "Create the first admin password to access the dashboard." : "Enter the admin password to access the dashboard."}</p>
      <label for="admin-login-password">Password</label>
      <input id="admin-login-password" type="password" placeholder="Enter password" required />
      <label for="admin-confirm-password">Confirm password</label>
      <input id="admin-confirm-password" type="password" placeholder="Confirm password" />
      <button type="submit">${needsSetup ? "Create Password" : "Login"}</button>
      <div id="admin-login-message" class="auth-message"></div>
    `;

    authGate.innerHTML = "";
    authGate.appendChild(form);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const messageBox = document.getElementById("admin-login-message");
      const passwordInput = document.getElementById("admin-login-password");
      const confirmInput = document.getElementById("admin-confirm-password");
      const password = passwordInput ? passwordInput.value : "";
      const confirmPassword = confirmInput ? confirmInput.value : "";

      if (!password.trim()) {
        if (messageBox) {
          messageBox.textContent = "Please enter a password.";
          messageBox.className = "auth-message error";
        }
        return;
      }

      if (needsSetup) {
        const weakPasswordMessage = validatePassword(password);
        if (weakPasswordMessage) {
          if (messageBox) {
            messageBox.textContent = weakPasswordMessage;
            messageBox.className = "auth-message error";
          }
          return;
        }
        if (password !== confirmPassword) {
          if (messageBox) {
            messageBox.textContent = "Passwords do not match.";
            messageBox.className = "auth-message error";
          }
          return;
        }

        localStorage.setItem(PASSWORD_STORAGE_KEY, hashPassword(password));
        sessionStorage.setItem(AUTH_SESSION_KEY, "true");
        showMessage("Password created successfully. You are now logged in.");
        renderAuthGate();
        return;
      }

      const storedHash = localStorage.getItem(PASSWORD_STORAGE_KEY);
      if (hashPassword(password) === storedHash) {
        sessionStorage.setItem(AUTH_SESSION_KEY, "true");
        showMessage("Login successful.");
        renderAuthGate();
      } else {
        if (messageBox) {
          messageBox.textContent = "Incorrect password.";
          messageBox.className = "auth-message error";
        }
      }
    });

    if (authCard) {
      authCard.insertAdjacentElement("afterend", authGate);
    }
  }

  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const currentPassword = document.getElementById("admin-current-password").value;
      const newPassword = document.getElementById("admin-new-password").value;
      const confirmPassword = document.getElementById("admin-new-password-confirm").value;

      if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage("Please fill in all password fields.", true);
        return;
      }

      const storedHash = localStorage.getItem(PASSWORD_STORAGE_KEY);
      if (!storedHash) {
        showMessage("Create a password first before changing it.", true);
        return;
      }

      if (hashPassword(currentPassword) !== storedHash) {
        showMessage("Current password is incorrect.", true);
        return;
      }

      const weakPasswordMessage = validatePassword(newPassword);
      if (weakPasswordMessage) {
        showMessage(weakPasswordMessage, true);
        return;
      }

      if (newPassword !== confirmPassword) {
        showMessage("New passwords do not match.", true);
        return;
      }

      localStorage.setItem(PASSWORD_STORAGE_KEY, hashPassword(newPassword));
      changePasswordForm.reset();
      showMessage("Password changed successfully.");
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      renderAuthGate();
      showMessage("You have been logged out.");
    });
  }

  window.addEventListener("load", () => {
    if (!hasPassword()) {
      showMessage("Create an admin password to access the dashboard.");
    } else {
      showMessage("Enter the admin password to access the dashboard.");
    }
    renderAuthGate();
  });
})();
