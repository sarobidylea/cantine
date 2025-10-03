const btn = document.getElementById("btnProposer");
const form = document.getElementById("proposer");
const ferme = document.getElementsByClassName("fermer")[0];

btn.onclick = function(){
    form.style.display = "block";
}

ferme.onclick = function(){
    form.style.display = "none";
}
