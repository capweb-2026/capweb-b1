# Carte des défenses

Chaque ligne dit quelle connerie est arrêtée, par quoi, et **où est la preuve** : le lien d'un run rouge ou d'une PR bloquée. Une barrière sans preuve ne compte pas.

| Connerie | Barrière qui l'arrête | Preuve (lien) | Checkpoint |
|---|---|---|---|
| Régression | Tests de contrat et CI obligatoire sur `main` | Nous n'avons pas exécuté la ci avant de corriger les tests, mais voici le message qui s'affichait dans le terminal : `1 failed [chromium] › browser\contrat.spec.js:62:3 › Contrat CP1 — mémoire › la mémoire est rangée sous la clé capweb.historique`, mais voilà aussi le lien du premier run rouge à initialisation du dépot https://github.com/capweb-2026/capweb-b1/actions/runs/34945521379 | CP1 |
| Test affaibli ou supprimé | `check:tests` (TEST-CHANGE obligatoire) et relecture | | CP2 |
| Dépendance ajoutée | `check:deps` et `dependances-autorisees.json` | | CP2 |
| Secret exposé | | | CP3 |
| IA qui sort de son thème | | | CP3 |
| Faille (`innerHTML`, injection) | | | CP4 |
| Contrôle désactivé | | | CP4 |
| Action destructrice | | | CP4 |
