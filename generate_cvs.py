import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def set_paragraph_spacing(paragraph, before=0, after=0, line=None):
    pf = paragraph.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    if line is not None:
        pf.line_spacing = line

def set_run_font(run, name='Outfit', size=11, bold=False, italic=False, color=None):
    run.font.name = name
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = RGBColor(*color)

def add_section_heading(doc, text):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=14, after=6)
    run = p.add_run(text.upper())
    set_run_font(run, name='Outfit', size=11, bold=True, color=(0x33, 0x33, 0x33))
    # Add bottom border
    pPr = p._element.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '4')
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), '333333')
    pBdr.append(bottom)
    pPr.append(pBdr)

def add_bullet(doc, text, indent_level=0):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=1, after=1, line=1.15)
    p.style = doc.styles['List Bullet']
    run = p.add_run(text)
    set_run_font(run, size=10.5)

def add_body_text(doc, text, size=10.5, bold=False, italic=False):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=2, after=2, line=1.15)
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold, italic=italic)

def add_experience_item(doc, title, org, date, bullets):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=6, after=1)
    run = p.add_run(title)
    set_run_font(run, size=11, bold=True)
    run = p.add_run(f'  —  {org}')
    set_run_font(run, size=10.5, italic=True)

    p2 = doc.add_paragraph()
    set_paragraph_spacing(p2, before=0, after=2)
    run = p2.add_run(date)
    set_run_font(run, size=10, italic=True, color=(0x66, 0x66, 0x66))

    for bullet in bullets:
        add_bullet(doc, bullet)


# ============================================================
# DATA
# ============================================================

CONTACT = {
    'name': 'NDICHIA QUINCY FIEN',
    'email': 'quincyfien99@gmail.com',
    'phone': '+237 653 319 958',
    'address': 'Bambili, Cameroon',
    'github': 'github.com/ndichia-quincy',
    'portfolio': None,  # set per role
}

EDUCATION = [
    'Professional Master\'s degree in Cybersecurity — University of Bamenda (2025–Present)',
    'Bachelor of Science in Physics — University of Bamenda',
]

# ============================================================
# CV 1: CYBERSECURITY
# ============================================================

def build_cybersecurity_cv():
    doc = Document()

    # Page margins
    for section in doc.sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    style = doc.styles['Normal']
    style.font.name = 'Outfit'
    style.font.size = Pt(10.5)

    # --- Header ---
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=2)
    run = p.add_run('NDICHIA QUINCY FIEN')
    set_run_font(run, size=16, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=2)
    run = p.add_run('Cybersecurity Engineer')
    set_run_font(run, size=12, color=(0x55, 0x55, 0x55))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=6)
    run = p.add_run(f'{CONTACT["email"]}  |  {CONTACT["phone"]}  |  {CONTACT["address"]}')
    set_run_font(run, size=9.5, color=(0x66, 0x66, 0x66))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=8)
    run = p.add_run(f'{CONTACT["github"]}  |  Portfolio: yoursite.com/?role=cybersecurity')
    set_run_font(run, size=9.5, color=(0x66, 0x66, 0x66))

    # --- Professional Summary ---
    add_section_heading(doc, 'Professional Summary')
    add_body_text(doc,
        'Cybersecurity Master\'s student and researcher with a rigorous analytical foundation in physics '
        'and specialized academic training in network security, secure system architecture, and identity & '
        'access management. Skilled in threat simulation, vulnerability assessment, and incident response '
        'using industry-standard tools. Seeking a dynamic operational security internship to apply hands-on '
        'skills in a real-world security operations environment.',
        size=10.5,
    )

    # --- Technical Skills ---
    add_section_heading(doc, 'Technical Skills')
    skills_data = [
        ('Security Tools:', 'Kali Linux, Nmap, Wireshark, Metasploit, Suricata IDS, OpenVAS'),
        ('IAM & Access Control:', 'FreeIPA, LDAP, RBAC, Sudoers Policies, SSH key-based auth'),
        ('Networking & Defense:', 'TCP/IP, Firewalls (iptables), VPN, fail2ban, packet inspection'),
        ('OS Platforms:', 'Linux (AlmaLinux, Ubuntu, CentOS), Windows'),
        ('Scripting & Dev:', 'Python, Bash, Git, Version Control'),
        ('Analysis & Reporting:', 'Excel (log analysis), LaTeX, MS Word'),
    ]
    for label, content in skills_data:
        p = doc.add_paragraph()
        set_paragraph_spacing(p, before=1, after=1, line=1.15)
        run = p.add_run(label + ' ')
        set_run_font(run, size=10.5, bold=True)
        run = p.add_run(content)
        set_run_font(run, size=10.5)

    # --- Languages ---
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=1, after=1, line=1.15)
    run = p.add_run('Languages: ')
    set_run_font(run, size=10.5, bold=True)
    run = p.add_run('English (Professional), French (Intermediate)')
    set_run_font(run, size=10.5)

    # --- Education ---
    add_section_heading(doc, 'Education')
    for edu in EDUCATION:
        add_bullet(doc, edu)

    # --- Relevant Coursework ---
    add_section_heading(doc, 'Relevant Coursework & Certifications')
    courses = [
        'Network Security and Defense',
        'Secure System Architecture',
        'Risk Assessment Fundamentals',
        'Identity & Access Management (IAM)',
        'Cyberspace Ethics, Sociology & Psychology',
        'Cross-Site Scripting & Web Security (SEED Labs)',
    ]
    for c in courses:
        add_bullet(doc, c)

    # --- Projects ---
    add_section_heading(doc, 'Projects & Practical Experience')
    add_experience_item(doc,
        'Threat Simulation & Vulnerability Assessment',
        'University of Bamenda — Network Security Lab',
        'Academic Project',
        [
            'Conducted network reconnaissance and vulnerability scanning using Kali Linux, Nmap, and Wireshark across simulated enterprise environments.',
            'Mapped attack surfaces, documented system flaws, and produced structured mitigation reports aligned with industry frameworks.',
            'Reproduced real-world attack vectors (XSS, privilege escalation) in lab environments to validate detection and response procedures.',
        ]
    )
    add_experience_item(doc,
        'Identity & Access Management (IAM) Lab',
        'University of Bamenda — Systems Security Course',
        'Academic Project',
        [
            'Deployed FreeIPA-based centralized authentication across a multi-VM environment (Kali, AlmaLinux 9, Ubuntu Server, CentOS).',
            'Configured sudoers access policies, SSH key-based authentication, and iptables firewall rules to enforce least-privilege.',
            'Designed RBAC identity matrices and documented access control logic in compliance with IAM best practices.',
        ]
    )
    add_experience_item(doc,
        'SecureBank Incident Simulation (Red/Blue Team)',
        'Capstone Project',
        'Academic Project',
        [
            'Simulated real-world corporate intrusion: web exploitation and privilege escalation (Red Team) then OS hardening, firewall, and Suricata IDS deployment (Blue Team).',
            'Engineered Suricata threshold rules reducing false positives by 85% while detecting stealthy Nmap scan patterns.',
            'Built incident response pipeline with log review, traffic analysis in Wireshark, and post-incident reporting.',
        ]
    )
    add_experience_item(doc,
        'Malware Detection Research — Static Feature Classification',
        'Academic Research Project',
        'Research',
        [
            'Compared SVM, Neural Network, and GAN-augmented classifiers for malware detection using static binary features from PE headers.',
            'Contributed to dataset curation, feature extraction pipeline, and performance benchmarking across classification models.',
            'Authored technical report sections covering methodology, results analysis, and security implications.',
        ]
    )

    # --- Core Competencies ---
    add_section_heading(doc, 'Core Competencies')
    competencies = [
        'Network Security & Defense — Threat modelling, vulnerability assessment, traffic analysis',
        'Risk Assessment — Risk identification, mitigation documentation, compliance frameworks',
        'Analytical Thinking — Data-driven security analysis, pattern recognition, log review',
        'Secure System Architecture — IAM design, access control policies, firewall configuration',
        'Collaborative Research — Academic teamwork, peer-reviewed reporting, methodology documentation',
    ]
    for comp in competencies:
        add_bullet(doc, comp)

    # --- Interests ---
    add_section_heading(doc, 'Interests')
    add_body_text(doc, 'Cybersecurity Trends & CTFs  ·  Technical Research & Documentation  ·  African History & Current Events')

    path = os.path.join(OUTPUT_DIR, 'CV_Ndichia_Quincy_Cybersecurity.docx')
    doc.save(path)
    print(f'Saved: {path}')


# ============================================================
# CV 2: FULL-STACK DEVELOPER
# ============================================================

def build_developer_cv():
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    style = doc.styles['Normal']
    style.font.name = 'Outfit'
    style.font.size = Pt(10.5)

    # --- Header ---
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=2)
    run = p.add_run('NDICHIA QUINCY FIEN')
    set_run_font(run, size=16, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=2)
    run = p.add_run('Full-Stack Developer')
    set_run_font(run, size=12, color=(0x55, 0x55, 0x55))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=6)
    run = p.add_run(f'{CONTACT["email"]}  |  {CONTACT["phone"]}  |  {CONTACT["address"]}')
    set_run_font(run, size=9.5, color=(0x66, 0x66, 0x66))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=8)
    run = p.add_run(f'{CONTACT["github"]}  |  Portfolio: yoursite.com/?role=dev')
    set_run_font(run, size=9.5, color=(0x66, 0x66, 0x66))

    # --- Professional Summary ---
    add_section_heading(doc, 'Professional Summary')
    add_body_text(doc,
        'Full-stack developer with a strong problem-solving foundation rooted in physics and systems thinking. '
        'Experienced in building production-ready web applications using Python (Django) and modern JavaScript, '
        'designing relational database schemas, and containerizing services with Docker. Adept at translating '
        'complex requirements into clean, maintainable code with rigorous attention to security and performance.',
        size=10.5,
    )

    # --- Technical Skills ---
    add_section_heading(doc, 'Technical Skills')
    skills_data = [
        ('Backend:', 'Python, Django, REST APIs, JSON-RPC, Django ORM, Shell scripting (Bash)'),
        ('Frontend:', 'JavaScript, HTML5, CSS3, Responsive design, Custom UI components'),
        ('Databases:', 'PostgreSQL, Relational schema design, Query optimization (select_related, N+1 prevention)'),
        ('DevOps & Tools:', 'Docker, Git, Linux (Ubuntu, AlmaLinux), Vite build tool'),
        ('Systems:', 'Distributed systems design, TCP socket programming, Master-replica architectures'),
        ('Security Awareness:', 'RBAC, Authentication flows, Session management, Input sanitization'),
    ]
    for label, content in skills_data:
        p = doc.add_paragraph()
        set_paragraph_spacing(p, before=1, after=1, line=1.15)
        run = p.add_run(label + ' ')
        set_run_font(run, size=10.5, bold=True)
        run = p.add_run(content)
        set_run_font(run, size=10.5)

    # --- Education ---
    add_section_heading(doc, 'Education')
    for edu in EDUCATION:
        add_bullet(doc, edu)

    # --- Projects ---
    add_section_heading(doc, 'Projects')

    add_experience_item(doc,
        'Circuit Forge — Custom PC E-Commerce Platform',
        'Personal Project  ·  github.com/ndichia-quincy/circuit-forge',
        '',
        [
            'Built a full-featured e-commerce platform for custom PC building using Django, JavaScript, PostgreSQL, and Docker.',
            'Engineered a dynamic component compatibility checker mapping CPU socket types, RAM standards, and power requirements to prevent invalid builds at checkout.',
            'Integrated real-time inventory tracking with automatic restocking alerts and a multistep checkout workflow.',
            'Designed a responsive glassmorphic UI with custom CSS grid and flexbox layouts.',
        ]
    )
    add_experience_item(doc,
        'Hospital Management System',
        'Personal Project  ·  github.com/ndichia-quincy/hospital-management',
        '',
        [
            'Developed a multi-portal platform with role-based access control for Admins, Doctors, Patients, and Receptionists using Django and PostgreSQL.',
            'Implemented custom Django middleware decorators restricting patient records strictly to authorized attending doctors.',
            'Built interactive appointment scheduler, digital prescription generator, and billing system with audit trails.',
            'Optimized database queries using select_related to eliminate N+1 query patterns in medical record views.',
        ]
    )
    add_experience_item(doc,
        'Replicated Key-Value Store — Distributed System',
        'Personal Project  ·  github.com/ndichia-quincy/replicated-kv-store',
        '',
        [
            'Designed and implemented a fault-tolerant, master-replica key-value store in Python using TCP sockets.',
            'Achieved read-your-writes session consistency by tracking client vector clocks and logical timestamps.',
            'Built automatic heartbeat monitoring with ping-ack loops and quorum-based synchronous write propagation.',
            'Addressed CAP theorem trade-offs through concurrent thread execution and state synchronization across nodes.',
        ]
    )
    add_experience_item(doc,
        'Malware Classification System (ML/Data)',
        'Research Project  ·  github.com/ndichia-quincy/malware-classification',
        '',
        [
            'Built a Python pipeline for static feature extraction from PE binary headers and automated malware family classification.',
            'Implemented SVM, Neural Network, and GAN-augmented classifiers with Scikit-learn and Pandas for model comparison.',
            'Applied SMOTE oversampling and hyperparameter tuning to handle class imbalance and boost recall on rare malware variants.',
        ]
    )

    # --- Core Competencies ---
    add_section_heading(doc, 'Core Competencies')
    competencies = [
        'Full-Stack Web Development — End-to-end feature delivery from database to user interface',
        'System Design — Distributed architectures, fault tolerance, consistency models',
        'Database Engineering — Schema design, query optimization, access control modeling',
        'Analytical Problem Solving — Physics-trained approach to debugging and system reasoning',
        'Technical Documentation — Writing clear READMEs, API docs, and code annotations',
    ]
    for comp in competencies:
        add_bullet(doc, comp)

    # --- Interests ---
    add_section_heading(doc, 'Interests')
    add_body_text(doc, 'Open Source Contribution  ·  Distributed Systems  ·  Linux & Cloud Technologies')

    path = os.path.join(OUTPUT_DIR, 'CV_Ndichia_Quincy_Developer.docx')
    doc.save(path)
    print(f'Saved: {path}')


# ============================================================
# CV 3: TECHNICAL WRITER
# ============================================================

def build_writer_cv():
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    style = doc.styles['Normal']
    style.font.name = 'Outfit'
    style.font.size = Pt(10.5)

    # --- Header ---
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=2)
    run = p.add_run('NDICHIA QUINCY FIEN')
    set_run_font(run, size=16, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=2)
    run = p.add_run('Technical Writer & Documentation Specialist')
    set_run_font(run, size=12, color=(0x55, 0x55, 0x55))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=6)
    run = p.add_run(f'{CONTACT["email"]}  |  {CONTACT["phone"]}  |  {CONTACT["address"]}')
    set_run_font(run, size=9.5, color=(0x66, 0x66, 0x66))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, before=0, after=8)
    run = p.add_run(f'{CONTACT["github"]}  |  Portfolio: yoursite.com/?role=writer  |  Blog at portfolio')
    set_run_font(run, size=9.5, color=(0x66, 0x66, 0x66))

    # --- Professional Summary ---
    add_section_heading(doc, 'Professional Summary')
    add_body_text(doc,
        'Technical writer with a unique cross-disciplinary background spanning cybersecurity, software development, '
        'and physics. Skilled at translating complex technical concepts into clear, precise, and accessible documentation. '
        'Experienced in writing academic research reports, project documentation, technical blog posts, and user guides. '
        'Combines hands-on technical knowledge with rigorous writing methodology to produce documentation that engineers trust.',
        size=10.5,
    )

    # --- Writing & Technical Skills ---
    add_section_heading(doc, 'Writing & Technical Skills')
    skills_data = [
        ('Writing & Editing:', 'Technical documentation, research reports, user guides, API documentation, blog posts, academic papers'),
        ('Tools:', 'LaTeX, MS Word, Markdown, Git (version-controlled docs), Excel (data analysis & visualization)'),
        ('Research Methods:', 'Qualitative and quantitative research, thematic analysis, literature review, data curation'),
        ('Technical Domains:', 'Cybersecurity (network security, IAM, threat analysis), Software development (Python, Django), Linux systems'),
        ('Languages:', 'English (Professional, native-level written fluency), French (Intermediate)'),
    ]
    for label, content in skills_data:
        p = doc.add_paragraph()
        set_paragraph_spacing(p, before=1, after=1, line=1.15)
        run = p.add_run(label + ' ')
        set_run_font(run, size=10.5, bold=True)
        run = p.add_run(content)
        set_run_font(run, size=10.5)

    # --- Education ---
    add_section_heading(doc, 'Education')
    for edu in EDUCATION:
        add_bullet(doc, edu)

    # --- Writing Samples & Projects ---
    add_section_heading(doc, 'Writing Samples & Projects')

    add_experience_item(doc,
        'Cyberspace Ethics & AI Research Report (Master\'s Level)',
        'University of Bamenda',
        '',
        [
            'Designed and conducted a qualitative research study analyzing student perspectives on generative AI in academic settings.',
            'Performed thematic analysis on interview transcripts following established qualitative research methodology.',
            'Produced a comprehensive master\'s-level analytical report meeting rigorous academic writing standards.',
        ]
    )
    add_experience_item(doc,
        'Malware Detection Research — Technical Report',
        'Academic Research Project',
        '',
        [
            'Authored the full technical report for a machine learning malware classification study covering methodology design, experimental results, and security implications.',
            'Documented complex ML workflows including feature extraction pipelines, SVM vs. Neural Network comparison, and performance benchmarking in accessible language.',
            'Created clear data visualizations and structured analysis sections suitable for both technical and semi-technical audiences.',
        ]
    )
    add_experience_item(doc,
        'Technical Blog — Portfolio',
        'Personal Project',
        '',
        [
            'Write and publish technical articles covering cybersecurity, distributed systems, and software development topics.',
            'Built a custom markdown parser and blog platform from scratch to showcase technical writing alongside engineering skills.',
            'Topics include: Suricata IDS setup and rule tuning, session consistency in distributed systems, and static malware classification.',
        ]
    )
    add_experience_item(doc,
        'Project Documentation Portfolio',
        'Multiple Open-Source Projects',
        '',
        [
            'Wrote comprehensive READMEs, setup guides, and inline code documentation for Python/Django web applications and distributed systems projects.',
            'Documented security configurations including firewall rules, SSH authentication flows, and IAM policy matrices.',
            'Created user-facing documentation translating system architecture decisions into clear usage guides.',
        ]
    )

    # --- Core Competencies ---
    add_section_heading(doc, 'Core Competencies')
    competencies = [
        'Technical Writing — Transforming complex engineering concepts into clear, structured documentation',
        'Research & Analysis — Methodical investigation, data interpretation, and evidence-based reporting',
        'Editing & Precision — Meticulous grammar, consistent terminology, adherence to style guides',
        'Cross-Domain Fluency — Comfortable writing on cybersecurity, software development, and academic research topics',
        'Tool Proficiency — Expert in LaTeX for academic writing, Markdown for developer docs, MS Word for business formats',
    ]
    for comp in competencies:
        add_bullet(doc, comp)

    # --- Interests ---
    add_section_heading(doc, 'Interests')
    add_body_text(doc, 'Technical Research & Documentation  ·  Cybersecurity Trends  ·  African History & Current Events')

    path = os.path.join(OUTPUT_DIR, 'CV_Ndichia_Quincy_Writer.docx')
    doc.save(path)
    print(f'Saved: {path}')


# ============================================================
# BUILD ALL
# ============================================================

if __name__ == '__main__':
    build_cybersecurity_cv()
    build_developer_cv()
    build_writer_cv()
    print('\nAll 3 CVs generated successfully.')
