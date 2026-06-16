---
title: Inception - System Administration and Virtualization
date: 2024-01-10 10:00:00 +0100
categories: [System Administration, DevOps, Docker]
tags: [Docker, Docker-compose, Nginx, MariaDB, WordPress, Virtualization]
render_with_liquid: false
---

# Introduction :

Docker, introduced in 2013, utilizes OS-level virtualization to deliver software in packages called containers. Unlike hardware virtualization (virtual machines), containers share the host system's kernel, making them lightweight and fast to start. The Inception project focuses on setting up a multi-container infrastructure utilizing Docker and Docker Compose.

# Project goals :

Inception is a 1337 project that aims to broaden system administration knowledge by deploying a LEMP stack (Linux, Nginx, MariaDB, PHP) entirely within Docker containers, connected via a dedicated Docker network.

# Walkthrough :

:warning: This project requires building custom Docker images from the penultimate stable version of Alpine Linux or Debian. No pre-built application images (like `nginx:latest`) are allowed.

:one: Setting up the Virtual Machine :

Ensure your host machine has Docker and Docker Compose installed.

    sudo apt update
    sudo apt install docker.io docker-compose

:two: Structuring the project :

The required structure isolates each service into its own directory containing a custom `Dockerfile` and setup scripts.

    srcs/
    ├── docker-compose.yml
    ├── .env
    └── requirements/
        ├── nginx/
        ├── mariadb/
        └── wordpress/

:three: Configuring the Docker Network and Volumes :

In the `docker-compose.yml`, define a bridge network to allow inter-container communication and volume mounts for persistent data storage.

    networks:
      inception_net:
        driver: bridge

    volumes:
      wordpress_data:
        driver: local
        driver_opts:
          type: none
          o: bind
          device: /home/user/data/wordpress

:four: Writing the Dockerfiles :

Each service requires its own PID 1 process. For example, the Nginx container must execute the Nginx daemon in the foreground.

    FROM debian:bullseye
    RUN apt-get update && apt-get install -y nginx openssl
    COPY conf/nginx.conf /etc/nginx/sites-available/default
    # Generate TLS certificates here
    CMD ["nginx", "-g", "daemon off;"]

:five: Orchestrating the Startup :

Execute the stack using Docker Compose.

    docker-compose up --build -d

# Questions and answers

:question: What is the difference between a Virtual Machine and a Docker Container?

> A virtual machine includes a full guest operating system and relies on a hypervisor to emulate hardware. A Docker container packages the application and its dependencies, running as an isolated process in user space while sharing the host operating system's kernel.

:question: Why must Nginx run with `daemon off`?

> Docker containers terminate when the primary process (PID 1) exits. If Nginx runs as a background daemon, the initial foreground process completes, causing Docker to immediately stop the container.

:question: What is a volume in Docker?

> A volume is a mechanism for persisting data generated and used by Docker containers. Volumes are stored within a part of the host filesystem which is managed by Docker (`/var/lib/docker/volumes/` on Linux), ensuring data outlives the container lifecycle.

# Ressources :

* Docker Documentation : https://docs.docker.com/
* Alpine Linux Packages : https://pkgs.alpinelinux.org/packages
* Nginx Configuration : https://nginx.org/en/docs/
