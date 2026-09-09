document;
document
  .getElementById("feedbackForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    var formData = new FormData(this);
    var data = {};
    formData.forEach(function (value, key) {
      data[key] = value;
    });

    fetch(
      "https://script.google.com/macros/s/AKfycbxQBj-I8atPHOEmwgBuEe1fPlxeR_TsRD3djfGlHPNswOO0w9Eg2xTe1YT0E8RvHPbFXA/exec",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    )
      .then(function () {
        alert("Merci pour votre avis !");
        document.getElementById("feedbackForm").reset();
      })
      .catch(function (error) {
        alert("Erreur lors de l'envoi. Réessayez.");
        console.error(error);
      });
  });
