---
title: Inception of Things - Kubernetes and GitOps
date: 2026-05-20 10:00:00 +0100
categories: [DevOps, Container Orchestration, Cloud Native]
tags: [Kubernetes, K3s, K3d, Vagrant, ArgoCD, GitOps, Helm, CI/CD]
render_with_liquid: false
---

# Introduction :

Kubernetes (K8s) is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications across a cluster of nodes. GitOps is a modern operational framework that applies software development best practices — version control, pull requests, CI/CD — to infrastructure and application delivery. The fundamental rule of GitOps is simple: **Git is the single source of truth**. If the state of the system diverges from what is described in Git, an automated agent corrects it.

# Project goals :

Inception of Things is a 1337 project focused on clustered orchestration. It is composed of three parts:
- **Part 1**: Provision a K3s cluster with multiple nodes inside VMs managed by Vagrant.
- **Part 2**: Deploy multiple applications on K3s and route traffic to them using Ingress.
- **Part 3**: Set up a full GitOps pipeline using K3d (K3s in Docker) and ArgoCD.

# Kubernetes Architecture Overview :

    ┌─────────────────────────────────────────────────────┐
    │                  Control Plane (Server)             │
    │  ┌─────────┐  ┌──────────────┐  ┌──────────────┐   │
    │  │  etcd   │  │  API Server  │  │  Scheduler   │   │
    │  └─────────┘  └──────────────┘  └──────────────┘   │
    │  ┌──────────────────────────────────────────────┐   │
    │  │         Controller Manager                   │   │
    │  └──────────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────────┘
              │ kubectl / API
    ┌─────────┴──────────────────────────┐
    │           Worker Nodes             │
    │  ┌────────────┐  ┌────────────┐    │
    │  │  kubelet   │  │  kube-proxy│    │
    │  ├────────────┤  └────────────┘    │
    │  │  Pod       │  │  Pod       │    │
    │  │ [Container]│  │ [Container]│    │
    │  └────────────┘  └────────────┘    │
    └────────────────────────────────────┘

| Component | Role |
|---|---|
| **etcd** | Distributed key-value store holding all cluster state |
| **API Server** | The entry point for all cluster management; validates and processes REST requests |
| **Scheduler** | Assigns newly created Pods to appropriate worker nodes |
| **Controller Manager** | Runs control loops to ensure the cluster's actual state matches the desired state |
| **kubelet** | Agent on each worker node that communicates with the API server and manages Pods |
| **kube-proxy** | Maintains network rules on nodes for Service traffic routing |

# Walkthrough :

:one: Virtual Machine Provisioning with Vagrant :

Write a `Vagrantfile` to define and provision the cluster topology. The project requires a dedicated server node and one or more agent (worker) nodes, each with a static private IP and sufficient memory:

    # Vagrantfile
    Vagrant.configure("2") do |config|
      config.vm.box = "debian/bullseye64"

      config.vm.define "ansmsafiS" do |server|
        server.vm.hostname = "ansmsafiS"
        server.vm.network "private_network", ip: "192.168.56.110"
        server.vm.provider "virtualbox" do |vb|
          vb.memory = "1024"
          vb.cpus   = 1
        end
        server.vm.provision "shell", path: "scripts/server.sh"
      end

      config.vm.define "ansmsafiSW" do |worker|
        worker.vm.hostname = "ansmsafiSW"
        worker.vm.network "private_network", ip: "192.168.56.111"
        worker.vm.provider "virtualbox" do |vb|
          vb.memory = "1024"
          vb.cpus   = 1
        end
        worker.vm.provision "shell", path: "scripts/worker.sh"
      end
    end

:two: Bootstrapping K3s (Server and Agent) :

The server provisioning script installs K3s in server mode and exposes the `node-token` for agents to join. The `--write-kubeconfig-mode 644` flag allows the `vagrant` user to use `kubectl` without root:

    # scripts/server.sh
    curl -sfL https://get.k3s.io | sh -s - server \
      --write-kubeconfig-mode 644 \
      --node-ip 192.168.56.110 \
      --flannel-iface eth1

    # Export the token for agents
    cat /var/lib/rancher/k3s/server/node-token

The agent provisioning script reads the token and joins the cluster:

    # scripts/worker.sh
    TOKEN=$(cat /vagrant/node-token)
    curl -sfL https://get.k3s.io | sh -s - agent \
      --server https://192.168.56.110:6443 \
      --token $TOKEN \
      --node-ip 192.168.56.111 \
      --flannel-iface eth1

Verify from the server node:

    $ kubectl get nodes -o wide
    NAME         STATUS   ROLES                  AGE   VERSION   INTERNAL-IP
    ansmsafiS    Ready    control-plane,master   5m    v1.28.3   192.168.56.110
    ansmsafiSW   Ready    <none>                 3m    v1.28.3   192.168.56.111

:three: Deploying Applications with Ingress Routing (Part 2) :

K3s ships with Traefik as the default Ingress controller. Define Kubernetes Deployment, Service, and Ingress manifests to expose multiple applications on the same IP, differentiated by hostname:

    # app1-deployment.yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: app-one
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: app-one
      template:
        metadata:
          labels:
            app: app-one
        spec:
          containers:
          - name: app-one
            image: nginx:alpine
            ports:
            - containerPort: 80
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: app-one-svc
    spec:
      selector:
        app: app-one
      ports:
      - port: 80
    ---
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: app-one-ingress
    spec:
      rules:
      - host: app1.com
        http:
          paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-one-svc
                port:
                  number: 80

Apply all manifests and verify:

    $ kubectl apply -f app1-deployment.yaml
    $ kubectl get pods,svc,ingress

:four: Setting up K3d for the GitOps Lab (Part 3) :

K3d runs K3s clusters inside Docker containers — no VMs needed. Install K3d and create a cluster with port mappings for the Ingress controller:

    $ curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
    $ k3d cluster create gitops-cluster \
        --port "80:80@loadbalancer" \
        --port "443:443@loadbalancer" \
        --agents 2

:five: Installing ArgoCD :

Deploy ArgoCD into its own namespace and expose its UI via port-forward:

    $ kubectl create namespace argocd
    $ kubectl apply -n argocd \
        -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

    # Wait for all pods to be Running
    $ kubectl wait --for=condition=Ready pod --all -n argocd --timeout=120s

    # Expose the ArgoCD API server UI
    $ kubectl port-forward svc/argocd-server -n argocd 8080:443 &

    # Get the initial admin password
    $ kubectl -n argocd get secret argocd-initial-admin-secret \
        -o jsonpath="{.data.password}" | base64 -d

    # Login via CLI
    $ argocd login localhost:8080 --username admin --insecure

:six: Configuring the GitOps Pipeline :

Create an ArgoCD `Application` custom resource pointing to your Git repository. ArgoCD will watch the repository and automatically sync any changes:

    # application.yaml
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
      syncPolicy:
        automated:
          prune: true       # delete resources removed from Git
          selfHeal: true    # revert manual changes to the cluster

    $ kubectl apply -f application.yaml

    # Check sync status
    $ argocd app get my-app
    $ argocd app sync my-app   # force an immediate sync

:seven: Verifying GitOps Reconciliation :

The true test of a GitOps pipeline is proving that it self-heals. Manually delete a deployment from the cluster — ArgoCD should detect the drift and restore it within seconds:

    # Manually delete a resource
    $ kubectl delete deployment app-one -n dev

    # Watch ArgoCD detect and restore it (within ~30 seconds)
    $ watch kubectl get pods -n dev

    # In the ArgoCD UI or CLI, the app briefly shows "OutOfSync"
    # then returns to "Synced" automatically because selfHeal=true

# Questions and answers

:question: What is the difference between Docker Compose and Kubernetes?

> Docker Compose defines and runs multi-container applications on a **single host**. It is excellent for local development but has no concept of scheduling, failover, or cross-host networking. Kubernetes manages containers across a **cluster of many machines**, providing scheduling (placing workloads on appropriate nodes), self-healing (restarting failed containers), auto-scaling, rolling updates, and service discovery — making it the standard for production workloads.

:question: Why use K3s instead of standard Kubernetes (K8s)?

> Standard K8s requires `etcd`, multiple control plane components, and high memory overhead — impractical for VMs with 1GB of RAM. K3s bundles everything into a single binary (~70MB), replaces `etcd` with SQLite by default, and uses less than 512MB of RAM. It is fully conformant with the Kubernetes API, so all standard `kubectl` commands and manifests work identically — making it ideal for edge devices, IoT, and local development VMs.

:question: What constitutes the GitOps methodology?

> GitOps has four core principles: (1) **Declarative** — the desired system state is expressed as declarations, not imperative scripts. (2) **Versioned and immutable** — all desired state is stored in Git; history is preserved and changes are auditable. (3) **Pulled automatically** — software agents inside the system pull the desired state from Git rather than having external systems push changes in. (4) **Continuously reconciled** — agents continuously compare actual state to desired state and converge any differences automatically.

:question: What is a Kubernetes Ingress and how does it differ from a Service?

> A Kubernetes `Service` exposes a group of Pods internally within the cluster (or via a cloud LoadBalancer externally), but it works at Layer 4 (TCP/UDP) and assigns each service its own external IP. An `Ingress` operates at Layer 7 (HTTP/HTTPS) and acts as a single entry point for multiple services, routing requests to different backends based on the **hostname** or **URL path** in the HTTP request. This allows many applications to share one load balancer IP, differentiated by routing rules.

:question: What is the difference between K3s and K3d?

> K3s is a lightweight Kubernetes distribution packaged as a single binary, designed to run on physical or virtual machines. K3d is a wrapper tool that runs K3s **inside Docker containers**, creating multi-node clusters without requiring VMs. K3d is ideal for local CI/CD and GitOps lab environments because clusters can be created and destroyed in seconds with a single command, and there is no hypervisor dependency.

:question: What do ArgoCD's `prune` and `selfHeal` sync policies do?

> `prune: true` tells ArgoCD to **delete** Kubernetes resources from the cluster if they have been removed from the Git repository. Without this, resources orphaned from Git would remain in the cluster indefinitely. `selfHeal: true` enables **automatic reconciliation** — if someone manually modifies or deletes a resource in the cluster without going through Git, ArgoCD detects the drift and reverts it to match the Git-defined state. Together, these two flags enforce that Git is the strict and only source of truth.

# Ressources :

* Kubernetes Official Concepts : https://kubernetes.io/docs/concepts/
* K3s Architecture and Installation : https://docs.k3s.io/architecture
* K3d Documentation : https://k3d.io/
* ArgoCD Core Concepts : https://argo-cd.readthedocs.io/en/stable/core_concepts/
* ArgoCD Getting Started : https://argo-cd.readthedocs.io/en/stable/getting_started/
* Vagrant Documentation : https://developer.hashicorp.com/vagrant/docs
* Kubernetes Ingress Explained : https://kubernetes.io/docs/concepts/services-networking/ingress/
