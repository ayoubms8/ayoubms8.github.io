---
title: "Création des choses - Kubernetes et GitOps"
date: 2026-05-20 10:00:00 +0100
categories: [DevOps, Container Orchestration, Cloud Native]
tags: [Kubernetes, K3s, K3d, Vagrant, ArgoCD, GitOps, Helm, CI/CD]
render_with_liquid: false
---

# Introduction :

Kubernetes (K8s) est une plateforme d'orchestration de conteneurs open source qui automatise le déploiement, la mise à l'échelle et la gestion des applications conteneurisées sur un cluster de nœuds. GitOps est un cadre opérationnel moderne qui applique les meilleures pratiques de développement logiciel (contrôle de version, demandes d'extraction, CI/CD) à la fourniture d'infrastructures et d'applications. La règle fondamentale de GitOps est simple : **Git est la source unique de vérité**. Si l'état du système s'écarte de ce qui est décrit dans Git, un agent automatisé le corrige.

# Objectifs du projet :

Inception of Things est un projet 1337 axé sur l'orchestration clusterisée. Il est composé de trois parties :
- **Partie 1** : provisionnez un cluster K3s avec plusieurs nœuds dans des VM gérées par Vagrant.
- **Partie 2** : Déployez plusieurs applications sur les K3 et acheminez le trafic vers elles à l'aide d'Ingress.
- **Partie 3** : Configurez un pipeline GitOps complet à l'aide de K3d (K3 dans Docker) et ArgoCD.

# Présentation de l'architecture Kubernetes :

┌────────────────────────── ───────────────────────────┐ │ Plan de contrôle (serveur) │ │ ┌─────────┐ ┌──────────────┐ ┌──────────────┐ │ │ │ etcd │ │ Serveur API │ │ Planificateur │ │ │ └─────────┘ └──────────────┘ └──────────────┘ │ │ ┌─────────────────────── ───────────────────────┐ │ │ │ Gestionnaire de contrôleur │ │ │ └─────────────────────── ───────────────────────┘ │ └────────────────────────── ───────────────────────────┘ │ Kubectl/API ┌─────────┴──────────────────────────┐ │ Nœuds de travail │ │ ┌────────────┐ ┌────────────┐ │ │ │ kubelet │ │ kube-proxy│ │ │ ├────────────┤ └────────────┘ │ │ │ Pod │ │ Pod │ │ │ │ [Conteneur]│ │ [Conteneur]│ │ │ └────────────┘ └────────────┘ │ └────────────────────────────────────┘

| Component | Role |
|---|---|
| **etcd** | Distributed key-value store holding all cluster state |
| **API Server** | The entry point for all cluster management; validates and processes REST requests |
| **Scheduler** | Assigns newly created Pods to appropriate worker nodes |
| **Controller Manager** | Runs control loops to ensure the cluster's actual state matches the desired state |
| **kubelet** | Agent on each worker node that communicates with the API server and manages Pods |
| **kube-proxy** | Maintains network rules on nodes for Service traffic routing |

# Procédure pas à pas :

:one : Provisionnement de machines virtuelles avec Vagrant :

Écrivez un `Vagrantfile` pour définir et provisionner la topologie du cluster. Le projet nécessite un nœud de serveur dédié et un ou plusieurs nœuds d'agent (travailleur), chacun avec une adresse IP privée statique et une mémoire suffisante :

# Vagrantfile Vagrant.configure("2") faire |config|       config.vm.box = "debian/bullseye64"

config.vm.define "alemsafiS" faire |serveur|         server.vm.hostname = "alemsafiS" server.vm.network "private_network", ip : "192.168.56.110" server.vm.provider "virtualbox" do |vb|           vb.memory = "1024" vb.cpus = 1 fin server.vm.provision "shell", chemin : fin "scripts/server.sh"

config.vm.define "alemsafiSW" faire |worker|         travailleur.vm.hostname = "alemsafiSW" travailleur.vm.network "private_network", ip : "192.168.56.111" travailleur.vm.provider "virtualbox" faire |vb|           vb.memory = "1024" vb.cpus = 1 fin worker.vm.provision "shell", chemin : "scripts/worker.sh" fin fin

:two : Amorçage des K3 (serveur et agent) :

Le script de provisionnement du serveur installe les K3 en mode serveur et expose le `node-token` pour que les agents puissent le rejoindre. L'indicateur `--write-kubeconfig-mode 644` permet à l'utilisateur `vagrant` d'utiliser `kubectl` sans root :

# scripts/server.sh curl -sfL https://get.k3s.io | sh -s - serveur \ --write-kubeconfig-mode 644 \ --node-ip 192.168.56.110 \ --flannel-iface eth1

# Exporter le token pour les agents cat /var/lib/rancher/k3s/server/node-token

Le script de provisionnement de l'agent lit le jeton et rejoint le cluster :

# scripts/worker.sh TOKEN=$(cat /vagrant/node-token) curl -sfL https://get.k3s.io | sh -s - agent \ --server https://192.168.56.110:6443 \ --token $TOKEN \ --node-ip 192.168.56.111 \ --flannel-iface eth1

Vérifiez à partir du nœud du serveur :

$ kubectl get nodes -owide NOM STATUT RÔLES ÂGE VERSION IP INTERNE alemsafiS Ready control-plane, master 5m v1.28.3 192.168.56.110 alemsafiSW Ready <aucun> 3m v1.28.3 192.168.56.111

:trois : Déploiement d'applications avec le routage d'entrée (partie 2) :

K3s est livré avec Traefik comme contrôleur d'entrée par défaut. Définissez les manifestes de déploiement, de service et d'entrée Kubernetes pour exposer plusieurs applications sur la même adresse IP, différenciées par nom d'hôte :

# app1-deployment.yaml apiVersion : apps/v1 kind : métadonnées de déploiement : nom : spécification app-one : réplicas : 1 sélecteur : matchLabels : app : modèle app-one : métadonnées : étiquettes : application : spécification app-one : conteneurs :
          - nom : app-one
image : nginx : ports alpins :
            - port de conteneur : 80
--- apiVersion : v1 kind : Métadonnées du service : nom : app-one-svc spec : sélecteur : app : app-one ports :
      - port : 80
--- apiVersion : type de networking.k8s.io/v1 : métadonnées d'entrée : nom : spécification app-one-ingress : règles :
      - hébergeur : app1.com
http : chemins :
          - chemin: /
pathType : préfixe backend : service : nom : port app-one-svc : numéro : 80

Appliquez tous les manifestes et vérifiez :

$ kubectl apply -f app1-deployment.yaml $ kubectl obtenir les pods, svc, entrée

:quatre : Configuration de K3d pour le GitOps Lab (Partie 3) :

K3d exécute des clusters K3s dans des conteneurs Docker – aucune machine virtuelle n'est nécessaire. Installez K3d et créez un cluster avec des mappages de ports pour le contrôleur Ingress :

$ curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash $ k3d cluster créer gitops-cluster \ --port "80:80@loadbalancer" \ --port "443:443@loadbalancer" \ --agents 2

5️⃣ Installation d'ArgoCD :

Déployez ArgoCD dans son propre espace de noms et exposez son interface utilisateur via le transfert de port :

$ kubectl créer un espace de noms argocd $ kubectl apply -n argocd \ -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Attendez que tous les pods soient en cours d'exécution $ kubectl wait --for=condition=Ready pod --all -n argocd --timeout=120s

# Exposez l'interface utilisateur du serveur API ArgoCD $ kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Récupère le mot de passe administrateur initial $ kubectl -n argocd get secret argocd-initial-admin-secret \ -o jsonpath="{.data.password}" | base64 -d

# Connectez-vous via CLI $ argocd login localhost:8080 --username admin --insecure

6️⃣ Configuration du pipeline GitOps :

Créez une ressource personnalisée ArgoCD `Application` pointant vers votre référentiel Git. ArgoCD surveillera le référentiel et synchronisera automatiquement toutes les modifications :

# application.yaml apiVersion : argoproj.io/v1alpha1 kind : métadonnées de l'application : nom : espace de noms de mon application : argocd spec : projet : source par défaut : repoURL : 'https://github.com/username/my-k8s-repo.git' targetRevision : HEAD chemin : manifeste destination : serveur : 'https://kubernetes.default.svc' espace de noms : dev syncPolicy : automatisé : prune : true # supprimer les ressources supprimées de Git selfHeal : true # annuler les modifications manuelles apportées au cluster

$ kubectl apply -f application.yaml

# Vérifier l'état de la synchronisation $ argocd app get my-app $ argocd app sync my-app # forcer une synchronisation immédiate

:seven : Vérification de la réconciliation GitOps :

Le véritable test d'un pipeline GitOps prouve qu'il s'auto-répare. Supprimez manuellement un déploiement du cluster — ArgoCD devrait détecter la dérive et la restaurer en quelques secondes :

# Supprimer manuellement une ressource $ kubectl delete déployer app-one -n ​​dev

# Regardez ArgoCD le détecter et le restaurer (dans un délai d'environ 30 secondes) $ watch kubectl get pods -n dev

# Dans l'interface utilisateur ou la CLI d'ArgoCD, l'application affiche brièvement "OutOfSync" # puis revient automatiquement à "Synced" car selfHeal=true

# Questions et réponses

:question : Quelle est la différence entre Docker Compose et Kubernetes ?

> Docker Compose définit et exécute des applications multi-conteneurs sur un **hôte unique**. Il est excellent pour le développement local mais n'a aucun concept de planification, de basculement ou de mise en réseau entre hôtes. Kubernetes gère les conteneurs sur un **cluster de nombreuses machines**, assurant la planification (placement des charges de travail sur les nœuds appropriés), l'auto-réparation (redémarrage des conteneurs défaillants), la mise à l'échelle automatique, les mises à jour progressives et la découverte de services, ce qui en fait la norme pour les charges de travail de production.

:question : Pourquoi utiliser des K3 au lieu de Kubernetes standard (K8) ?

> Les K8 standard nécessitent `etcd`, plusieurs composants de plan de contrôle et une surcharge de mémoire élevée, ce qui n'est pas pratique pour les machines virtuelles avec 1 Go de RAM. K3s regroupe tout dans un seul binaire (~ 70 Mo), remplace `etcd` par SQLite par défaut et utilise moins de 512 Mo de RAM. Il est entièrement conforme à l'API Kubernetes, de sorte que toutes les commandes et manifestes `kubectl` standard fonctionnent de manière identique, ce qui le rend idéal pour les appareils de périphérie, l'IoT et les machines virtuelles de développement local.

:question : Qu'est-ce qui constitue la méthodologie GitOps ?

> GitOps repose sur quatre principes fondamentaux : (1) **Déclaratif** — l'état souhaité du système est exprimé sous forme de déclarations et non de scripts impératifs. (2) ** Versionné et immuable ** — tous les états souhaités sont stockés dans Git ; l’historique est préservé et les modifications sont vérifiables. (3) **Extrait automatiquement** — les agents logiciels à l'intérieur du système extraient l'état souhaité de Git plutôt que de laisser des systèmes externes importer les modifications. (4) **Continuellement réconciliés** — les agents comparent en permanence l'état réel à l'état souhaité et font converger automatiquement les différences.

:question : Qu'est-ce qu'une entrée Kubernetes et en quoi diffère-t-elle d'un service ?

> Un Kubernetes `Service` expose un groupe de pods en interne au sein du cluster (ou via un cloud LoadBalancer en externe), mais il fonctionne au niveau de la couche 4 (TCP/UDP) et attribue à chaque service sa propre adresse IP externe. Un `Ingress` fonctionne au niveau de la couche 7 (HTTP/HTTPS) et agit comme un point d'entrée unique pour plusieurs services, acheminant les requêtes vers différents backends en fonction du **nom d'hôte** ou du **chemin d'URL** dans la requête HTTP. Cela permet à de nombreuses applications de partager une adresse IP d'équilibrage de charge, différenciée par des règles de routage.

:question : Quelle est la différence entre les K3 et les K3d ?

> K3s est une distribution Kubernetes légère conditionnée sous forme d'un seul binaire, conçue pour s'exécuter sur des machines physiques ou virtuelles. K3d est un outil wrapper qui exécute des K3 **dans des conteneurs Docker**, créant des clusters multi-nœuds sans nécessiter de machines virtuelles. K3d est idéal pour les environnements de laboratoire CI/CD et GitOps locaux, car les clusters peuvent être créés et détruits en quelques secondes avec une seule commande, et il n'y a pas de dépendance à l'hyperviseur.

:question : À quoi servent les politiques de synchronisation `prune` et `selfHeal` d'ArgoCD ?

> `prune: true` indique à ArgoCD de **supprimer** les ressources Kubernetes du cluster si elles ont été supprimées du référentiel Git. Sans cela, les ressources orphelines de Git resteraient indéfiniment dans le cluster. `selfHeal: true` permet la **réconciliation automatique** — si quelqu'un modifie ou supprime manuellement une ressource dans le cluster sans passer par Git, ArgoCD détecte la dérive et l'inverse pour qu'elle corresponde à l'état défini par Git. Ensemble, ces deux drapeaux affirment que Git est la seule et stricte source de vérité.

# Ressources :

* Concepts officiels Kubernetes : https://kubernetes.io/docs/concepts/
* Architecture et installation K3s : https://docs.k3s.io/architecture
* Documentation K3d : https://k3d.io/
* Concepts de base d'ArgoCD : https://argo-cd.readthedocs.io/en/stable/core_concepts/
* ArgoCD Mise en route : https://argo-cd.readthedocs.io/en/stable/getting_started/
* Documentation Vagrant : https://developer.hashicorp.com/vagrant/docs
* Explication de l'entrée Kubernetes : https://kubernetes.io/docs/concepts/services-networking/ingress/
