---
title: "Minishell – Littéralement un clone bash."
date: 2023-04-05 10:20:00 +0100
categories: [System Administration, Operating Systems, Low level, C Programming]
tags: [Minishell, Shell, Command Line Interface (CLI), Bash, Abstract Syntax Tree (AST), Interpreted Programming Language, Interpreter, Binary Tree, Child Process, Process Management, Input/Output (I/O), Output Redirection, Pipes, Signals, Logical Operators, Shell Scripting]
render_with_liquid: false
---

# Mini-coque

Minishell est un projet axé sur la création d'un shell de type Unix dans le langage de programmation C. The goal of this project is to develop a command-line interpreter similar to Bash, enabling users to interact with their operating system through a shell interface.

## Table des matières

- [Introduction]
- [Caractéristiques]
- [Concepts appris]
  - [Arbre de syntaxe abstraite (AST)]
  - [Langage de programmation interprété et interprète]
  - [Arbre binaire]
  - [Création de processus enfants sous Linux]
  - [Exécution des commandes]
  - [Redirection de sortie dans les commandes]
  - [Communication interprocessus avec les signaux et canaux Linux]
- [Exemples]
  - [Exécuter des commandes]
  - [Redirection de sortie]
  - [Tuyaux]
  - [Opérateurs logiques]

## Introduction

Minishell est un projet complet qui fournit aux développeurs des informations sur la programmation système et les interfaces de ligne de commande. En implémentant un shell de base, les développeurs peuvent comprendre les subtilités de la gestion des processus, de la gestion des entrées/sorties et de l'exécution des commandes dans les systèmes d'exploitation de type Unix.

## Caractéristiques

- Interface de ligne de commande similaire à Bash.
- Prise en charge de l'exécution de commandes, y compris des commandes intégrées et des exécutables externes.
- Redirection de sortie vers des fichiers et des canaux.
- Gestion des erreurs de base et gestion des signaux.

## Concepts appris

### Arbre de syntaxe abstraite (AST)

Minishell implique l'analyse des entrées de l'utilisateur et la construction d'un arbre de syntaxe abstraite (AST). L'AST représente la structure syntaxique de la commande d'entrée, facilitant ainsi l'analyse et l'exécution.

### Langage de programmation interprété et rôle d'un interprète

Minishell agit comme un interprète des commandes fournies par l'utilisateur. Il analyse et exécute les commandes en temps réel, imitant le comportement d'un interprète pour un langage de programmation interprété.

### Arbre binaire

La construction de l'arbre de syntaxe abstraite dans Minishell utilise souvent une structure arborescente binaire. Comprendre les arbres binaires facilite le parcours et la manipulation efficaces de l'arbre de syntaxe des commandes.

### Création de processus enfants sous Linux

Minishell crée des processus enfants sous Linux pour exécuter des commandes. Cela implique d'utiliser des appels système tels que `fork()` pour générer de nouveaux processus, gérer les relations parent-enfant et garantir la bonne exécution des commandes.

### Exécution des commandes

L'exécution de commandes dans Minishell implique l'analyse des arguments, la recherche d'exécutables dans le PATH du système et l'exécution de la commande dans le contexte du shell.

### Redirection de sortie dans les commandes

Minishell prend en charge la redirection de sortie, permettant aux utilisateurs de contrôler les flux d'entrée et de sortie des commandes. Des techniques permettant de rediriger les flux d'entrées, de sorties et d'erreurs standard vers et depuis des fichiers ou d'autres processus sont explorées.

### Communication interprocessus avec les signaux et canaux Linux

La communication interprocessus est facilitée via des signaux et des canaux Linux dans Minishell. Les signaux permettent la communication entre les processus, tandis que les canaux facilitent le transfert de données entre les processus, permettant des exécutions de commandes plus complexes.

## Exemples

### Exécuter des commandes

Pour exécuter une commande dans Minishell, tapez simplement la commande suivie de ses arguments :

```bash
$ ls -l
```

### Redirection de sortie

La redirection de la sortie vous permet de sauvegarder la sortie d'une commande dans un fichier :

```bash
$ ls > file.txt
```

### Tuyaux

Les tuyaux permettent d'utiliser la sortie d'une commande comme entrée pour une autre commande :

```bash
$ ps aux | grep minishell
```

### Opérateurs logiques

Les opérateurs logiques `||` et `&&` fournissent une exécution conditionnelle de commandes en fonction du succès ou de l'échec des commandes précédentes.

#### OU logique (||)

L'opérateur `||` exécute la deuxième commande uniquement si la première commande échoue (renvoie un état de sortie différent de zéro).

```bash
$ rm non_existent_file || echo "File does not exist"
```

Dans cet exemple, si la commande `rm` échoue parce que le fichier n'existe pas, la commande `echo` sera exécutée en imprimant « Le fichier n'existe pas ».

#### ET logique (&&)

L'opérateur `&&` exécute la deuxième commande uniquement si la première commande réussit (renvoie un état de sortie nul).

```bash
$ ./configure && make && make install
```

Dans cet exemple, le script `configure` est exécuté en premier. En cas de réussite, la commande `make` est exécutée. Si `make` réussit, la commande `make install` est exécutée. Si l'une des commandes échoue, les commandes suivantes ne seront pas exécutées.

Ces opérateurs logiques offrent une flexibilité dans l'exécution des commandes et sont couramment utilisés dans les scripts shell pour gérer les flux d'exécution conditionnelle.