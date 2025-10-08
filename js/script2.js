// --- Sélection des éléments ---
const btn = document.getElementById("btnProposer");
const form = document.getElementById("proposer");
const ferme = document.getElementsByClassName("fermer")[0];

// --- Ouverture du formulaire ---
btn.onclick = () => {
  form.style.display = "block";
};

// --- Fermeture du formulaire ---
ferme.onclick = () => {
  form.style.display = "none";
};

// --- Initialisation du DOM ---
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".cardmenu").forEach((card) => {
    const stars = card.querySelectorAll(".star");
    const day = card.getAttribute("data-day");

    // Charger la note sauvegardée
    loadRating(day, stars);

    stars.forEach((star, index) => {
      // Survol : effet visuel
      star.addEventListener("mouseover", function () {
        stars.forEach((s, i) => {
          s.classList.toggle("hovered", i <= index);
        });
      });

      // Fin du survol
      star.addEventListener("mouseout", function () {
        stars.forEach((s) => s.classList.remove("hovered"));
      });

      // Clic : enregistrer la note
      star.addEventListener("click", function () {
        stars.forEach((s, i) => {
          s.classList.toggle("filled", i <= index);
        });
        saveRating(day, index + 1);
        updateTopPlats();
      });
    });
  });

  // Afficher les suggestions au chargement
  afficherSuggestions();
  updateTopPlats();
});

// --- Sauvegarde de la note ---
function saveRating(day, rating) {
  localStorage.setItem("rating_" + day, rating);
}

// --- Chargement de la note ---
function loadRating(day, stars) {
  const saved = localStorage.getItem("rating_" + day);
  if (saved) {
    stars.forEach((s, i) => {
      s.classList.toggle("filled", i < saved);
    });
  }
}

// --- Envoi de suggestion ---
function Envoyer() {
  const plat = document.getElementById("nomPlat").value.trim();

  if (!plat) return alert("Veuillez entrer un nom de plat.");

  let suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];
  suggestions.push(plat);

  localStorage.setItem("suggestions", JSON.stringify(suggestions));

  alert("Merci pour votre suggestion !");
  document.getElementById("nomPlat").value = "";
  afficherSuggestions();
}

// --- Affichage des suggestions ---
function afficherSuggestions() {
  const suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];
  const list = document.getElementById("liste-suggestions");

  list.innerHTML = "";

  suggestions.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    list.appendChild(li);
  });
}

// --- Mise à jour du top plats ---
function updateTopPlats() {
  const topList = document.getElementById("top-plats-list");
  if (!topList) return; // sécurité

  topList.innerHTML = "";
  const topPlats = [];

  document.querySelectorAll(".cardmenu").forEach((card) => {
    const day = card.getAttribute("data-day");
    const rating = parseInt(localStorage.getItem("rating_" + day)) || 0;

    if (rating > 0) {
      topPlats.push({
        day: card.querySelector("h2").textContent,
        rating,
        img: card.querySelector("img").src,
      });
    }
  });

  // Trier du meilleur au moins bon
  topPlats.sort((a, b) => b.rating - a.rating);

  topPlats.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${p.img}" alt="${p.day}">
      ${p.day} - ${p.rating}⭐ ${i === 0 ? '<span class="badge">🏆</span>' : ""}
    `;
    topList.appendChild(li);
  });
}
