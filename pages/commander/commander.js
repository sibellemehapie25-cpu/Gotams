(function () {
  var KEY = "gotams.cart.v1";
  var WHATSAPP = "237699232344";

  var CATALOG = {
    lait: {
      id: "lait",
      name: "Lait de soja",
      flavors: ["Nature", "Vanille", "Cacao", "Gingembre"],
      formats: ["0,5 L", "1 L"],
      priceHint: "500 - 1000 FCFA (fourchette indiquée sur le site existant)"
    },
    yaourt: {
      id: "yaourt",
      name: "Yaourt de soja",
      flavors: ["Fraise", "Ananas", "Mangue", "Bissap", "Gingembre"],
      formats: ["0,5 L"],
      priceHint: "300 - 600 FCFA (fourchette indiquée sur le site existant)"
    },
    okara: {
      id: "okara",
      name: "Okara",
      flavors: ["Alimentation animale"],
      formats: ["1 kg"],
      priceHint: "100 - 250 FCFA / kg (fourchette indiquée sur le site existant)"
    }
  };

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function saveCart(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

  function addItem(item) {
    var cart = loadCart();
    var found = cart.find(function (x) {
      return x.id === item.id && x.flavor === item.flavor && x.format === item.format;
    });
    if (found) found.qty += item.qty;
    else cart.push(item);
    saveCart(cart);
    render();
    if (window.GotamsUI) window.GotamsUI.toast("Produit ajouté à la commande.");
  }

  function removeItem(index) {
    var cart = loadCart();
    cart.splice(index, 1);
    saveCart(cart);
    render();
  }

  function setQty(index, qty) {
    var cart = loadCart();
    cart[index].qty = Math.max(1, qty);
    saveCart(cart);
    render();
  }

  function render() {
    var list = document.getElementById("cart-list");
    var empty = document.getElementById("cart-empty");
    var count = document.getElementById("cart-count");
    if (!list) return;
    var cart = loadCart();
    if (count) count.textContent = cart.reduce(function (n, i) { return n + i.qty; }, 0);
    list.innerHTML = "";
    if (!cart.length) {
      if (empty) empty.classList.remove("is-hidden");
      return;
    }
    if (empty) empty.classList.add("is-hidden");
    cart.forEach(function (item, index) {
      var li = document.createElement("li");
      li.className = "card";
      li.style.padding = "1rem";
      li.style.marginBottom = "0.8rem";
      li.innerHTML =
        "<strong>" + item.name + "</strong>" +
        "<p class='hint'>" + item.flavor + " · " + item.format + "<br>" + item.priceHint + "</p>" +
        "<div style='display:flex;justify-content:space-between;align-items:center;gap:0.6rem'>" +
        "<div class='qty'>" +
        "<button type='button' data-minus='" + index + "' aria-label='Diminuer'>-</button>" +
        "<span>" + item.qty + "</span>" +
        "<button type='button' data-plus='" + index + "' aria-label='Augmenter'>+</button>" +
        "</div>" +
        "<button type='button' class='btn btn-outline' data-remove='" + index + "'>Retirer</button>" +
        "</div>";
      list.appendChild(li);
    });
  }

  function messageFromCart(form) {
    var cart = loadCart();
    var lines = ["Bonjour GOTAM'S, je souhaite commander :", ""];
    cart.forEach(function (item) {
      lines.push("- " + item.qty + " × " + item.name + " (" + item.flavor + ", " + item.format + ")");
    });
    lines.push("");
    lines.push("Nom : " + (form.nom.value || "À compléter"));
    lines.push("WhatsApp : " + (form.whatsapp.value || "À compléter"));
    lines.push("Zone : " + (form.zone.value || "À compléter"));
    if (form.note.value) lines.push("Note : " + form.note.value);
    lines.push("");
    lines.push("Merci de me confirmer la disponibilité. Les prix exacts restent à confirmer.");
    return lines.join("\n");
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();

    document.querySelectorAll("[data-add-product]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var id = form.getAttribute("data-add-product");
        var product = CATALOG[id];
        if (!product) return;
        addItem({
          id: product.id,
          name: product.name,
          flavor: form.flavor.value,
          format: form.format.value,
          qty: Number(form.qty.value || 1),
          priceHint: product.priceHint
        });
      });
    });

    document.getElementById("cart-list")?.addEventListener("click", function (e) {
      var t = e.target;
      if (t.hasAttribute("data-remove")) removeItem(Number(t.getAttribute("data-remove")));
      if (t.hasAttribute("data-minus")) setQty(Number(t.getAttribute("data-minus")), loadCart()[Number(t.getAttribute("data-minus"))].qty - 1);
      if (t.hasAttribute("data-plus")) setQty(Number(t.getAttribute("data-plus")), loadCart()[Number(t.getAttribute("data-plus"))].qty + 1);
    });

    var orderForm = document.getElementById("order-form");
    if (orderForm) {
      orderForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!loadCart().length) {
          if (window.GotamsUI) window.GotamsUI.toast("Ajoutez au moins un produit.");
          return;
        }
        if (!orderForm.nom.value.trim() || !orderForm.whatsapp.value.trim()) {
          if (window.GotamsUI) window.GotamsUI.toast("Indiquez votre nom et votre WhatsApp.");
          return;
        }
        var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(messageFromCart(orderForm));
        window.open(url, "_blank", "noopener");
      });
    }
  });
})();

