import { validateMessage, replyTo } from "./brain.js";
import { renderMessages } from "./view.js";

const formulaire = document.querySelector('#chat-form');
const statut = document.querySelector('#status');
const versionElt = document.querySelector('#version');
const champ = document.querySelector('#message');
const liste = document.querySelector('#messages');
const longueurTxt = document.querySelector('#longueurAct');
const effacer = document.querySelector('#effacer');
const historique = [];

try {
  const memoire = localStorage.getItem('capweb.historique');

  if (memoire) {
    const messages = JSON.parse(memoire);

    historique.push(...messages);
    renderMessages(historique, liste);
  }
} catch (error) {
  historique.length = 0;
  statut.textContent =
    'La conversation enregistrée est abîmée. Une nouvelle conversation a été créée.';
}

champ?.addEventListener('input', (event) => {
  const longueur = champ.value.length;
  event.preventDefault();
  longueurTxt.textContent = longueur;
});

// J1 : interface seule, on bloque l’envoi et on l’explique.
formulaire?.addEventListener('submit', (event) => {
  event.preventDefault();
  const texte = champ.value.trim();
  if (validateMessage(texte).ok) {
    historique.push({ role: 'user', text: texte });
    historique.push({ role: 'assistant', text: replyTo(texte) });
    localStorage.setItem('capweb.historique', JSON.stringify(historique));
    renderMessages(historique, liste);
    statut.textContent = '';
    champ.value = '';
    longueurTxt.textContent = '0';
    champ.focus();
  } else {
    statut.textContent = 'Le message ne doit pas être vide.';
    champ.value = '';
    longueurTxt.textContent = '0';
    champ.focus();
  }
});

effacer?.addEventListener('click', (event) => {
  event.preventDefault();
  if (confirm('Êtes-vous sûr de vouloir effacer la conversation ?')) {
    historique.length = 0;
    localStorage.removeItem('capweb.historique');
    renderMessages(historique, liste);
  }
});

// Version du serveur local, échec discret si indisponible.
fetch('/version.json', { headers: { accept: 'application/json' } })
  .then((reponse) => (reponse.ok ? reponse.json() : null))
  .then((donnees) => {
    if (donnees && typeof donnees.version === 'string' && versionElt) {
      versionElt.textContent = `version ${donnees.version}`;
    }
  })
  .catch(() => { });
