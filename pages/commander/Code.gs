// ============================================================
// GOTAM'S — Réception des enquêtes + commandes du site
// Colle tout ce fichier dans l'éditeur Apps Script (remplace
// tout ce qu'il y avait avant), puis redéploie (voir explications).
// ============================================================

var NOTIF_EMAIL = "sibellemehapie@gmail.com";

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);

  if (data.type === "household" || data.type === "merchant") {
    handleSurvey(ss, data);
  } else if (data.type === "order") {
    handleOrder(ss, data);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSurvey(ss, data) {
  var sheetName = data.type === "household" ? "Ménages" : "Commerçants";
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Date", "ID", "Réponses (JSON)"]);
  }

  sheet.appendRow([
    new Date(),
    data.id || "",
    JSON.stringify(data.answers || {})
  ]);

  MailApp.sendEmail({
    to: NOTIF_EMAIL,
    subject: "GOTAM'S — Nouvelle réponse (" + sheetName + ")",
    body:
      "Une nouvelle réponse vient d'être enregistrée.\n\n" +
      "Enquête : " + sheetName + "\n" +
      "ID : " + (data.id || "") + "\n" +
      "Date : " + new Date() + "\n\n" +
      "Réponses :\n" + JSON.stringify(data.answers || {}, null, 2)
  });
}

function handleOrder(ss, data) {
  var sheet = ss.getSheetByName("Commandes") || ss.insertSheet("Commandes");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Date", "ID", "Nom", "WhatsApp", "Email",
      "Zone", "Produits", "Note"
    ]);
  }

  var produitsTxt = (data.items || []).map(function (it) {
    return it.qty + " x " + it.name + " (" + it.flavor + ", " + it.format + ")";
  }).join(" | ");

  sheet.appendRow([
    new Date(),
    data.id || "",
    data.nom || "",
    data.whatsapp || "",
    data.email || "",
    data.zone || "",
    produitsTxt,
    data.note || ""
  ]);

  // Notification à GOTAM'S
  MailApp.sendEmail({
    to: NOTIF_EMAIL,
    subject: "GOTAM'S — Nouvelle commande de " + (data.nom || "un client"),
    body:
      "Nouvelle commande reçue sur le site :\n\n" +
      produitsTxt + "\n\n" +
      "Nom : " + (data.nom || "-") + "\n" +
      "WhatsApp : " + (data.whatsapp || "-") + "\n" +
      "Zone : " + (data.zone || "-") + "\n" +
      "Note : " + (data.note || "-")
  });

  // Confirmation au client, seulement s'il a donné un e-mail
  if (data.email) {
    MailApp.sendEmail({
      to: data.email,
      subject: "Confirmation de votre commande GOTAM'S",
      body:
        "Bonjour " + (data.nom || "") + ",\n\n" +
        "Nous avons bien reçu votre commande :\n\n" +
        produitsTxt + "\n\n" +
        "GOTAM'S vous contactera bientôt sur WhatsApp (" + data.whatsapp + ") " +
        "pour confirmer la disponibilité et la livraison.\n\n" +
        "Merci de votre confiance !\nGOTAM'S"
    });
  }
}
