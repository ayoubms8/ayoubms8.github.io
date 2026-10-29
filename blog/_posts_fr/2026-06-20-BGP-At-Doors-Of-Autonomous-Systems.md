---
title: "BGP - Aux portes des systèmes autonomes"
date: 2026-06-20 11:00:00 +0100
categories: [Networking, Routing, Infrastructure]
tags: [BGP, VXLAN, GNS3, FRRouting, Networking, EVPN, Underlay, Overlay, Docker]
render_with_liquid: false
---

# Introduction

Border Gateway Protocol (BGP) est le protocole de routage qui assure la cohésion d'Internet. Il s'agit du seul protocole conçu pour échanger des informations de routage entre des réseaux administrés indépendamment – ​​appelés systèmes autonomes (AS) – à l'échelle d'Internet. Alors que les protocoles de routage interne comme OSPF ou EIGRP gèrent les routes au sein du réseau d'une seule organisation, BGP gère les routes **entre** les organisations, les FAI et les centres de données. Chaque fois que vous visitez un site Web, BGP garantit que vos paquets empruntent un chemin valide à travers les dizaines de réseaux entre vous et le serveur.

# Objectifs du projet

BGP Aux Portes des Systèmes Autonomes est un projet d'école 1337 axé sur la virtualisation de réseau et le routage dynamique. Le projet est divisé en trois parties progressives :

- **Partie 1** : Créez une topologie GNS3 simple (un routeur et un hôte) et familiarisez-vous avec le FRRouting, la configuration de l'interface et la connectivité IP de base.
- **Partie 2** : étendez la topologie avec un commutateur central et plusieurs paires routeur+hôte. Superposez les tunnels VXLAN sur la sous-couche IP pour créer une superposition L2 virtuelle à l'aide d'un plan de contrôle **flood-and-learn**.
- **Partie 3** : Remplacez le plan de contrôle VXLAN Flood-and-Learn par un plan de contrôle **BGP EVPN** utilisant FRRouting, simulant une structure feuille-épine de centre de données moderne.

Chaque partie s'appuie directement sur la précédente, passant progressivement de la connectivité de base à une distribution MAC/IP entièrement pilotée par BGP.

# Présentation de l'architecture réseau

## Partie 1 — Routeur simple + hôte

┌─────────────────────────────────────┐ │ Topologie GNS3 │ │ │ │ ┌─────────────┐ ┌───────────┐ │ │ │ Routeur 1 │ │ Hôte 1 │ │ │ │ (FRRouting)│───│ (Alpine) │ │ │ │ eth0 (WAN)│ └───────────┘ │ │ └─────────────┘ │ └─────────────────────────────────────┘

Un routeur FRRouting, un hôte Alpine. L'objectif est simplement de configurer les interfaces, de vérifier le routage et de se familiariser avec `vtysh`.

## Parties 2 et 3 — Topologie de superposition VXLAN

┌─────────────────────────────── ───────────────────────────────┐ │ Topologie GNS3 │ │ │ │ ┌──────────────┐ │ │ │ Commutateur │ ← Nœud OpenVSwitch │ │ └──┬───┬───┬──┘ │ │ __________|   |   |__________ │ │ |               |             |                  │ │ ┌─────┴──────┐ ┌─────┴──────┐ ┌──┴─────────┐ │ │ │ Routeur 1 │ │ Routeur 2 │ │ Routeur 3 │ │ │ │ (FRRouting)│ │ (FRRouting)│ │ (FRRouting)│ │ │ │ eth0 / lo │ │ eth0 / lo │ │ eth0 / lo │ │ │ └──────┬─────┘ └──────┬─────┘ └──────┬─────┘ │ │ │ │ │ │ │ ┌──────┴──┐ ┌──────┴──┐ ┌──────┴──┐ │ │ │ Hôte 1 │ │ Hôte 2 │ │ Hôte 3 │ │ │ │ Alpine │ │ Alpine │ │ Alpine │ │ │ └─────────┘ └─────────┘ └─────────┘ │ └─────────────────────────────── ───────────────────────────────┘

- Le **switch** est un nœud OpenVSwitch dans GNS3 connectant tous les routeurs sur la sous-couche.
- Chaque **routeur** est un conteneur Docker exécutant FRRouting.
- Chaque **hôte** est un conteneur Alpine connecté à l'interface `eth1`/bridge de son routeur.
- Le **réseau sous-jacent** (routeur ↔ commutateur) utilise le sous-réseau `11.11.11.0/24`.
- Le **réseau côté hôte** utilise le sous-réseau `12.12.12.0/24`, ponté via VXLAN.

| Layer | Technology | Role |
|---|---|---|
| **Underlay** | Static routes or OSPF | Provides routed connectivity between VTEPs via the switch |
| **Overlay** | VXLAN (UDP port 4789) | Carries Layer 2 frames across the Layer 3 underlay |
| **Control Plane (P2)** | Flood-and-learn | Static remote VTEP list, MAC learning by flooding |
| **Control Plane (P3)** | BGP EVPN | Distributes MAC/IP reachability dynamically, no flooding |

---
# Procédure pas à pas

## :one: Partie 1 — Configuration de GNS3 et de la connectivité de base

Installez GNS3 et la machine virtuelle GNS3, qui fournit un environnement de virtualisation imbriqué pour les nœuds basés sur Docker. Extrayez les images Docker requises :

docker pull frrouting/frr:dernière docker pull alpine:dernière

Dans GNS3, ajoutez l'image FRR en tant qu'appliance Docker et créez une topologie minimale : un nœud de routeur FRR lié à un hôte Alpine. Chaque nœud du routeur FRR dispose d'un terminal accessible directement depuis GNS3.

### Configuration des interfaces dans GNS3

GNS3 fournit des interfaces Ethernet virtuelles à chaque conteneur Docker en fonction de la manière dont les liens sont dessinés dans le canevas de topologie. Lorsqu'un lien est établi entre le nœud du routeur FRRouting et le commutateur, GNS3 le présente automatiquement comme `eth0` à l'intérieur du conteneur.

La **configuration IP de `eth0`** (l'interface sous-jacente connectant chaque routeur au commutateur) est définie dans la configuration du nœud GNS3 — soit via le fichier de configuration de démarrage intégré dans la définition de l'appliance, soit en modifiant la configuration du nœud directement dans GNS3. Ceci est appliqué au démarrage du nœud par le processus FRRouting `docker-start` chargeant sa configuration.

Exemple de configuration de démarrage GNS3 pour un nœud de routeur :

# /etc/frr/frr.conf (intégré dans la configuration du nœud GNS3) frr version 9.x frr par défaut le nom d'hôte traditionnel router1 !     interface eth0 adresse IP 11.11.11.1/24 !     interface adresse IP 1.1.1.1/32 !     route IP 0.0.0.0/0 11.11.11.254 !     ligne vty !

Vérifiez que FRR est en cours d'exécution et que les interfaces sont actives :

# À l'intérieur d'un terminal de nœud GNS3 FRR $ vtysh Router# show interface eth0 L'interface eth0 est active, le protocole de ligne est actif inet 11.11.11.1/24

Routeur # ping 11.11.11.2 !!!!!

À ce stade, tous les routeurs peuvent se joindre via le commutateur via la sous-couche `11.11.11.0/24`. Les hôtes ne sont pas encore connectés – cela figure dans la partie 2.

---
## :two : Partie 2 — Superposition VXLAN avec Flood-and-Learn

Dans la partie 2, chaque routeur devient un **VTEP** (VXLAN Tunnel Endpoint). VXLAN encapsule les trames Ethernet de couche 2 dans les paquets UDP/IP, étendant un segment L2 virtuel (`12.12.12.0/24`) à travers la sous-couche `11.11.11.0/24`.

### Pourquoi un script d'installation séparé ?

L'interface sous-couche `eth0` appartient et est configurée par FRRouting via sa configuration de démarrage (comme indiqué ci-dessus). Cependant, **Les interfaces VXLAN et Bridge sont de pures constructions du noyau Linux** : elles ne sont pas gérées par les démons FRRouting. Ils doivent exister et être opérationnels **avant** que le script `docker-start` de FRRouting lance les démons, sinon FRRouting ne peut pas se lier au pont ou à la liaison VXLAN.

La solution : écrivez un script shell et connectez-le au **Docker `ENTRYPOINT`** afin qu'il s'exécute en premier, configure le VXLAN/bridge, puis appelle `docker-start` pour le transmettre à FRRouting.

### Fichier Docker

DE frrouting/frr:dernier

COPIER setup.sh /usr/local/bin/setup.sh RUN chmod +x /usr/local/bin/setup.sh

# Exécutez d'abord notre script de configuration, puis transférez-le au docker-start ENTRYPOINT de FRR ["/usr/local/bin/setup.sh"]

### setup.sh — Script de configuration de VXLAN et de pont

Ce script s'exécute dans le conteneur au démarrage. Il lit les variables d'environnement (ou valeurs codées en dur) pour connaître l'adresse IP du VTEP local et la liste des VTEP distants. Il crée l'interface VXLAN, construit le pont, asservit à la fois l'interface VXLAN et le `eth1` côté hôte, puis appelle `docker-start` pour lancer FRRouting normalement.

#!/bin/sh ensemble -e

# --- Configuration --- # Celles-ci correspondent aux IP de bouclage attribuées dans la configuration de démarrage de GNS3/FRR LOCAL_VTEP_IP="1.1.1.1" # le bouclage de ce routeur (IP source VTEP) REMOTE_VTEP_IPS="2.2.2.2 3.3.3.3" # VTEP homologues (flood-and-learn : liste statique) VNI=10 BRIDGE="br0" VXLAN_IFACE="vxlan10" HOST_IFACE="eth1" # GNS3 présente le lien hôte comme eth1

# --- Créez l'interface VXLAN --- ip link add "${VXLAN_IFACE}" tapez vxlan \ id "${VNI}" \ dstport 4789 \ local "${LOCAL_VTEP_IP}" \ nolearning # dans la partie 3, cela supprime l'apprentissage local ; BGP EVPN le gère

# En mode inondation et apprentissage, ajoutez chaque VTEP distant en tant qu'entrée FDB statique pour REMOTE dans ${REMOTE_VTEP_IPS} ; faire le pont fdb ajouter 00:00:00:00:00:00 dev "${VXLAN_IFACE}" dst "${REMOTE}" terminé

lien IP défini "${VXLAN_IFACE}"

# --- Créer le pont et attacher les interfaces --- ip link add "${BRIDGE}" type bridge ip link set "${VXLAN_IFACE}" master "${BRIDGE}" ip link set "${HOST_IFACE}" master "${BRIDGE}" # eth1 fait face à l'hôte Alpine ip link set "${BRIDGE}" up

# Attribuez une adresse IP de passerelle sur le pont pour l'adresse IP du sous-réseau hôte, ajoutez 12.12.12.254/24 dev "${BRIDGE}"

echo "[setup.sh] VXLAN ${VXLAN_IFACE} et le pont ${BRIDGE} sont opérationnels."

# --- Passer au démarrage normal de FRRouting --- exec /sbin/docker-start

Étant donné que `exec /sbin/docker-start` remplace le processus shell, FRRouting prend le relais en tant que PID 1 du conteneur une fois que les interfaces réseau sont prêtes.

### Configuration de l'hôte

Chaque hôte Alpine obtient une adresse IP dans la plage `12.12.12.0/24` et pointe sa passerelle par défaut vers l'adresse IP du pont du routeur :

# Sur l'hôte 1 (conteneur Alpine dans GNS3) / # ip addr add 12.12.12.1/24 dev eth0 / # ip route add default via 12.12.12.254

Le ping entre les hôtes traverse le tunnel VXLAN :

# Depuis l'hôte 1 / # ping 12.12.12.2 64 octets à partir de 12.12.12.2 : seq=0 ttl=64 time=2,1 ms

En mode inondation et apprentissage, le premier paquet envoyé à un MAC inconnu est diffusé vers tous les VTEP distants du FDB statique. Une fois le MAC appris de la réponse, le trafic ultérieur est directement monodiffusé.

---
## :trois : Partie 3 — Remplacement de Flood-and-Learn par BGP EVPN

Dans la partie 2, chaque VTEP a besoin d'une liste codée en dur de tous les VTEP distants, et les adresses MAC sont apprises par inondation. Dans les grands tissus, cela est intenable. **BGP EVPN** résout les deux problèmes :

- Les **routes IMET de type 3** annoncent les VNI auxquels un VTEP participe, remplaçant ainsi les entrées FDB statiques.
- Les **routes MAC/IP de type 2** distribuent les adresses MAC et IP apprises sous forme de routes BGP, remplaçant ainsi le plan de données d'inondation et d'apprentissage.

Le script de configuration du VXLAN et du pont de la partie 2 reste inchangé : les interfaces du noyau sont identiques. Seule la configuration FRRouting change pour ajouter BGP et EVPN.

### setup.sh mis à jour pour la partie 3

Le script est presque identique, mais l'indicateur `nolearning` joue désormais un rôle différent : il indique au noyau de **ne pas** apprendre les MAC à partir du plan de données, puisque BGP EVPN remplira plutôt le FDB via le plan de contrôle. Les entrées statiques d'inondation FDB ne sont plus nécessaires et sont supprimées :

#!/bin/sh ensemble -e

LOCAL_VTEP_IP="1.1.1.1" VNI=10 BRIDGE="br0" VXLAN_IFACE="vxlan10" HOST_IFACE="eth1"

lien ip ajoutez "${VXLAN_IFACE}" tapez vxlan \ id "${VNI}" \ dstport 4789 \ local "${LOCAL_VTEP_IP}" \ nolearning # BGP EVPN possède maintenant le FDB — pas d'apprentissage MAC du noyau

lien IP défini "${VXLAN_IFACE}"

ip link add "${BRIDGE}" tapez bridge # Désactivez également l'apprentissage MAC sur le pont — BGP EVPN le gère ip link set "${BRIDGE}" type bridge vieillissement 0 ip link set "${VXLAN_IFACE}" master "${BRIDGE}" ip link set "${HOST_IFACE}" master "${BRIDGE}" ip link set "${BRIDGE}" up

adresse IP ajouter 12.12.12.254/24 dev "${BRIDGE}"

echo "[setup.sh] VXLAN et pont prêts. Transfert à FRRouting."     exec /sbin/docker-start

### Configuration EVPN BGP FRRRouting

Avec les interfaces du noyau configurées par le script, configurez FRRouting via sa configuration de démarrage GNS3 (ou via `vtysh`) pour activer BGP et la famille d'adresses `l2vpn evpn`.

Un routeur fait office de **Route Reflector** : il gère des sessions iBGP avec tous les routeurs feuilles et redistribue les routes EVPN entre eux. Les autres sont des feuilles :

**Réflecteur d'itinéraire (par exemple, routeur 1, ASN 65000) :**

routeur bgp 65000 bgp router-id 1.1.1.1 pas de bgp par défaut ipv4-unicast !      voisin 2.2.2.2 distant comme 65000 voisin 2.2.2.2 source de mise à jour lo voisin 3.3.3.3 distant comme 65000 voisin 3.3.3.3 source de mise à jour lo !      famille d'adresses l2vpn evpn voisin 2.2.2.2 activer le voisin 3.3.3.3 activer le voisin 2.2.2.2 route-reflector-client voisin 3.3.3.3 route-reflector-client sortie-adresse-famille

**Routeur feuille (par exemple, routeur 2, ASN 65000) :**

routeur bgp 65000 bgp router-id 2.2.2.2 pas de bgp par défaut ipv4-unicast !      voisin 1.1.1.1 distant-comme 65000 ! vers le voisin de Route Reflector 1.1.1.1 source de mise à jour lo !      adresse-famille l2vpn evpn voisin 1.1.1.1 activer publicité-all-vni ! annoncer tous les VNI configurés localement exit-address-family

`advertise-all-vni` indique à FRRouting d'analyser le noyau à la recherche des interfaces VXLAN (qui existent déjà, grâce au script de configuration) et de générer automatiquement des routes BGP EVPN Type-2 et Type-3 pour chaque VNI qu'il trouve.

### Vérification

# État de la session BGP — tous les voisins doivent être un routeur établi

# Table de routage EVPN — Routes de type 2 (MAC/IP) et de type 3 (IMET) Routeur# show bgp l2vpn evpn Distinguisher de route : 2.2.2.2:10 *> [2]:[0]:[48]:[aa:bb:cc:dd:ee:ff] Publicité MAC/IP *> [3]:[0]:[32]:[2.2.2.2] IMET (multidiffusion incluse)

# Le FDB du noyau doit afficher les MAC distants appris via BGP, et non en inondant le routeur # show evpn mac vni 10 VNI 10 MAC Remote VTEP State aa:bb:cc:dd:ee:ff 3.3.3.3 distant (BGP)

# Ping de bout en bout à travers la structure Host1# ping 12.12.12.2 64 octets à partir de 12.12.12.2 : seq=0 ttl=64 time=1,8 ms

# Confirmez qu'il n'y a pas d'inondation de BUM - le trafic est en monodiffusion à partir du premier paquet Routeur# show vxlan fdb

---
# Questions et réponses

:question : Qu'est-ce qu'un système autonome (AS) ?

> Un système autonome est un ensemble de préfixes de routage IP sous le contrôle administratif d'un ou de plusieurs opérateurs de réseau qui présente une **politique de routage unique et cohérente** vers le reste d'Internet. Chaque AS est identifié par un **numéro de système autonome (ASN)** unique au monde attribué par l'IANA ou un registre Internet régional (RIR). BGP est le protocole de routage interdomaine qui échange des informations d'accessibilité entre les AS. Les ASN peuvent être de 16 bits (1 à 65 535) ou de 32 bits (jusqu'à ~ 4,3 milliards), les numéros 64 512 à 65 535 étant réservés à un usage privé.

:question : Quelle est la différence entre iBGP et eBGP ?

> Les sessions **eBGP (BGP externe)** sont formées entre des routeurs de **différents** systèmes autonomes. La durée de vie des paquets eBGP est de 1 par défaut, ce qui signifie que les homologues doivent généralement être directement connectés. Les sessions **iBGP (BGP interne)** sont formées entre les routeurs **au sein du même** AS pour propager les routes apprises en externe à travers l'AS. Une règle iBGP critique est la **règle d'horizon partagé** : les routes apprises d'un homologue iBGP ne peuvent pas être réannoncées vers un autre homologue iBGP. Ce problème est résolu soit par une topologie iBGP **full-mesh**, soit par un **Route Reflector** (un routeur redistribue les routes à tous les clients iBGP, tel qu'utilisé dans ce projet).

:question : Pourquoi les interfaces VXLAN et pont sont-elles configurées dans un script plutôt que par FRRouting ?

> FRRouting gère l'état du protocole de routage et met à jour la table de routage du noyau, mais il ne crée pas d'interfaces réseau Linux arbitraires. Les interfaces de tunnel VXLAN (`ip link add ... type vxlan`) et les interfaces de pont (`ip link add ... type bridge`) sont de pures constructions du noyau Linux. Ils doivent être créés et affichés **avant** le démarrage des démons FRRouting — sinon, FRRouting ne peut pas les référencer dans sa configuration. En exécutant un script d'installation en tant que Docker `ENTRYPOINT` (avant d'appeler `docker-start`), nous garantissons que les interfaces du noyau sont prêtes lors de l'initialisation de FRRouting.

:question : Pourquoi GNS3 gère-t-il `eth0` mais pas les interfaces VXLAN ?

> GNS3 présente des interfaces Ethernet virtuelles aux conteneurs Docker basées sur les liens dessinés dans le canevas de topologie. Lorsque vous connectez un nœud de routeur au commutateur dans GNS3, il câble une paire veth dans le conteneur et la présente comme `eth0`. GNS3 ne sait rien des interfaces VXLAN ou pont – ce sont des constructions de superposition qui existent logiquement au-dessus de la sous-couche. La sous-couche (`eth0`, `11.11.11.0/24`) est le travail de GNS3 ; la superposition (VXLAN, pont, `12.12.12.0/24`) est le travail de l'application.

:question : Qu'est-ce que VXLAN et pourquoi est-il nécessaire dans les centres de données modernes ?

> VXLAN (Virtual Extensible LAN, RFC 7348) est un protocole de superposition de réseau qui encapsule les trames Ethernet de couche 2 dans les paquets UDP de couche 3 (port 4789). Il a été créé pour surmonter la limitation VLAN de 4 096 segments uniques : VXLAN utilise un VNI (VXLAN Network Identifier) ​​24 bits, autorisant plus de 16 millions de segments virtuels. Dans les centres de données modernes comptant des milliers de locataires et de conteneurs, cette échelle est essentielle. VXLAN permet d'étendre la contiguïté de couche 2 sur une sous-couche de couche 3 acheminée — une technique appelée **réseau superposé**.

:question : Qu'est-ce que BGP EVPN et pourquoi est-il utilisé avec VXLAN ?

> BGP EVPN (Ethernet VPN, RFC 7432 + RFC 8365) est une extension de famille d'adresses de BGP qui transporte l'adresse MAC et les informations d'accessibilité IP sous forme de routes BGP. Lorsqu'il est combiné avec VXLAN, il remplace le mécanisme traditionnel de **inondation et d'apprentissage** (dans lequel les MAC inconnus sont inondés vers tous les VTEP) par une approche **pilotée par le plan de contrôle**. Chaque VTEP annonce ses liaisons MAC/IP apprises localement via des routes BGP EVPN de type 2 et son adhésion au VTEP via des routes IMET de type 3. Cela élimine l’inondation BUM (Broadcast, Unknown unicast, Multicast), réduisant ainsi considérablement le trafic inutile dans les grandes structures.

:question : Qu'est-ce qu'un VTEP et quel rôle joue-t-il ?

> Un VTEP (VXLAN Tunnel Endpoint) est un périphérique réseau (physique ou virtuel) qui crée et termine les tunnels VXLAN. Côté envoi, il encapsule une trame Ethernet avec un en-tête VXLAN (contenant le VNI), un en-tête UDP (port 4789) et un en-tête IP externe (utilisant l'IP de bouclage du VTEP comme source). Du côté de la réception, il supprime les en-têtes externes et transmet la trame Ethernet d'origine au pont local. Dans ce projet, chaque routeur FRRouting agit comme un VTEP.

:question : Quels sont les types de routes BGP EVPN ?

> BGP EVPN définit plusieurs types de routes. **Type 1 (Découverte automatique Ethernet)** : utilisé pour la convergence rapide multi-hébergement. **Type 2 (publicité MAC/IP)** : transporte une adresse MAC spécifique et éventuellement son adresse IP associée, permettant aux VTEP d'apprendre les mappages MAC à VTEP à distance sans inondation. **Type 3 (étiquette Ethernet multidiffusion incluse / IMET)** : annonce la participation d'un VTEP à un VNI, remplaçant les entrées d'inondation FDB statiques de la partie 2. **Type 5 (route de préfixe IP)** : transporte des préfixes IP pour le routage inter-sous-réseau. Les types 2 et 3 sont ce que `advertise-all-vni` génère automatiquement.

:question : Qu'est-ce que `advertise-all-vni` dans FRRouting ?

> `advertise-all-vni` est une directive FRRouting BGP EVPN qui indique au démon de découvrir automatiquement toutes les interfaces VXLAN présentes dans le noyau (celles créées par le script de configuration) et de générer les routes BGP EVPN correspondantes (Type-2 et Type-3) pour chaque VNI. Sans cela, vous devrez configurer manuellement chaque VNI sous la strophe `address-family l2vpn evpn`. Cela ne fonctionne que parce que les interfaces VXLAN existent déjà au démarrage de FRRouting – une autre raison pour laquelle le script d'installation doit être exécuté en premier.

# Ressources

* BGP RFC 4271 : https://www.rfc-editor.org/rfc/rfc4271
* VXLAN RFC 7348 : https://www.rfc-editor.org/rfc/rfc7348
* BGP EVPN RFC 7432 : https://www.rfc-editor.org/rfc/rfc7432
* Documentation FRRouting BGP : https://docs.frrouting.org/en/latest/bgp.html
* Documentation FRRouting EVPN : https://docs.frrouting.org/en/latest/evpn.html
* VXLAN BGP EVPN approfondissement : https://vincent.bernat.ch/en/blog/2017-vxlan-bgp-evpn
* Documentation GNS3 : https://docs.gns3.com/
* Guide EVPN Cumulus Networks : https://docs.nvidia.com/networking-ethernet-software/cumulus-linux/Network-Virtualization/Ethernet-Virtual-Private-Network-EVPN/
