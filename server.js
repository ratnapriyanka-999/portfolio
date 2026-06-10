const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

loadEnv();

let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch {
  nodemailer = null;
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon"
};

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) return;

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Message is too large."));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleContact(req, res) {
  try {
    const body = await readRequestBody(req);
    const { name, email, message } = JSON.parse(body || "{}");

    if (!name || !email || !message) {
      return sendJson(res, 400, { message: "Please fill in all fields." });
    }

    if (!isValidEmail(email)) {
      return sendJson(res, 400, { message: "Please enter a valid email address." });
    }

    if (!nodemailer) {
      return sendJson(res, 500, {
        message: "Website is running, but email packages are not installed yet. Run npm.cmd install in VS Code."
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return sendJson(res, 500, {
        message: "Email is not configured yet. Add EMAIL_USER and EMAIL_PASS in your .env file."
      });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_TO || "priyankaratnam36999@gmail.com",
      replyTo: email,
      subject: `Portfolio message from ${safeName}`,
      html: `
        <h2>New portfolio contact message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `
    });

    return sendJson(res, 200, { message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact error:", error);
    return sendJson(res, 500, { message: "Message failed to send. Please try again." });
  }
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(ROOT, requestedPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      return res.end("Not found");
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/contact") {
    return handleContact(req, res);
  }

  if (req.method === "GET" || req.method === "HEAD") {
    return serveStatic(req, res);
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  if (!nodemailer) {
    console.log("Nodemailer is not installed yet. The website preview works, but contact emails need npm.cmd install.");
  }
});
