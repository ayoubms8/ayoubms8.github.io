export const PORTFOLIO_CONTENT = {
  en: {
    personalInfo: {
      name: 'Ayoub Lemsafi',
      tagline: 'Software Engineer / Fullstack Developer',
      roles: ['Software Engineer', 'Fullstack Developer', 'Backend & Cloud Infrastructure'],
      subtitle: 'Specializing in backend development, microservices, and cloud infrastructure.',
      bio: [
        "Software engineering student at 42 Paris, specializing in backend development and cloud infrastructure. Experienced in external API integration, CI/CD pipelines, and microservices architecture.",
        "From engineering full-stack distributed web applications with Django, Laravel, React.js, and Three.js to provisioning multi-machine Kubernetes clusters and bare-metal x86 kernels in C and assembly, I build resilient software across the entire stack.",
        "1st place winner at the Phos4code Generative AI Hackathon (OCP Group & 1337) and certified Oracle OCI Generative AI Professional."
      ],
      blogUrl: 'https://ayoubms8.github.io/blog',
      githubUrl: 'https://github.com/ayoubms8',
      linkedinUrl: 'https://www.linkedin.com/in/ayoubms8',
      email: 'ayoub.lemsafi10@gmail.com',
      phone: '+33 753041252',
      location: 'Melun, Île-de-France',
      status: 'Available for opportunities & collaborations',
      certification: 'Oracle OCI Generative AI Certified Professional – July 2024',
      education: [
        {
          school: '42 Paris',
          period: '10/2022 – present',
          program: 'Software engineering & systems architecture'
        },
        {
          school: 'EST Agadir',
          period: '09/2020 – 06/2022',
          program: 'DUT in Computer Engineering'
        }
      ],
      languages: [
        { name: 'Arabic', level: 'Native' },
        { name: 'English', level: 'Advanced' },
        { name: 'French', level: 'Fluent' }
      ]
    },
    nav: {
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      contact: 'Contact',
      blog: 'Blog'
    },
    ui: {
      viewProjects: 'View Projects',
      readBlog: 'Read Blog',
      aboutTitle: 'Engineering at every layer of the stack',
      skillsTitle: 'Core Technologies',
      projectsTitle: 'Featured Work',
      featuredLabel: 'Featured Project',
      contactTitle: "Let's build something.",
      contactSub: "Available for opportunities, collaborations, and deep technical discussions about backend architectures, cloud systems, and low-level engineering.",
      emailCopied: 'Email copied to clipboard!',
      copyEmail: 'Copy email address',
      viewPost: 'View Post',
      sourceCode: 'Source',
      allSystemsOperational: 'All systems operational',
      backToTop: 'Back to top'
    },
    stats: [
      { id: 'stat-0', target: 20, suffix: '+', label: 'Projects & Systems' },
      { id: 'stat-1', target: 4, suffix: '+', label: 'Years Building' },
      { id: 'stat-2', target: 6, suffix: '', label: 'Domains Covered' }
    ],
    skills: [
      {
        id: 'backend',
        title: 'Backend & APIs',
        icon: 'Layers',
        glyph: '◉',
        tags: [
          'Python', 'FastAPI', 'Django', 'Laravel', 'Java', 'PHP',
          'SQL', 'Microservices', 'REST APIs', 'External API Integration'
        ]
      },
      {
        id: 'frontend',
        title: 'Frontend & 3D',
        icon: 'Code2',
        glyph: '△',
        tags: [
          'React.js', 'Three.js', 'JavaScript', 'HTML5 / CSS3',
          'WebSockets', 'Responsive UI', 'State Management'
        ]
      },
      {
        id: 'devops',
        title: 'Cloud & DevOps',
        icon: 'Cloud',
        glyph: '⬢',
        tags: [
          'AWS', 'Docker', 'Kubernetes (K3s/K3d)', 'Helm', 'ArgoCD',
          'GitLab CI/CD', 'GitHub Actions', 'Ansible', 'Nginx', 'GitOps'
        ]
      },
      {
        id: 'systems',
        title: 'Systems & Architecture',
        icon: 'Cpu',
        glyph: '⬡',
        tags: [
          'Arch Linux', 'Linux/Unix', 'C', 'C++', 'Microservices',
          'Bash', 'Neovim', 'Git', 'x86 Assembly', 'POSIX'
        ]
      },
      {
        id: 'ai',
        title: 'AI & Data',
        icon: 'Shield',
        glyph: '◈',
        tags: [
          'Local LLMs (Ollama, Qwen)', 'NLP', 'Deep Learning',
          'Data Preprocessing', 'scikit-learn', 'Oracle OCI GenAI'
        ]
      },
      {
        id: 'networking',
        title: 'Security & Low-Level',
        icon: 'Network',
        glyph: '◊',
        tags: [
          'Kernel Dev', 'Binary Exploitation', 'Reverse Engineering',
          'ROP Chains', 'Buffer Overflow', 'BGP / EVPN', 'TCP/IP', 'epoll'
        ]
      }
    ],
    featuredProject: {
      id: 'featured-kfs',
      category: 'systems',
      categoryLabel: 'Kernel Development · C · Assembly · x86',
      year: '2026',
      title: 'Kernel From Scratch (KFS)',
      description:
        'A multi-part series building a fully functional x86 operating system from bare-metal boot to virtual memory, hardware interrupts, and an interactive kernel shell. Every component hand-crafted in C and assembly without external runtime dependencies.',
      highlights: [
        { code: 'KFS-1', desc: 'Multiboot spec compliance, VGA text driver, x86 real-to-protected boot sequence' },
        { code: 'KFS-2', desc: 'Global Descriptor Table (GDT), segmentation, kernel stack diagnostics' },
        { code: 'KFS-3', desc: 'Physical Memory Manager (PMM bitmap), two-tier virtual paging, kmalloc/kfree heap allocator' },
        { code: 'KFS-4', desc: 'Interrupt Descriptor Table (IDT), Dual 8259 PIC remapping, PIT timer, PS/2 keyboard driver' }
      ],
      link: 'https://ayoubms8.github.io/blog/posts/KFS-4/',
      tags: ['Kernel', 'x86 Assembly', 'C', 'Paging', 'IDT', 'Bootloader']
    },
    projects: [
      {
        id: 'proj-0',
        title: 'Phos4code Generative AI (Winning Team)',
        category: 'ai',
        categoryLabel: 'Generative AI · OCP Group & 1337',
        year: '2025',
        description:
          'Winning team at the Phos4code Generative AI Hackathon (OCP Group & 1337). Built a digital twin of a sulfuric acid plant from real-world telemetry to maximize energy production while keeping the process stable, including an AI chatbot delivering real-time energy optimization suggestions.',
        tags: ['FastAPI', 'React.js', 'Python', 'scikit-learn', 'NLP', 'Local LLMs'],
        link: 'https://ayoubms8.github.io/blog/posts/Topiary-AI-Industrial-Digital-Twin/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-1',
        title: 'ft_transcendence',
        category: 'fullstack',
        categoryLabel: 'Full-Stack · Django · React · Three.js',
        year: '2024',
        description:
          'Full-stack real-time web application featuring 3D Pong with Three.js, online tournaments, matchmaking, achievements, live chat, and multiple game modes. Engineered on a microservices architecture using Django, React.js, and blockchain integration.',
        tags: ['Django', 'React.js', 'Three.js', 'Microservices', 'WebSockets', 'Blockchain'],
        link: 'https://ayoubms8.github.io/blog/posts/ft_Transcendence/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-2',
        title: 'Inception of Things & Cloud-1',
        category: 'devops',
        categoryLabel: 'Kubernetes · Helm · Ansible · GitOps',
        year: '2026',
        description:
          'Cloud infrastructure with multi-machine Kubernetes (K3s/K3d) clusters automated with Vagrant and Ansible. Deployed automated GitOps pipelines with ArgoCD and Helm charts, combined with Terraform-provisioned AWS environments.',
        tags: ['Kubernetes', 'Helm', 'Ansible', 'ArgoCD', 'Terraform', 'AWS', 'GitOps'],
        link: 'https://ayoubms8.github.io/blog/posts/Inception_Of_Things/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-3',
        title: 'Real Estate ERP & Social Automation',
        category: 'devops',
        categoryLabel: 'Cloud Infrastructure · APIs · Alpha Real Estate',
        year: '2025',
        description:
          'Engineered and deployed the cloud infrastructure for a real estate ERP application. Built automated CI/CD pipelines and integrated Facebook, Instagram, and LinkedIn APIs for automated multi-channel property listing publication.',
        tags: ['External APIs', 'CI/CD', 'ERP', 'Microservices', 'Docker', 'Python'],
        link: 'https://github.com/ayoubms8',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-4',
        title: 'Menara Prefa HR & Intern Platform',
        category: 'fullstack',
        categoryLabel: 'Web Application · Laravel · PHP',
        year: '2022',
        description:
          'Centralized web application engineered with Laravel to manage interns, employees, and administrative onboarding workflows with role-based access control and administrative analytics.',
        tags: ['Laravel', 'PHP', 'SQL', 'MVC', 'Full-Stack'],
        link: 'https://github.com/ayoubms8',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-5',
        title: 'BGP — At Doors of Autonomous Systems',
        category: 'devops',
        categoryLabel: 'Networking · Routing',
        year: '2026',
        description:
          'Network virtualization with GNS3 implementing BGP EVPN control planes over VXLAN underlay tunnels. Fully dynamic inter-AS routing with FRRouting engines.',
        tags: ['BGP', 'VXLAN', 'EVPN', 'FRRouting', 'GNS3'],
        link: 'https://ayoubms8.github.io/blog/posts/BGP-At-Doors-Of-Autonomous-Systems/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-6',
        title: 'ft_irc',
        category: 'systems',
        categoryLabel: 'Network Programming · C++',
        year: '2024',
        description:
          'RFC 1459-compliant IRC server in C++98 using non-blocking I/O with epoll multiplexing. Handles multiple concurrent clients, channels, operators, and RFC protocol commands.',
        tags: ['C++98', 'epoll', 'Sockets', 'IRC'],
        link: 'https://ayoubms8.github.io/blog/posts/ft_IRC/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-7',
        title: 'Cub3D',
        category: 'systems',
        categoryLabel: 'Computer Graphics · C',
        year: '2023',
        description:
          'Raycasting 3D engine in C inspired by Wolfenstein 3D. Real-time texture mapping, minimap rendering, trigonometric ray projection, and collision detection.',
        tags: ['C', 'Raycasting', 'Computer Graphics', 'Game Engine'],
        link: 'https://ayoubms8.github.io/blog/posts/Cub3d/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-8',
        title: 'Minishell',
        category: 'systems',
        categoryLabel: 'Systems · Unix',
        year: '2023',
        description:
          'A bash-compatible shell in C supporting multi-stage pipes, I/O redirections, environment variable expansion, signal handling, custom built-ins, and process tree management.',
        tags: ['C', 'Shell', 'Pipes', 'Signals', 'POSIX'],
        link: 'https://ayoubms8.github.io/blog/posts/Minishell/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-9',
        title: 'Override',
        category: 'security',
        categoryLabel: 'Cybersecurity · Exploitation',
        year: '2026',
        description:
          'Advanced binary analysis: ROP chain construction, ret2libc exploitation, stack smashing with ASLR bypass. Deep dive into x86 memory corruption and mitigation bypasses.',
        tags: ['ROP', 'ret2libc', 'GDB', 'Assembly'],
        link: 'https://ayoubms8.github.io/blog/posts/Override/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-10',
        title: 'Rainfall',
        category: 'security',
        categoryLabel: 'Cybersecurity · Memory',
        year: '2026',
        description:
          'Memory corruption vulnerability research: buffer overflows, format string attacks, and bypassing modern security mitigations including ASLR and stack canaries.',
        tags: ['Buffer Overflow', 'Format String', 'C', 'Exploit'],
        link: 'https://ayoubms8.github.io/blog/posts/Rainfall/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-11',
        title: 'Snowcrash',
        category: 'security',
        categoryLabel: 'Cybersecurity · Linux',
        year: '2026',
        description:
          'Linux privilege escalation through SUID binaries, cron job abuse, and system misconfigurations. Comprehensive CTF methodology and systematic enumeration.',
        tags: ['Linux', 'Privilege Escalation', 'SUID', 'CTF'],
        link: 'https://ayoubms8.github.io/blog/posts/Snowcrash/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-12',
        title: 'Inception',
        category: 'devops',
        categoryLabel: 'DevOps · Docker',
        year: '2024',
        description:
          'Multi-container Docker infrastructure: Nginx with TLSv1.3, WordPress, MariaDB, secrets management, custom bridge networks, and persistent named volumes.',
        tags: ['Docker', 'Nginx', 'WordPress', 'MariaDB', 'TLS'],
        link: 'https://ayoubms8.github.io/blog/posts/Inception/',
        github: 'https://github.com/ayoubms8'
      }
    ],
    filters: [
      { id: 'all', label: 'All' },
      { id: 'fullstack', label: 'Full-Stack' },
      { id: 'devops', label: 'DevOps & Cloud' },
      { id: 'systems', label: 'Systems & C/C++' },
      { id: 'ai', label: 'AI & Data' },
      { id: 'security', label: 'Security' }
    ]
  },
  fr: {
    personalInfo: {
      name: 'Ayoub Lemsafi',
      tagline: 'Ingénieur Logiciel / Développeur Full-Stack',
      roles: ['Ingénieur Logiciel', 'Développeur Full-Stack', 'Infrastructure Backend & Cloud'],
      subtitle: 'Spécialisé en développement backend, microservices et architecture cloud.',
      bio: [
        "Étudiant en ingénierie logicielle à 42 Paris, spécialisé dans le développement backend et les architectures cloud. Solide expérience en intégration d'APIs externes, pipelines CI/CD et microservices.",
        "De la conception d'applications web distribuées complètes (Django, Laravel, React.js, Three.js) à l'orchestration de clusters Kubernetes multi-machines et la création de noyaux x86 en C et assembleur, je conçois des systèmes performants et pérennes.",
        "1ère place au Hackathon Phos4code Generative AI (Groupe OCP & 1337) et certifié Oracle OCI Generative AI Professional."
      ],
      blogUrl: 'https://ayoubms8.github.io/blog',
      githubUrl: 'https://github.com/ayoubms8',
      linkedinUrl: 'https://www.linkedin.com/in/ayoubms8',
      email: 'ayoub.lemsafi10@gmail.com',
      phone: '+33 753041252',
      location: 'Melun, Île-de-France',
      status: 'Disponible pour opportunités & collaborations',
      certification: 'Oracle OCI Generative AI Certified Professional – Juillet 2024',
      education: [
        {
          school: '42 Paris',
          period: '10/2022 – présent',
          program: 'Génie logiciel & architecture des systèmes'
        },
        {
          school: 'EST Agadir',
          period: '09/2020 – 06/2022',
          program: 'DUT en Génie Informatique'
        }
      ],
      languages: [
        { name: 'Arabe', level: 'Langue maternelle' },
        { name: 'Anglais', level: 'Avancé' },
        { name: 'Français', level: 'Courant' }
      ]
    },
    nav: {
      about: 'À propos',
      skills: 'Compétences',
      projects: 'Projets',
      contact: 'Contact',
      blog: 'Blog'
    },
    ui: {
      viewProjects: 'Voir les projets',
      readBlog: 'Lire le blog',
      aboutTitle: "L'ingénierie à chaque niveau de la pile",
      skillsTitle: 'Compétences & Technologies',
      projectsTitle: 'Projets Sélectionnés',
      featuredLabel: 'Projet Phare',
      contactTitle: 'Construisons ensemble.',
      contactSub: "Disponible pour de nouvelles opportunités, des collaborations et des échanges techniques sur les architectures backend, le cloud et les systèmes bas niveau.",
      emailCopied: 'E-mail copié dans le presse-papiers !',
      copyEmail: "Copier l'adresse e-mail",
      viewPost: "Consulter l'article",
      sourceCode: 'Code source',
      allSystemsOperational: 'Tous les systèmes sont opérationnels',
      backToTop: 'Haut de page'
    },
    stats: [
      { id: 'stat-0', target: 20, suffix: '+', label: 'Projets & Systèmes' },
      { id: 'stat-1', target: 4, suffix: '+', label: "Années d'expérience" },
      { id: 'stat-2', target: 6, suffix: '', label: 'Domaines Maîtrisés' }
    ],
    skills: [
      {
        id: 'backend',
        title: 'Backend & APIs',
        icon: 'Layers',
        glyph: '◉',
        tags: [
          'Python', 'FastAPI', 'Django', 'Laravel', 'Java', 'PHP',
          'SQL', 'Microservices', 'APIs REST', 'Intégration APIs Externes'
        ]
      },
      {
        id: 'frontend',
        title: 'Frontend & 3D',
        icon: 'Code2',
        glyph: '△',
        tags: [
          'React.js', 'Three.js', 'JavaScript', 'HTML5 / CSS3',
          'WebSockets', 'Interfaces Réactives', 'Gestion d’État'
        ]
      },
      {
        id: 'devops',
        title: 'Cloud & DevOps',
        icon: 'Cloud',
        glyph: '⬢',
        tags: [
          'AWS', 'Docker', 'Kubernetes (K3s/K3d)', 'Helm', 'ArgoCD',
          'GitLab CI/CD', 'GitHub Actions', 'Ansible', 'Nginx', 'GitOps'
        ]
      },
      {
        id: 'systems',
        title: 'Systèmes & Architecture',
        icon: 'Cpu',
        glyph: '⬡',
        tags: [
          'Arch Linux', 'Linux/Unix', 'C', 'C++', 'Microservices',
          'Bash', 'Neovim', 'Git', 'Assembleur x86', 'POSIX'
        ]
      },
      {
        id: 'ai',
        title: 'IA & Données',
        icon: 'Shield',
        glyph: '◈',
        tags: [
          'LLMs Locaux (Ollama, Qwen)', 'NLP', 'Deep Learning',
          'Prétraitement de Données', 'scikit-learn', 'Oracle OCI GenAI'
        ]
      },
      {
        id: 'networking',
        title: 'Sécurité & Bas Niveau',
        icon: 'Network',
        glyph: '◊',
        tags: [
          'Dév Noyau / Kernel', 'Exploitation Binaire', 'Rétro-Ingénierie',
          'Chaînes ROP', 'Dépassement de Tampon', 'BGP / EVPN', 'TCP/IP', 'epoll'
        ]
      }
    ],
    featuredProject: {
      id: 'featured-kfs',
      category: 'systems',
      categoryLabel: 'Développement Noyau · C · Assembleur · x86',
      year: '2026',
      title: 'Kernel From Scratch (KFS)',
      description:
        "Série complète de développement d'un système d'exploitation x86 fonctionnel, du boot bare-metal à la mémoire virtuelle, aux interruptions matérielles et à un shell interactif. Chaque composant conçu en C et assembleur sans bibliothèques externes.",
      highlights: [
        { code: 'KFS-1', desc: 'Conformité Multiboot, pilote VGA texte, passage du mode réel au mode protégé x86' },
        { code: 'KFS-2', desc: 'Table globale des descripteurs (GDT), segmentation, diagnostics de la pile noyau' },
        { code: 'KFS-3', desc: 'Gestionnaire de mémoire physique (bitmap PMM), pagination virtuelle à 2 niveaux, allocateur heap kmalloc/kfree' },
        { code: 'KFS-4', desc: 'Table des descripteurs d’interruptions (IDT), remappage double PIC 8259, timer PIT, pilote clavier PS/2' }
      ],
      link: 'https://ayoubms8.github.io/blog/posts/KFS-4/',
      tags: ['Kernel', 'Assembleur x86', 'C', 'Pagination', 'IDT', 'Bootloader']
    },
    projects: [
      {
        id: 'proj-0',
        title: 'Phos4code Generative AI (Équipe Gagnante)',
        category: 'ai',
        categoryLabel: 'IA Générative · Groupe OCP & 1337',
        year: '2025',
        description:
          "Équipe gagnante au Hackathon Phos4code Generative AI (Groupe OCP & 1337). Conception d'un jumeau numérique d'une usine d'acide sulfurique basé sur la télémétrie industrielle en temps réel pour optimiser la production énergétique tout en maintenant la stabilité du procédé, avec un chatbot IA d'assistance.",
        tags: ['FastAPI', 'React.js', 'Python', 'scikit-learn', 'NLP', 'LLMs Locaux'],
        link: 'https://ayoubms8.github.io/blog/posts/Topiary-AI-Industrial-Digital-Twin/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-1',
        title: 'ft_transcendence',
        category: 'fullstack',
        categoryLabel: 'Full-Stack · Django · React · Three.js',
        year: '2024',
        description:
          'Plateforme web multijoueur complète en temps réel avec Pong 3D animé avec Three.js, gestion de tournois, messagerie instantanée, succès et modes de jeu variés. Architecture microservices moderne avec Django, React.js et intégration blockchain.',
        tags: ['Django', 'React.js', 'Three.js', 'Microservices', 'WebSockets', 'Blockchain'],
        link: 'https://ayoubms8.github.io/blog/posts/ft_Transcendence/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-2',
        title: 'Inception of Things & Cloud-1',
        category: 'devops',
        categoryLabel: 'Kubernetes · Helm · Ansible · GitOps',
        year: '2026',
        description:
          'Infrastructure cloud orchestrée sur clusters Kubernetes multi-machines (K3s/K3d) provisionnés avec Vagrant et Ansible. Déploiements GitOps automatisés via ArgoCD et Helm, associés à une infrastructure AWS codifiée avec Terraform.',
        tags: ['Kubernetes', 'Helm', 'Ansible', 'ArgoCD', 'Terraform', 'AWS', 'GitOps'],
        link: 'https://ayoubms8.github.io/blog/posts/Inception_Of_Things/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-3',
        title: 'ERP Immobilier & Automatisation Sociale',
        category: 'devops',
        categoryLabel: 'Infrastructure Cloud · APIs · Alpha Real Estate',
        year: '2025',
        description:
          "Projet de stage professionnel : Conception et déploiement de l'infrastructure cloud pour un ERP immobilier. Automatisation des déploiements via des pipelines CI/CD et intégration des APIs Facebook, Instagram et LinkedIn pour la diffusion multi-plateforme des annonces.",
        tags: ['APIs Externes', 'CI/CD', 'ERP', 'Microservices', 'Docker', 'Python'],
        link: 'https://github.com/ayoubms8',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-4',
        title: 'Plateforme RH & Stagiaires Menara Prefa',
        category: 'fullstack',
        categoryLabel: 'Application Web · Laravel · PHP',
        year: '2022',
        description:
          'Application web centralisée développée avec Laravel pour gérer les stagiaires, employés et parcours administratifs, incluant une gestion des rôles et des tableaux de bord analytiques.',
        tags: ['Laravel', 'PHP', 'SQL', 'MVC', 'Full-Stack'],
        link: 'https://github.com/ayoubms8',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-5',
        title: 'BGP — Aux Portes des Systèmes Autonomes',
        category: 'devops',
        categoryLabel: 'Réseaux · Routage Avancé',
        year: '2026',
        description:
          'Virtualisation réseau sous GNS3 implémentant des plans de contrôle BGP EVPN au-dessus de tunnels sous-jacents VXLAN. Routage inter-AS dynamique avec moteurs FRRouting.',
        tags: ['BGP', 'VXLAN', 'EVPN', 'FRRouting', 'GNS3'],
        link: 'https://ayoubms8.github.io/blog/posts/BGP-At-Doors-Of-Autonomous-Systems/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-6',
        title: 'ft_irc',
        category: 'systems',
        categoryLabel: 'Programmation Réseau · C++',
        year: '2024',
        description:
          "Serveur IRC conforme RFC 1459 en C++98 avec entrées/sorties non-bloquantes multiplexées via epoll. Gestion simultanée de multiples clients, canaux, privilèges opérateurs et commandes du protocole.",
        tags: ['C++98', 'epoll', 'Sockets', 'IRC'],
        link: 'https://ayoubms8.github.io/blog/posts/ft_IRC/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-7',
        title: 'Cub3D',
        category: 'systems',
        categoryLabel: 'Graphisme Informatique · C',
        year: '2023',
        description:
          'Moteur 3D en raycasting en langage C inspiré du classique Wolfenstein 3D. Calculs de textures en temps réel, minimap dynamique, projections trigonométriques et gestion des collisions.',
        tags: ['C', 'Raycasting', 'Graphisme', 'Moteur de Jeu'],
        link: 'https://ayoubms8.github.io/blog/posts/Cub3d/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-8',
        title: 'Minishell',
        category: 'systems',
        categoryLabel: 'Systèmes · Environnement Unix',
        year: '2023',
        description:
          'Interpréteur de commandes compatible Bash en langage C. Prise en charge des pipelines multi-étapes, redirections d’E/S, expansion des variables, gestion des signaux et commandes intégrées (built-ins).',
        tags: ['C', 'Shell', 'Pipes', 'Signaux', 'POSIX'],
        link: 'https://ayoubms8.github.io/blog/posts/Minishell/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-9',
        title: 'Override',
        category: 'security',
        categoryLabel: 'Cybersécurité · Exploitation Binaire',
        year: '2026',
        description:
          'Analyse binaire avancée : élaboration de chaînes ROP, attaques ret2libc, débordements de pile avec contournement ASLR. Étude approfondie des corruptions mémoire x86.',
        tags: ['ROP', 'ret2libc', 'GDB', 'Assembleur'],
        link: 'https://ayoubms8.github.io/blog/posts/Override/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-10',
        title: 'Rainfall',
        category: 'security',
        categoryLabel: 'Cybersécurité · Corruption Mémoire',
        year: '2026',
        description:
          'Recherche de vulnérabilités en mémoire : buffer overflows, failles par chaînes de format et contournement des protections modernes (ASLR, canaris de pile).',
        tags: ['Buffer Overflow', 'Format String', 'C', 'Exploit'],
        link: 'https://ayoubms8.github.io/blog/posts/Rainfall/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-11',
        title: 'Snowcrash',
        category: 'security',
        categoryLabel: 'Cybersécurité · Élévation de Privilèges',
        year: '2026',
        description:
          "Élévation de privilèges Linux à travers l'exploitation de binaires SUID, détournement de tâches cron et mauvaises configurations système. Méthodologie rigoureuse de CTF.",
        tags: ['Linux', 'Élévation de Privilèges', 'SUID', 'CTF'],
        link: 'https://ayoubms8.github.io/blog/posts/Snowcrash/',
        github: 'https://github.com/ayoubms8'
      },
      {
        id: 'proj-12',
        title: 'Inception',
        category: 'devops',
        categoryLabel: 'DevOps · Conteneurisation Docker',
        year: '2024',
        description:
          'Infrastructure multi-conteneurs sous Docker : serveur Nginx avec TLSv1.3, WordPress, base MariaDB, gestion des secrets, réseaux personnalisés et volumes persistants.',
        tags: ['Docker', 'Nginx', 'WordPress', 'MariaDB', 'TLS'],
        link: 'https://ayoubms8.github.io/blog/posts/Inception/',
        github: 'https://github.com/ayoubms8'
      }
    ],
    filters: [
      { id: 'all', label: 'Tous' },
      { id: 'fullstack', label: 'Full-Stack' },
      { id: 'devops', label: 'DevOps & Cloud' },
      { id: 'systems', label: 'Systèmes & C/C++' },
      { id: 'ai', label: 'IA & Données' },
      { id: 'security', label: 'Sécurité' }
    ]
  }
};

// Backward-compatible exports:
export const PERSONAL_INFO = PORTFOLIO_CONTENT.en.personalInfo;
export const STATS = PORTFOLIO_CONTENT.en.stats;
export const SKILL_CATEGORIES = PORTFOLIO_CONTENT.en.skills;
export const FEATURED_PROJECT = PORTFOLIO_CONTENT.en.featuredProject;
export const PROJECTS = PORTFOLIO_CONTENT.en.projects;
export const FILTER_CATEGORIES = PORTFOLIO_CONTENT.en.filters;
