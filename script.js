const loader = document.getElementById("loader");
const header = document.getElementById("header");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const backToTop = document.getElementById("backToTop");
const typingText = document.getElementById("typingText");
const canvas = document.getElementById("neuralCanvas");
const ctx = canvas.getContext("2d");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const projectModal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalOverview = document.getElementById("modalOverview");
const modalFeatures = document.getElementById("modalFeatures");
const modalTech = document.getElementById("modalTech");
const certificateModal = document.getElementById("certificateModal");
const certificateTitle = document.getElementById("certificateTitle");
const certificateViewer = document.getElementById("certificateViewer");
const certificateOpenLink = document.getElementById("certificateOpenLink");

const roles = [
  "AIML Student",
  "Web Developer",
  "AI Enthusiast",
  "Future AI Engineer"
];

const projectDetails = {
  fisheries: {
    category: "IoT + AI Monitoring",
    title: "Smart Fisheries Monitoring System",
    overview:
      "Developed an intelligent fisheries monitoring system that continuously monitors water quality parameters and environmental conditions in fish ponds using IoT sensors. The system supports real-time analysis, alerts, recommendations, and predictive insights to improve fish health, increase productivity, and reduce losses.",
    features: [
      "Real-time water quality monitoring",
      "Temperature, pH, dissolved oxygen, and water level monitoring",
      "Automated alerts for abnormal pond conditions",
      "Cloud-based data storage and visualization",
      "Mobile/Web dashboard for remote monitoring",
      "Predictive analytics for fish health management"
    ],
    tech: [
      "ESP32 / Arduino",
      "pH, temperature, dissolved oxygen, and water level sensors",
      "Python, HTML, CSS, JavaScript, React.js",
      "Firebase / MySQL",
      "Machine Learning, data analysis, predictive monitoring"
    ]
  },
  legal: {
    category: "AI + Legal Tech",
    title: "Legal Ease",
    overview:
      "Developed an AI-powered web and mobile platform that simplifies legal document understanding through document scanning, AI-generated summaries, multilingual voice assistance, lawyer-client interaction, and secure encrypted communication.",
    features: [
      "AI-based legal document scanning and text extraction",
      "Automated legal document summarization",
      "Multilingual voice and text assistance",
      "AI chatbot for legal guidance",
      "Lawyer recommendation and matching system",
      "Secure document storage and end-to-end encrypted communication"
    ],
    tech: [
      "React.js, HTML, CSS, JavaScript",
      "Flutter for mobile app prototype",
      "Node.js, Express.js",
      "MongoDB / MySQL",
      "Python, OpenAI API / Gemini API, Tesseract OCR, NLP",
      "AES Encryption, SSL/TLS, JWT Authentication"
    ]
  }
};

let roleIndex = 0;
let charIndex = 0;
let deleting = false;
let particles = [];

window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("hide"), 700);
});

// Mobile navigation toggle.
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  const icon = navToggle.querySelector("i");
  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-xmark");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.querySelector("i").className = "fa-solid fa-bars";
  });
});

function typeRole() {
  const currentRole = roles[roleIndex];

  if (deleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  typingText.textContent = currentRole.slice(0, charIndex);

  if (!deleting && charIndex === currentRole.length) {
    deleting = true;
    setTimeout(typeRole, 1200);
    return;
  }

  if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }

  setTimeout(typeRole, deleting ? 45 : 85);
}

typeRole();

// Reveal elements as they enter the viewport.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

function updateScrollUI() {
  const scrolled = window.scrollY > 80;
  header.classList.toggle("scrolled", scrolled);
  backToTop.classList.toggle("show", window.scrollY > 500);

  document.querySelectorAll("section[id]").forEach((section) => {
    const top = section.offsetTop - 120;
    const bottom = top + section.offsetHeight;
    const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);

    if (window.scrollY >= top && window.scrollY < bottom) {
      link?.classList.add("active");
    } else {
      link?.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", updateScrollUI);
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

function renderList(listElement, items) {
  listElement.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function openProjectModal(projectKey) {
  const project = projectDetails[projectKey];
  if (!project) return;

  modalCategory.textContent = project.category;
  modalTitle.textContent = project.title;
  modalOverview.textContent = project.overview;
  renderList(modalFeatures, project.features);
  renderList(modalTech, project.tech);
  projectModal.classList.add("open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  projectModal.classList.remove("open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openCertificateModal({ title, file, type }) {
  certificateTitle.textContent = title;
  certificateOpenLink.href = file;

  if (type === "image") {
    certificateViewer.innerHTML = `<img src="${file}" alt="${title}" />`;
  } else {
    certificateViewer.innerHTML = `<iframe src="${file}" title="${title}"></iframe>`;
  }

  certificateModal.classList.add("open");
  certificateModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCertificateModal() {
  certificateModal.classList.remove("open");
  certificateModal.setAttribute("aria-hidden", "true");
  certificateViewer.innerHTML = "";
  document.body.style.overflow = "";
}

document.querySelectorAll(".project-details-btn").forEach((button) => {
  button.addEventListener("click", () => openProjectModal(button.dataset.project));
});

document.querySelectorAll("[data-close-project-modal]").forEach((button) => {
  button.addEventListener("click", closeProjectModal);
});

document.querySelectorAll(".cert-view-btn").forEach((button) => {
  button.addEventListener("click", () => {
    openCertificateModal({
      title: button.dataset.certTitle,
      file: button.dataset.certFile,
      type: button.dataset.certType
    });
  });
});

document.querySelectorAll("[data-close-cert-modal]").forEach((button) => {
  button.addEventListener("click", closeCertificateModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && projectModal.classList.contains("open")) {
    closeProjectModal();
  }

  if (event.key === "Escape" && certificateModal.classList.contains("open")) {
    closeCertificateModal();
  }
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector("button[type='submit']");
  const formData = Object.fromEntries(new FormData(contactForm));

  formStatus.textContent = "Sending your message...";
  formStatus.className = "form-status";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Message could not be sent.");
    }

    formStatus.textContent = "Message sent successfully. Thank you!";
    formStatus.className = "form-status success";
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = error.message || "Please run the Node server and try again.";
    formStatus.className = "form-status error";
  } finally {
    submitButton.disabled = false;
  }
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createParticles();
}

function createParticles() {
  const count = Math.min(90, Math.floor(window.innerWidth / 18));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    radius: Math.random() * 2 + 1
  }));
}

function drawNeuralBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(244, 199, 107, 0.75)";
    ctx.fill();

    for (let next = index + 1; next < particles.length; next++) {
      const other = particles[next];
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 130) {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(98, 232, 212, ${1 - distance / 130})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(drawNeuralBackground);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawNeuralBackground();
updateScrollUI();
