// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

// Active link on scroll
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (pageYOffset >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Simple scroll reveal
const revealElements = document.querySelectorAll(
  ".section, .project-card, .card, .timeline-item, .contact-form"
);
revealElements.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => observer.observe(el));

// Footer year
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Contact form (demo only)
async function handleFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const statusEl = document.getElementById("formStatus");

  if (!name || !email || !message) {
    statusEl.textContent = "Please fill all fields.";
    statusEl.style.color = "red";
    return;
  }

  statusEl.textContent = "Sending...";
  statusEl.style.color = "blue";

  try {
    const response = await fetch("https://YOUR-BACKEND.onrender.com/api/ contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, message })
    });

    const data = await response.json();

    if (data.success) {
      statusEl.textContent = "Message sent successfully! ✅";
      statusEl.style.color = "green";

      // Clear form
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("message").value = "";
    } else {
      statusEl.textContent = "Something went wrong!";
      statusEl.style.color = "red";
    }
  } catch (error) {
    statusEl.textContent = "Server not reachable!";
    statusEl.style.color = "red";
  }
}

