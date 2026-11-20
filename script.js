document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  function closeMenu() {
    if (!navToggle || !navMenu) return;
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ---------- 3. Highlight active nav link while scrolling ---------- */
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = ["home", "skills", "projects", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActiveLink() {
    var scrollPos = window.scrollY + 120;
    var currentId = "home";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
    });
  }
  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- 4. Typing effect in the hero ---------- */
  var typedEl = document.getElementById("typed");
  var words = ["clean websites", "responsive layouts", "smart prompts", "projects that work"];

  if (typedEl && !reducedMotion) {
    var wordIndex = 0;
    var charIndex = 0;
    var deleting = false;

    (function tick() {
      var word = words[wordIndex];
      typedEl.textContent = word.substring(0, charIndex);
      var delay = deleting ? 45 : 85;

      if (!deleting && charIndex === word.length) {
        deleting = true;
        delay = 1500;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 350;
      } else {
        charIndex += deleting ? -1 : 1;
      }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- 5. Animated number counters ---------- */
  var counters = document.querySelectorAll(".count");

  function setCounterFinal(el) {
    el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
  }

  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 6. Scroll reveal (also triggers skill bars + counters) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var canObserve = "IntersectionObserver" in window && !reducedMotion;

  if (canObserve) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(setCounterFinal);
  }

  /* ---------- 7. Project filtering ---------- */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project-card");
  var resultCount = document.getElementById("resultCount");

  function applyFilter(category) {
    var visible = 0;
    projectCards.forEach(function (card) {
      var show = category === "all" || card.dataset.category === category;
      card.hidden = !show;
      if (show) visible++;
    });
    if (resultCount) {
      resultCount.textContent = "Showing " + visible + " of " + projectCards.length + " projects";
    }
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) {
        var isActive = b === btn;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-pressed", String(isActive));
      });
      applyFilter(btn.dataset.filter);
    });
  });

  /* ---------- 8. Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  if (!form) return;

  var fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    interest: document.getElementById("interest"),
    message: document.getElementById("message")
  };
  var statusBox = document.getElementById("formStatus");
  var charCount = document.getElementById("charCount");
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Each rule returns an error message, or "" when the value is valid
  var rules = {
    name: function (v) {
      v = v.trim();
      if (!v) return "Please enter your name.";
      if (v.length < 2) return "Name must be at least 2 characters.";
      if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(v)) return "Use letters only (spaces, . ' - allowed).";
      return "";
    },
    email: function (v) {
      v = v.trim();
      if (!v) return "Please enter your email address.";
      if (!emailPattern.test(v)) return "Enter a valid email, like name@example.com.";
      return "";
    },
    interest: function (v) {
      return v ? "" : "Please choose an option.";
    },
    message: function (v) {
      v = v.trim();
      if (!v) return "Please write a message.";
      if (v.length < 10) return "Message must be at least 10 characters.";
      return "";
    }
  };

  function showFieldState(key) {
    var input = fields[key];
    var wrapper = input.closest(".field");
    var errorEl = document.getElementById(key + "Error");
    var message = rules[key](input.value);

    wrapper.classList.toggle("invalid", message !== "");
    wrapper.classList.toggle("valid", message === "");
    if (errorEl) errorEl.textContent = message;
    return message === "";
  }

  function clearStatus() {
    statusBox.textContent = "";
    statusBox.className = "status";
  }

  Object.keys(fields).forEach(function (key) {
    var input = fields[key];
    input.addEventListener("blur", function () { showFieldState(key); });
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("invalid")) showFieldState(key);
    });
    input.addEventListener("change", function () { showFieldState(key); });
  });

  fields.message.addEventListener("input", function () {
    charCount.textContent = fields.message.value.length + " / 500";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearStatus();

    var allValid = true;
    var firstInvalid = null;

    Object.keys(fields).forEach(function (key) {
      var ok = showFieldState(key);
      if (!ok) {
        allValid = false;
        if (!firstInvalid) firstInvalid = fields[key];
      }
    });

    if (!allValid) {
      statusBox.className = "status fail";
      statusBox.textContent = "Please fix the highlighted fields and try again.";
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Demo only: there is no backend, so success is shown immediately.
    var firstName = fields.name.value.trim().split(/\s+/)[0];
    statusBox.className = "status success";
    statusBox.textContent = "Thank you, " + firstName + "! Your message was submitted successfully.";

    form.reset();
    charCount.textContent = "0 / 500";
    form.querySelectorAll(".field").forEach(function (f) {
      f.classList.remove("valid", "invalid");
    });
    form.querySelectorAll(".error").forEach(function (e) { e.textContent = ""; });
  });
});