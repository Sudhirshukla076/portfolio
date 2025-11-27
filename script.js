console.log("JS Loaded!");

// 🔗 Your Render backend URL:
const BACKEND_URL = "https://portfolio-backend-7boz.onrender.com";

// ⭐ MAKE IT GLOBAL, so index.html can find it
async function handleFormSubmit(event) {
  event.preventDefault();

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const messageEl = document.getElementById("message");
  const statusEl = document.getElementById("formStatus");
  const submitBtn = document.getElementById("contactSubmitBtn");

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const message = messageEl.value.trim();

  if (!name || !email || !message) {
    statusEl.textContent = "Please fill in all fields.";
    statusEl.style.color = "salmon";
    return;
  }

  // Disable button temporarily
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  statusEl.textContent = "";
  statusEl.style.color = "#aaa";

  try {
    console.log("Sending to backend:", `${BACKEND_URL}/api/contact`);

    const res = await fetch(`${BACKEND_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
      // ❌ removed `signal: controller.signal`
    });

    console.log("Response status:", res.status);

    let data;
    try {
      data = await res.json();
      console.log("Response JSON:", data);
    } catch (parseErr) {
      console.error("Error parsing JSON response:", parseErr);
      data = null;
    }

    if (!res.ok || !data || !data.success) {
      statusEl.textContent =
        (data && data.message) || "Something went wrong!";
      statusEl.style.color = "salmon";
      return;
    }

    // Success
    statusEl.textContent = "Message sent successfully! ✔️";
    statusEl.style.color = "#4ade80";

    nameEl.value = "";
    emailEl.value = "";
    messageEl.value = "";
  } catch (err) {
    console.error("Contact form error:", err);
    statusEl.textContent = "Cannot reach server. Check your connection or backend.";
    statusEl.style.color = "salmon";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
}
