import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repondre, DELAI_MAX } from '../server/ia.js';
import { validateMessage, replyTo } from '../public/js/brain.js';
import { createApp } from '../server/app.js';

// Tests SPEC « Gestion des performances » + repli sans clé.
// Module serveur testé avec un faux fournisseur (aucun appel réseau).

describe('module serveur avec faux fournisseur', () => {
  it('fournisseur répond : source ia et texte du fournisseur', async () => {
    const texteFournisseur = 'Cuity : soupe anti-gaspi du faux fournisseur';
    const appeler = async () => texteFournisseur;
    const reponse = await repondre({ message: 'bonjour', historique: [], appeler });
    assert.equal(reponse.source, 'ia');
    assert.equal(reponse.texte, texteFournisseur);
  });

  it('fournisseur échoue : source regles avec le texte de replyTo', async () => {
    const message = 'bonjour';
    const appeler = async () => {
      throw new Error('panne du faux fournisseur');
    };
    const reponse = await repondre({ message, historique: [], appeler });
    assert.equal(reponse.source, 'regles');
    assert.equal(reponse.texte, replyTo(message));
  });

  it('fournisseur trop lent : repli regles dans le délai maximal', async () => {
    const message = 'bonjour';
    // Ne se résout jamais : seul le délai maximal débloque repondre().
    const appeler = () => new Promise(() => {});
    const debut = performance.now();
    const reponse = await repondre({ message, historique: [], appeler, delaiMax: 50 });
    const duree = performance.now() - debut;
    assert.equal(reponse.source, 'regles');
    assert.equal(reponse.texte, replyTo(message));
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

  it('sans clé répond 200 avec la source regles', async () => {
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
});
