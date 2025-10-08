// === Gestion du formulaire de proposition ===
const btn = document.getElementById("btnProposer");
const form = document.getElementById("proposer");
const ferme = document.getElementsByClassName("fermer")[0];

btn.onclick = () => form.style.display = "block";
ferme.onclick = () => form.style.display = "none";

// === Gestion des étoiles et top plats ===
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".cardmenu").forEach(card => {
        const day = card.querySelector("h2").textContent; 
        const stars = card.querySelectorAll(".star");

        // Charger les notes enregistrées
        loadRating(day, stars);

        stars.forEach((star, index) => {
            star.addEventListener("mouseover", () => {
                stars.forEach((s, i) => s.classList.toggle("hovered", i <= index));
            });
            star.addEventListener("mouseout", () => {
                stars.forEach(s => s.classList.remove("hovered"));
            });
            star.addEventListener("click", () => {
                stars.forEach((s, i) => s.classList.toggle("filled", i <= index));
                saveRating(day, index + 1);
                afficherTopPlats();
            });
        });
    });

    afficherSuggestions();
    afficherTopPlats();
    appliquerFiltres(); // Affiche tout correctement au chargement
});

// Sauvegarde et chargement des notes
function saveRating(day, rating) {
    localStorage.setItem("rating-" + day, rating);
}
function loadRating(day, stars) {
    const saved = localStorage.getItem("rating-" + day);
    if (saved) {
        stars.forEach((s, i) => s.classList.toggle("filled", i < saved));
    }
}

// === Suggestions ===
function Envoyer() {
    const plat = document.getElementById("nomPlat").value.trim();
    if (!plat) return alert("Veuillez entrer un plat.");

    let suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];
    suggestions.push(plat);
    localStorage.setItem("suggestions", JSON.stringify(suggestions));

    afficherSuggestions();
    alert("Merci pour votre proposition !");
    document.getElementById("nomPlat").value = "";
    form.style.display = "none";
}

function afficherSuggestions() {
    const suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];
    const list = document.getElementById("liste-suggestions");
    list.innerHTML = "";
    suggestions.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        list.appendChild(li);
    });
}



// === Top plats de la semaine ===
function afficherTopPlats() {
    const plats = [];
    document.querySelectorAll(".cardmenu").forEach(card => {
        const nom = card.querySelector("h2").textContent;
        const rating = localStorage.getItem("rating-" + nom);
        if (rating) plats.push({ nom, rating: parseInt(rating) });
    });

    plats.sort((a, b) => b.rating - a.rating);

    const list = document.getElementById("top-plats-list");
    list.innerHTML = "";
    if (plats.length === 0) {
        list.innerHTML = "<li>Aucune note pour le moment 😅</li>";
        return;
    }

    plats.slice(0, 3).forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${p.nom}</strong> — ⭐ ${p.rating}/5`;
        list.appendChild(li);
    });
}

// === PLANIFICATEUR DE REPAS ===
document.getElementById("btn-save-planning").addEventListener("click", function() {
    const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
    let planning = {};
  
    jours.forEach(jour => {
      const input = document.getElementById("repas-" + jour);
      planning[jour] = input.value || "Aucun plat choisi";
    });
  
    localStorage.setItem("planning", JSON.stringify(planning));
    afficherPlanning();
    alert("✅ Planning enregistré avec succès !");
  });
  
  function afficherPlanning() {
    let saved = JSON.parse(localStorage.getItem("planning")) || {};
    let ul = document.getElementById("liste-planning");
    ul.innerHTML = "";
    for (let jour in saved) {
      let li = document.createElement("li");
      li.textContent = `${jour.charAt(0).toUpperCase() + jour.slice(1)} : ${saved[jour]}`;
      ul.appendChild(li);
    }
  }
  
  // Charger automatiquement le planning sauvegardé
  document.addEventListener("DOMContentLoaded", afficherPlanning);

// === STATISTIQUES & SONDAGE ===

// Charger Chart.js
const chartScript = document.createElement('script');
chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
document.head.appendChild(chartScript);

chartScript.onload = () => {
  afficherStatsVotes();
  chargerSondage();
  afficherResultatsSondage();
};

// === STATISTIQUES DES VOTES ===
function afficherStatsVotes() {
  const plats = [];
  const notes = [];

  document.querySelectorAll(".cardmenu").forEach(card => {
    const nom = card.querySelector("h2").textContent;
    const rating = localStorage.getItem("rating-" + nom);
    if (rating) {
      plats.push(nom);
      notes.push(parseInt(rating));
    }
  });

const ctx = document.getElementById("chartVotes").getContext("2d");
new Chart(ctx, {
    type: 'bar',
    data: {
      labels: plats.length ? plats : ['Aucune donnée'],
      datasets: [{
        label: '⭐ Moyenne des votes',
        data: notes.length ? notes : [0],
        backgroundColor: ['#ffcc00', '#4CAF50', '#2196F3', '#E91E63', '#FF5722'],
        borderRadius: 10
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 5 }
      },
      plugins: {
        legend: { labels: { color: '#fff' } }
      }
    }
  });
}

// === SONDAGE : AUTO-GÉNÉRATION DES PLATS ===
function chargerSondage() {
  const optionsDiv = document.getElementById("options-sondage");
  const plats = new Set();

  document.querySelectorAll(".plat-text").forEach(el => {
    const nomPlat = el.textContent.split(":")[1]?.trim();
    if (nomPlat) plats.add(nomPlat);
  });

  if (plats.size === 0) {
    optionsDiv.innerHTML = "<p>Aucun plat à afficher pour le sondage.</p>";
    return;
  }

  optionsDiv.innerHTML = "";
  plats.forEach(plat => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="platMois" value="${plat}"> ${plat}`;
    optionsDiv.appendChild(label);
  });
}

// === SONDAGE : VOTE + SAUVEGARDE ===
document.addEventListener("click", e => {
  if (e.target.id === "btnVoteSondage") {
    const choix = document.querySelector("input[name='platMois']:checked");
    if (!choix) return alert("Veuillez sélectionner un plat avant de voter !");
    
    let votes = JSON.parse(localStorage.getItem("votesMois")) || {};
    votes[choix.value] = (votes[choix.value] || 0) + 1;
    localStorage.setItem("votesMois", JSON.stringify(votes));
    
    afficherResultatsSondage();
    alert("✅ Merci pour ton vote !");
  }
});

// === AFFICHAGE DES RÉSULTATS ===
function afficherResultatsSondage() {
  let votes = JSON.parse(localStorage.getItem("votesMois")) || {};
  let list = document.getElementById("resultats-liste");
  if (!list) return;
  list.innerHTML = "";

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0) || 1;
  for (let plat in votes) {
    let percent = ((votes[plat] / totalVotes) * 100).toFixed(1);
    let li = document.createElement("li");
    li.textContent = `${plat} — ${votes[plat]} votes (${percent}%)`;
    list.appendChild(li);
  }
}

  

// === Filtre et recherche ===
const filterJour = document.getElementById("filterJour");
const filterType = document.getElementById("filterType");
const searchInput = document.getElementById("searchInput");

filterJour.addEventListener("change", appliquerFiltres);
filterType.addEventListener("change", appliquerFiltres);
searchInput.addEventListener("input", appliquerFiltres);

function appliquerFiltres() {
    const jour = filterJour.value.toLowerCase();
    const type = filterType.value.toLowerCase();
    const search = searchInput.value.toLowerCase();

    document.querySelectorAll(".cardmenu").forEach(card => {
        const day = card.querySelector("h2").textContent.toLowerCase();

        // Récupère tous les plats de la carte
        const plats = Array.from(card.querySelectorAll(".plat-text"));
        let anyVisible = false;

        plats.forEach(p => {
            const platType = p.textContent.split(":")[0].toLowerCase().trim();
            const platName = p.textContent.toLowerCase();

            // Vérifie si le plat correspond aux filtres
            const matchType = type ? platType === type : true;
            const matchSearch = search ? platName.includes(search) : true;

            const showPlat = matchType && matchSearch;
            p.parentElement.style.display = showPlat ? "grid" : "none";

            if (showPlat) anyVisible = true;
        });

        // Affiche la carte seulement si au moins un plat correspond
        const matchJour = jour ? day === jour : true;
        card.style.display = (anyVisible && matchJour) ? "block" : "none";
    });
}
