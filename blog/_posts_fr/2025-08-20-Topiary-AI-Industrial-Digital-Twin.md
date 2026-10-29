---
title: "Topiary - Jumeau numérique industriel alimenté par l'IA"
date: 2025-08-20 12:00:00 +0100
categories: [AI, Hackathon, Industry]
tags: [Python, FastAPI, React, Machine Learning, Digital Twin, LLM, OCP, "1337", Docker, scikit-learn, Optimization]
render_with_liquid: true
---

# Introduction :

Un **Digital Twin** est une réplique virtuelle en temps réel d'un système physique : un modèle logiciel qui reflète l'état, le comportement et les performances de son homologue physique à l'aide de données de capteurs en direct. Lorsqu'il est associé à l'IA, un jumeau numérique peut non seulement simuler le système, mais également prédire son état futur et recommander des paramètres de fonctionnement optimisés, transformant ainsi la surveillance passive en intelligence active.

# Contexte :

Topiary a été construit lors d'un hackathon d'IA de 48 heures co-organisé par le **Groupe OCP** (l'un des plus grands producteurs de phosphate au monde) et l'**école 1337**. Le défi était d’appliquer l’IA aux problèmes industriels réels auxquels sont confrontées les usines chimiques d’OCP. Notre équipe s'est attaquée à l'optimisation énergétique dans une **usine d'acide sulfurique**, un élément essentiel de la chaîne de production d'acide phosphorique d'OCP.

Dans une usine d’acide sulfurique, la combustion du soufre génère une chaleur intense. Cette chaleur produit de la vapeur à haute pression, qui alimente un ensemble de **groupes turbo-alternateurs (GTA)** qui génèrent de l'énergie électrique pour l'installation. Le principal défi opérationnel : étant donné une quantité fixe de soufre entrant, comment la vapeur devrait-elle être distribuée dans les trois RGT pour maximiser la production totale d’électricité ?

Répondre à cette question en temps réel, à grande échelle, avec une interface en langage naturel : voilà ce qu'était Topiary.

# Architecture du système :

┌─────────────────────────── ────────────────────────────┐ │ TOPIAIRE │ │ │ │ ┌─────────────────┐ ┌────────────────────────┐ │ │ │ React Frontend │◄────►│ Backend FastAPI │ │ │ │ (Vite + Tailwind│ │ (Python) │ │ │ │ Tableau de bord) │ │ │ │ │ └─────────────────┘ │ ┌──────────────────┐ │ │ │ │ │ Jumeau numérique │ │ │ │ │ │ (RandomForest ML) │ │ │ │ │ └──────────────────┘ │ │ │ │ ┌──────────────────┐ │ │ │ │ │ Optimiseur │ │ │ │ │ │ (Recherche aléatoire) │ │ │ │ │ └──────────────────┘ │ │ │ │ ┌──────────────────┐ │ │ │ │ │ Assistant LLM │ │ │ │ │ │ (Qwen 2.5 local) │ │ │ │ │ └──────────────────┘ │ │ │ │ ┌──────────────────┐ │ │ │ │ │ Alertes SMS │ │ │ │ │ │ (API Twilio) │ │ │ │ │ └──────────────────┘ │ │ │ └────────────────────────┘ │ └─────────────────────────── ────────────────────────────┘

| Component | Technology | Role |
|---|---|---|
| **Frontend** | React + Vite + Tailwind CSS | Real-time operator dashboard |
| **Backend** | FastAPI (Python) | REST API, model inference, orchestration |
| **Digital Twin** | scikit-learn RandomForest | Predicts plant output from input parameters |
| **Optimizer** | Random Search algorithm | Finds optimal GTA steam distribution |
| **AI Assistant** | Qwen 2.5 (via LM Studio) | Natural language operator guidance |
| **Alerting** | Twilio SMS API | Critical parameter alerts to operators |
| **Infrastructure** | Docker Compose | One-command deployment of all services |

Voici l'interface complète du tableau de bord Topiary montrant tous les composants intégrés dans une vue unifiée de la salle de contrôle :

![Interface opérateur topiaire](/assets/img/posts/Topiary/5.png) _Interface opérateur topiaire : un tableau de bord unifié comprenant un panneau de contrôle, des mesures KPI en temps réel, un diagramme de flux de processus interactif et un assistant IA local._

# Procédure pas à pas :

:one : L'ensemble de données et le problème :

OCP nous a fourni un véritable ensemble de données industrielles (`Data_Final.csv`) : relevés historiques des capteurs de l'usine d'acide sulfurique couvrant les taux d'entrée de soufre, les valeurs d'admission de vapeur pour chaque GTA, la puissance de sortie par turbine et les pressions de vapeur.

Les relations clés dans les données :

# Variables clés de l'usine : # Entrée : # Total_Sulfur → tonnes/heure de soufre entrant dans l'usine # Adm GTA1/2/3 → admission de vapeur (T/h) dans chaque turbo-alternateur # # Sortie (ce que nous prévoyons) : # P GTA1/2/3 → puissance électrique (MW) de chaque GTA # P GTAA/B → puissance de la turbine auxiliaire # Pression vap MP1 → vapeur moyenne pression (paramètre de sécurité critique) # S TR1/2/3 → débit de vapeur à travers chacun turbine

Premier aperçu d'EDA : la vapeur totale disponible est approximativement proportionnelle à l'apport de soufre. Nous avons calculé le **rapport de vapeur** directement à partir des données :

steam_ratio = (Adm_GTA1 + Adm_GTA2 + Adm_GTA3) / Total_Sulphur # Valeur médiane tirée des données historiques : ~2,2

Cela devient la contrainte clé de l'optimiseur : pour un apport de soufre donné, la vapeur totale distribuée dans les GTA ne peut pas dépasser `sulfur_in × steam_ratio`.

L'opérateur ajuste ces entrées via la barre latérale de contrôle :

![Barre latérale de contrôle topiaire](/assets/img/posts/Topiary/3.png) _Barre latérale de contrôle topiaire : curseurs permettant aux opérateurs d'ajuster l'alimentation en soufre et l'admission de vapeur aux trois groupes de turbo-alternateurs (GTA) en temps réel._

:deux : Formation du jumeau numérique (modèle ML) :

Nous avons formé un **Régresseur de forêt aléatoire à sorties multiples** — un modèle unique qui prédit simultanément les 12 variables de sortie à partir des 4 variables d'entrée. Random Forest a été choisi parce que :
- Il gère bien la dynamique non linéaire des installations
- Il est robuste aux données de capteurs bruyantes
- Il fonctionne avec des sorties à fonction échelonnée (les turbines ont des états opérationnels discrets)
- Aucun réglage d'hyperparamètres n'est nécessaire pour obtenir rapidement une base de référence utile (critique dans un hackathon de 48 heures)

à partir de sklearn.ensemble importer RandomForestRegressor à partir de sklearn.multioutput importer MultiOutputRegressor

modèle = MultiOutputRegressor( RandomForestRegressor(n_estimators=50, random_state=42) )

# Caractéristiques d'entrée : [Total_Sulphur, Adm_GTA1, Adm_GTA2, Adm_GTA3] # Cibles de sortie : [P_GTA1, P_GTA2, P_GTA3, P_GTAA, P_GTAB, # MP_Pressure, TR1, TR2, TR3, Sout1, Sout2, Sout3] model.fit(X_train, y_train)

Le modèle entraîné devient le **cœur du Digital Twin** : étant donné tout ensemble de paramètres de fonctionnement proposé, il renvoie instantanément l'état prévu de l'usine, nous permettant d'évaluer des milliers de configurations en millisecondes.

Voici la disposition prévue de l'usine et le diagramme de flux de processus générés par le modèle Digital Twin :

![Process Flow Mimic](/assets/img/posts/Topiary/2.png) _Process Flow Mimic : une visualisation jumelle numérique représentant les puissances de sortie et les débits de vapeur prévus sur toutes les turbines et collecteurs de vapeur._

Les indicateurs clés de performance (KPI) en haut de l'interface sont mis à jour instantanément en fonction de ces prédictions :

![En-tête KPI](/assets/img/posts/Topiary/7.png) _En-tête KPI : indicateurs de performance clés calculés dynamiquement à partir des prédictions des jumeaux numériques._

:trois : Le moteur d'optimisation :

Le jumeau numérique répond : « que *produirait* l’usine avec ces paramètres ? » L'optimiseur répond : « quels paramètres *devrons-nous* utiliser pour maximiser le rendement ? »

Nous avons implémenté un optimiseur de **Recherche aléatoire** : à chaque itération, il échantillonne une distribution aléatoire valide de vapeur sur les trois GTA (en respectant la contrainte totale de vapeur), interroge le jumeau numérique pour connaître la puissance prévue et conserve la meilleure :

def solve_random_search(sulfur_in, n_iter=1000) : max_steam = sulfur_in * sim.steam_ratio best_power = -1.0 best_adm = [0, 0, 0]

pour _ dans la plage (n_iter) : r = np.random.rand(3) proposition = (r / r.sum()) * max_steam # normaliser la proposition de budget vapeur total = np.clip(proposal, 0, 220) # limites physiques des vannes

# Renforcez la contrainte de vapeur totale après l'écrêtage si proposition.sum() > max_steam : proposition = proposition * (max_steam / proposition.sum())

pwr = predict_total_power(sulfur_in, *proposition) si pwr > best_power : best_power = pwr best_adm = proposition

retourner best_adm, best_power

Pourquoi une recherche aléatoire plutôt qu'une descente de gradient ? Les forêts aléatoires produisent des sorties de fonctions échelonnées : les gradients sont nuls presque partout, ce qui rend les méthodes basées sur les gradients inefficaces. La recherche aléatoire est simple, parallélisable et fonctionne bien avec 3 variables continues sur 1 000 itérations.

L'optimiseur émet des suggestions de points de consigne directement sur l'interface opérateur :

![Suggestion d'optimisation](/assets/img/posts/Topiary/1.png) _Suggestion d'optimisation : le solveur de recherche aléatoire recommande des points de consigne optimaux pour maximiser la génération tout en respectant les contraintes de disponibilité de la vapeur._

:quatre: L'assistant opérateur LLM :

Les chiffres bruts ne suffisent pas aux opérateurs industriels en poste. Nous avons intégré un modèle de langage Qwen 2.5 **exécuté localement (servi via LM Studio) pour traduire la sortie de l'optimiseur en instructions exploitables en langage naturel :

# L'optimiseur trouve : optimal_adm = [145.3, 88.1, 62.6] # État actuel : current_adm = [120.0, 95.0, 85.0] # Gain prévu : +4,7 MW

# Le LLM est interrogé avec ce contexte et répond : # "Augmenter l'admission GTA1 de 120 à 145 T/h, réduire GTA3 de 85 à 63 T/h. # Gain attendu : +4,7 MW. GTA2 reste proche du point de consigne actuel."

Le LLM a également été exposé via un point de terminaison de chat, permettant aux opérateurs de poser des questions sur les données en direct de l'usine en langage naturel – une interface conversationnelle vers le jumeau numérique.

En plus de la télémétrie simulée par l'installation, l'opérateur peut surveiller les mesures de puissance apparente :

![Puissance apparente du réseau](/assets/img/posts/Topiary/4.png) _Puissance apparente du réseau : télémétrie surveillant la puissance apparente des transformateurs du réseau._

:cinq : Alertes de sécurité critiques (Twilio) :

L'une des fonctionnalités les plus importantes d'un système industriel est l'**alerte en temps réel**. Nous avons intégré l'API SMS Twilio pour envoyer des alertes automatiques lorsque des paramètres critiques de l'usine dépassent les seuils de sécurité :

# Dans le point final /simulate, après chaque prédiction : if result['MP_Pressure'] < 7.5 : # Vapeur moyenne pression inférieure au seuil de sécurité twilio_client.messages.create( body=f"ALERTE CRITIQUE : MP Pressure Low ({result['MP_Pressure']:.2f} bar). " f"Vérifiez immédiatement la charge GTA.", from_=TWILIO_FROM_NUMBER, à=TWILIO_TO_NUMBER )

Cela signifie qu'un opérateur éloigné de la salle de contrôle reçoit un SMS quelques secondes après que le système simulé – ou réel – entre dans un état critique.

Les alertes actives sont affichées clairement dans le panneau assistant du tableau de bord :

![Alertes actives](/assets/img/posts/Topiary/6.png) _Alertes actives : le système signale instantanément les scénarios anormaux ou impossibles, par exemple lorsque l'extraction de vapeur dépasse la vapeur générée ou lorsque la consommation de la turbine est trop élevée._

:six: Déploiement avec Docker Compose :

L'ensemble de l'application a été conteneurisé pour un déploiement en une seule commande, ce qui est essentiel dans un environnement de hackathon où les juges doivent exécuter le projet sans configuration manuelle de l'environnement :

# Une seule commande pour tout lancer : docker-compose up --build

# Services démarrés : # - backend → FastAPI sur http://localhost:8000 (mode réseau hôte) # - frontend → Serveur de développement React/Vite sur http://localhost:5173

Le backend utilise `network_mode: host` pour lui permettre d'atteindre le serveur LLM local de LM Studio sur `localhost:1234` sans mise en réseau Docker complexe.

# Questions et réponses

:question : Qu'est-ce qu'un jumeau numérique et en quoi est-il différent d'une simulation ?

> Une simulation traditionnelle est un modèle autonome exécuté pour explorer des scénarios : elle est déconnectée du monde réel. Un jumeau numérique est un modèle **synchronisé en permanence** avec un système physique réel via les données de capteurs en direct. Il reflète l'état actuel du système physique en temps réel, permettant aux opérateurs de surveiller ce qui se passe, de prédire ce qui va se passer et de tester sans risque des scénarios de simulation par rapport à l'état réel du système. Topiary crée la couche de simulation ; dans un déploiement de production, il serait connecté au SCADA/DCS de l'usine via une API pour recevoir les lectures des capteurs en direct.

:question : Pourquoi utiliser une forêt aléatoire au lieu d'un modèle basé sur la physique pour le jumeau numérique ?

> Un modèle basé sur la physique (principes premiers) d'une usine d'acide sulfurique nécessiterait une connaissance approfondie du domaine thermodynamique, des semaines d'étalonnage et des bilans masse-énergie validés. Lors d’un hackathon de 48 heures, cela n’était pas réalisable. Une forêt aléatoire formée sur des données historiques capture les relations entrées-sorties réelles de l'usine – y compris les comportements non idéaux, l'usure et la dérive d'étalonnage – sans nécessiter une équation pour chaque processus physique. Le compromis est qu'il ne peut pas extrapoler au-delà de la distribution des données d'entraînement, mais pour fonctionner dans des paramètres normaux, il est très efficace.

:question : Pourquoi Qwen 2.5 a-t-il été exécuté localement via LM Studio au lieu d'utiliser une API comme GPT-4 ?

> Deux raisons : le coût et la confidentialité des données. Les données des installations industrielles sont commercialement sensibles : leur envoi vers un point de terminaison d’API externe crée un risque de gouvernance des données. L'exécution du LLM localement via LM Studio signifie que toutes les données restent dans le réseau local. De plus, pour une démonstration de hackathon, l'inférence locale évite les limites de débit de l'API et la latence du réseau. La variable d'environnement `LLM_BASE_URL` est abstraite, de sorte que le même code peut pointer vers n'importe quel point de terminaison d'API compatible OpenAI en production.

:question : Pourquoi la recherche aléatoire est-elle efficace pour optimiser le résultat d'une forêt aléatoire ?

> Les modèles Random Forest sont constants par morceaux : ils divisent l'espace d'entrée en régions rectangulaires et prédisent la même valeur pour tous les points d'une région. Cela signifie que la surface de sortie n'a pas de dégradés ; les optimiseurs basés sur le gradient comme SGD ou Adam resteraient immédiatement bloqués. La recherche aléatoire explore uniformément l'espace d'entrée et est garantie de trouver une bonne solution avec suffisamment d'itérations. Avec seulement 3 entrées continues (GTA1, GTA2, GTA3) et un budget de 1 000 itérations, il trouve des solutions quasi optimales en quelques millisecondes sur n'importe quel processeur moderne.

:question : Que faudrait-il pour déployer Topiary dans un environnement de production réel ?

> Plusieurs ajouts seraient nécessaires : (1) **Ingestion de données en temps réel** — connexion du backend au système SCADA/DCS de l'usine via OPC-UA ou une passerelle REST/MQTT pour remplacer la saisie manuelle par des flux de capteurs en direct. (2) ** Pipeline de recyclage du modèle ** — à mesure que l'usine vieillit et que les conditions d'exploitation dérivent, le modèle doit être recyclé périodiquement sur de nouvelles données. (3) **Authentification et contrôle d'accès** — les points de terminaison de l'API doivent être sécurisés. (4) **Redondance et basculement** — les systèmes industriels nécessitent une haute disponibilité. (5) **Surveillance du modèle** — suivi de la dérive des prédictions pour détecter quand le modèle n'est plus précis.

# Ressources :

* scikit-learn MultiOutputRegressor : https://scikit-learn.org/stable/modules/generated/sklearn.multioutput.MultiOutputRegressor.html
* Documentation FastAPI : https://fastapi.tiangolo.com/
* LM Studio (service LLM local) : https://lmstudio.ai/
* Modèle Qwen 2.5 : https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
* API SMS Twilio : https://www.twilio.com/docs/sms
* Concept de jumeau numérique (IBM) : https://www.ibm.com/topics/what-is-a-digital-twin
* Groupe OCP : https://www.ocpgroup.ma/
* Dépôt GitHub : https://github.com/ayoubms8/Topiary
