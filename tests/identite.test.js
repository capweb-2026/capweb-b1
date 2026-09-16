import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { replyTo } from '../public/js/brain.js';

// Tests rouges SPEC critères 1 à 5 — critère 5 (cerveau pur).
// Quand l'assistant répond, chaque réponse commence par « Cuity ».

describe('SPEC 5 — Réponses signées (replyTo)', () => {
  it('N1 — salut et bonjour sont signés Cuity', () => {
    for (const entree of ['salut', 'bonjour']) {
      const reponse = replyTo(entree);
      assert.equal(typeof reponse, 'string');
      assert.ok(reponse.startsWith('Cuity'), `« ${entree} » devrait commencer par Cuity, reçu : ${reponse}`);
    }
  });

  it('N2 — aide et test sont signés Cuity', () => {
    for (const entree of ['aide', 'test']) {
      const reponse = replyTo(entree);
      assert.equal(typeof reponse, 'string');
      assert.ok(reponse.startsWith('Cuity'), `« ${entree} » devrait commencer par Cuity, reçu : ${reponse}`);
    }
  });

  it('N3 — le repli inconnu est signé Cuity', () => {
    for (const entree of ['parle-moi de la météo', 'une phrase inconnue', '']) {
      const reponse = replyTo(entree);
      assert.equal(typeof reponse, 'string');
      assert.ok(reponse.trim().length > 0);
      assert.ok(reponse.startsWith('Cuity'), `« ${entree} » devrait commencer par Cuity, reçu : ${reponse}`);
    }
  });

  it('N4 — casse et espaces : toujours signé Cuity', () => {
    for (const entree of ['  SALUT ', 'Aide', ' TEST', '  Bonjour  ']) {
      const reponse = replyTo(entree);
      assert.equal(typeof reponse, 'string');
      assert.ok(reponse.startsWith('Cuity'), `« ${entree} » devrait commencer par Cuity, reçu : ${reponse}`);
    }
  });
});
