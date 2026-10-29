---
title: "Inception - Administration système et virtualisation"
date: 2024-01-10 10:00:00 +0100
categories: [System Administration, DevOps, Docker]
tags: [Docker, Docker-compose, Nginx, MariaDB, WordPress, Virtualization, Linux, DevOps]
render_with_liquid: false
---

# Introduction :

Docker, introduit en 2013, utilise la virtualisation au niveau du système d'exploitation pour fournir des logiciels dans des packages appelés conteneurs. Contrairement à la virtualisation matérielle (machines virtuelles), les conteneurs partagent le noyau du système hôte, ce qui les rend légers et rapides à démarrer. Le projet Inception se concentre sur la mise en place d'une infrastructure multi-conteneurs utilisant Docker et Docker Compose.

# Objectifs du projet :

Inception est un projet 1337 qui vise à élargir les connaissances en administration système en déployant une stack LEMP (Linux, Nginx, MariaDB, PHP) entièrement au sein de conteneurs Docker, connectés via un réseau Docker dédié.

# Procédure pas à pas :

:avertissement : Ce projet nécessite la création d'images Docker personnalisées à partir de l'avant-dernière version stable d'Alpine Linux ou Debian. Aucune image d'application prédéfinie (comme `nginx:latest`) n'est autorisée.

1️⃣ Configuration de la machine virtuelle :

Assurez-vous que Docker et Docker Compose sont installés sur votre machine hôte.

sudo apt update sudo apt installer docker.io docker-compose

2️⃣ Structuration du projet :

La structure requise isole chaque service dans son propre répertoire contenant un `Dockerfile` personnalisé et des scripts d'installation.

srcs/ ​​├── docker-compose.yml ├── .env └── exigences/ ├── nginx/ ├── mariadb/ └── wordpress/

:trois : Configuration du réseau Docker et des volumes :

Dans `docker-compose.yml`, définissez un réseau de pont pour permettre la communication entre conteneurs et les montages de volumes pour le stockage de données persistant.

réseaux : inception_net : pilote : pont

volumes : wordpress_data : pilote : local driver_opts : type : aucun o : périphérique de liaison : /home/user/data/wordpress

4️⃣ Écriture des fichiers Docker :

Chaque service nécessite son propre processus PID 1. Par exemple, le conteneur Nginx doit exécuter le démon Nginx au premier plan.

FROM debian:bullseye RUN apt-get update && apt-get install -y nginx openssl COPY conf/nginx.conf /etc/nginx/sites-available/default # Générez des certificats TLS ici CMD ["nginx", "-g", "daemon off;"]

:five : Orchestrer la startup :

Exécutez la pile à l'aide de Docker Compose.

docker-compose up --build -d

# Questions et réponses

:question : Quelle est la différence entre une machine virtuelle et un conteneur Docker ?

> Une machine virtuelle comprend un système d'exploitation invité complet et s'appuie sur un hyperviseur pour émuler le matériel. Un conteneur Docker regroupe l'application et ses dépendances, s'exécutant comme un processus isolé dans l'espace utilisateur tout en partageant le noyau du système d'exploitation hôte.

:question : Pourquoi Nginx doit-il fonctionner avec `daemon off` ?

> Les conteneurs Docker se terminent à la fin du processus principal (PID 1). Si Nginx s'exécute en tant que démon en arrière-plan, le processus initial de premier plan se termine, ce qui oblige Docker à arrêter immédiatement le conteneur.

:question : Qu'est-ce qu'un volume dans Docker ?

> Un volume est un mécanisme permettant de conserver les données générées et utilisées par les conteneurs Docker. Les volumes sont stockés dans une partie du système de fichiers hôte qui est gérée par Docker (`/var/lib/docker/volumes/` sous Linux), garantissant que les données survivent au cycle de vie du conteneur.

# Ressources :

* Documentation Docker : https://docs.docker.com/
* Forfaits Alpine Linux : https://pkgs.alpinelinux.org/packages
* Configuration Nginx : https://nginx.org/en/docs/
