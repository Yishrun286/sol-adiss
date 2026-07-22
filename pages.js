/* ==========================================================================
   PAGES.JS — gallery filter + lightbox, FAQ accordion, contact form,
   shop selectors + payment/order modal flow.
   Loaded on gallery.html / contact.html / shop.html alongside main.js
   and animation.js. Every block checks for its elements before running,
   so this file is safe to include on any of the three pages.
   ========================================================================== */

(function () {
  "use strict";

  // TELEGRAM BOT CREDENTIALS
  const TELEGRAM_BOT_TOKEN = "8609980311:AAENOdIEHFsIaR9xRmqtu-WbThiGCTHVMAk";
  const TELEGRAM_CHAT_ID = "968893335";

  // Helper function to escape Markdown special characters for Telegram API
  function escapeMarkdown(text) {
    return text ? String(text).replace(/[_*`\[\]]/g, "\\$&") : "";
  }

  /* ==========================================================================
     GALLERY — filter bar + masonry + lightbox
     ========================================================================== */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const masonryItems = document.querySelectorAll(".masonry-item");
  const loadMoreBtn = document.querySelector("[data-load-more]");

  let visibleCount = 8;
  const pageSize = 8;

  function applyFilter(category) {
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
      if (lbTag) lbTag.textContent = item.dataset.category;
      if (lbTitle) lbTitle.textContent = item.dataset.title || "Academy Moment";
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
     CONTACT FORM WITH TELEGRAM API & ALERT MODAL
     ========================================================================== */
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const modal = document.getElementById("status-modal");
    const modalIcon = document.getElementById("modal-icon");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => {
        if (modal) modal.style.display = "none";
      });
    }

    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const fullName = contactForm.querySelector("#full-name")?.value || "";
      const phone = contactForm.querySelector("#phone")?.value || "";
      const email = contactForm.querySelector("#email")?.value || "";
      const subject = contactForm.querySelector("#subject")?.value || "";
      const message = contactForm.querySelector("#message")?.value || "";

      const note = contactForm.querySelector("[data-form-note]");
      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalBtnText = submitBtn ? submitBtn.innerHTML : "Send Message";

      if (submitBtn) {
        submitBtn.innerHTML = "Sending Message...";
        submitBtn.disabled = true;
      }

      const telegramMessage =
        `📩 *NEW CONTACT MESSAGE*\n` +
        `-----------------------------\n` +
        `👤 *Name:* ${escapeMarkdown(fullName)}\n` +
        `📞 *Phone:* ${escapeMarkdown(phone)}\n` +
        `📧 *Email:* ${escapeMarkdown(email)}\n` +
        `📌 *Subject:* ${escapeMarkdown(subject)}\n\n` +
        `💬 *Message:*\n${escapeMarkdown(message)}`;

      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: "Markdown",
          }),
        });

        const result = await response.json();

        if (result.ok) {
          if (modal) {
            modalIcon.innerHTML = "✅";
            modalTitle.innerText = "Message Sent!";
            modalMessage.innerText = "መልእክትዎ በተሳካ ሁኔታ ደርሶናል፤ በቅርቡ እንመልስልዎታለን።";
            modal.style.display = "flex";
          }
          if (note) {
            note.textContent = "✨ Message sent successfully!";
            note.style.color = "var(--accent, #E8FF73)";
          }
          contactForm.reset();
        } else {
          throw new Error("Telegram API Error");
        }
      } catch (error) {
        console.error("Error sending to Telegram:", error);
        if (modal) {
          modalIcon.innerHTML = "❌";
          modalTitle.innerText = "Failed to Send";
          modalMessage.innerText = "መልእክቱን መላክ አልተቻለም። እባክዎ ድጋሚ ይሞክሩ።";
          modal.style.display = "flex";
        }
        if (note) {
          note.textContent = "❌ Failed to send message. Please try again.";
          note.style.color = "#ff9d9d";
        }
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }
      }
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

  /* ---------- Order / payment modal flow WITH TELEGRAM PHOTO/CAPTION ---------- */
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
          name: card.dataset.productName || "Home Jersey",
          price: card.dataset.productPrice || "0 ETB",
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

    // 🛒 SHOP ORDER FORM SUBMISSION
    const orderForm = orderModal.querySelector("[data-order-form]");
    if (orderForm) {
      orderForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = orderForm.querySelector("button[type='submit']");
        const originalBtnText = submitBtn ? submitBtn.innerHTML : "Complete Order";

        // Form Inputs
        const jerseyName = orderJerseyField ? orderJerseyField.value : "Home Jersey";
        const jerseySize = orderSizeField ? orderSizeField.value : "M";
        const jerseyQty = orderQtyField ? orderQtyField.value : "1";

        // Customer Inputs
        const custName = orderForm.querySelector("#order-name, [name='name']")?.value || "N/A";
        const custPhone = orderForm.querySelector("#order-phone, [name='phone']")?.value || "N/A";
        const custTelegram = orderForm.querySelector("#order-telegram, [name='telegram'], [name='email']")?.value || "N/A";
        const fileInput = uploadInput?.files[0];

        if (submitBtn) {
          submitBtn.innerHTML = "Placing Order...";
          submitBtn.disabled = true;
        }

        // 📝 ምስሉ ላይ ባለው ዲዛይን መሠረት የተዘጋጀ የፅሁፍ ቅርፅ (Caption)
        const captionMessage =
          `🛍️ *NEW KIT SHOP ORDER*\n` +
          `-----------------------------------\n` +
          `👕 *Item:* ${escapeMarkdown(jerseyName)}\n` +
          `📐 *Size:* ${escapeMarkdown(jerseySize)}\n` +
          `🔢 *Quantity:* ${escapeMarkdown(jerseyQty)}\n\n` +
          `👤 *Customer Name:* ${escapeMarkdown(custName)}\n` +
          `📞 *Phone:* ${escapeMarkdown(custPhone)}\n` +
          `✈️ *Telegram:* ${escapeMarkdown(custTelegram)}`;

        try {
          let response;

          // 1. ደንበኛው የክፍያ ስክሪንሾት/ደረሰኝ ካያያዘ -> sendPhoto (ፎቶ ከነ Caption አብሮ ይላካል)
          if (fileInput) {
            const formData = new FormData();
            formData.append("chat_id", TELEGRAM_CHAT_ID);
            formData.append("photo", fileInput);
            formData.append("caption", captionMessage);
            formData.append("parse_mode", "Markdown");

            response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
              method: "POST",
              body: formData,
            });
          } 
          // 2. ደንበኛው ፎቶ ካላያያዘ -> sendMessage (ፅሁፉ ብቻ ይላካል)
          else {
            response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: captionMessage,
                parse_mode: "Markdown",
              }),
            });
          }

          const result = await response.json();

          if (result.ok) {
            setStep("success");
            orderForm.reset();
            if (uploadBox) {
              uploadBox.classList.remove("has-file");
              uploadBox.textContent = "Upload Payment Receipt";
            }
          } else {
            console.error("Telegram API Error:", result);
            alert("ትዕዛዝዎን መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።");
          }
        } catch (err) {
          console.error("Order submission error:", err);
          alert("የመረብ ችግር አጋጥሟል። እባክዎ የኢንተርኔት ግንኙነትዎን ያረጋግጡ።");
        } finally {
          if (submitBtn) {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
          }
        }
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