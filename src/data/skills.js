export const skills = {
  cybersecurity: {
    title: "Cybersecurity & Systems",
    items: [
      { name: "Networking Fundamentals",       category: "Core Architecture" },
      { name: "Penetration Testing",           category: "Core Architecture" },
      { name: "Identity & Access Management",  category: "Core Architecture" },
      { name: "Incident Response",             category: "Core Architecture" },
      { name: "Network Hardening",             category: "Core Architecture" },
      { name: "Security Monitoring",           category: "Tools & Frameworks" },
      { name: "Suricata IDS",                  category: "Tools & Frameworks" },
      { name: "Wireshark",                     category: "Tools & Frameworks" },
      { name: "Nmap",                          category: "Tools & Frameworks" },
      { name: "Linux Administration",          category: "Environments" },
      { name: "Virtualization",                category: "Environments" },
      { name: "Docker",                        category: "Environments" },
    ]
  },
  development: {
    title: "Software Development",
    items: [
      { name: "Python",                        category: "Core Architecture" },
      { name: "JavaScript",                    category: "Core Architecture" },
      { name: "Full-Stack Development",        category: "Core Architecture" },
      { name: "Database Design",               category: "Core Architecture" },
      { name: "REST APIs",                     category: "Core Architecture" },
      { name: "Django",                        category: "Tools & Frameworks" },
      { name: "React",                         category: "Tools & Frameworks" },
      { name: "HTML & CSS",                    category: "Tools & Frameworks" },
      { name: "Git & Version Control",         category: "Tools & Frameworks" },
      { name: "Machine Learning (SVM / MLP)", category: "Tools & Frameworks" },
      { name: "Linux / Bash",                  category: "Environments" },
      { name: "Docker / Containers",           category: "Environments" },
      { name: "PostgreSQL",                    category: "Environments" },
    ]
  },
  business: {
    title: "Communication & Business",
    items: [
      { name: "Technical Writing",             category: "Core Architecture" },
      { name: "Research & Analysis",           category: "Core Architecture" },
      { name: "Professional Communication",    category: "Core Architecture" },
      { name: "Documentation",                 category: "Tools & Frameworks" },
      { name: "Project Management",            category: "Tools & Frameworks" },
      { name: "Problem Solving",               category: "Tools & Frameworks" },
      { name: "Virtual Assistance",            category: "Environments" },
      { name: "Data Entry & Admin Support",    category: "Environments" },
    ]
  }
};

// The three standard category labels used across all skill groups
export const skillCategories = [
  { key: "Core Architecture", description: "Foundational knowledge I build systems on" },
  { key: "Tools & Frameworks", description: "Technologies and toolchains I work with regularly" },
  { key: "Environments",       description: "Platforms and operating contexts I navigate daily" },
];
