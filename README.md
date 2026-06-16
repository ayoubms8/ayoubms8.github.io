# Personal Technical Blog

This repository contains the source code and markdown articles for my personal technical blog, primarily focusing on detailed walkthroughs, architecture documentation, and implementation details for projects completed within the 1337 (42 Network) curriculum.

## Content Categories

The technical write-ups span several low-level and high-level domains:
* **System Administration & DevOps**: Docker, Kubernetes, CI/CD pipelines, Infrastructure as Code (Terraform, Ansible).
* **Cybersecurity**: Binary exploitation, reverse engineering, privilege escalation, memory corruption vulnerabilities (x86 architecture).
* **Network Programming**: Custom IRC server implementation, socket programming, I/O multiplexing.
* **Web Development**: Single Page Applications (SPA), real-time bidirectional communication (WebSockets), RESTful APIs.
* **Computer Graphics**: Raycasting engines, 3D rendering in C.

## Project Write-ups Index

The posts directory contains comprehensive documentation for the following projects:
1. **Cub3D**: 2D raycasting engine rendered in a 3D perspective using MinilibX.
2. **Inception**: Multi-container infrastructure deploying a LEMP stack via Docker Compose.
3. **ft_irc**: Non-blocking I/O Internet Relay Chat server written in C++98.
4. **ft_transcendence**: Real-time multiplayer Pong SPA with OAuth2 and WebSockets using a microservices architecture.
5. **Snowcrash**: Privilege escalation and Linux security models (CTF format).
6. **Rainfall**: 32-bit x86 binary exploitation, buffer overflows, and format string vulnerabilities.
7. **Override**: Advanced reverse engineering, anti-debugging circumvention, and exploit development.
8. **Cloud-1**: Cloud infrastructure provisioning utilizing Terraform and Ansible.
9. **Inception of Things**: GitOps continuous delivery pipeline with Kubernetes (K3s) and ArgoCD.

## Local Development

This blog utilizes standard static site generation logic (compatible with Jekyll/GitHub Pages formatting). 

To run the site locally:
1. Ensure Ruby and Bundler are installed on your system.
2. Clone the repository: 
   ```bash
   git clone https://github.com/ayoubms8/ayoubms8.github.io.git
   cd ayoubms8.github.io.git
   bundle install
   bundle exec jekyll serve
   ```
3. Navigate to http://localhost:4000 in your browser.