/* ==========================================================================
   PAGES.JS — registration + donation page interactions
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Generic modal open/close ---------- */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.closest(".modal-overlay")));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });
  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.openModal);
      openModal(target);
    });
  });

  /* ---------- File upload: show chosen filename ---------- */
  document.querySelectorAll(".file-upload input[type='file']").forEach((input) => {
    input.addEventListener("change", () => {
      const label = input.closest(".file-upload").querySelector(".file-name");
      if (!label) return;
      label.textContent = input.files && input.files[0] ? input.files[0].name : "";
    });
  });

  /* ---------- Registration form -> success modal ---------- */
  const registrationForm = document.querySelector("#registrationForm");
  if (registrationForm) {
    registrationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        return;
      }
      openModal(document.querySelector("#registrationSuccess"));
      registrationForm.reset();
      registrationForm
        .querySelectorAll(".file-name")
        .forEach((el) => (el.textContent = ""));
    });
  }

  /* ---------- Donation: amount card selection ---------- */
  const amountCards = document.querySelectorAll(".amount-card input[name='donationAmount']");
  const customInput = document.querySelector("#customAmountInput");
  const customCard = document.querySelector("#customAmountCard");

  function clearCustom() {
    if (customInput) customInput.value = "";
    if (customCard) customCard.classList.remove("active");
  }

  amountCards.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.value !== "custom") clearCustom();
    });
  });

  if (customInput) {
    customInput.addEventListener("input", () => {
      if (customInput.value) {
        amountCards.forEach((i) => (i.checked = false));
        const customRadio = document.querySelector("#amountCustom");
        if (customRadio) customRadio.checked = true;
        if (customCard) customCard.classList.add("active");
      } else if (customCard) {
        customCard.classList.remove("active");
      }
    });
  }

  /* ---------- Payment method -> confirmation modal, pre-fill amount/method ---------- */
  document.querySelectorAll("[data-payment-method]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const method = btn.dataset.paymentMethod;
      const methodField = document.querySelector("#confirmMethod");
      if (methodField) methodField.value = method;

      const selectedAmount = document.querySelector("input[name='donationAmount']:checked");
      const amountField = document.querySelector("#confirmAmount");
      if (amountField && selectedAmount) {
        amountField.value =
          selectedAmount.value === "custom"
            ? customInput && customInput.value
              ? customInput.value
              : ""
            : selectedAmount.value;
      }
      openModal(document.querySelector("#donationConfirmModal"));
    });
  });

  /* ---------- Donation confirmation form -> success modal ---------- */
  const donationForm = document.querySelector("#donationConfirmForm");
  if (donationForm) {
    donationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!donationForm.checkValidity()) {
        donationForm.reportValidity();
        return;
      }
      closeModal(document.querySelector("#donationConfirmModal"));
      setTimeout(() => openModal(document.querySelector("#donationSuccess")), 250);
      donationForm.reset();
      const label = donationForm.querySelector(".file-name");
      if (label) label.textContent = "";
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((el) => el.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
})();
