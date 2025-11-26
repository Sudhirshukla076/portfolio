import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load env variables from .env
dotenv.config();

// --- Setup __dirname for ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Admin key (prefer .env, fallback to hardcoded)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "admin123";

// Path to messages.json in backend folder
const messagesFilePath = path.join(__dirname, "messages.json");

// Middleware
app.use(cors());
app.use(express.json());

// Ensure messages.json exists
function ensureMessagesFile() {
  if (!fs.existsSync(messagesFilePath)) {
    console.log("📁 messages.json not found, creating a new one...");
    fs.writeFileSync(messagesFilePath, "[]", "utf-8");
  }
}

// Setup nodemailer transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// CONTACT FORM route: save to file + send email
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  console.log("📩 New contact form submission:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Message:", message);

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    // Ensure file exists
    ensureMessagesFile();

    // Read existing messages
    const raw = fs.readFileSync(messagesFilePath, "utf-8") || "[]";

    let messages = [];
    try {
      messages = JSON.parse(raw);
      if (!Array.isArray(messages)) messages = [];
    } catch (e) {
      console.error("❌ Error parsing messages.json, resetting:", e);
      messages = [];
    }

    const newMessage = {
      name,
      email,
      message,
      time: new Date().toLocaleString()
    };

    // Add and save
    messages.push(newMessage);
    fs.writeFileSync(
      messagesFilePath,
      JSON.stringify(messages, null, 2),
      "utf-8"
    );

    console.log("💾 Message saved to:", messagesFilePath);

    // Try sending email (but don't fail the whole request if email fails)
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_TO) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: process.env.EMAIL_TO,
          subject: `New contact from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: `<p><strong>Name:</strong> ${name}</p>
                 <p><strong>Email:</strong> ${email}</p>
                 <p><strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>`
        });

        console.log("✉️ Email notification sent");
      } else {
        console.log("✉️ Email config missing, skipping email send...");
      }
    } catch (emailErr) {
      console.error("❌ Error sending email:", emailErr.message);
      // we don't return error to user here, just log it
    }

    return res.json({
      success: true,
      message: "Message saved successfully!"
    });
  } catch (err) {
    console.error("❌ Error handling contact form:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error saving message." });
  }
});

// ADMIN route: get all messages (protected by key)
app.get("/api/messages", (req, res) => {
  const key = req.query.key;
  console.log("🔐 /api/messages called");
  console.log("Query key:", key);
  console.log("Expected key:", ADMIN_API_KEY);

  if (key !== ADMIN_API_KEY) {
    console.log("❌ Admin key mismatch, sending 401");
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    ensureMessagesFile();
    const raw = fs.readFileSync(messagesFilePath, "utf-8") || "[]";

    let messages = [];
    try {
      messages = JSON.parse(raw);
      if (!Array.isArray(messages)) messages = [];
    } catch (e) {
      console.error("❌ Error parsing messages.json:", e);
      messages = [];
    }

    console.log("✅ Returning", messages.length, "messages");
    return res.json({ success: true, messages });
  } catch (err) {
    console.error("❌ Error reading messages file:", err);
    return res.status(500).json({
      success: false,
      message: "Server error reading messages."
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log("Messages file path:", messagesFilePath);
  console.log("Admin API key:", ADMIN_API_KEY);
});
