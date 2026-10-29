---
title: "ft_transcendence - Application temps réel Full-Stack"
date: 2024-01-02 10:00:00 +0100
categories: [Web Development, Full-Stack, TypeScript]
tags: [Vue/React, NestJS, PostgreSQL, WebSockets, SPA, OAuth2, TypeScript, Real-time, JWT]
render_with_liquid: false
---

# Introduction :

Une application à page unique (SPA) s'appuie sur la récupération de données asynchrone pour réécrire dynamiquement la page Web actuelle avec les nouvelles données du serveur Web, évitant ainsi le comportement par défaut consistant à charger de nouvelles pages entières. Combinée aux WebSockets pour une communication bidirectionnelle en temps réel, cette architecture est la norme pour les applications Web modernes et interactives.

# Objectifs du projet :

ft_transcendence est un projet 1337 conçu pour synthétiser les compétences de développement full-stack. L'objectif est de créer une plate-forme Web comprenant un jeu Pong multijoueur en temps réel, un système de discussion, des profils d'utilisateurs et une authentification OAuth2, en utilisant une pile technologique moderne (par exemple, NestJS pour le backend, Vue.js ou React pour le frontend et PostgreSQL).

La plateforme prend en charge de nombreux modes de jeu distincts :

# Procédure pas à pas :

Vous trouverez ci-dessous le tableau de bord principal de l'application, présentant le point d'entrée pour les joueurs, le statut de matchmaking et l'accès aux différents modes de jeu :

![Tableau de bord des applications](/assets/img/posts/ft_transcendence/dashboard.png)

:one : Architecture du système :

Définissez une séparation nette des préoccupations. Le backend agit comme une API RESTful et un serveur WebSocket. Le frontend gère la gestion de l’état et le rendu. Les deux sont conteneurisés à l’aide de Docker.

:two : Schéma de base de données (PostgreSQL) :

Concevoir les schémas de base de données relationnelle. Les entités clés incluent les utilisateurs, les correspondances, les canaux et les messages. Utilisez un ORM (comme Prisma ou TypeORM) pour mapper des objets aux tables de base de données.

model User { id Int @id @default(autoincrement()) username String @unique avatar String matches Match[] status String @default("offline") }

:trois : Authentification et OAuth2 :

Implémentez le flux de code d’autorisation. Lorsqu'un utilisateur clique sur « Se connecter avec 42 », redirigez-le vers le point de terminaison d'autorisation de l'API 42. Gérez le rappel, extrayez le code d'autorisation et échangez-le contre un jeton d'accès. Générez un jeton Web JSON (JWT) local pour maintenir l'état de session côté client.

Pour sécuriser l'accès, les utilisateurs peuvent s'inscrire et se connecter en utilisant leurs identifiants ou via les fournisseurs Google/42 OAuth :

| Login Portal | Registration Portal |
| :---: | :---: |
| ![Login Page](/assets/img/posts/ft_transcendence/auth-login.png) | ![Register Page](/assets/img/posts/ft_transcendence/auth-register.png) |

Les deux vues sont entièrement réactives et s'adaptent parfaitement aux écrans mobiles :

| Mobile Login | Mobile Registration |
| :---: | :---: |
| ![Mobile Login](/assets/img/posts/ft_transcendence/auth-login-mobile.png) | ![Mobile Register](/assets/img/posts/ft_transcendence/auth-register-mobile.png) |

De plus, nous avons mis en œuvre l'authentification à deux facteurs (2FA) via Google Authenticator. Les utilisateurs scannent un code QR dynamique sur leur page de paramètres de sécurité pour activer cette couche supplémentaire :

![Configuration de l'authentification à deux facteurs](/assets/img/posts/ft_transcendence/auth-2fa.png)

:quatre : Chat et canaux (messagerie en temps réel) :

La plate-forme comprend une page de discussion complète prenant en charge les messages directs, les canaux publics/privés/protégés par mot de passe et les contrôles de modération en temps réel (mise en sourdine, bannissement, exclusion et désignation des administrateurs). Les utilisateurs peuvent également en bloquer d’autres ou les inviter directement à un jeu depuis l’interface de chat :

![Page de discussion](/assets/img/posts/ft_transcendence/chat-interface.png)

:cinq : Communication en temps réel (passerelles WebSockets) :

Pour obtenir des mises à jour à faible latence pour les messages de discussion et les coordonnées de jeu, nous instancions des passerelles WebSocket. Dans NestJS, cela est géré à l'aide de `@WebSocketGateway()`, permettant des connexions persistantes bidirectionnelles entre les clients et le serveur.

@WebSocketGateway({ cors: true }) classe d'exportation GameGateway implémente OnGatewayConnection { @SubscribeMessage('playerMove') handleMove (@MessageBody() data: any, @ConnectedSocket() client: Socket) { // Calculer la physique et diffuser la position mise à jour de la palette } }

:six: Moteur de jeu Pong :

L'état de jeu faisant autorité doit résider sur le serveur pour empêcher toute manipulation côté client (tricherie). Le serveur calcule la vitesse de la balle, les collisions de palettes et les mises à jour des scores à un rythme fixe, diffusant les données de coordonnées mises à jour aux clients connectés. Le framework frontend analyse ces données et restitue les éléments sur un `<canvas>` à l'aide de Three.js ou du rendu Canvas standard.

Voici à quoi ressemble le gameplay 3D en direct en action, présentant une perspective immersive horizontale ou inclinée :

| Top-Down View | Angled 3D View |
| :---: | :---: |
| ![Top-Down View](/assets/img/posts/ft_transcendence/game-3d-topdown.png) | ![Angled 3D View](/assets/img/posts/ft_transcendence/game-3d-angled.png) |

Le jeu est divisé en trois options de match distinctes :

**Mode 1v1** — deux joueurs s'affrontent en temps réel sur la même instance de serveur :

**mode vs Bot** — le serveur exécute une raquette contrôlée par l'IA s'opposant au joueur humain :

**Mode Tournoi** — une compétition basée sur des tranches où les joueurs sont affrontés séquentiellement jusqu'à ce qu'un gagnant soit déterminé :


:seven: Profils utilisateur et statistiques de jeu :

Chaque joueur dispose d'un profil dédié qui affiche les statistiques de jeu (total des parties, taux de victoire, classement ELO, victoires/défaites) et un historique complet des matchs. Les notes et les performances ELO sont tracées de manière dynamique pour montrer les progrès :

![Aperçu des statistiques de profil](/assets/img/posts/ft_transcendence/profile-stats.png)

Une vue détaillée affiche l'historique des matchs récents avec les détails des victoires/défaites, l'historique ELO au fil du temps et un tableau des compétences radar :

![Profil détaillé et historique](/assets/img/posts/ft_transcendence/profile-details.png)

# Questions et réponses

:question : Quel est le but d'un jeton Web JSON (JWT) ?

> Un JWT est un moyen compact et sécurisé pour les URL de représenter les revendications à transférer entre deux parties. Il permet au serveur de vérifier l'identité de l'utilisateur sans stocker l'état de la session dans la base de données ou dans la mémoire du serveur, car le jeton lui-même contient une charge utile signée cryptographiquement prouvant sa validité.

:question : En quoi les WebSockets diffèrent-ils des requêtes HTTP standard ?

> HTTP est un protocole unidirectionnel et sans état dans lequel le client initie une requête et le serveur renvoie une réponse, après quoi la connexion se ferme. Les WebSockets établissent une connexion TCP bidirectionnelle persistante, permettant au client ou au serveur de transmettre des données à tout moment avec une surcharge minimale.

:question : Pourquoi la logique du jeu devrait-elle s'exécuter sur le serveur ?

> L'exécution d'une logique de jeu faisant autorité sur le serveur garantit la cohérence de l'état sur tous les clients et atténue les exploits côté client. Si le client calculait la position de la balle, un client modifié pourrait arbitrairement modifier les coordonnées et transmettre de fausses données au serveur.

# Ressources :

* Documentation NestJS : https://docs.nestjs.com/
* Documentation Vue.js : https://vuejs.org/
* API MDN WebSockets : https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
