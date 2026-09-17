import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { repondre } from './ia.js';

// Liste explicite : seuls ces chemins publics sont servis.
const FICHIERS = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/styles.css': 'styles.css',
  '/js/app.js': 'js/app.js',
  '/js/brain.js': 'js/brain.js',
  '/js/view.js': 'js/view.js'
};

// MIME corrects pour chaque fichier servi.
const TYPES = {
  'index.html': 'text/html; charset=utf-8',
  'styles.css': 'text/css; charset=utf-8',
  'js/app.js': 'text/javascript; charset=utf-8',
  'js/brain.js': 'text/javascript; charset=utf-8',
  'js/view.js': 'text/javascript; charset=utf-8'
};

export function createApp({ publicDir, version = 'dev' } = {}) {
  const serveur = http.createServer((req, res) => {
    traiter(req, res).catch(() => {
      // Dernier filet : ne jamais laisser la requête sans réponse.
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      }
      res.end('Erreur interne');
    });
  });

  async function traiter(req, res) {
    const methode = (req.method ?? 'GET').toUpperCase();
    let chemin = '/';
    try {
      // URL puis décodage : tout encodage suspect hors liste donne 404.
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      chemin = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Non trouvé');
      return;
    }
    // Porte d'entrée locale vers le module IA (sans clé : repli sur les règles).
    if (chemin === '/api/chat') {
      if (methode !== 'POST') {
        res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Méthode non autorisée');
        return;
      }
      let brut = '';
      try {
        for await (const morceau of req) {
          brut += morceau;
          if (brut.length > 20000) {
            break;
          }
        }
        const corps = brut === '' ? {} : JSON.parse(brut);
        const reponse = await repondre({
          message: corps.message,
          historique: Array.isArray(corps.historique) ? corps.historique : []
        });
        if (reponse.invalide === true) {
          const erreur = JSON.stringify({ erreur: reponse.texte });
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(erreur) });
          res.end(erreur);
          return;
        }
        const sortie = JSON.stringify({ texte: reponse.texte, source: reponse.source });
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(sortie) });
        res.end(sortie);
      } catch {
        res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Requête invalide');
      }
      return;
    }
    // Seules GET et HEAD sont autorisées (outillage statique J1).
    if (methode !== 'GET' && methode !== 'HEAD') {
      res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Méthode non autorisée');
      return;
    }
    // Métadonnée de version fournie au démarrage.
    if (chemin === '/version.json') {
      const corps = JSON.stringify({ version });
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(corps) });
      res.end(methode === 'HEAD' ? '' : corps);
      return;
    }
    const relatif = FICHIERS[chemin];
    // Inconnu : 404 neutre, sans fuite du dépôt.
    if (!relatif) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Non trouvé');
      return;
    }
    try {
      // Chemin construit depuis la liste, pas depuis l’URL brute.
      const fichier = path.join(publicDir, relatif);
      const corps = await readFile(fichier);
      res.writeHead(200, { 'content-type': TYPES[relatif], 'content-length': corps.length });
      res.end(methode === 'HEAD' ? '' : corps);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Non trouvé');
    }
  }

  return serveur;
}
