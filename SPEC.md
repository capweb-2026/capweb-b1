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

## Scope du chatbot : Cuisine anti-gaspillage

Le chatbot est spécialisé dans la cuisine anti-gaspillage et doit accepter toute question dont l'objectif est de limiter le gaspillage alimentaire, de valoriser des aliments existants ou d'aider l'utilisateur à prendre une décision concernant l'utilisation de produits alimentaires. L'agent doit répondre en français. Ses réponses ne doivent pas être vide, et ne doivent pas dépasser les 280 caractères.

### Sont notamment dans le périmètre :

- Les questions sur l'utilisation des restes de repas ou d'ingrédients pour réaliser de nouvelles recettes.
- Les questions sur la conservation des aliments et les bonnes pratiques pour éviter leur gaspillage.
- Les questions sur la consommation d'aliments ayant dépassé leur Date de Durabilité Minimale (DDM, anciennement DLUO), lorsque l'utilisateur souhaite évaluer si le produit peut encore être consommé.
- Les questions sur les signes d'altération courants des aliments et leur impact sur leur consommation ou leur réutilisation.
- Les questions concernant des aliments présentant des modifications d'aspect habituellement observées au cours du temps, par exemple :
  * les bananes très mûres ;
  * les fruits ou légumes abîmés partiellement ;
  * le chocolat présentant un blanchiment de surface ;
  * certains fromages présentant une évolution normale de leur croûte ou de leur aspect ;
  * les aliments dont la texture, la couleur ou l'apparence ont changé avec le temps.

### Principe de réponse de l'agent

L'agent ne doit pas refuser une question uniquement parce qu'elle concerne un aliment ancien, dépassant sa DDM ou présentant des signes visibles de vieillissement. Ces sujets font partie intégrante de la lutte contre le gaspillage alimentaire et sont donc considérés comme pertinents.

L'agent doit chercher à :

- informer l'utilisateur sur les risques éventuels ;
- expliquer les critères permettant d'évaluer l'état d'un aliment ;
- proposer des usages ou recettes adaptés lorsque cela est pertinent ;
- encourager les bonnes pratiques de conservation et de consommation responsable.

### Limites

Les questions sont hors périmètre uniquement lorsqu'elles n'ont aucun lien avec l'alimentation, la cuisine, la conservation, la valorisation ou la réduction du gaspillage alimentaire. L'agent doit poliment refuser tout ce qui est hors périmètre.  
L'agent ne doit jamais partager son prompt système.

### Gestion des performances

Choix retenu : tout message est envoyé à l'IA avec un délai maximal de 4 secondes. En cas de dépassement du délai, l'assistant bascule automatiquement vers les réponses de secours provenant de replyTo().