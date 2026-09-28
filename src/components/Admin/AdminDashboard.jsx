import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  Download,
  Upload,
  RefreshCw,
  Eye,
  MoveUp,
  MoveDown,
  Sparkles,
  Code,
  FileCode,
  Lock,
  LogOut,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { renderMarkdownToJSX } from '../../utils/markdown';
import './AdminDashboard.css';

const TEMPLATES = {
  architecture: `---
title: "System Architecture & Security Specification"
category: "Cybersecurity"
tags: ["Architecture", "Security", "Cloud", "Zero-Trust"]
summary: "Formal technical specification defining system components, boundary security, and zero-trust data flows."
readTime: "6 min read"
---

### 1. Executive Summary
This document establishes the technical architecture and security boundaries for our production infrastructure.

### 2. Component Diagram & Flow
The application follows a decoupled tier architecture:
- **Frontend Layer**: React SPA with strict CSP (Content Security Policy)
- **API Gateway**: Reverse proxy enforcing rate limiting and IP filtering
- **Backend Service**: Django REST framework with JWT token authentication
- **Persistence Layer**: PostgreSQL database with encrypted data at rest

### 3. Threat Matrix & Controls
\`\`\`text
+-------------------+----------------------------+-----------------------+
| Threat Vector     | Attack Surface             | Mitigation Control    |
+-------------------+----------------------------+-----------------------+
| Credential Theft  | Login endpoints            | Rate limiting + 2FA  |
| Injection Attack  | Search / Form parameters   | ORM parameterized SQL |
| Data Interception | Traffic in transit         | TLS 1.3 Strict HTTPS  |
+-------------------+----------------------------+-----------------------+
\`\`\`

### 4. Implementation Guidelines
All code commits must pass automated dependency vulnerability scanning before deployment.`,

  securityAudit: `---
title: "Vulnerability Assessment & Threat Model"
category: "Cybersecurity"
tags: ["Security", "Threat Model", "STRIDE", "Pentest"]
summary: "In-depth threat evaluation using the STRIDE framework and mitigation recommendations."
readTime: "8 min read"
---

### 1. Overview & Scope
Assessment of security vulnerabilities across public-facing API interfaces and database permissions.

### 2. STRIDE Analysis Breakdown
1. **Spoofing**: Identity verification enforced using cryptographic tokens.
2. **Tampering**: Signatures validated on payloads.
3. **Repudiation**: Append-only auditing logs enabled.
4. **Information Disclosure**: Sensitive data fields obfuscated before logging.
5. **Denial of Service**: Gateway token bucket algorithm rate-limiting.
6. **Elevation of Privilege**: Least privilege access policy across services.

\`\`\`python
# Example Boundary Input Sanitizer
def validate_secure_payload(payload):
    if not isinstance(payload, dict):
        raise ValueError("Invalid payload type")
    # Enforce strict field checking
    allowed_keys = {'user_id', 'action', 'timestamp'}
    if set(payload.keys()) != allowed_keys:
        raise SecurityViolation("Unauthorized keys in payload")
    return True
\`\`\`

### 3. Recommendations
- Implement automated vulnerability scanning in CI/CD pipeline.
- Enforce quarterly credential rotation policies.`,

  devmortem: `---
title: "DevSecOps Engineering Post-Mortem"
category: "Web Development"
tags: ["Django", "React", "PostgreSQL", "Docker", "DevSecOps"]
summary: "Technical breakdown of performance optimization and container security enhancements."
readTime: "5 min read"
---

### The Problem
During peak load testing, database connection pool exhaustion caused elevated latencies.

### Technical Diagnosis
Unoptimized relational queries resulted in N+1 database hits on complex nested data endpoints.

### The Solution
1. Applied Django \`.select_related()\` and \`.prefetch_related()\` to reduce query count from 45 to 2.
2. Integrated Redis cache for read-heavy static reference schemas.

\`\`\`bash
# Docker Compose Security Constraint snippet
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
\`\`\`

### Key Learnings
- Benchmark query performance at high dataset volumes early in development.
- Secure container runtime settings to limit impact of potential container escapes.`,
};

export default function AdminDashboard({ onClose }) {
  const {
    profile,
    updateProfile,
    journey,
    addJourneyItem,
    updateJourneyItem,
    deleteJourneyItem,
    reorderJourney,
    technicalDocs,
    saveTechnicalDoc,
    deleteTechnicalDoc,
    resetToDefaults,
    exportData,
    importData,
    updatePin,
    logoutAdmin,
    showToast,
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');

  // Local state for profile form
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [newDetailText, setNewDetailText] = useState('');
  const [newEduForm, setNewEduForm] = useState({ degree: '', institution: '', status: '' });

  // Local state for journey milestone creation / editing
  const [editingJourneyId, setEditingJourneyId] = useState(null);
  const [journeyForm, setJourneyForm] = useState({ year: '', title: '', subtitle: '', description: '' });

  // Local state for technical document studio
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docSearch, setDocSearch] = useState('');
  const [docFilterCategory, setDocFilterCategory] = useState('All');
  const [docForm, setDocForm] = useState({
    id: '',
    title: '',
    category: 'Cybersecurity',
    tags: '',
    summary: '',
    readTime: '5 min read',
    date: new Date().toISOString().split('T')[0],
    status: 'published',
    content: '',
  });

  // Local state for Security settings
  const [newPinInput, setNewPinInput] = useState('');
  const [jsonImportInput, setJsonImportInput] = useState('');

  // ── Profile Handlers ──
  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
  };

  const handleAddAboutDetail = () => {
    if (!newDetailText.trim()) return;
    setProfileForm((prev) => ({
      ...prev,
      aboutDetails: [...(prev.aboutDetails || []), newDetailText.trim()],
    }));
    setNewDetailText('');
  };

  const handleRemoveAboutDetail = (index) => {
    setProfileForm((prev) => ({
      ...prev,
      aboutDetails: prev.aboutDetails.filter((_, i) => i !== index),
    }));
  };

  const handleAddEducation = () => {
    if (!newEduForm.degree.trim() || !newEduForm.institution.trim()) return;
    setProfileForm((prev) => ({
      ...prev,
      education: [...(prev.education || []), { ...newEduForm }],
    }));
    setNewEduForm({ degree: '', institution: '', status: '' });
  };

  const handleRemoveEducation = (index) => {
    setProfileForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // ── Journey Handlers ──
  const handleStartNewJourney = () => {
    setEditingJourneyId('new');
    setJourneyForm({ year: '', title: '', subtitle: '', description: '' });
  };

  const handleStartEditJourney = (item) => {
    setEditingJourneyId(item.id);
    setJourneyForm({ ...item });
  };

  const handleSaveJourney = (e) => {
    e.preventDefault();
    if (!journeyForm.title.trim() || !journeyForm.year.trim()) {
      showToast('Year and Title are required.', 'error');
      return;
    }

    if (editingJourneyId === 'new') {
      addJourneyItem(journeyForm);
    } else {
      updateJourneyItem(editingJourneyId, journeyForm);
    }
    setEditingJourneyId(null);
    setJourneyForm({ year: '', title: '', subtitle: '', description: '' });
  };

  const handleMoveJourney = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= journey.length) return;
    const newList = [...journey];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    reorderJourney(newList);
  };

  // ── Technical Document Studio Handlers ──
  const handleSelectDoc = (doc) => {
    setSelectedDocId(doc.id);
    setDocForm({
      id: doc.id,
      title: doc.title || '',
      category: doc.category || 'Cybersecurity',
      tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : doc.tags || '',
      summary: doc.summary || '',
      readTime: doc.readTime || '5 min read',
      date: doc.date || new Date().toISOString().split('T')[0],
      status: doc.status || 'published',
      content: doc.content || '',
    });
  };

  const handleNewDoc = () => {
    setSelectedDocId('new');
    setDocForm({
      id: '',
      title: '',
      category: 'Cybersecurity',
      tags: 'Cybersecurity, Architecture, Documentation',
      summary: '',
      readTime: '5 min read',
      date: new Date().toISOString().split('T')[0],
      status: 'published',
      content: '### Executive Overview\nWrite your technical document content here in Markdown format.\n\n```python\n# Add code samples, diagrams, or architecture specs\nprint("Hello Technical Document")\n```',
    });
  };

  const handleApplyTemplate = (templateKey) => {
    const raw = TEMPLATES[templateKey];
    if (!raw) return;
    // Extract metadata & content simple parse
    const lines = raw.split('\n');
    let title = 'Technical Specification';
    let category = 'Cybersecurity';
    let tags = 'Architecture, Security';
    let summary = '';
    let readTime = '5 min read';
    let content = raw;

    if (lines[0] === '---') {
      const endYaml = lines.indexOf('---', 1);
      if (endYaml > 0) {
        const yamlLines = lines.slice(1, endYaml);
        yamlLines.forEach((l) => {
          if (l.startsWith('title:')) title = l.replace('title:', '').trim().replace(/^["']|["']$/g, '');
          if (l.startsWith('category:')) category = l.replace('category:', '').trim().replace(/^["']|["']$/g, '');
          if (l.startsWith('summary:')) summary = l.replace('summary:', '').trim().replace(/^["']|["']$/g, '');
          if (l.startsWith('readTime:')) readTime = l.replace('readTime:', '').trim().replace(/^["']|["']$/g, '');
        });
        content = lines.slice(endYaml + 1).join('\n').trim();
      }
    }

    setDocForm((prev) => ({
      ...prev,
      title,
      category,
      tags,
      summary,
      readTime,
      content,
    }));

    showToast(`Template "${templateKey}" applied to editor!`);
  };

  const handleSaveDoc = (e) => {
    e.preventDefault();
    if (!docForm.title.trim()) {
      showToast('Document Title is required.', 'error');
      return;
    }
    saveTechnicalDoc(docForm);
  };

  const insertMarkdownSyntax = (prefix, suffix = '') => {
    const textarea = document.getElementById('doc-editor-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = docForm.content.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = docForm.content.substring(0, start) + replacement + docForm.content.substring(end);
    setDocForm((prev) => ({ ...prev, content: newContent }));
  };

  // Filtered Docs
  const filteredDocs = technicalDocs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.summary.toLowerCase().includes(docSearch.toLowerCase());
    const matchesCategory = docFilterCategory === 'All' || d.category === docFilterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-dashboard-container">
      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <div className="admin-brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="admin-brand-title">Admin Dashboard</h1>
            <span className="admin-status-badge">
              <span className="status-dot"></span> Live Data Controller
            </span>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <button onClick={onClose} className="btn-admin-nav" title="View Live Portfolio Site">
            <Eye size={16} /> View Site
          </button>
          <button onClick={exportData} className="btn-admin-nav" title="Export Backup JSON">
            <Download size={16} /> Export Backup
          </button>
          <button onClick={logoutAdmin} className="btn-admin-nav btn-logout" title="Exit Admin Portal">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="admin-main-wrapper">
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar">
          <nav className="admin-nav-list">
            <button
              onClick={() => setActiveTab('overview')}
              className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={18} /> Profile & Job Title
            </button>
            <button
              onClick={() => setActiveTab('journey')}
              className={`admin-nav-item ${activeTab === 'journey' ? 'active' : ''}`}
            >
              <Briefcase size={18} /> Journey & Timeline
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`admin-nav-item ${activeTab === 'documents' ? 'active' : ''}`}
            >
              <FileText size={18} /> Technical Documents ({technicalDocs.length})
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`admin-nav-item ${activeTab === 'system' ? 'active' : ''}`}
            >
              <Settings size={18} /> Backup & Settings
            </button>
          </nav>

          {/* Quick Active Title Widget */}
          <div className="sidebar-quick-info glass-panel">
            <span className="quick-info-label">Active Job Title</span>
            <p className="quick-info-value">{profile.title}</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="admin-content-area">
          {/* ──────────────── TAB 1: OVERVIEW ──────────────── */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Dashboard Overview</h2>
                <p>Welcome to your central control panel. Manage your portfolio data in real time.</p>
              </div>

              {/* Metric Cards */}
              <div className="overview-stats-grid">
                <div className="stat-card glass-panel">
                  <div className="stat-card-header">
                    <User size={20} className="stat-icon-gold" />
                    <span className="stat-card-title">Job Title</span>
                  </div>
                  <h3 className="stat-card-value">{profile.title}</h3>
                  <p className="stat-card-sub">{profile.name}</p>
                  <button onClick={() => setActiveTab('profile')} className="stat-link-btn">
                    Edit Title →
                  </button>
                </div>

                <div className="stat-card glass-panel">
                  <div className="stat-card-header">
                    <Briefcase size={20} className="stat-icon-gold" />
                    <span className="stat-card-title">Journey Milestones</span>
                  </div>
                  <h3 className="stat-card-value">{journey.length}</h3>
                  <p className="stat-card-sub">Career Timeline Items</p>
                  <button onClick={() => setActiveTab('journey')} className="stat-link-btn">
                    Manage Timeline →
                  </button>
                </div>

                <div className="stat-card glass-panel">
                  <div className="stat-card-header">
                    <FileText size={20} className="stat-icon-gold" />
                    <span className="stat-card-title">Technical Documents</span>
                  </div>
                  <h3 className="stat-card-value">{technicalDocs.length}</h3>
                  <p className="stat-card-sub">
                    {technicalDocs.filter((d) => d.status === 'published').length} Published ·{' '}
                    {technicalDocs.filter((d) => d.status === 'draft').length} Drafts
                  </p>
                  <button onClick={() => setActiveTab('documents')} className="stat-link-btn">
                    Write Document →
                  </button>
                </div>
              </div>

              {/* Quick Job Title Updater */}
              <div className="admin-card glass-panel margin-top-lg">
                <h3 className="card-section-title">
                  <Sparkles size={18} /> Quick Job Title & Headline Update
                </h3>
                <div className="quick-form-grid">
                  <div className="admin-form-group">
                    <label>Current Job Title</label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Headline Tagline</label>
                    <input
                      type="text"
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>
                <div className="card-actions-right">
                  <button onClick={handleProfileSave} className="btn-admin-primary">
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>

              {/* Recent Technical Documents Table */}
              <div className="admin-card glass-panel margin-top-lg">
                <div className="card-header-flex">
                  <h3 className="card-section-title">
                    <FileCode size={18} /> Recent Technical Documents
                  </h3>
                  <button onClick={handleNewDoc} className="btn-admin-secondary">
                    <Plus size={14} /> Write New Document
                  </button>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {technicalDocs.slice(0, 5).map((doc) => (
                        <tr key={doc.id}>
                          <td className="font-semibold">{doc.title}</td>
                          <td>
                            <span className="badge-pill">{doc.category}</span>
                          </td>
                          <td>{doc.date}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                doc.status === 'published' ? 'status-published' : 'status-draft'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                handleSelectDoc(doc);
                                setActiveTab('documents');
                              }}
                              className="btn-icon-action"
                              title="Edit document"
                            >
                              <Edit size={16} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 2: PROFILE & JOB TITLE ──────────────── */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Profile & Job Title Settings</h2>
                <p>Update your personal information, job title, biography, and academic credentials.</p>
              </div>

              <form onSubmit={handleProfileSave} className="admin-form-stack">
                <div className="admin-card glass-panel">
                  <h3 className="card-section-title">Core Identity</h3>
                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Avatar Monogram Symbol</label>
                      <input
                        type="text"
                        value={profileForm.avatarSymbol}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, avatarSymbol: e.target.value })
                        }
                        className="admin-input"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group margin-top-md">
                    <label>Job Title (Displayed on Hero & Navigation)</label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="admin-input input-highlight"
                    />
                  </div>

                  <div className="admin-form-group margin-top-md">
                    <label>Headline Tagline</label>
                    <input
                      type="text"
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-form-group margin-top-md">
                    <label>Hero Short Bio</label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="admin-textarea"
                    />
                  </div>

                  <div className="admin-form-group margin-top-md">
                    <label>About Me Detailed Summary</label>
                    <textarea
                      rows={4}
                      value={profileForm.summary}
                      onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })}
                      className="admin-textarea"
                    />
                  </div>
                </div>

                {/* About Me Details Bullet Points */}
                <div className="admin-card glass-panel">
                  <h3 className="card-section-title">About Me Highlight Bullet Points</h3>
                  <div className="items-list-container">
                    {(profileForm.aboutDetails || []).map((detail, idx) => (
                      <div key={idx} className="list-item-row">
                        <span className="item-number">{idx + 1}.</span>
                        <input
                          type="text"
                          value={detail}
                          onChange={(e) => {
                            const updated = [...profileForm.aboutDetails];
                            updated[idx] = e.target.value;
                            setProfileForm({ ...profileForm, aboutDetails: updated });
                          }}
                          className="admin-input input-flex"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAboutDetail(idx)}
                          className="btn-icon-delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="add-item-row margin-top-md">
                    <input
                      type="text"
                      placeholder="Add new highlight point..."
                      value={newDetailText}
                      onChange={(e) => setNewDetailText(e.target.value)}
                      className="admin-input input-flex"
                    />
                    <button type="button" onClick={handleAddAboutDetail} className="btn-admin-secondary">
                      <Plus size={16} /> Add Point
                    </button>
                  </div>
                </div>

                {/* Academic Credentials */}
                <div className="admin-card glass-panel">
                  <h3 className="card-section-title">Academic Credentials</h3>
                  <div className="items-list-container">
                    {(profileForm.education || []).map((edu, idx) => (
                      <div key={idx} className="education-item-card">
                        <div className="form-grid-3">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...profileForm.education];
                              updated[idx].degree = e.target.value;
                              setProfileForm({ ...profileForm, education: updated });
                            }}
                            placeholder="Degree"
                            className="admin-input"
                          />
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...profileForm.education];
                              updated[idx].institution = e.target.value;
                              setProfileForm({ ...profileForm, education: updated });
                            }}
                            placeholder="Institution"
                            className="admin-input"
                          />
                          <div className="flex-row-center">
                            <input
                              type="text"
                              value={edu.status}
                              onChange={(e) => {
                                const updated = [...profileForm.education];
                                updated[idx].status = e.target.value;
                                setProfileForm({ ...profileForm, education: updated });
                              }}
                              placeholder="Status"
                              className="admin-input"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveEducation(idx)}
                              className="btn-icon-delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="add-education-box margin-top-md">
                    <h4>Add Academic Credential</h4>
                    <div className="form-grid-3">
                      <input
                        type="text"
                        placeholder="Degree Title"
                        value={newEduForm.degree}
                        onChange={(e) => setNewEduForm({ ...newEduForm, degree: e.target.value })}
                        className="admin-input"
                      />
                      <input
                        type="text"
                        placeholder="University / Institution"
                        value={newEduForm.institution}
                        onChange={(e) => setNewEduForm({ ...newEduForm, institution: e.target.value })}
                        className="admin-input"
                      />
                      <input
                        type="text"
                        placeholder="Status (e.g. Graduate Student)"
                        value={newEduForm.status}
                        onChange={(e) => setNewEduForm({ ...newEduForm, status: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <button type="button" onClick={handleAddEducation} className="btn-admin-secondary margin-top-sm">
                      <Plus size={16} /> Add Academic Item
                    </button>
                  </div>
                </div>

                <div className="form-save-bar">
                  <button type="submit" className="btn-admin-primary btn-large">
                    <Save size={18} /> Save All Profile & Job Title Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ──────────────── TAB 3: JOURNEY & TIMELINE ──────────────── */}
          {activeTab === 'journey' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Journey & Career Timeline</h2>
                <p>Add, edit, reorder, or delete career milestones and professional growth phases.</p>
              </div>

              {/* Action Bar */}
              <div className="admin-action-bar">
                <button onClick={handleStartNewJourney} className="btn-admin-primary">
                  <Plus size={16} /> Add New Milestone
                </button>
              </div>

              {/* Add / Edit Form Modal or Panel */}
              {editingJourneyId && (
                <div className="admin-card glass-panel edit-journey-card margin-bottom-lg">
                  <h3>{editingJourneyId === 'new' ? 'Add New Journey Milestone' : 'Edit Journey Milestone'}</h3>
                  <form onSubmit={handleSaveJourney} className="margin-top-md">
                    <div className="form-grid-2">
                      <div className="admin-form-group">
                        <label>Year Range (e.g. 2024 - Present)</label>
                        <input
                          type="text"
                          value={journeyForm.year}
                          onChange={(e) => setJourneyForm({ ...journeyForm, year: e.target.value })}
                          className="admin-input"
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Milestone Title</label>
                        <input
                          type="text"
                          value={journeyForm.title}
                          onChange={(e) => setJourneyForm({ ...journeyForm, title: e.target.value })}
                          className="admin-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-form-group margin-top-md">
                      <label>Subtitle / Institution / Focus Area</label>
                      <input
                        type="text"
                        value={journeyForm.subtitle}
                        onChange={(e) => setJourneyForm({ ...journeyForm, subtitle: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-group margin-top-md">
                      <label>Description & Achievements</label>
                      <textarea
                        rows={4}
                        value={journeyForm.description}
                        onChange={(e) => setJourneyForm({ ...journeyForm, description: e.target.value })}
                        className="admin-textarea"
                      />
                    </div>

                    <div className="card-actions-right margin-top-md">
                      <button
                        type="button"
                        onClick={() => setEditingJourneyId(null)}
                        className="btn-admin-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-admin-primary">
                        <Save size={16} /> Save Milestone
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Journey Milestones List */}
              <div className="journey-admin-list">
                {journey.map((item, idx) => (
                  <div key={item.id} className="journey-admin-item glass-panel">
                    <div className="journey-item-header">
                      <div>
                        <span className="journey-year-tag">{item.year}</span>
                        <h3 className="journey-item-title">{item.title}</h3>
                        <h4 className="journey-item-sub">{item.subtitle}</h4>
                      </div>
                      <div className="journey-item-actions">
                        <button
                          onClick={() => handleMoveJourney(idx, -1)}
                          disabled={idx === 0}
                          className="btn-icon-nav"
                          title="Move Up"
                        >
                          <MoveUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveJourney(idx, 1)}
                          disabled={idx === journey.length - 1}
                          className="btn-icon-nav"
                          title="Move Down"
                        >
                          <MoveDown size={16} />
                        </button>
                        <button
                          onClick={() => handleStartEditJourney(item)}
                          className="btn-icon-nav"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteJourneyItem(item.id)}
                          className="btn-icon-delete"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="journey-item-desc">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ──────────────── TAB 4: TECHNICAL DOCUMENTS STUDIO ──────────────── */}
          {activeTab === 'documents' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Technical Document & Blog Studio</h2>
                <p>Write, format, and publish technical documentation, architecture specs, and security guides.</p>
              </div>

              {/* Studio Split Layout */}
              <div className="docs-studio-wrapper">
                {/* Docs Sidebar List */}
                <div className="docs-sidebar-list glass-panel">
                  <div className="docs-sidebar-header">
                    <button onClick={handleNewDoc} className="btn-admin-primary btn-full-width">
                      <Plus size={16} /> Write New Document
                    </button>
                  </div>

                  <div className="docs-search-box" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      className="admin-input-sm"
                    />
                    <select
                      value={docFilterCategory}
                      onChange={(e) => setDocFilterCategory(e.target.value)}
                      className="admin-select"
                      style={{ fontSize: '0.78rem', padding: '0.4rem' }}
                    >
                      <option value="All">All Categories</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Distributed Systems">Distributed Systems</option>
                      <option value="Cloud Architecture">Cloud Architecture</option>
                      <option value="SecOps">SecOps</option>
                      <option value="Career & Personal">Career & Personal</option>
                    </select>
                  </div>

                  <div className="docs-items-scroll">
                    {filteredDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectDoc(doc)}
                        className={`doc-list-item ${selectedDocId === doc.id ? 'active' : ''}`}
                      >
                        <div className="doc-item-meta">
                          <span className="doc-cat">{doc.category}</span>
                          <span className={`doc-status status-${doc.status}`}>{doc.status}</span>
                        </div>
                        <h4 className="doc-item-title">{doc.title}</h4>
                        <span className="doc-item-date">{doc.date} · {doc.readTime}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Markdown Editor & Live Preview */}
                <div className="docs-editor-pane glass-panel">
                  {selectedDocId ? (
                    <form onSubmit={handleSaveDoc} className="doc-editor-form">
                      <div className="editor-meta-grid">
                        <div className="admin-form-group">
                          <label>Document Title</label>
                          <input
                            type="text"
                            value={docForm.title}
                            onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                            placeholder="Enter Technical Document Title..."
                            className="admin-input input-highlight"
                            required
                          />
                        </div>

                        <div className="form-grid-3 margin-top-sm">
                          <div className="admin-form-group">
                            <label>Category</label>
                            <select
                              value={docForm.category}
                              onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                              className="admin-select"
                            >
                              <option value="Cybersecurity">Cybersecurity</option>
                              <option value="Web Development">Web Development</option>
                              <option value="Distributed Systems">Distributed Systems</option>
                              <option value="Cloud Architecture">Cloud Architecture</option>
                              <option value="SecOps">SecOps</option>
                              <option value="Career & Personal">Career & Personal</option>
                            </select>
                          </div>

                          <div className="admin-form-group">
                            <label>Estimated Read Time</label>
                            <input
                              type="text"
                              value={docForm.readTime}
                              onChange={(e) => setDocForm({ ...docForm, readTime: e.target.value })}
                              className="admin-input"
                            />
                          </div>

                          <div className="admin-form-group">
                            <label>Status</label>
                            <select
                              value={docForm.status}
                              onChange={(e) => setDocForm({ ...docForm, status: e.target.value })}
                              className="admin-select"
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                            </select>
                          </div>
                        </div>

                        <div className="admin-form-group margin-top-sm">
                          <label>Tags (Comma separated)</label>
                          <input
                            type="text"
                            value={docForm.tags}
                            onChange={(e) => setDocForm({ ...docForm, tags: e.target.value })}
                            placeholder="Django, Security, PostgreSQL, Docker"
                            className="admin-input"
                          />
                        </div>

                        <div className="admin-form-group margin-top-sm">
                          <label>Summary / Post-Mortem Abstract</label>
                          <textarea
                            rows={2}
                            value={docForm.summary}
                            onChange={(e) => setDocForm({ ...docForm, summary: e.target.value })}
                            placeholder="Short summary displayed in article cards..."
                            className="admin-textarea"
                          />
                        </div>
                      </div>

                      {/* Formatting Toolbar */}
                      <div className="markdown-toolbar-bar">
                        <span className="toolbar-label">Format:</span>
                        <button type="button" onClick={() => insertMarkdownSyntax('**', '**')} className="btn-toolbar" title="Bold">
                          <strong>B</strong>
                        </button>
                        <button type="button" onClick={() => insertMarkdownSyntax('*', '*')} className="btn-toolbar" title="Italic">
                          <em>I</em>
                        </button>
                        <button type="button" onClick={() => insertMarkdownSyntax('### ')} className="btn-toolbar" title="Heading 3">
                          H3
                        </button>
                        <button type="button" onClick={() => insertMarkdownSyntax('```python\n', '\n```')} className="btn-toolbar" title="Code Block">
                          <Code size={14} /> Code
                        </button>
                        <button type="button" onClick={() => insertMarkdownSyntax('[', '](https://)')} className="btn-toolbar" title="Link">
                          Link
                        </button>
                        <button type="button" onClick={() => insertMarkdownSyntax('- ')} className="btn-toolbar" title="List Item">
                          List
                        </button>

                        <div className="toolbar-spacer" />

                        {/* Quick Templates */}
                        <div className="quick-templates-group">
                          <span className="toolbar-label">Insert Template:</span>
                          <button type="button" onClick={() => handleApplyTemplate('architecture')} className="btn-toolbar-pill">
                            Architecture Spec
                          </button>
                          <button type="button" onClick={() => handleApplyTemplate('securityAudit')} className="btn-toolbar-pill">
                            Security Audit
                          </button>
                          <button type="button" onClick={() => handleApplyTemplate('devmortem')} className="btn-toolbar-pill">
                            Dev Post-Mortem
                          </button>
                        </div>
                      </div>

                      {/* Split Editor + Preview */}
                      <div className="split-editor-container">
                        <div className="editor-pane-half">
                          <label className="editor-pane-label">Markdown Source</label>
                          <textarea
                            id="doc-editor-textarea"
                            rows={16}
                            value={docForm.content}
                            onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
                            className="admin-textarea editor-code-font"
                            placeholder="Write your technical document using Markdown..."
                          />
                        </div>

                        <div className="preview-pane-half">
                          <label className="editor-pane-label">Live Document Preview</label>
                          <div className="markdown-preview-box">
                            <h2 className="preview-title">{docForm.title || 'Untitled Document'}</h2>
                            <div className="preview-meta">
                              <span>{docForm.category}</span> · <span>{docForm.date}</span> · <span>{docForm.readTime}</span>
                            </div>
                            <div className="preview-body">
                              {renderMarkdownToJSX(docForm.content)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Editor Save & Delete Bar */}
                      <div className="editor-action-bar">
                        {docForm.id && (
                          <button
                            type="button"
                            onClick={() => deleteTechnicalDoc(docForm.id)}
                            className="btn-admin-danger"
                          >
                            <Trash2 size={16} /> Delete Document
                          </button>
                        )}
                        <div className="spacer" />
                        <button type="submit" className="btn-admin-primary btn-large">
                          <Save size={18} /> Save & Publish Document
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="empty-studio-state">
                      <FileCode size={48} className="empty-icon-gold" />
                      <h3>Technical Document Studio</h3>
                      <p>Select an existing document from the left or create a new one to begin writing.</p>
                      <button onClick={handleNewDoc} className="btn-admin-primary margin-top-md">
                        <Plus size={16} /> Create New Technical Document
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 5: SYSTEM & BACKUP ──────────────── */}
          {activeTab === 'system' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Backup & Security Settings</h2>
                <p>Manage data persistence, backup JSON exports, data imports, and security access PINs.</p>
              </div>

              <div className="admin-card glass-panel">
                <h3 className="card-section-title">
                  <Download size={18} /> Export / Backup Portfolio Data
                </h3>
                <p className="card-desc">
                  Download your entire portfolio configuration (profile, job titles, journey timeline, and technical documents) as a formatted JSON backup file.
                </p>
                <button onClick={exportData} className="btn-admin-primary margin-top-sm">
                  <Download size={16} /> Download Backup JSON
                </button>
              </div>

              <div className="admin-card glass-panel margin-top-lg">
                <h3 className="card-section-title">
                  <Upload size={18} /> Restore / Import Portfolio Data
                </h3>
                <p className="card-desc">Paste your JSON backup data below to restore your portfolio configuration.</p>
                <textarea
                  rows={4}
                  placeholder="Paste JSON backup data here..."
                  value={jsonImportInput}
                  onChange={(e) => setJsonImportInput(e.target.value)}
                  className="admin-textarea editor-code-font margin-top-sm"
                />
                <button
                  onClick={() => {
                    if (jsonImportInput) {
                      const success = importData(jsonImportInput);
                      if (success) setJsonImportInput('');
                    }
                  }}
                  className="btn-admin-secondary margin-top-sm"
                >
                  <Upload size={16} /> Import Portfolio Data
                </button>
              </div>

              <div className="admin-card glass-panel margin-top-lg">
                <h3 className="card-section-title">
                  <Lock size={18} /> Change Admin Access Security PIN
                </h3>
                <div className="admin-form-group margin-top-sm" style={{ maxWidth: '300px' }}>
                  <label>New Security PIN Code</label>
                  <input
                    type="text"
                    placeholder="Enter new PIN"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="admin-input"
                  />
                  <button
                    onClick={() => {
                      if (newPinInput.trim()) {
                        updatePin(newPinInput.trim());
                        setNewPinInput('');
                      }
                    }}
                    className="btn-admin-secondary margin-top-sm"
                  >
                    <Save size={16} /> Update Security PIN
                  </button>
                </div>
              </div>

              <div className="admin-card glass-panel margin-top-lg card-danger-zone">
                <h3 className="card-section-title danger-title">
                  <RefreshCw size={18} /> Reset All Portfolio Data
                </h3>
                <p className="card-desc">
                  Reset all custom edits back to initial hardcoded default profiles, journey, and blog files.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all data back to default?')) {
                      resetToDefaults();
                    }
                  }}
                  className="btn-admin-danger margin-top-sm"
                >
                  <RefreshCw size={16} /> Reset Portfolio to Defaults
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
