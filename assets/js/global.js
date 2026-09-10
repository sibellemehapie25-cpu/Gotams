document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("mobileMenuBtn");
  var menu = document.getElementById("mobileMenu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      menu.classList.toggle("hidden");
    });
  }
});
