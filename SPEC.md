# SPEC.md — *nom de la fonctionnalité*

> Modèle à copier à la racine de votre dépôt. Une spec dit **ce que** le système doit faire, pas comment. Chaque critère doit pouvoir être vérifié par un test automatique ou par une démo de 30 secondes. Un exemple complet se trouve en fin de fichier.

## Objectif

*Une ou deux phrases : ce que l'utilisateur obtient, et pourquoi.*

## Critères d'acceptation

Rédigez chaque critère sous la forme « Quand …, le système … ». Numérotez-les : les tests et les PR y feront référence.

1. **Titre court** — Quand *situation*, le système *comportement observable*.
2. **Titre court** — Quand *situation*, le système *comportement observable*.
3. **Contrat** — Les tests de contrat CP1 restent verts.

Pour chaque critère, demandez-vous : « Quel test pourrait échouer si ce critère n'était pas respecté ? » Si vous ne trouvez pas, réécrivez le critère.

## Hors périmètre

*Ce que cette fonctionnalité ne fait pas, pour que l'agent n'en fasse pas plus.*

## Données et fonctions attendues

*Noms de fichiers, de fonctions exportées, de paramètres et de valeurs de retour. C'est ce qui permet d'écrire les tests avant le code.*

## Questions ouvertes

*Ce que vous n'avez pas encore décidé. L'agent doit poser la question plutôt que choisir à votre place.*

---

## Exemple complet : l'identité de Boussole

### Objectif

L'assistant a une identité reconnaissable dès l'ouverture de la page : un nom, un emoji, un message d'accueil et trois questions pour démarrer.

### Critères d'acceptation

1. **Nom** — Quand la page s'ouvre, le système affiche le nom de l'assistant dans le titre principal. Le nom fait de 2 à 20 caractères.
2. **Emoji** — Quand la page s'ouvre, le système affiche un seul emoji à côté du nom.
3. **Accueil** — Quand la conversation est vide, le système affiche un message d'accueil qui contient le nom. Ce message n'est pas une ligne de `#messages`, disparaît dès le premier message envoyé et revient quand la conversation est effacée.
4. **Suggestions** — Quand la page s'ouvre, le système propose exactement trois questions suggérées. Quand l'utilisateur clique sur l'une d'elles, le système la place dans le champ de saisie sans l'envoyer.
5. **Réponses signées** — Quand l'assistant répond, sa ligne commence par son nom au lieu de « Cap Web ».
6. **Contrat** — Les tests de contrat CP1 restent verts.

### Hors périmètre

Pas de choix de l'identité par l'utilisateur, pas d'image d'avatar, pas d'appel à une IA.

### Données et fonctions attendues

- `public/js/persona.js` exporte `persona = { nom, emoji, accueil, suggestions }` et `validatePersona(persona)`, qui renvoie `{ ok: true }` ou `{ ok: false, erreurs: [texte, …] }`.
- `validatePersona` refuse : un nom de moins de 2 ou de plus de 20 caractères ; un emoji qui n'est pas exactement un emoji ; un accueil qui ne contient pas le nom ; un nombre de suggestions différent de trois ou une suggestion vide.
- La page contient `#accueil` et `#suggestions`, en dehors de `#messages`.
- `persona.js` est ajouté à la liste blanche du serveur local.

### Questions ouvertes

Aucune.
