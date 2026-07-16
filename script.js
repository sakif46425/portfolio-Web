/* ============================================================
   SAKIF KHAN — PORTFOLIO SCRIPT
   Handles navigation, scroll reveals, the contact form, and the
   two canvas "signal" elements that carry the seismic identity.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------------- Mobile menu ---------------- */
  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (menuBtn && navLinks) {
    // swap the single bars icon for a bars/xmark pair we can crossfade
    menuBtn.innerHTML =
      '<i class="fas fa-bars"></i><i class="fas fa-xmark"></i>';

    menuBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      menuBtn.classList.toggle("active", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuBtn.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------------- Dark / light theme toggle ---------------- */
  const themeToggle = document.getElementById("themeToggle");
  const rootEl = document.documentElement;

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = rootEl.getAttribute("data-theme") === "light";
      if (isLight) {
        rootEl.removeAttribute("data-theme");
        try {
          localStorage.setItem("theme", "dark");
        } catch (e) {}
      } else {
        rootEl.setAttribute("data-theme", "light");
        try {
          localStorage.setItem("theme", "light");
        } catch (e) {}
      }
    });
  }

  /* ---------------- Dynamic background: drifting glow orbs ---------------- */
  const orbContainer = document.createElement("div");
  orbContainer.className = "bg-orbs";
  orbContainer.setAttribute("aria-hidden", "true");
  orbContainer.innerHTML = `
        <div class="bg-orb bg-orb-1"></div>
        <div class="bg-orb bg-orb-2"></div>
        <div class="bg-orb bg-orb-3"></div>
    `;
  document.body.prepend(orbContainer);
  const orbs = Array.from(orbContainer.querySelectorAll(".bg-orb"));

  // per-orb motion profile: independent drift speed/radius + parallax depth
  const orbProfiles = [
    {
      radiusX: 9,
      radiusY: 7,
      speed: 0.00028,
      depth: 34,
      scrollDepth: 0.05,
      phase: 0,
    },
    {
      radiusX: 7,
      radiusY: 10,
      speed: -0.00035,
      depth: 48,
      scrollDepth: -0.08,
      phase: 2.1,
    },
    {
      radiusX: 10,
      radiusY: 6,
      speed: 0.00023,
      depth: 24,
      scrollDepth: 0.11,
      phase: 4.2,
    },
  ];

  let mouseX = 0,
    mouseY = 0; // normalized -1..1

  if (!reduceMotion) {
    window.addEventListener(
      "mousemove",
      (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true },
    );

    const animateOrbs = (t) => {
      const scrollY = window.scrollY;
      orbs.forEach((orb, i) => {
        const p = orbProfiles[i];
        const driftX = Math.cos(t * p.speed + p.phase) * p.radiusX;
        const driftY = Math.sin(t * p.speed + p.phase) * p.radiusY;
        const parallaxX = mouseX * p.depth;
        const parallaxY = mouseY * p.depth + scrollY * p.scrollDepth;
        const scale = 1 + Math.sin(t * p.speed * 1.6 + p.phase) * 0.14;
        orb.style.transform = `translate3d(${(driftX + parallaxX).toFixed(2)}vw, ${(driftY + parallaxY).toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      });
      requestAnimationFrame(animateOrbs);
    };
    requestAnimationFrame(animateOrbs);
  }

  /* ---------------- Hero role rotation (typewriter) ---------------- */
  const roleEl = document.getElementById("role-text");
  if (roleEl && !reduceMotion) {
    const roles = (roleEl.dataset.roles || roleEl.textContent)
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    let roleIndex = 0;
    let charIndex = roles[0] ? roles[0].length : 0;
    let deleting = false;

    const TYPE_SPEED = 55;
    const DELETE_SPEED = 32;
    const HOLD_TIME = 1800;

    const tick = () => {
      const current = roles[roleIndex];

      if (!deleting) {
        charIndex++;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex >= current.length) {
          deleting = true;
          setTimeout(tick, HOLD_TIME);
          return;
        }
      } else {
        charIndex--;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }

      setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
    };

    if (roles.length > 1) {
      setTimeout(tick, HOLD_TIME);
    }
  }

  /* ---------------- Navbar scroll state ---------------- */
  const navbar = document.querySelector(".navbar");
  const onNavScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  };
  onNavScroll();
  window.addEventListener("scroll", onNavScroll, { passive: true });

  /* ---------------- Active link highlighting ---------------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  if (sections.length && navAnchors.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navAnchors.forEach((a) => {
              a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((sec) => navObserver.observe(sec));
  }

  /* ---------------- Scroll reveal ---------------- */
  const revealTargets = document.querySelectorAll(
    ".section-title, .about-content, .skill-category, .project-card, .pub-card, .education-card, .info-card, .ref-card, .contact-info, #contact form",
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // slight stagger for grouped items like skill/project/pub cards
            const delay =
              entry.target.classList.contains("skill-category") ||
              entry.target.classList.contains("project-card") ||
              entry.target.classList.contains("pub-card") ||
              entry.target.classList.contains("education-card") ||
              entry.target.classList.contains("info-card") ||
              entry.target.classList.contains("ref-card")
                ? (i % 6) * 60
                : 0;
            setTimeout(() => entry.target.classList.add("in-view"), delay);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------------- Project filters ---------------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.remove("filter-in");
        if (match) {
          card.classList.remove("filter-hide");
          if (!reduceMotion) {
            void card.offsetWidth; // restart animation
            card.classList.add("filter-in");
          }
        } else {
          card.classList.add("filter-hide");
        }
      });
    });
  });

  /* ---------------- Skill progress bars ---------------- */
  const skillBars = document.querySelectorAll(".skill-bar");
  skillBars.forEach((bar) => {
    bar.style.setProperty("--level", `${bar.dataset.level || 0}%`);
  });

  if ("IntersectionObserver" in window) {
    const skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            skillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 },
    );

    skillBars.forEach((bar) => skillObserver.observe(bar));
  } else {
    skillBars.forEach((bar) => bar.classList.add("in-view"));
  }

  /* ---------------- Button ripple ---------------- */
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------------- Cursor glow + project-card tilt (non-touch only) ---------------- */
  const isFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  if (!reduceMotion && isFinePointer) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);

    window.addEventListener(
      "mousemove",
      (e) => {
        glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      },
      { passive: true },
    );

    projectCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-8px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------- Contact form (Formspree) ---------------- */
  const form = document.getElementById("contactForm");
  if (form) {
    const note = document.createElement("p");
    note.className = "form-note";
    note.setAttribute("role", "status");
    form.appendChild(note);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn.textContent;
      const nameInput = form.querySelector('input[name="name"]');
      const firstName =
        (nameInput?.value || "").trim().split(" ")[0] || "there";

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      note.textContent = "";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          note.textContent = `// signal received — thanks, ${firstName}. I\u2019ll reply soon.`;
          note.style.color = "var(--signal)";
          form.reset();
        } else {
          throw new Error("Form submission failed");
        }
      } catch (err) {
        note.textContent =
          "// transmission failed — email me directly at sakifkhan1340@gmail.com";
        note.style.color = "var(--pulse)";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  /* ---------------- Signal-strip: fixed, scroll-reactive canvas ---------------- */
  const strip = document.createElement("canvas");
  strip.id = "signal-strip";
  strip.setAttribute("aria-hidden", "true");
  document.body.appendChild(strip);

  const stripCtx = strip.getContext("2d");
  let stripHistory = [];
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;

  const sizeStrip = () => {
    strip.width = window.innerWidth * devicePixelRatio;
    strip.height = strip.clientHeight * devicePixelRatio;
    stripHistory = new Array(
      Math.ceil(strip.width / (2 * devicePixelRatio)),
    ).fill(0);
  };
  sizeStrip();
  window.addEventListener("resize", sizeStrip);

  window.addEventListener(
    "scroll",
    () => {
      scrollVelocity = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
    },
    { passive: true },
  );

  const styles = getComputedStyle(document.documentElement);
  const signalColor = styles.getPropertyValue("--signal").trim() || "#2de1c2";
  const pulseColor = styles.getPropertyValue("--pulse").trim() || "#ff6b4a";

  function drawStrip() {
    if (!stripCtx) return;
    const w = strip.width,
      h = strip.height;
    stripCtx.clearRect(0, 0, w, h);

    const mid = h / 2;
    const idleWobble = Math.sin(Date.now() / 900) * (h * 0.04);
    const amplitude =
      Math.max(-1, Math.min(1, scrollVelocity / 40)) * (h * 0.42);

    stripHistory.push(idleWobble + amplitude);
    stripHistory.shift();
    scrollVelocity *= 0.85;

    stripCtx.beginPath();
    stripCtx.moveTo(0, mid);
    const step = w / (stripHistory.length - 1);
    stripHistory.forEach((v, i) => {
      stripCtx.lineTo(i * step, mid + v);
    });

    const grad = stripCtx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, signalColor);
    grad.addColorStop(0.5, pulseColor);
    grad.addColorStop(1, signalColor);

    stripCtx.strokeStyle = grad;
    stripCtx.lineWidth = 2 * devicePixelRatio;
    stripCtx.lineJoin = "round";
    stripCtx.shadowColor = signalColor;
    stripCtx.shadowBlur = 8 * devicePixelRatio;
    stripCtx.stroke();

    requestAnimationFrame(drawStrip);
  }

  if (!reduceMotion) requestAnimationFrame(drawStrip);

  /* ---------------- Hero canvas: ambient oscilloscope waves ---------------- */
  const hero = document.querySelector(".hero");
  if (hero) {
    const heroCanvas = document.createElement("canvas");
    heroCanvas.id = "hero-canvas";
    heroCanvas.setAttribute("aria-hidden", "true");
    hero.prepend(heroCanvas);

    const heroCtx = heroCanvas.getContext("2d");

    const sizeHero = () => {
      heroCanvas.width = hero.clientWidth * devicePixelRatio;
      heroCanvas.height = hero.clientHeight * devicePixelRatio;
    };
    sizeHero();
    window.addEventListener("resize", sizeHero);

    const waves = [
      {
        amp: 0.06,
        freq: 0.006,
        speed: 0.00045,
        color: signalColor,
        width: 2,
        opacity: 0.55,
      },
      {
        amp: 0.04,
        freq: 0.01,
        speed: -0.0007,
        color: pulseColor,
        width: 1.6,
        opacity: 0.35,
      },
      {
        amp: 0.025,
        freq: 0.016,
        speed: 0.0009,
        color: signalColor,
        width: 1.2,
        opacity: 0.22,
      },
    ];

    function drawHero(t) {
      const w = heroCanvas.width,
        h = heroCanvas.height;
      heroCtx.clearRect(0, 0, w, h);
      const baseY = h * 0.62;

      waves.forEach((wave) => {
        heroCtx.beginPath();
        for (let x = 0; x <= w; x += 4 * devicePixelRatio) {
          const y =
            baseY +
            Math.sin(x * wave.freq + t * wave.speed) * (h * wave.amp) +
            Math.sin(x * wave.freq * 2.3 + t * wave.speed * 1.7) *
              (h * wave.amp * 0.3);
          if (x === 0) heroCtx.moveTo(x, y);
          else heroCtx.lineTo(x, y);
        }
        heroCtx.strokeStyle = wave.color;
        heroCtx.globalAlpha = wave.opacity;
        heroCtx.lineWidth = wave.width * devicePixelRatio;
        heroCtx.stroke();
      });
      heroCtx.globalAlpha = 1;

      if (!reduceMotion) requestAnimationFrame(drawHero);
    }

    requestAnimationFrame(drawHero);
    if (reduceMotion) drawHero(0); // draw a single static frame
  }
});
