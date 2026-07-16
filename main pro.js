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
