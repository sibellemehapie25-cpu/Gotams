(function () {
  var STORAGE_KEY = "gotams.surveys.v1";

  function uid() {
    return (
      "gs_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  /* Replace this function later with POST /api/surveys/households or /merchants */
  var SHEET_URL =
    "https://script.google.com/macros/s/AKfycbx1vLZD8jgXMYLV29o4JBMB8jgZagSdjtQCSIRGLlky93DPHu2i8fAXQBVJO3RXPcEZ/exec";

  function persistSurvey(payload) {
    // Sauvegarde locale (comme avant, en secours)
    var items = loadAll();
    items.push(payload);
    saveAll(items);
    // Envoie aussi vers Google Sheets
    try {
      fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      /* pas de connexion : la copie locale suffit */
    }
    return payload;
  }

  function csvEscape(value) {
    var str = value == null ? "" : String(value);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  }

  function flatten(obj, prefix, out) {
    prefix = prefix || "";
    out = out || {};
    Object.keys(obj || {}).forEach(function (key) {
      var val = obj[key];
      var next = prefix ? prefix + "." + key : key;
      if (val && typeof val === "object" && !Array.isArray(val))
        flatten(val, next, out);
      else out[next] = Array.isArray(val) ? val.join(" | ") : val;
    });
    return out;
  }

  function exportCsv() {
    var items = loadAll();
    if (!items.length) return "";
    var rows = items.map(function (item) {
      return flatten(item);
    });
    var keys = {};
    rows.forEach(function (row) {
      Object.keys(row).forEach(function (k) {
        keys[k] = true;
      });
    });
    var headers = Object.keys(keys);
    var lines = [headers.join(",")];
    rows.forEach(function (row) {
      lines.push(
        headers
          .map(function (h) {
            return csvEscape(row[h]);
          })
          .join(","),
      );
    });
    return lines.join("\n");
  }

  function downloadCsv() {
    var csv = exportCsv();
    if (!csv) {
      if (window.GotamsUI) window.GotamsUI.toast("Aucune enquête à exporter.");
      return;
    }
    var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "gotams-enquetes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function updateSurveyCount() {
    var el = document.getElementById("survey-count");
    if (!el) return;
    var n = loadAll().length;
    el.textContent =
      n + " enquête" + (n > 1 ? "s" : "") + " enregistrée" + (n > 1 ? "s" : "");
  }

  function requiredVisible(panel) {
    return Array.prototype.slice
      .call(panel.querySelectorAll("[data-required='true']"))
      .filter(function (el) {
        var wrap = el.closest(".js-conditional");
        if (wrap && wrap.classList.contains("is-hidden")) return false;
        if (el.closest(".is-hidden")) return false;
        return true;
      });
  }

  function groupValue(form, name) {
    var checked = form.querySelector('[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function validatePanel(panel, form) {
    var ok = true;
    panel.querySelectorAll(".field").forEach(function (f) {
      f.classList.remove("is-error");
    });
    requiredVisible(panel).forEach(function (el) {
      var field = el.closest(".field") || el;
      var valid = true;
      if (el.type === "radio") {
        valid = !!groupValue(form, el.name);
      } else if (el.type === "checkbox") {
        valid = el.checked;
      } else {
        valid = !!(el.value && String(el.value).trim());
      }
      if (!valid) {
        ok = false;
        field.classList.add("is-error");
      }
    });
    return ok;
  }

  function serializeForm(form) {
    var data = {};
    Array.prototype.slice.call(form.elements).forEach(function (el) {
      if (!el.name || el.disabled) return;
      if (el.type === "radio") {
        if (el.checked) data[el.name] = el.value;
        return;
      }
      if (el.type === "checkbox") {
        data[el.name] = el.checked;
        return;
      }
      data[el.name] = el.value;
    });
    return data;
  }

  function initWizard(form) {
    var panels = Array.prototype.slice.call(
      form.querySelectorAll(".step-panel"),
    );
    var index = 0;
    var bar = form.querySelector(".progress-bar span");
    var label = form.querySelector("[data-step-label]");
    var prevBtn = form.querySelector("[data-prev]");
    var nextBtn = form.querySelector("[data-next]");

    function visiblePanels() {
      return panels.filter(function (p) {
        return !p.classList.contains("is-hidden");
      });
    }

    function refresh() {
      var vis = visiblePanels();
      vis.forEach(function (p, i) {
        p.classList.toggle("is-active", i === index);
      });
      var total = vis.length;
      if (label) label.textContent = "Étape " + (index + 1) + " sur " + total;
      if (bar) bar.style.width = ((index + 1) / total) * 100 + "%";
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn)
        nextBtn.textContent = index === total - 1 ? "Valider" : "Suivant";
    }

    function applyLogic() {
      var milk = groupValue(form, "q1_lait");
      form.querySelectorAll("[data-show-if-milk]").forEach(function (el) {
        el.classList.toggle("is-hidden", milk === "Non");
      });
      var sells = groupValue(form, "q1_vend");
      form.querySelectorAll("[data-show-if-sells]").forEach(function (el) {
        el.classList.toggle("is-hidden", sells === "Non");
      });
      var follow = groupValue(form, "accord_suivi");
      form.querySelectorAll("[data-show-if-follow]").forEach(function (el) {
        el.classList.toggle("is-hidden", follow !== "Oui");
      });
      var interest = groupValue(form, "q4_interet");
      var letter = form.querySelector("[data-letter-step]");
      if (letter) {
        var show = interest && interest !== "Non";
        letter.classList.toggle("is-hidden", !show);
        if (!show && letter.classList.contains("is-active") && index > 0) {
          index = Math.min(index, visiblePanels().length - 1);
        }
      }
      var otherSit = groupValue(form, "situation");
      var sitExtra = form.querySelector("[data-situation-other]");
      if (sitExtra)
        sitExtra.classList.toggle("is-hidden", otherSit !== "Autre");
      var type = groupValue(form, "type_etablissement");
      var typeExtra = form.querySelector("[data-type-other]");
      if (typeExtra) typeExtra.classList.toggle("is-hidden", type !== "Autre");
    }

    form.addEventListener("change", applyLogic);

    form.querySelectorAll(".score").forEach(function (group) {
      group.querySelectorAll("input").forEach(function (input) {
        input.addEventListener("change", function () {
          group.querySelectorAll("label").forEach(function (lab) {
            lab.classList.remove("is-on");
          });
          var lab = input.closest("label");
          if (lab) lab.classList.add("is-on");
        });
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        index = Math.max(0, index - 1);
        refresh();
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var vis = visiblePanels();
        var current = vis[index];
        if (!validatePanel(current, form)) {
          if (window.GotamsUI)
            window.GotamsUI.toast("Merci de compléter les champs requis.");
          return;
        }
        if (index < vis.length - 1) {
          index += 1;
          refresh();
          current = visiblePanels()[index];
          current.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        var answers = serializeForm(form);
        var payload = {
          id: uid(),
          type: form.getAttribute("data-survey-type"),
          createdAt: new Date().toISOString(),
          answers: answers,
        };
        persistSurvey(payload);
        form.classList.add("is-hidden");
        var done = document.getElementById("survey-success");
        if (done) {
          done.classList.remove("is-hidden");
          var idEl = done.querySelector("[data-survey-id]");
          if (idEl) idEl.textContent = payload.id;
        }
        if (window.GotamsUI) window.GotamsUI.toast("Enquête enregistrée.");
        updateSurveyCount();
      });
    }

    applyLogic();
    refresh();
  }

  window.GotamsSurveys = {
    persistSurvey: persistSurvey,
    loadAll: loadAll,
    exportCsv: exportCsv,
    downloadCsv: downloadCsv,
    updateSurveyCount: updateSurveyCount,
    initWizard: initWizard,
  };

  document.addEventListener("DOMContentLoaded", function () {
    updateSurveyCount();
    var exportBtn = document.getElementById("export-surveys");
    if (exportBtn) exportBtn.addEventListener("click", downloadCsv);
    var form = document.querySelector("form[data-survey-type]");
    if (form) initWizard(form);
  });
})();
