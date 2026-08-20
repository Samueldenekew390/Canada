const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-secret";

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 4
    }
  })
);

let adminPasswordHash = null;

function validatePassword(password) {
  if (!password || password.trim().length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one uppercase letter and one number.";
  }
  return "";
}

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized. Please log in first." });
}

app.get("/api/admin/status", (req, res) => {
  res.json({
    authenticated: Boolean(req.session && req.session.isAdmin),
    hasPassword: Boolean(adminPasswordHash)
  });
});

app.post("/api/admin/setup", async (req, res) => {
  const { password, confirmPassword } = req.body || {};

  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "Please enter and confirm the password." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const validationError = validatePassword(password);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (adminPasswordHash) {
    return res.status(400).json({ message: "An admin password already exists." });
  }

  adminPasswordHash = await bcrypt.hash(password, 12);
  req.session.isAdmin = true;
  res.json({ message: "Password created successfully." });
});

app.post("/api/admin/login", async (req, res) => {
  const { password } = req.body || {};

  if (!adminPasswordHash) {
    return res.status(400).json({ message: "No admin password has been created yet." });
  }

  if (!password) {
    return res.status(400).json({ message: "Please enter your password." });
  }

  const isValid = await bcrypt.compare(password, adminPasswordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Incorrect password." });
  }

  req.session.isAdmin = true;
  res.json({ message: "Login successful." });
});

app.post("/api/admin/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Please fill in all password fields." });
  }

  const isValid = await bcrypt.compare(currentPassword, adminPasswordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match." });
  }

  const validationError = validatePassword(newPassword);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  adminPasswordHash = await bcrypt.hash(newPassword, 12);
  res.json({ message: "Password changed successfully." });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin/zela.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "zela.html"));
});

app.use(express.static(path.join(__dirname), { index: false }));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Admin auth server running at http://localhost:${PORT}`);
});
