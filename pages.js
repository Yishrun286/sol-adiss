/* ==========================================================================
   PAGES.JS — gallery filter + lightbox, FAQ accordion, contact form,
   shop selectors + payment/order modal flow.
   Loaded on gallery.html / contact.html / shop.html alongside main.js
   and animation.js. Every block checks for its elements before running,
   so this file is safe to include on any of the three pages.
   ========================================================================== */

(function () {
  "use strict";

  /* ==========================================================================
     GALLERY — filter bar + masonry + lightbox
     ========================================================================== */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const masonryItems = document.querySelectorAll(".masonry-item");
  const loadMoreBtn = document.querySelector("[data-load-more]");

  let visibleCount = 8;
  const pageSize = 8;

  function applyFilter(category) {
    let shown = 0;
    masonryItems.forEach((item) => {
      const matches = category === "all" || item.dataset.category === category;
      item.dataset.matches = matches ? "1" : "0";
    });
    renderVisible();
  }

  function renderVisible() {
    let shown = 0;
    masonryItems.forEach((item) => {
      const matches = item.dataset.matches !== "0";
      if (matches && shown < visibleCount) {
        item.classList.remove("hide");
        shown++;
      } else {
        item.classList.add("hide");
      }
    });
    if (loadMoreBtn) {
      const totalMatching = Array.from(masonryItems).filter((i) => i.dataset.matches !== "0").length;
      loadMoreBtn.style.display = shown >= totalMatching ? "none" : "inline-flex";
    }
  }

  if (filterBtns.length && masonryItems.length) {
    masonryItems.forEach((i) => (i.dataset.matches = "1"));
    renderVisible();

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        visibleCount = pageSize;
        applyFilter(btn.dataset.filter);
      });
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += pageSize;
      renderVisible();
    });
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.querySelector("[data-lightbox]");
  if (lightbox && masonryItems.length) {
    const lbTag = lightbox.querySelector("[data-lb-tag]");
    const lbTitle = lightbox.querySelector("[data-lb-title]");
    const lbClose = lightbox.querySelector(".lightbox-close");
    const lbPrev = lightbox.querySelector(".lightbox-prev");
    const lbNext = lightbox.querySelector(".lightbox-next");
    let currentIndex = 0;

    function visibleItems() {
      return Array.from(masonryItems).filter((i) => !i.classList.contains("hide"));
    }

    function openLightbox(item) {
      const items = visibleItems();
      currentIndex = items.indexOf(item);
      updateLightbox();
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function updateLightbox() {
      const items = visibleItems();
      if (!items.length) return;
      const item = items[currentIndex];
      lbTag.textContent = item.dataset.category;
      lbTitle.textContent = item.dataset.title || "Academy Moment";
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    }

    masonryItems.forEach((item) => {
      item.addEventListener("click", () => openLightbox(item));
    });

    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    if (lbPrev)
      lbPrev.addEventListener("click", () => {
        const items = visibleItems();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateLightbox();
      });
    if (lbNext)
      lbNext.addEventListener("click", () => {
        const items = visibleItems();
        currentIndex = (currentIndex + 1) % items.length;
        updateLightbox();
      });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft" && lbPrev) lbPrev.click();
      if (e.key === "ArrowRight" && lbNext) lbNext.click();
    });
  }

  /* ==========================================================================
     FAQ ACCORDION
     ========================================================================== */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach((other) => {
        other.classList.remove("open");
        const a = other.querySelector(".faq-answer");
        if (a) a.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ==========================================================================
     CONTACT FORM
     ========================================================================== */
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = contactForm.querySelector("[data-form-note]");
      const requiredFields = contactForm.querySelectorAll("[required]");
      let valid = true;
      requiredFields.forEach((f) => {
        if (!f.value.trim()) valid = false;
      });
      if (!valid) {
        if (note) {
          note.textContent = "Please fill in all required fields.";
          note.style.color = "#ff9d9d";
        }
        return;
      }
      if (note) {
        note.textContent = "Message sent — the academy will reply within 1 business day.";
        note.style.color = "var(--accent)";
      }
      contactForm.reset();
    });
  }

  /* ==========================================================================
     SHOP — size / color / quantity selectors + order flow
     ========================================================================== */
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    const sizeBtns = card.querySelectorAll(".size-btn");
    sizeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        sizeBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    const colorDots = card.querySelectorAll(".color-dot");
    colorDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        colorDots.forEach((d) => d.classList.remove("active"));
        dot.classList.add("active");
      });
    });

    const qtyVal = card.querySelector(".qty-val");
    const qtyMinus = card.querySelector("[data-qty-minus]");
    const qtyPlus = card.querySelector("[data-qty-plus]");
    if (qtyVal && qtyMinus && qtyPlus) {
      qtyMinus.addEventListener("click", () => {
        let v = parseInt(qtyVal.textContent, 10);
        if (v > 1) qtyVal.textContent = v - 1;
      });
      qtyPlus.addEventListener("click", () => {
        let v = parseInt(qtyVal.textContent, 10);
        if (v < 10) qtyVal.textContent = v + 1;
      });
    }
  });

  /* ---------- Order / payment modal flow ---------- */
  const orderModal = document.querySelector("[data-order-modal]");
  if (orderModal) {
    const stepPayment = orderModal.querySelector("[data-step='payment']");
    const stepForm = orderModal.querySelector("[data-step='form']");
    const stepSuccess = orderModal.querySelector("[data-step='success']");
    const stepDots = orderModal.querySelectorAll(".step-dot");
    const summaryName = orderModal.querySelector("[data-summary-name]");
    const summaryPrice = orderModal.querySelector("[data-summary-price]");
    const orderJerseyField = orderModal.querySelector("[data-order-jersey]");
    const orderSizeField = orderModal.querySelector("[data-order-size]");
    const orderQtyField = orderModal.querySelector("[data-order-qty]");
    const closeBtns = orderModal.querySelectorAll(".modal-close, [data-modal-dismiss]");
    const uploadBox = orderModal.querySelector(".upload-box");
    const uploadInput = orderModal.querySelector("[data-upload-input]");

    function setStep(step) {
      [stepPayment, stepForm, stepSuccess].forEach((s) => s && (s.style.display = "none"));
      if (step === "payment" && stepPayment) stepPayment.style.display = "block";
      if (step === "form" && stepForm) stepForm.style.display = "block";
      if (step === "success" && stepSuccess) stepSuccess.style.display = "block";
      stepDots.forEach((d, i) => {
        const order = { payment: 0, form: 1, success: 2 };
        d.classList.toggle("active", i <= order[step]);
      });
    }

    function openOrderModal(product) {
      if (summaryName) summaryName.textContent = product.name;
      if (summaryPrice) summaryPrice.textContent = product.price;
      if (orderJerseyField) orderJerseyField.value = product.name;
      if (orderSizeField) orderSizeField.value = product.size;
      if (orderQtyField) orderQtyField.value = product.qty;
      setStep("payment");
      orderModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeOrderModal() {
      orderModal.classList.remove("active");
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-order-trigger]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".product-card");
        if (!card) return;
        const activeSize = card.querySelector(".size-btn.active");
        const qtyVal = card.querySelector(".qty-val");
        openOrderModal({
          name: card.dataset.productName,
          price: card.dataset.productPrice,
          size: activeSize ? activeSize.textContent.trim() : "M",
          qty: qtyVal ? qtyVal.textContent.trim() : "1",
        });
      });
    });

    closeBtns.forEach((btn) => btn.addEventListener("click", closeOrderModal));
    orderModal.addEventListener("click", (e) => {
      if (e.target === orderModal) closeOrderModal();
    });

    orderModal.querySelectorAll("[data-paid-btn]").forEach((btn) => {
      btn.addEventListener("click", () => setStep("form"));
    });

    if (uploadBox && uploadInput) {
      uploadBox.addEventListener("click", () => uploadInput.click());
      uploadInput.addEventListener("change", () => {
        if (uploadInput.files && uploadInput.files.length) {
          uploadBox.classList.add("has-file");
          uploadBox.textContent = uploadInput.files[0].name + " — selected";
        }
      });
    }

    const orderForm = orderModal.querySelector("[data-order-form]");
    if (orderForm) {
      orderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        setStep("success");
      });
    }
  }

  /* ---------- Quick view modal ---------- */
  const quickViewModal = document.querySelector("[data-quickview-modal]");
  if (quickViewModal) {
    const qvName = quickViewModal.querySelector("[data-qv-name]");
    const qvDesc = quickViewModal.querySelector("[data-qv-desc]");
    const qvPrice = quickViewModal.querySelector("[data-qv-price]");
    const closeBtns = quickViewModal.querySelectorAll(".modal-close, [data-modal-dismiss]");

    document.querySelectorAll("[data-quickview-trigger]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".product-card");
        if (!card) return;
        if (qvName) qvName.textContent = card.dataset.productName;
        if (qvDesc) qvDesc.textContent = card.dataset.productDesc || "";
        if (qvPrice) qvPrice.textContent = card.dataset.productPrice;
        quickViewModal.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    closeBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        quickViewModal.classList.remove("active");
        document.body.style.overflow = "";
      })
    );
    quickViewModal.addEventListener("click", (e) => {
      if (e.target === quickViewModal) {
        quickViewModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }
})();
