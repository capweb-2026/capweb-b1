# SPEC.md — *Identité de Cuity*

> Modèle à copier à la racine de votre dépôt. Une spec dit **ce que** le système doit faire, pas comment. Chaque critère doit pouvoir être vérifié par un test automatique ou par une démo de 30 secondes. Un exemple complet se trouve en fin de fichier.

## Objectif

L'assistant Cuity possède une identité reconnaissable dès l'ouverture de la page grâce à un nom, un emoji, un message d'accueil et trois questions suggérées permettant à l'utilisateur de démarrer rapidement une conversation sur la cuisine anti-gaspillage.

## Critères d'acceptation

Rédigez chaque critère sous la forme « Quand …, le système … ». Numérotez-les : les tests et les PR y feront référence.

1. **Nom** — Quand la page s'ouvre, le système affiche le nom « Cuity » dans le titre principal. Le nom contient entre 2 et 20 caractères.
 
2. **Emoji** — Quand la page s'ouvre, le système affiche l'emoji « 👩‍🍳 » à côté du nom de l'assistant.
 
3. **Accueil** — Quand la conversation est vide, le système affiche le message :
   « Bonjour, je suis Cuity 👩‍🍳. Posez-moi vos questions sur la cuisine anti-gaspi ! ».
   Ce message n'est pas ajouté dans `#messages`, disparaît dès le premier message envoyé et réapparaît lorsque la conversation est effacée.
 
4. **Suggestions** — Quand la page s'ouvre, le système propose exactement les trois questions suivantes :
   - « J'ai faim, propose-moi des recettes anti-gaspi »
   - « J'ai du Penicillium sur mon fromage, puis-je encore le manger ? »
   - « Mes bananes sont noires, quelles recettes puis-je faire ? »
   Quand l'utilisateur clique sur une suggestion, le système place son texte dans le champ de saisie sans l'envoyer.
 
5. **Réponses signées** — Quand l'assistant répond, chaque réponse commence par « Cuity ».
 
6. **Contrat** — Quand les tests de contrat CP1 sont exécutés, le système les valide tous.

Pour chaque critère, demandez-vous : « Quel test pourrait échouer si ce critère n'était pas respecté ? » Si vous ne trouvez pas, réécrivez le critère.

## Hors périmètre

- Choix du nom par l'utilisateur.
- Modification de l'emoji.
- Avatar personnalisé.
- Génération d'images.
- Appel à une IA externe.

## Données et fonctions attendues

### Fichiers


- public/js/brain.js

- public/js/view.js

- public/js/app.js


### validateMessage(raw)


Paramètre :

- raw : valeur saisie par l'utilisateur.


Retour :

- { ok: true, value: string }

- ou { ok: false, error: string }


### replyTo(message)


Paramètre :

- message : string


Retour :

- string contenant la réponse de l'assistant.


### renderMessages(messages, container)


Paramètres :

- messages : tableau de messages

- container : élément HTML


Retour :

- aucune valeur.


Effet :

- affiche les messages dans la conversation.

## Questions ouvertes

Pas de questions ouvertes