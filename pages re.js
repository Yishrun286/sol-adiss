/* ==========================================================================
   PAGES.JS — registration + donation page interactions with Telegram API
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

  /* ---------- File upload: show chosen filename & Image Preview ---------- */
  function setupFilePreview(inputId, previewImgId, previewContainerId) {
    const input = document.getElementById(inputId);
    const previewImg = document.getElementById(previewImgId);
    const container = document.getElementById(previewContainerId);

    if (!input) return;

    input.addEventListener("change", () => {
      const label = input.closest(".file-upload") ? input.closest(".file-upload").querySelector(".file-name") : null;
      const file = input.files && input.files[0];

      if (file) {
        // 1. File Size Validation (Max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
          alert("⚠️ ፋይሉ ከ 5MB በላይ መሆን የለበትም። እባክዎ አነስ ያለ ፋይል ይምረጡ።");
          input.value = ""; 
          if (label) label.textContent = "";
          if (container) container.style.display = "none";
          return;
        }

        if (label) label.textContent = file.name;

        // 2. Image Preview logic
        if (file.type.startsWith("image/") && previewImg && container) {
          const reader = new FileReader();
          reader.onload = function (e) {
            previewImg.src = e.target.result;
            container.style.display = "block";
          };
          reader.readAsDataURL(file);
        } else if (container) {
          // ፎቶ ካልሆነ (ለምሳሌ PDF ከሆነ)
          container.style.display = "none";
        }
      } else {
        if (label) label.textContent = "";
        if (container) container.style.display = "none";
      }
    });
  }

  // Setup preview for player photo and birth certificate
  setupFilePreview("playerPhoto", "playerPhotoPreview", "playerPhotoPreviewContainer");
  setupFilePreview("birthCert", "birthCertPreview", "birthCertPreviewContainer");


  /* ---------- Registration form -> Telegram API ---------- */
  const registrationForm = document.querySelector("#registrationForm");
  if (registrationForm) {
    registrationForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        return;
      }

      // 1. የቅጹን Input values መሰብሰብ
      const fullName = document.getElementById("fullName") ? document.getElementById("fullName").value : "";
      const age = document.getElementById("age") ? document.getElementById("age").value : "";
      const dob = document.getElementById("dob") ? document.getElementById("dob").value : "";

      const genderInput = document.querySelector("input[name='gender']:checked");
      const gender = genderInput ? genderInput.value : "Not Specified";

      const position = document.getElementById("position") ? document.getElementById("position").value : "";
      const program = document.getElementById("program") ? document.getElementById("program").value : "";
      const phone = document.getElementById("phone") ? document.getElementById("phone").value : "";
      const email = document.getElementById("email") ? document.getElementById("email").value : "N/A";
      const parentName = document.getElementById("parentName") ? document.getElementById("parentName").value : "";
      const parentPhone = document.getElementById("parentPhone") ? document.getElementById("parentPhone").value : "";
      const address = document.getElementById("address") ? document.getElementById("address").value : "";
      const experience = document.getElementById("experience") ? document.getElementById("experience").value : "None";
      const emergencyName = document.getElementById("emergencyName") ? document.getElementById("emergencyName").value : "";
      const medical = document.getElementById("medical") ? document.getElementById("medical").value : "None";

      const selectedDays = Array.from(document.querySelectorAll("input[name='trainingDays']:checked"))
                                .map((cb) => cb.value)
                                .join(", ");

      // 2. ሁለቱንም ፋይሎች ለይቶ መሰብሰብ
      const playerPhotoInput = document.getElementById("playerPhoto");
      const birthCertInput = document.getElementById("birthCert");

      const playerPhotoFile = playerPhotoInput && playerPhotoInput.files[0] ? playerPhotoInput.files[0] : null;
      const birthCertFile = birthCertInput && birthCertInput.files[0] ? birthCertInput.files[0] : null;

      const submitBtn = registrationForm.querySelector("button[type='submit']");
      const originalBtnText = submitBtn ? submitBtn.innerHTML : "Submit Registration";

      // Loading state
      if (submitBtn) {
        submitBtn.innerHTML = "Submitting...";
        submitBtn.disabled = true;
      }

      // 3. Telegram Bot credentials
      const TELEGRAM_BOT_TOKEN = "8609980311:AAENOdIEHFsIaR9xRmqtu-WbThiGCTHVMAk";
      const TELEGRAM_CHAT_ID = "-1003732216657";

      const telegramMessage = 
        `⚽ *NEW PLAYER REGISTRATION*\n` +
        `-----------------------------------\n` +
        `👤 *Player Name:* ${fullName}\n` +
        `🎂 *Age / DOB:* ${age} yrs (${dob})\n` +
        `⚧ *Gender:* ${gender}\n` +
        `🏃 *Position:* ${position}\n` +
        `🏆 *Program:* ${program}\n` +
        `📞 *Player Phone:* ${phone}\n` +
        `📧 *Email:* ${email}\n\n` +
        `👨‍👩‍👦 *Parent/Guardian:* ${parentName} (${parentPhone})\n` +
        `📍 *Address:* ${address}\n` +
        `🚑 *Emergency Contact:* ${emergencyName}\n` +
        `🏥 *Medical Conditions:* ${medical}\n` +
        `📅 *Training Days:* ${selectedDays || "None selected"}\n` +
        `⚽ *Experience:* ${experience}`;

      try {
        // 🖼️ ሀ) የተጫዋቹ ፎቶ ካለ ከነ መረጃው (Caption) አብሮ ይላካል
        if (playerPhotoFile) {
          const photoData = new FormData();
          photoData.append("chat_id", TELEGRAM_CHAT_ID);
          photoData.append("photo", playerPhotoFile);
          photoData.append("caption", telegramMessage);
          photoData.append("parse_mode", "Markdown");

          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: photoData,
          });
        } else {
          // ፎቶ ካልተመረጠ ጽሁፉን ብቻ መላክ
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: telegramMessage,
              parse_mode: "Markdown",
            }),
          });
        }

        // 📄 ለ) የልደት ሰርተፊኬት (PDF/Photo) ካለ በየብቻው ቀጥሎ ይላካል
        if (birthCertFile) {
          const certData = new FormData();
          certData.append("chat_id", TELEGRAM_CHAT_ID);
          certData.append("document", birthCertFile);
          certData.append("caption", `📑 *Birth Certificate / Document for:* ${fullName}`);
          certData.append("parse_mode", "Markdown");

          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
            method: "POST",
            body: certData,
          });
        }

        // Success Modal መክፈትና Form ማፅዳት
        openModal(document.querySelector("#registrationSuccess"));
        registrationForm.reset();

        // የቆዩ ፕሪቪው እና ፋይል ስሞችን ማፅዳት
        registrationForm.querySelectorAll(".file-name").forEach((el) => (el.textContent = ""));
        const p1 = document.getElementById("playerPhotoPreviewContainer");
        const p2 = document.getElementById("birthCertPreviewContainer");
        if (p1) p1.style.display = "none";
        if (p2) p2.style.display = "none";

      } catch (error) {
        console.error("Registration submission error:", error);
        alert("❌ Failed to submit registration. Please try again.");
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }
      }
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


/* ==========================================================================
   DONATION FORM WITH TELEGRAM INTEGRATION
   ========================================================================== */
(function () {
  "use strict";

  // TELEGRAM BOT CREDENTIALS
  const TELEGRAM_BOT_TOKEN = "8609980311:AAENOdIEHFsIaR9xRmqtu-WbThiGCTHVMAk";
 const TELEGRAM_CHAT_ID = "-1003732216657";
  // Helper function to escape Markdown special characters
  function escapeMarkdown(text) {
    return text ? String(text).replace(/[_*`\[\]]/g, "\\$&") : "";
  }

  // 1. Amount selection & Custom Amount syncing logic
  const customAmountInput = document.getElementById("customAmountInput");
  const confirmAmountInput = document.getElementById("confirmAmount");

  function getSelectedAmount() {
    const selectedRadio = document.querySelector('input[name="donationAmount"]:checked');
    if (!selectedRadio) return "500";
    if (selectedRadio.value === "custom") {
      return (customAmountInput && customAmountInput.value.trim()) ? customAmountInput.value.trim() : "0";
    }
    return selectedRadio.value;
  }

  if (customAmountInput) {
    customAmountInput.addEventListener("focus", () => {
      const customRadio = document.getElementById("amountCustom");
      if (customRadio) customRadio.checked = true;
    });
  }

  // 2. Handling "I Have Sent the Payment" Buttons & Modal Opening
  const paymentBtns = document.querySelectorAll("[data-payment-method]");
  const confirmModal = document.getElementById("donationConfirmModal");
  const confirmMethodSelect = document.getElementById("confirmMethod");

  paymentBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const method = btn.getAttribute("data-payment-method");

      // Auto-fill selected method in modal select field
      if (confirmMethodSelect && method) {
        confirmMethodSelect.value = method;
      }

      // Auto-fill selected amount in modal amount field
      if (confirmAmountInput) {
        confirmAmountInput.value = getSelectedAmount();
      }

      // Show Modal
      if (confirmModal) {
        confirmModal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  });

  // Modal Close buttons logic
  const modalCloseBtns = document.querySelectorAll("#donationConfirmModal [data-modal-close]");
  modalCloseBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirmModal) {
        confirmModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  });

  // 3. File Input UI Display Sync
  const fileInput = document.getElementById("paymentScreenshot");
  const fileNameDisplay = document.querySelector("#donationConfirmModal .file-upload .file-name");

  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files.length > 0) {
        fileNameDisplay.textContent = " — " + fileInput.files[0].name;
      } else {
        fileNameDisplay.textContent = "";
      }
    });
  }

  // 4. Form Submission & Telegram Bot Integration
  const donationForm = document.getElementById("donationConfirmForm");
  const successModal = document.getElementById("donationSuccess");

  if (donationForm) {
    donationForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = donationForm.querySelector("button[type='submit']");
      const originalBtnText = submitBtn ? submitBtn.innerHTML : "Submit Donation";

      // 🎯 መረጃዎቹን በቀጥታ ከፎርሙ Input id ወይም name መውሰድ
      const name = document.getElementById("confirmName")?.value.trim() || donationForm.querySelector("[name='confirmName']")?.value.trim() || "N/A";
      const phone = document.getElementById("confirmPhone")?.value.trim() || donationForm.querySelector("[name='confirmPhone']")?.value.trim() || "N/A";
      const email = document.getElementById("confirmEmail")?.value.trim() || donationForm.querySelector("[name='confirmEmail']")?.value.trim() || "N/A";
      const amount = document.getElementById("confirmAmount")?.value.trim() || donationForm.querySelector("[name='confirmAmount']")?.value.trim() || "N/A";
      const method = document.getElementById("confirmMethod")?.value.trim() || donationForm.querySelector("[name='confirmMethod']")?.value.trim() || "N/A";
      const message = document.getElementById("confirmMessage")?.value.trim() || donationForm.querySelector("[name='confirmMessage']")?.value.trim() || "መልእክት የለውም";
      const screenshot = fileInput?.files[0];

      // Getting Frequency (One Time / Monthly / Yearly)
      const freqRadio = document.querySelector('input[name="frequency"]:checked');
      const frequency = freqRadio ? freqRadio.value : "One Time";

      if (submitBtn) {
        submitBtn.innerHTML = "እየላከ ነው...";
        submitBtn.disabled = true;
      }

      // 💛 Telegram Caption Text
      const telegramCaption =
        `💛 *NEW DONATION RECEIVED*\n` +
        `-----------------------------------\n` +
        `💰 *Amount:* ${escapeMarkdown(amount)} ETB\n` +
        `🔄 *Frequency:* ${escapeMarkdown(frequency)}\n` +
        `💳 *Payment Method:* ${escapeMarkdown(method)}\n\n` +
        `👤 *Donor Name:* ${escapeMarkdown(name)}\n` +
        `📞 *Phone:* ${escapeMarkdown(phone)}\n` +
        `📧 *Email:* ${escapeMarkdown(email)}\n\n` +
        `💬 *Note/Message:*\n${escapeMarkdown(message)}`;

      try {
        let response;

        // Screenshot ካለ -> sendPhoto API
        if (screenshot) {
          const formData = new FormData();
          formData.append("chat_id", TELEGRAM_CHAT_ID);
          formData.append("photo", screenshot);
          formData.append("caption", telegramCaption);
          formData.append("parse_mode", "Markdown");

          response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: formData,
          });
        } 
        // Screenshot ካልተያያዘ -> sendMessage API
        else {
          response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: telegramCaption,
              parse_mode: "Markdown",
            }),
          });
        }

        const result = await response.json();

        if (result.ok) {
          // Close confirmation modal
          if (confirmModal) {
            confirmModal.classList.remove("active");
          }

          // Open success modal
          if (successModal) {
            successModal.classList.add("active");
            document.body.style.overflow = "hidden";
          }

          donationForm.reset();
          if (fileNameDisplay) fileNameDisplay.textContent = "";
        } else {
          console.error("Telegram API Error:", result);
          alert("መረጃውን መላክ አልተቻለም፤ እባክዎ እንደገና ይሞክሩ።");
        }
      } catch (err) {
        console.error("Donation submission error:", err);
        alert("የኢንተርኔት ግንኙነት ችግር አጋጥሟል።");
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }
      }
    });
  }

  // Success Modal close handler
  if (successModal) {
    const successCloseBtns = successModal.querySelectorAll("[data-modal-close]");
    successCloseBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        successModal.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }
})();