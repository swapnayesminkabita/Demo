/*
  EcoMart (Static Edition)
  Enabled JS only:
  1) Topbar live date & time (#dateTime)
  2) Simple form validation + demo submit (forms with data-confirm or data-demo-form)
*/

(() => {
  "use strict";

  function formatNow(d) {
    try {
      return d.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      // fallback
      return d.toString();
    }
  }

  function updateDateTime() {
    const el = document.getElementById("dateTime");
    if (!el) return;
    el.textContent = formatNow(new Date());
  }

  function getMessageBox(form) {
    let box = form.querySelector("[data-form-msg]");
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("data-form-msg", "1");
      box.className = "alert d-none mb-3";
      form.insertBefore(box, form.firstChild);
    }
    return box;
  }

  function showMessage(form, type, text) {
    const box = getMessageBox(form);
    box.className = `alert alert-${type} mb-3`;
    box.textContent = text;
    box.classList.remove("d-none");
  }

  function hideMessage(form) {
    const box = form.querySelector("[data-form-msg]");
    if (!box) return;
    box.classList.add("d-none");
  }

  function ensureFeedback(field) {
    // Try to keep feedback inside the same parent (Bootstrap friendly)
    const parent = field.parentElement || field;
    let fb = parent.querySelector(".invalid-feedback");
    if (!fb) {
      fb = document.createElement("div");
      fb.className = "invalid-feedback";
      parent.appendChild(fb);
    }
    return fb;
  }

  function setInvalid(field, message) {
    field.classList.add("is-invalid");
    const fb = ensureFeedback(field);
    fb.textContent = message;
  }

  function clearInvalid(field) {
    field.classList.remove("is-invalid");
    const parent = field.parentElement || field;
    const fb = parent.querySelector(".invalid-feedback");
    if (fb) fb.textContent = "";
  }

  function looksLikeEmail(v) {
    // Simple, practical email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function digitsOnly(v) {
    return String(v || "").replace(/\D/g, "");
  }

  function validateForm(form) {
    let ok = true;

    const fields = Array.from(form.querySelectorAll("input, select, textarea"));
    fields.forEach((field) => {
      if (!(field instanceof HTMLElement)) return;

      // Skip disabled
      // @ts-ignore
      if (field.disabled) return;

      const required = field.hasAttribute("required");
      const type = (field.getAttribute("type") || "").toLowerCase();
      const value = (field.value || "").trim();

      clearInvalid(field);

      if (required && value === "") {
        ok = false;
        setInvalid(field, "This field is required.");
        return;
      }

      if (value !== "" && type === "email" && !looksLikeEmail(value)) {
        ok = false;
        setInvalid(field, "Please enter a valid email address.");
        return;
      }

      if (value !== "" && type === "tel") {
        const d = digitsOnly(value);
        if (d.length < 8) {
          ok = false;
          setInvalid(field, "Please enter a valid phone number.");
          return;
        }
      }

      if (value !== "" && type === "password" && value.length < 4) {
        ok = false;
        setInvalid(field, "Password must be at least 4 characters.");
        return;
      }
    });

    return ok;
  }

  function demoSuccessText(form) {
    const key = (form.getAttribute("data-demo-form") || "").toLowerCase();
    if (key === "login") return "Login successful (demo).";
    if (key === "signup") return "Account created (demo).";
    if (key === "coupon") return "Coupon submitted (demo).";
    return "Form submitted (demo).";
  }

  function wireForms() {
    // Validate live (remove red border once user types)
    document.addEventListener(
      "input",
      (e) => {
        const target = e.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
        if (target.classList.contains("is-invalid")) {
          const v = (target.value || "").trim();
          if (v !== "") clearInvalid(target);
        }
      },
      true
    );

    document.addEventListener(
      "submit",
      (e) => {
        const form = e.target;
        if (!(form instanceof HTMLFormElement)) return;

        const isDemoForm = form.hasAttribute("data-confirm") || form.hasAttribute("data-demo-form");
        if (!isDemoForm) return;

        // Confirmation (if provided)
        if (form.hasAttribute("data-confirm")) {
          const msg = form.getAttribute("data-confirm") || "Are you sure?";
          // eslint-disable-next-line no-alert
          if (!window.confirm(msg)) {
            e.preventDefault();
            return;
          }
        }

        // Validate required fields
        const ok = validateForm(form);
        if (!ok) {
          e.preventDefault();
          showMessage(form, "danger", "Please fix the highlighted fields.");
          return;
        }

        // Demo submit (no backend)
        e.preventDefault();
        hideMessage(form);
        showMessage(form, "success", demoSuccessText(form));
        form.reset();
      },
      true
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    wireForms();
  });
})();
