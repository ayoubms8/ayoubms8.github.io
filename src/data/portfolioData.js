export const PERSONAL_INFO = {
  name: 'Ayoub Lemsafi',
  tagline: 'Software Engineer',
  roles: ['Systems Programmer', 'Kernel Developer', 'Infrastructure Engineer'],
  subtitle: 'Building from the metal up.',
  bio: [
    "I'm a software engineer with a passion for understanding systems at their deepest levels — from bare-metal kernel internals to cloud-scale infrastructure.",
    "Trained at 1337 / 42 Network, I've built everything from a custom x86 kernel from scratch to BGP-routed networks, Kubernetes GitOps pipelines, and AI-powered industrial digital twins.",
    "I document my journey on my technical blog, where I go deep into the 'why' behind the things I build."
  ],
  blogUrl: 'https://ayoubms8.github.io/blog',
  githubUrl: 'https://github.com/ayoubms8',
  linkedinUrl: 'https://www.linkedin.com/in/ayoub-lemsafi-2a3724212/',
  email: 'ayoub.lemsafi10@gmail.com',
  location: 'Morocco',
  status: 'Available for opportunities & collaborations'
};

export const STATS = [
  { id: 'stat-0', target: 19, suffix: '', label: 'Projects & Posts' },
  { id: 'stat-1', target: 4, suffix: '+', label: 'Years Building' },
  { id: 'stat-2', target: 5, suffix: '', label: 'Domains Covered' }
];

export const SKILL_CATEGORIES = [
  {
    id: 'systems',
    title: 'Systems & Kernel',
    icon: 'Cpu',
    glyph: '⬡',
    tags: [
      'C', 'x86 Assembly', 'Kernel Dev', 'Memory Management',
      'Interrupts', 'VGA Drivers', 'GDT / IDT', 'Paging',
      'Multithreading', 'Mutexes'
    ]
  },
  {
    id: 'security',
    title: 'Cybersecurity',
    icon: 'Shield',
    glyph: '◈',
    tags: [
      'Binary Exploitation', 'Reverse Engineering', 'ROP Chains',
      'GDB', 'Buffer Overflow', 'Privilege Escalation', 'ASLR Bypass'
    ]
  },
  {
    id: 'networking',
    title: 'Networking',
    icon: 'Network',
    glyph: '◊',
    tags: [
      'BGP', 'VXLAN / EVPN', 'FRRouting', 'GNS3', 'TCP/IP', 'Sockets'
    ]
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud',
    icon: 'Cloud',
    glyph: '⬢',
    tags: [
      'Kubernetes', 'Docker', 'Terraform', 'Ansible', 'ArgoCD',
      'AWS', 'GitOps', 'Helm', 'K3s'
    ]
  },
  {
    id: 'languages',
    title: 'Languages',
    icon: 'Code2',
    glyph: '△',
    tags: [
      'C', 'C++', 'Python', 'TypeScript', 'Assembly', 'Bash', 'Java'
    ]
  },
  {
    id: 'fullstack',
    title: 'Full-Stack & AI',
    icon: 'Layers',
    glyph: '◉',
    tags: [
      'NestJS', 'React', 'FastAPI', 'WebSockets', 'scikit-learn', 'ML'
    ]
  }
];

export const FEATURED_PROJECT = {
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
};

export const PROJECTS = [
  {
    id: 'proj-0',
    title: 'Topiary',
    category: 'ai',
    categoryLabel: 'AI · Machine Learning',
    year: '2025',
    description:
      'AI-powered Industrial Digital Twin built in 48h at an OCP Group hackathon. Models steam distribution and thermodynamics in a sulfuric acid plant using Multi-Output Random Forest.',
    tags: ['scikit-learn', 'FastAPI', 'React', 'Python'],
    link: 'https://ayoubms8.github.io/blog/posts/Topiary-AI-Industrial-Digital-Twin/',
    github: 'https://github.com/ayoubms8'
  },
  {
    id: 'proj-1',
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
    id: 'proj-2',
    title: 'Inception of Things',
    category: 'devops',
    categoryLabel: 'DevOps · Cloud Native',
    year: '2026',
    description:
      'Multi-node K3s Kubernetes cluster provisioned with Vagrant. Traefik ingress routing + automated GitOps deployments via ArgoCD with complete CI/CD pipelines.',
    tags: ['Kubernetes', 'ArgoCD', 'Helm', 'GitOps', 'Vagrant'],
    link: 'https://ayoubms8.github.io/blog/posts/Inception_Of_Things/',
    github: 'https://github.com/ayoubms8'
  },
  {
    id: 'proj-3',
    title: 'Cloud-1',
    category: 'devops',
    categoryLabel: 'Cloud · IaC',
    year: '2026',
    description:
      'Infrastructure as Code with Terraform provisioning AWS EC2, VPC, S3, and security groups. Ansible for configuration management and automated hardened deployment.',
    tags: ['Terraform', 'Ansible', 'AWS', 'EC2'],
    link: 'https://ayoubms8.github.io/blog/posts/Cloud-1/',
    github: 'https://github.com/ayoubms8'
  },
  {
    id: 'proj-4',
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
    id: 'proj-5',
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
    id: 'proj-6',
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
    id: 'proj-7',
    title: 'ft_transcendence',
    category: 'fullstack',
    categoryLabel: 'Full-Stack · Real-Time',
    year: '2024',
    description:
      'Full-stack real-time Pong SPA with WebSocket multiplayer, OAuth2 authentication, 2FA, NestJS backend, PostgreSQL, and JWT sessions.',
    tags: ['NestJS', 'TypeScript', 'WebSockets', 'OAuth2', 'PostgreSQL'],
    link: 'https://ayoubms8.github.io/blog/posts/ft_Transcendence/',
    github: 'https://github.com/ayoubms8'
  },
  {
    id: 'proj-8',
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
    id: 'proj-9',
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
    id: 'proj-10',
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
    id: 'proj-11',
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
];

export const FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'systems', label: 'Systems' },
  { id: 'security', label: 'Security' },
  { id: 'devops', label: 'DevOps' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'ai', label: 'AI' }
];
