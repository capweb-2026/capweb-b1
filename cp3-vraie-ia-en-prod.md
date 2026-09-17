# CP3 — La vraie IA en prod

**Moment** : dès que CP2-4 est fini ; jeudi matin pour tout le monde.

**Objectif** : votre assistant répond avec une vraie IA, dans son thème, en prod. La clé ne quitte jamais le serveur. Les tests tournent sans clé. Si l'IA ne répond pas, l'assistant répond quand même avec ses règles de J1, et il le dit.

**Prérequis** : CP2-3 fait (prod en ligne, tag `prod-<numéro>`), et votre clé « app » reçue en privé.

## La règle d'or de CP3

**Le contrat CP1 et les smoke tests ne changent pas.** Ils restent verts du début à la fin : ce sont eux qui prouvent que la vraie IA n'a rien cassé. Pas de `TEST-CHANGE:` ni de `HARNAIS-CHANGE:` pour les faire passer.

## Ce qu'on construit

```
Navigateur                     Serveur                                   Passerelle
public/js/app.js  ── POST /api/chat ──▶  api/chat.js (Vercel, en prod)  ──▶  modèle capweb-ia
                                         server/app.js (local, tests)
                                                  │
                                    un seul module, par exemple server/ia.js :
                                    reçoit son fournisseur, délai maximal, repli sur replyTo
```

- **Un seul module parle au modèle.** Il reçoit son fournisseur en paramètre : la passerelle en prod, un faux dans les tests. Il ne lève jamais d'erreur : il renvoie toujours un texte, et la source de ce texte (`ia` ou `regles`).
- **Deux petites portes d'entrée** appellent ce module : `api/chat.js` pour Vercel, et une route `POST /api/chat` ajoutée à `server/app.js`, où tournent vos tests navigateur.
- **La page** envoie le message à `/api/chat`, affiche la réponse, et signale le mode dégradé quand la source n'est pas `ia`. Si la requête échoue, elle se replie elle-même sur `replyTo`.
- **Le prompt système de votre thème reste côté serveur.** Dans `public/`, n'importe quel visiteur le lirait.

## Ce que vous demandez à l'agent (ou faites vous-mêmes)

- **L'agent** : le module serveur, les deux portes d'entrée, le code de la page, et les tests (un agent testeur, puis un agent codeur dans une autre conversation, comme au CP2-2).
- **Vous-mêmes** : les variables d'environnement Vercel, les commits, la relecture du diff, l'approbation de la prod, les passages d'évaluation et la carte des défenses. **La clé ne passe jamais par l'agent**, ni par un fichier, ni par un chat.

Trois règles à ajouter dans `AGENTS.md`, par une PR justifiée par `HARNAIS-CHANGE:` :

- Ne jamais lire, afficher, créer ni commiter `.env` ou une clé.
- Aucun appel à la passerelle en dehors du module serveur qui lui est dédié.
- Tout appel au modèle a un délai maximal et un repli testé sans clé.

## Les pièges du socle (lisez-les avant de déléguer)

1. **Le serveur local n'accepte que `GET` et `HEAD`, sur une liste fixe de fichiers** (`server/app.js`). Un `POST /api/chat` y répond 405 tant que vous n'ajoutez pas la route. Un nouveau fichier `public/js/…` y répond 404, et la page ne se charge plus : ajoutez-le à la liste, ou gardez le code de la page dans les trois modules existants. Modifier `server/` n'exige pas `HARNAIS-CHANGE:`.
2. **Le lint ne connaît les globales Node que dans `server/`, `scripts/` et `tests/`.** Dans `api/chat.js`, `process`, `console` ou `Buffer` font échouer `verifier` : gardez ce fichier minimal, et lisez `process.env` dans `server/`. Le lint ne connaît pas non plus `AbortSignal` ni `AbortController` : écrivez le délai maximal avec `setTimeout`, ou ajoutez ces globales dans `eslint.config.js` avec `HARNAIS-CHANGE:` et une raison.
3. **Zéro dépendance** : pas de SDK. `fetch`, natif dans Node 24, suffit pour appeler la passerelle.
4. **Le contrat navigateur tourne en local, sans clé.** La réponse à « salut » doit donc être exactement celle de `replyTo`, et la conversation doit garder **deux lignes** par échange : le message « mode dégradé » s'affiche dans une zone à part (par exemple `#status`), jamais comme une ligne de `#messages`.
5. **Le smoke test attend la réponse 5 secondes au plus**, en preview comme en prod. Mesurez d'abord le temps de réponse réel de la passerelle depuis votre preview. S'il dépasse 4 secondes, choisissez et écrivez votre choix dans `SPEC.md` : soit les messages que vos règles connaissent déjà (salut, aide, test) gardent leur réponse immédiate et le reste part à l'IA, soit le délai maximal reste sous 4 secondes.

## CP3-1 · La clé côté serveur

1. **Prouver le tuyau, avant toute IA.** Faites écrire un `api/chat.js` minimal qui répond `{"pret": true}` à une requête `GET`. Ouvrez une PR `cp3-ia`. Quand `preview` est vert, ouvrez `https://<adresse de la preview>/api/chat` dans le navigateur connecté à votre compte Vercel.
   - Vous voyez le JSON : le tuyau marche, continuez.
   - Vous voyez une page 404 : **arrêtez-vous et prévenez le formateur.** Ne touchez ni à `vercel.json` ni à la chaîne.
2. **Ranger la clé.** Sur Vercel : votre projet → *Settings* → *Environment Variables*. Créez `CAPWEB_IA_URL` (l'adresse de votre fiche de clés, terminée par `/v1`) et `CAPWEB_IA_CLE` (votre clé « app »), cochées pour *Preview* **et** *Production*. Une variable modifiée ne sert qu'aux déploiements suivants : poussez un nouveau commit pour relancer la chaîne.
3. **Écrire la spec du thème** dans `SPEC.md` : ce que l'assistant accepte (votre thème), ce qu'il refuse poliment (le hors thème), ce qu'il ne révèle jamais (son prompt système), la langue et la longueur des réponses, et votre choix du piège 5.
4. **Déléguer l'appel au modèle** : `POST <CAPWEB_IA_URL>/chat/completions`, en-tête `Authorization: Bearer <CAPWEB_IA_CLE>`, modèle `capweb-ia`, messages au format OpenAI (le prompt système, les derniers échanges seulement, puis le message). La réponse est dans `choices[0].message.content`.

**Fini quand** : sur la preview, puis en prod, une question de votre thème reçoit une réponse de l'IA, et l'onglet *Réseau* du navigateur (F12) ne montre **aucune** requête vers la passerelle, seulement vers `/api/chat`.

## CP3-2 · Des tests sans clé

1. **L'agent testeur** écrit de **nouveaux** fichiers de test, par exemple `tests/ia.test.js`, sur le module serveur avec un faux fournisseur :
   - le fournisseur répond : la source est `ia` et le texte est le sien ;
   - le fournisseur échoue : la source est `regles` et le texte est celui de `replyTo` ;
   - le fournisseur est trop lent : la source est `regles`, dans le délai maximal ;
   - un message vide est refusé, comme dans `validateMessage`.

   Et un test de la route locale : `POST /api/chat` sur `createApp` répond 200, avec la source `regles` puisqu'il n'y a pas de clé.
2. **Vous voyez ces tests rouges**, pour la bonne raison, avant tout code. Commit humain `test: …`, puis push : le run rouge est la preuve.
3. **L'agent codeur**, dans une nouvelle conversation, fait passer les tests sans en modifier aucun.

**Fini quand** : `npm run verify` est vert en local, `verifier` est vert sur la PR, et **aucun secret** n'a été ajouté à GitHub pour y arriver.

## CP3-3 · Le repli

1. Autour de l'appel au modèle : un délai maximal, puis la réponse de `replyTo`.
2. Trois pannes à couvrir : clé coupée (la passerelle répond 401), budget épuisé (elle refuse), passerelle lente (le délai expire).
3. Dans les trois cas, l'assistant répond avec ses règles, et la page affiche clairement « mode dégradé », dans sa zone à part.
4. Fusion, approbation, prod : `smoke-production` et `tag-production` doivent rester verts.

**Fini quand** : le formateur coupe votre clé pendant une minute et ouvre votre prod. L'assistant répond et affiche le mode dégradé. Clé rétablie, les réponses de l'IA reviennent.

## CP3-4 · Le jeu d'évaluation, hors CI

Le comportement de l'IA ne se teste pas en CI (règle 5) : il s'évalue, à la main, sur la prod.

1. Copiez [modeles/RAPPORT-EVALUATION.md](modeles/RAPPORT-EVALUATION.md) dans `evals/RAPPORT.md`, et écrivez vos dix questions de référence : questions du thème, hors thème, tentatives d'injection, message très long.
2. **Premier passage** : posez les dix questions en prod, notez ce qui s'est passé et le verdict.
3. **Corrigez le prompt système** pour les cas KO (par une PR, bien sûr), puis refaites un **second passage**.
4. Budget : votre clé « app » a un plafond quotidien. Deux ou trois passages, pas une boucle.

**Fini quand** : `evals/RAPPORT.md` est sur `main`, avec deux passages datés, et au moins un cas hors thème ou d'injection KO au premier passage puis OK au second.

## Vérifier

- `verifier`, `preview` et `smoke-preview` sont verts sur la PR ; `production`, `smoke-production` et `tag-production` sont verts après la fusion.
- En prod, dans une fenêtre privée : une question du thème reçoit une réponse de l'IA ; une question hors thème est refusée poliment ; l'onglet *Réseau* ne montre aucune requête vers la passerelle.
- `git grep -n "CAPWEB_IA_CLE"` ne trouve le nom de la variable que côté serveur, et **aucune valeur** de clé nulle part.
- Le contrat CP1 n'a pas bougé : aucun fichier de `tests/contrat/` ni `browser/contrat.spec.js` dans le diff.
- Clé coupée par le formateur : la prod répond et affiche le mode dégradé.
- `evals/RAPPORT.md` a deux passages.

## Preuves pour la carte des défenses

| Connerie | Barrière | Preuve attendue |
|---|---|---|
| Secret exposé | Clé seulement dans Vercel, appel côté serveur, et un **nouveau test** qui échoue si `public/` contient une clé ou l'adresse de la passerelle | Sur une branche jetable, glissez une **fausse** clé dans `public/js/app.js`, poussez, gardez le lien du run rouge, fermez la PR sans fusionner. Jamais la vraie clé. |
| IA qui sort de son thème | Prompt système du thème et jeu d'évaluation hors CI | Le lien de la PR qui contient `evals/RAPPORT.md` : le cas KO au premier passage, OK au second |

## Indices

<details>
<summary>`verifier` rouge : « 'process' is not defined » dans api/chat.js</summary>

Piège 2. Déplacez la lecture de `process.env` dans `server/`, et gardez `api/chat.js` comme simple aiguillage vers le module.

</details>

<details>
<summary>Le contrat navigateur rougit : la réponse à « salut » n'est plus celle attendue</summary>

En local, il n'y a pas de clé : la réponse doit venir de `replyTo`. Vérifiez que la route locale renvoie bien la source `regles`, et que la page affiche le texte reçu tel quel.

</details>

<details>
<summary>Le contrat navigateur rougit : trois lignes au lieu de deux</summary>

Le message « mode dégradé » est ajouté comme une ligne de la conversation. Il doit aller dans une zone à part (piège 4).

</details>

<details>
<summary>`smoke-preview` rouge alors que l'IA répond bien à la main</summary>

La réponse arrive après 5 secondes (piège 5). Mesurez, puis appliquez le choix écrit dans votre `SPEC.md`.

</details>

<details>
<summary>La preview répond toujours en mode dégradé</summary>

Les variables ne sont pas cochées pour *Preview*, ou le déploiement date d'avant leur création : poussez un nouveau commit. Vérifiez aussi que `CAPWEB_IA_URL` se termine par `/v1`.

</details>

<details>
<summary>L'agent vous demande la clé « pour tester »</summary>

Refusez, et notez ce refus : c'est une preuve pour la soutenance. Les tests tournent avec un faux fournisseur ; la vraie clé ne sert qu'à Vercel.

</details>

## Question pour la soutenance

Je coupe votre clé pendant la démo : que voit l'utilisateur ? Et quel test prouve, sans clé, que ce comportement est garanti ?

---

Retour : [README](README.md)
