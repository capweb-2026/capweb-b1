import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repondre, DELAI_MAX } from '../server/ia.js';
import { validateMessage, replyTo } from '../public/js/brain.js';
import { createApp } from '../server/app.js';

// Tests SPEC « Gestion des performances » + repli sans clé.
// Module serveur testé avec un faux fournisseur (aucun appel réseau).
// Messages connus : salut, bonjour, aide, test → réponse immédiate sans IA.
// Messages inconnus → IA avec délai maximal de 15 secondes, repli sur replyTo().

const MESSAGES_CONNNUS = ['salut', 'bonjour', 'aide', 'test'];
const MESSAGE_INCONNU = 'que faire de mes restes de riz ?';

describe('module serveur avec faux fournisseur', () => {
  it('délai maximal de 15 secondes (SPEC gestion des performances)', () => {
    assert.equal(DELAI_MAX, 15000);
  });

  it('messages connus : réponse immédiate sans appel à l’IA', async () => {
    for (const message of MESSAGES_CONNNUS) {
      let appele = false;
      const appeler = async () => {
        appele = true;
        throw new Error('l’IA ne doit pas être appelée pour un message connu');
      };
      const reponse = await repondre({ message, historique: [], appeler });
      assert.equal(reponse.source, 'regles');
      assert.equal(reponse.texte, replyTo(message));
      assert.equal(appele, false, `fournisseur appelé pour « ${message} »`);
    }
  });

  it('message inconnu : fournisseur répond → source ia', async () => {
    const texteFournisseur = 'Cuity : soupe anti-gaspi du faux fournisseur';
    let appele = false;
    const appeler = async () => {
      appele = true;
      return texteFournisseur;
    };
    const reponse = await repondre({ message: MESSAGE_INCONNU, historique: [], appeler });
    assert.equal(appele, true);
    assert.equal(reponse.source, 'ia');
    assert.equal(reponse.texte, texteFournisseur);
  });

  it('message inconnu : fournisseur échoue → repli regles avec replyTo', async () => {
    const appeler = async () => {
      throw new Error('panne du faux fournisseur');
    };
    const reponse = await repondre({ message: MESSAGE_INCONNU, historique: [], appeler });
    assert.equal(reponse.source, 'regles');
    assert.equal(reponse.texte, replyTo(MESSAGE_INCONNU));
  });

  it('message inconnu trop lent : repli regles dans le délai maximal', async () => {
    // Ne se résout jamais : seul le délai maximal débloque repondre().
    const appeler = () => new Promise(() => {});
    const debut = performance.now();
    const reponse = await repondre({ message: MESSAGE_INCONNU, historique: [], appeler, delaiMax: 50 });
    const duree = performance.now() - debut;
    assert.equal(reponse.source, 'regles');
    assert.equal(reponse.texte, replyTo(MESSAGE_INCONNU));
    assert.ok(duree < DELAI_MAX, `repli en ${duree} ms, attendu moins de ${DELAI_MAX} ms`);
    assert.ok(duree < 1000, `repli en ${duree} ms, attendu moins de 1000 ms`);
  });

  it('message vide refusé, comme dans validateMessage', async () => {
    const attendu = validateMessage('   ');
    assert.equal(attendu.ok, false);
    const appeler = async () => 'Cuity : jamais utilisé';
    const reponse = await repondre({ message: '   ', historique: [], appeler });
    assert.equal(reponse.source, 'regles');
    assert.equal(reponse.invalide, true);
    assert.equal(reponse.texte, attendu.error);
  });
});

describe('route locale POST /api/chat', () => {
  const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
  let serveur;
  let base;

  before(async () => {
    const app = createApp({ publicDir, version: 'test-ia' });
    await new Promise((resolve) => {
      serveur = app.listen(0, '127.0.0.1', resolve);
    });
    const adresse = serveur.address();
    const port = typeof adresse === 'object' && adresse !== null ? adresse.port : 0;
    base = `http://127.0.0.1:${port}`;
  });

  after(
    () =>
      new Promise((resolve, reject) => {
        if (!serveur) {
          resolve();
          return;
        }
        serveur.close((erreur) => (erreur ? reject(erreur) : resolve()));
      }),
  );

  it('sans clé, message connu répond 200 avec la source regles', async () => {
    const urlSauvee = process.env.CAPWEB_IA_URL;
    const cleSauvee = process.env.CAPWEB_IA_CLE;
    delete process.env.CAPWEB_IA_URL;
    delete process.env.CAPWEB_IA_CLE;
    try {
      const reponse = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'bonjour', historique: [] }),
      });
      assert.equal(reponse.status, 200);
      const donnees = await reponse.json();
      assert.equal(donnees.source, 'regles');
      assert.equal(donnees.texte, replyTo('bonjour'));
    } finally {
      if (urlSauvee !== undefined) {
        process.env.CAPWEB_IA_URL = urlSauvee;
      }
      if (cleSauvee !== undefined) {
        process.env.CAPWEB_IA_CLE = cleSauvee;
      }
    }
  });

  it('sans clé, message inconnu répond 200 en repli regles', async () => {
    const urlSauvee = process.env.CAPWEB_IA_URL;
    const cleSauvee = process.env.CAPWEB_IA_CLE;
    delete process.env.CAPWEB_IA_URL;
    delete process.env.CAPWEB_IA_CLE;
    try {
      const reponse = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: MESSAGE_INCONNU, historique: [] }),
      });
      assert.equal(reponse.status, 200);
      const donnees = await reponse.json();
      assert.equal(donnees.source, 'regles');
      assert.equal(donnees.texte, replyTo(MESSAGE_INCONNU));
    } finally {
      if (urlSauvee !== undefined) {
        process.env.CAPWEB_IA_URL = urlSauvee;
      }
      if (cleSauvee !== undefined) {
        process.env.CAPWEB_IA_CLE = cleSauvee;
      }
    }
  });
});
