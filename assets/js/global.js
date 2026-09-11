(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const progress = document.getElementById("page-progress");
  const toastEl = document.getElementById("toast");

  if (toggle) {
    toggle.addEventListener("click", function () {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".nav-mobile a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
    });
  });

  window.addEventListener("scroll", function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      progress.style.width = Math.min(100, ratio * 100) + "%";
    }
  }, { passive: true });

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  document.querySelectorAll(".chips").forEach(function (group) {
    group.addEventListener("click", function (e) {
      if (!e.target.classList.contains("chip")) return;
      group.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-on"); });
      e.target.classList.add("is-on");
    });
  });

  document.querySelectorAll(".faq-item button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const item = btn.closest(".faq-item");
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  window.GotamsUI = {
    toast: function (message) {
      if (!toastEl) return;
      toastEl.textContent = message;
      toastEl.classList.add("is-on");
      setTimeout(function () { toastEl.classList.remove("is-on"); }, 2800);
    }
  };
})();

