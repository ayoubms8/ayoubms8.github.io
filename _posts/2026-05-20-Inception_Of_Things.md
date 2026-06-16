---
title: Inception of Things - Kubernetes and GitOps
date: 2024-07-05 10:00:00 +0100
categories: [DevOps, Container Orchestration, Cloud Native]
tags: [Kubernetes, K3s, K3d, Vagrant, ArgoCD, GitOps]
render_with_liquid: false
---

# Introduction :

Kubernetes (K8s) is an open-source container orchestration system designed to automate the deployment, scaling, and management of containerized applications. GitOps is a modern operational framework that takes DevOps best practices used for application development, such as version control, collaboration, compliance, and CI/CD, and applies them to infrastructure automation.

# Project goals :

Inception of Things is a 1337 project focused on clustered orchestration. The goal is to provision a multi-node K3s cluster (a lightweight Kubernetes distribution) inside virtual machines managed by Vagrant, and utilize ArgoCD to implement a GitOps continuous delivery pipeline.

# Walkthrough :

:one: Virtual Machine Provisioning (Vagrant) :

Write a `Vagrantfile` to define and provision multiple virtual machines (a server node and an agent/worker node) with specific IP addresses and memory allocations.

    Vagrant.configure("2") do |config|
      config.vm.define "server" do |server|
        server.vm.box = "ubuntu/focal64"
        server.vm.network "private_network", ip: "192.168.56.110"
      end
    end

:two: Bootstrapping K3s :

During the Vagrant provisioning sequence, utilize shell scripts to install K3s on the server node. Extract the generated node-token, and use it to join the agent nodes to the K3s cluster.

    curl -sfL https://get.k3s.io | sh -s - server --write-kubeconfig-mode 644
    
:three: Installing ArgoCD :

Interact with the Kubernetes API using `kubectl`. Create a namespace for ArgoCD and apply the installation manifests provided by the Argo Project.

    kubectl create namespace argocd
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

:four: Configuring the GitOps Pipeline :

Create an ArgoCD `Application` custom resource. Define the source repository (a Git repository containing Kubernetes Deployment and Service manifests) and the destination cluster.

    apiVersion: argoproj.io/v1alpha1
    kind: Application
    metadata:
      name: my-app
      namespace: argocd
    spec:
      project: default
      source:
        repoURL: 'https://github.com/username/my-k8s-repo.git'
        targetRevision: HEAD
        path: manifests
      destination:
        server: 'https://kubernetes.default.svc'
        namespace: dev

:five: State Synchronization :

Once applied, ArgoCD continuously monitors the Git repository. When a commit changes the configuration (e.g., updating a container image tag from `v1` to `v2`), ArgoCD detects the deviation from the cluster's live state and automatically reconciles the changes, pulling and deploying the new image to the K3s nodes.

# Questions and answers

:question: What is the difference between Docker Compose and Kubernetes?

> Docker Compose is designed for defining and running multi-container applications on a single host. Kubernetes is a distributed orchestration platform designed to schedule and manage containers across a cluster of multiple physical or virtual machines, providing high availability, auto-scaling, and self-healing mechanisms.

:question: Why use K3s instead of standard Kubernetes (K8s)?

> K3s is a highly certified Kubernetes distribution stripped of legacy, alpha, and non-default features, and packaged as a single binary backed by a lightweight SQLite database (instead of etcd). This makes it significantly less resource-intensive, ideal for edge computing, IoT devices, or local development environments inside VMs.

:question: What constitutes the GitOps methodology?

> GitOps requires that the desired state of a system is declaratively described and version-controlled in a Git repository. Software agents (like ArgoCD) run inside the cluster, continuously comparing the live system state against the desired state defined in Git, automatically applying necessary changes to maintain synchronization.

# Ressources :

* Kubernetes Concepts : https://kubernetes.io/docs/concepts/
* K3s Architecture : https://docs.k3s.io/architecture
* ArgoCD Core Concepts : https://argo-cd.readthedocs.io/en/stable/core_concepts/
