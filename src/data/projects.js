export const projects = [
  {
    id: "circuit-forge",
    title: "Circuit Forge",
    description: "An e-commerce platform for custom PC building and optimization services.",
    longDescription: "Circuit Forge is a full-featured e-commerce platform tailored for custom PC builders and tech enthusiasts. It provides an intuitive interface for users to select compatible components, customize system configurations, and purchase pre-built or bespoke rigs. The system integrates real-time price tracking and inventory management to prevent stock mismatches during checkout.",
    technologies: ["Python", "Django", "JavaScript", "HTML", "CSS", "PostgreSQL", "Docker"],
    features: [
      "Secure user authentication and profile management.",
      "Dynamic component compatibility checker (CPU, RAM, Motherboard).",
      "Interactive shopping cart and multistep checkout workflow.",
      "Real-time inventory tracking and automatic restocking alerts.",
      "Comprehensive admin dashboard for order processing and user analytics.",
      "Fully responsive, elegant, glassmorphic layout."
    ],
    challengesSolved: "Solving the hardware compatibility logic was a major hurdle. I designed a relational database schema mapping socket types, power requirements, and dimension parameters, using Django signals to evaluate compatibilities before items enter the cart.",
    lessonsLearned: "I deepened my knowledge of Docker containerization for Django and PostgreSQL services, and learned how to build robust, normalized SQL schemas for intricate e-commerce catalogs.",
    githubLink: "",
    demoLink: "",
    tags: ["E-Commerce", "Full-Stack", "Web Development"],
    featured: true
  },
  {
    id: "malware-classification",
    title: "Malware Classification System",
    description: "A machine learning project using Support Vector Machines and Neural Networks to automate malware detection based on static features.",
    longDescription: "This research-oriented project analyzes PE (Portable Executable) headers from the Microsoft Malware Dataset. By extracting static features such as API calls, section sizes, and entropy levels, it uses SVMs and Multi-Layer Perceptrons to classify binaries into malware families, achieving high accuracy with optimized hyperparameters.",
    technologies: ["Python", "Machine Learning", "SVM", "Neural Networks", "Data Analysis", "Scikit-Learn", "Pandas"],
    features: [
      "Static feature extraction pipeline from binary headers.",
      "Comparative analysis between Support Vector Machines and Neural Network architectures.",
      "Feature selection algorithms reducing dimensionality with minimal information loss.",
      "Evaluation metrics showing confusion matrices, precision, recall, and ROC curves.",
      "Interactive command-line tool to analyze and classify uploaded binaries."
    ],
    challengesSolved: "Handling class imbalance in the dataset was crucial to avoid skewed results. I utilized SMOTE (Synthetic Minority Over-sampling Technique) and tuned hyperparameter regularization matrices (C-value in SVM, learning rates in MLP) to boost the recall rate of rare malware variants.",
    lessonsLearned: "Learned the mathematical foundations of SVM kernels and how to tune multilayer perceptron layers. Acquired practical knowledge in threat intelligence and static analysis of suspicious executables.",
    githubLink: "https://github.com/ndichia-quincy/malware-classification",
    demoLink: "https://malware-classifier-demo.example.com",
    tags: ["Cybersecurity", "Machine Learning", "Data Science"],
    featured: true
  },
  {
    id: "replicated-kv-store",
    title: "Replicated Key-Value Store",
    description: "A distributed systems project featuring synchronous replication, failure detection, and read-your-writes session consistency.",
    longDescription: "A fault-tolerant, high-performance distributed key-value store built in Python. The system employs a master-replica architecture with synchronous replication, node heartbeat monitoring, and read-your-writes session consistency to ensure client operations reflect their own updates immediately, even in the event of partial node failures.",
    technologies: ["Python", "Distributed Systems", "Networking", "System Design", "Sockets", "JSON-RPC"],
    features: [
      "Master-replica network topologies utilizing TCP sockets.",
      "Synchronous write propagation with quorum acknowledgement.",
      "Read-your-writes consistency via tracking client vector clocks.",
      "Automatic heartbeat monitoring and failure detection using ping-ack loops.",
      "Elegant command-line interface to spawn, inspect, and crash cluster nodes."
    ],
    challengesSolved: "Maintaining session consistency during network partitions or node dropouts was complex. I implemented vector clocks and logical timestamps on clients, allowing replicas to serve correct historical data based on client-specific session states.",
    lessonsLearned: "Gained hands-on experience with network sockets, concurrent thread execution, state synchronization, and distributed consensus challenges like the CAP theorem.",
    githubLink: "https://github.com/ndichia-quincy/replicated-kv-store",
    demoLink: "https://kv-store-demo.example.com",
    tags: ["Systems", "Distributed Systems", "Networking"],
    featured: false
  },
  {
    id: "securebank-simulation",
    title: "SecureBank Incident Simulation",
    description: "A Red Team/Blue Team project involving exploitation and defense of an Ubuntu-based banking portal and Windows environments, configuring Suricata IDS.",
    longDescription: "This capstone project simulates real-world corporate intrusion. On the offensive (Red) side, I conducted web exploitation and privilege escalation. On the defensive (Blue) side, I hardened OS security, created firewall rules, deployed Suricata IDS, and constructed an incident response pipeline with detailed log reviews.",
    technologies: ["Linux", "Suricata IDS", "Networking", "Penetration Testing", "Incident Response", "Nmap", "Wireshark", "Bash"],
    features: [
      "Vulnerability assessment and automated scanning using Nmap and OpenVAS.",
      "Exploitation of SQL Injection and Remote Code Execution vectors on a banking portal.",
      "Suricata IDS setup with customized rules to detect malicious web traffic.",
      "Incident logging, traffic analysis in Wireshark, and post-incident reporting.",
      "Hardening of Ubuntu systems using fail2ban, iptables, and disabled unused ports."
    ],
    challengesSolved: "Differentiating between legitimate high traffic and slow, low-intensity scan patterns in Suricata was difficult. I researched and engineered precise threshold rules that reduced false alarms by 85% while catching stealthy Nmap scans.",
    lessonsLearned: "Obtained deep practical understanding of packet inspection, firewall management, system logs, and security monitoring workflows essential for Security Operations Centers (SOC).",
    githubLink: "https://github.com/ndichia-quincy/securebank-simulation",
    demoLink: "https://securebank-simulation.example.com",
    tags: ["Cybersecurity", "Incident Response", "Networking"],
    featured: true
  },
  {
    id: "effica",
    title: "Effica — Enterprise Printing Press Management Platform",
    description: "Full-stack multi-branch printing press SaaS with Mobile Money payments, production workflow automation, and enterprise-grade security.",
    longDescription: "A comprehensive Django/PostgreSQL/Redis platform digitizing the entire lifecycle of a multi-branch printing business — from customer ordering and Tranzak Mobile Money payment processing to production QA state machine, inventory management with optimistic locking, cross-branch financial dashboards, and a 3-portal isolated architecture for customers, staff, and superusers. Features a custom WAF, hash-chained tamper-proof audit system, hybrid RBAC + ABAC access control, passwordless JWT Ghost authentication, and a CI/CD pipeline with 131 automated tests at 80% coverage.",
    technologies: ["Django", "PostgreSQL", "Redis", "Celery", "Nginx", "Docker", "Python", "JWT", "Tranzak API", "Google OAuth", "Prometheus"],
    features: [
      "Three-portal architecture (customer, staff, admin) with middleware-level access gating.",
      "Passwordless JWT Ghost authentication with bcrypt-hashed OTPs, CAPTCHA fallback, and rate limiting.",
      "Hybrid RBAC + ABAC access control with contextual policies (discount approvals, machine scheduling).",
      "Tranzak Mobile Money integration with HMAC-SHA256 webhook verification and idempotency keys.",
      "Hash-chained tamper-proof audit logging — each record cryptographically linked to the previous one.",
      "Custom WAF middleware detecting SQL injection, XSS, malicious bots, and Slowloris DoS at the request layer.",
      "Production workflow state machine (Draft → QA Review → Ready for Delivery) enforced by django-fsm.",
      "CI/CD pipeline with Bandit SAST, 131 automated tests, and an 80% code coverage quality gate."
    ],
    challengesSolved: "Multi-branch data isolation was the hardest problem — enforcing strict query-level separation between print shop branches while allowing controlled cross-branch access for finance officers required a layered middleware and permission architecture. Mobile Money payment integrity was equally critical: implementing HMAC-SHA256 webhook verification, UUID-based idempotency keys, and a 3-state payment FSM to prevent double-charging and replay attacks. The 575+ printing service subtypes demanded a normalized catalog schema that could evolve without breaking existing orders.",
    lessonsLearned: "Security must be architected from day one — the WAF, RBAC, ABAC, audit logging, and encryption layers were all designed into the initial architecture rather than retrofitted. File upload security in a printing platform is fundamentally different from generic web apps: customer PDFs and design files need content-based malware scanning, magic-byte validation, and sandboxed processing — extension blocking alone is insufficient. CI/CD requires layered scanning: SAST for code vulnerabilities plus SCA for dependency vulnerabilities; one without the other leaves blind spots.",
    githubLink: "",
    demoLink: "",
    tags: ["Full-Stack", "Web Development", "Systems"],
    featured: true
  }
];
