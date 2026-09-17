import { validateMessage, replyTo } from "./brain.js";
import { renderMessages } from "./view.js";

const formulaire = document.querySelector('#chat-form');
const statut = document.querySelector('#status');
const versionElt = document.querySelector('#version');
const champ = document.querySelector('#message');
const liste = document.querySelector('#messages');
const longueurTxt = document.querySelector('#longueurAct');
const effacer = document.querySelector('#effacer');
const accueil = document.querySelector('#accueil');
const suggestions = document.querySelector('#suggestions');
const historique = [];

function mettreAJourAccueil() {
  if (accueil) {
    accueil.hidden = historique.length > 0;
  }
}

mettreAJourAccueil();

try {
  const memoire = localStorage.getItem('capweb.historique');

  if (memoire) {
    const messages = JSON.parse(memoire);

    historique.push(...messages);
    renderMessages(historique, liste);
    mettreAJourAccueil();
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

// J3 : la page demande au serveur (/api/chat), repli local si échec.
formulaire?.addEventListener('submit', (event) => {
  event.preventDefault();
  const texte = champ.value.trim();
  const validation = validateMessage(texte);
  if (!validation.ok) {
    statut.textContent = 'Le message ne doit pas être vide.';
    champ.value = '';
    longueurTxt.textContent = '0';
    champ.focus();
    return;
  }
  const valeur = validation.value;
  historique.push({ role: 'user', text: valeur });
  localStorage.setItem('capweb.historique', JSON.stringify(historique));
  renderMessages(historique, liste);
  mettreAJourAccueil();
  statut.textContent = 'Cuity réfléchit…';
  champ.value = '';
  longueurTxt.textContent = '0';
  champ.focus();

  const passe = historique.slice(0, -1);
  fetch('/api/chat', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ message: valeur, historique: passe.slice(-6) })
  })
    .then((reponse) => (reponse.ok ? reponse.json() : null))
    .then((donnees) => {
      const recu = donnees && typeof donnees.texte === 'string' ? donnees : null;
      const texteAssistant = recu ? recu.texte : replyTo(valeur);
      historique.push({ role: 'assistant', text: texteAssistant });
      localStorage.setItem('capweb.historique', JSON.stringify(historique));
      renderMessages(historique, liste);
      mettreAJourAccueil();
      if (!recu || recu.source !== 'ia') {
        statut.textContent = 'Mode dégradé : réponse de secours.';
      } else {
        statut.textContent = '';
      }
    })
    .catch(() => {
      historique.push({ role: 'assistant', text: replyTo(valeur) });
      localStorage.setItem('capweb.historique', JSON.stringify(historique));
      renderMessages(historique, liste);
      mettreAJourAccueil();
      statut.textContent = 'Mode dégradé : réponse de secours.';
    });
});

effacer?.addEventListener('click', (event) => {
  event.preventDefault();
  if (confirm('Êtes-vous sûr de vouloir effacer la conversation ?')) {
    historique.length = 0;
    localStorage.removeItem('capweb.historique');
    renderMessages(historique, liste);
    mettreAJourAccueil();
  }
});

suggestions?.addEventListener('click', (event) => {
  const cible = event.target.closest('button');
  if (cible && champ) {
    champ.value = cible.textContent;
    champ.focus();
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
