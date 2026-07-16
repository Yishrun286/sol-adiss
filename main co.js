/* ==========================================================================
   MAIN.JS — navigation, mobile menu, back-to-top, ripple, scoreboard clock
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Sticky nav on scroll ---------- */
  const navbar = document.querySelector(".navbar");
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");

    const backToTop = document.querySelector(".back-to-top");
    if (backToTop) {
      if (window.scrollY > 600) backToTop.classList.add("show");
      else backToTop.classList.remove("show");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu toggle ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      mobileMenu.classList.toggle("active");
      document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        navToggle.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Button ripple effect ---------- */
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Active nav link on scroll (single page anchors) ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a[href^='#']");
  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navAnchors.forEach((a) => a.classList.remove("active"));
            const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (match) match.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Program category filter (programs.html) ---------- */
  const filterBtns = document.querySelectorAll("[data-filter]");
  const filterCards = document.querySelectorAll("[data-category]");
  if (filterBtns.length && filterCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.dataset.filter;
        filterCards.forEach((card) => {
          const show = target === "all" || card.dataset.category === target;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* ---------- Coach modal popup (coaches.html) ---------- */
  const coachCards = document.querySelectorAll("[data-coach]");
  const modalOverlay = document.querySelector(".modal-overlay");
  if (coachCards.length && modalOverlay) {
    const modalAvatar = modalOverlay.querySelector(".modal-avatar");
    const modalName = modalOverlay.querySelector("[data-modal-name]");
    const modalRole = modalOverlay.querySelector("[data-modal-role]");
    const modalLicense = modalOverlay.querySelector("[data-modal-license]");
    const modalExp = modalOverlay.querySelector("[data-modal-exp]");
    const modalBio = modalOverlay.querySelector("[data-modal-bio]");
    const modalAch = modalOverlay.querySelector("[data-modal-achievements]");

    const openModal = (card) => {
      const d = card.dataset;
      modalAvatar.textContent = d.initials || "";
      modalName.textContent = d.name || "";
      modalRole.textContent = d.role || "";
      modalLicense.textContent = d.license || "";
      modalExp.textContent = d.exp || "";
      modalBio.textContent = d.bio || "";
      modalAch.innerHTML = "";
      (d.achievements || "").split("|").filter(Boolean).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.trim();
        modalAch.appendChild(li);
      });
      modalOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    coachCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("a")) return; // let social links behave normally
        openModal(card);
      });
    });

    modalOverlay.querySelectorAll("[data-modal-close]").forEach((el) =>
      el.addEventListener("click", () => {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = "";
      })
    );
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  /* ---------- Live matchday clock in hero scoreboard ---------- */
  const clockEl = document.querySelector("[data-live-clock]");
  if (clockEl) {
    let seconds = 0;
    setInterval(() => {
      seconds++;
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      clockEl.textContent = `${m}:${s}`;
    }, 1000);
  }
})();
