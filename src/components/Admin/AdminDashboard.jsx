import React, { useState } from 'react';
import {
  Shield, LayoutDashboard, User, Briefcase, FileText, Settings, Plus, Trash2,
  Edit, Save, Download, Upload, RefreshCw, Eye, MoveUp, MoveDown, Sparkles,
  FileCode, LogOut, Award, Layers, ExternalLink, Code,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

const EMPTY_DOC = () => ({
  id: '',
  title: '',
  category: 'Cybersecurity',
  tags: '',
  summary: '',
  readTime: '5 min read',
  date: new Date().toISOString().split('T')[0],
  status: 'published',
  fileUrl: '',
  fileName: '',
  fileType: '',
});

const EMPTY_PROJECT = () => ({
  id: '',
  title: '',
  description: '',
  longDescription: '',
  technologies: '',
  features: '',
  challengesSolved: '',
  lessonsLearned: '',
  githubLink: '',
  demoLink: '',
  tags: '',
  featured: false,
});

const EMPTY_SERVICE = () => ({ id: '', title: '', icon: 'FileText', tagline: '', details: '' });
const EMPTY_CERT = () => ({ id: '', name: '', issuer: '', status: 'Earned', date: '', credentialId: '', verifyUrl: '' });
const EMPTY_PILLAR = () => ({ id: '', title: '', description: '', items: '' });

const splitList = (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : v || []);

export default function AdminDashboard({ onClose }) {
  const {
    profile, updateProfile,
    journey, addJourneyItem, updateJourneyItem, deleteJourneyItem, reorderJourney,
    technicalDocs, saveTechnicalDoc, deleteTechnicalDoc,
    projects, saveProject, deleteProject, reorderProjects,
    skills, saveSkills,
    services, saveService, deleteService, reorderServices,
    certifications, saveCertification, deleteCertification, reorderCertifications,
    pillars, savePillar, deletePillar, reorderPillars,
    resetToDefaults, exportData, importData,
    logoutAdmin, showToast, isSupabaseConfigured,
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');

  // Profile
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [newDetailText, setNewDetailText] = useState('');
  const [newEduForm, setNewEduForm] = useState({ degree: '', institution: '', status: '' });

  // Journey
  const [editingJourneyId, setEditingJourneyId] = useState(null);
  const [journeyForm, setJourneyForm] = useState({ year: '', title: '', subtitle: '', description: '' });

  // Docs
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docSearch, setDocSearch] = useState('');
  const [docForm, setDocForm] = useState(EMPTY_DOC());
  const [uploading, setUploading] = useState(false);

  // Projects
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT());

  // Skills
  const [skillsForm, setSkillsForm] = useState(() => JSON.parse(JSON.stringify(skills || {})));

  // Services
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE());

  // Certifications
  const [editingCertId, setEditingCertId] = useState(null);
  const [certForm, setCertForm] = useState(EMPTY_CERT());

  // Pillars
  const [editingPillarId, setEditingPillarId] = useState(null);
  const [pillarForm, setPillarForm] = useState(EMPTY_PILLAR());

  // System
  const [jsonImportInput, setJsonImportInput] = useState('');

  // ---- Profile ----
  const handleProfileSave = (e) => { e.preventDefault(); updateProfile(profileForm); };
  const handleAddAboutDetail = () => {
    if (!newDetailText.trim()) return;
    setProfileForm((prev) => ({ ...prev, aboutDetails: [...(prev.aboutDetails || []), newDetailText.trim()] }));
    setNewDetailText('');
  };
  const handleRemoveAboutDetail = (i) => setProfileForm((prev) => ({ ...prev, aboutDetails: prev.aboutDetails.filter((_, idx) => idx !== i) }));
  const handleAddEducation = () => {
    if (!newEduForm.degree.trim() || !newEduForm.institution.trim()) return;
    setProfileForm((prev) => ({ ...prev, education: [...(prev.education || []), { ...newEduForm }] }));
    setNewEduForm({ degree: '', institution: '', status: '' });
  };
  const handleRemoveEducation = (i) => setProfileForm((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));

  // ---- Journey ----
  const handleSaveJourney = (e) => {
    e.preventDefault();
    if (!journeyForm.title.trim() || !journeyForm.year.trim()) { showToast('Year and Title are required.', 'error'); return; }
    if (editingJourneyId === 'new') addJourneyItem(journeyForm);
    else updateJourneyItem(editingJourneyId, journeyForm);
    setEditingJourneyId(null);
    setJourneyForm({ year: '', title: '', subtitle: '', description: '' });
  };
  const handleMoveJourney = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= journey.length) return;
    const list = [...journey];
    [list[index], list[target]] = [list[target], list[index]];
    reorderJourney(list);
  };

  // ---- Docs (upload) ----
  const handleSelectDoc = (doc) => {
    setSelectedDocId(doc.id);
    setDocForm({
      id: doc.id, title: doc.title || '', category: doc.category || 'Cybersecurity',
      tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : doc.tags || '',
      summary: doc.summary || '', readTime: doc.readTime || '5 min read',
      date: doc.date || new Date().toISOString().split('T')[0], status: doc.status || 'published',
      fileUrl: doc.fileUrl || '', fileName: doc.fileName || '', fileType: doc.fileType || '',
    });
  };
  const handleNewDoc = () => { setSelectedDocId('new'); setDocForm(EMPTY_DOC()); };
  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) { showToast('Supabase not configured — cannot upload file.', 'error'); return; }
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error } = await supabase.storage.from('documents').upload(path, file);
    setUploading(false);
    if (error) { showToast('Upload failed: ' + error.message, 'error'); return; }
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    setDocForm((prev) => ({ ...prev, fileUrl: data.publicUrl, fileName: file.name, fileType: file.type }));
    showToast('File uploaded. Remember to Save the document.');
  };
  const handleSaveDoc = (e) => {
    e.preventDefault();
    if (!docForm.title.trim()) { showToast('Document title is required.', 'error'); return; }
    const payload = { ...docForm, tags: splitList(docForm.tags) };
    saveTechnicalDoc(payload);
    handleNewDoc();
  };

  // ---- Projects ----
  const handleEditProject = (p) => {
    setEditingProjectId(p.id);
    setProjectForm({
      id: p.id, title: p.title || '', description: p.description || '', longDescription: p.longDescription || '',
      technologies: (p.technologies || []).join(', '), features: (p.features || []).join('\n'),
      challengesSolved: p.challengesSolved || '', lessonsLearned: p.lessonsLearned || '',
      githubLink: p.githubLink || '', demoLink: p.demoLink || '', tags: (p.tags || []).join(', '),
      featured: p.featured || false,
    });
  };
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) { showToast('Project title is required.', 'error'); return; }
    saveProject({
      ...projectForm,
      technologies: splitList(projectForm.technologies),
      features: splitList(projectForm.features),
      tags: splitList(projectForm.tags),
    });
    setEditingProjectId(null);
    setProjectForm(EMPTY_PROJECT());
  };
  const handleMoveProject = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= projects.length) return;
    const list = [...projects];
    [list[index], list[target]] = [list[target], list[index]];
    reorderProjects(list);
  };

  // ---- Skills ----
  const updateDomain = (key, field, value) =>
    setSkillsForm((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  const updateSkillField = (key, type, index, field, value) =>
    setSkillsForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[key][type][index][field] = value;
      return next;
    });
  const addCategory = (key) =>
    setSkillsForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[key].categories = next[key].categories || [];
      next[key].categories.push({ key: 'New Category', description: '' });
      return next;
    });
  const removeCategory = (key, index) =>
    setSkillsForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[key].categories.splice(index, 1);
      return next;
    });
  const addSkillItem = (key) =>
    setSkillsForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const firstCat = next[key].categories?.[0]?.key || 'Languages';
      next[key].items = next[key].items || [];
      next[key].items.push({ name: 'New Skill', category: firstCat });
      return next;
    });
  const removeSkillItem = (key, index) =>
    setSkillsForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[key].items.splice(index, 1);
      return next;
    });

  // ---- Services ----
  const handleEditService = (s) => {
    setEditingServiceId(s.id);
    setServiceForm({ id: s.id, title: s.title || '', icon: s.icon || 'FileText', tagline: s.tagline || '', details: (s.details || []).join('\n') });
  };
  const handleSaveService = (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) { showToast('Service title is required.', 'error'); return; }
    saveService({ ...serviceForm, details: splitList(serviceForm.details) });
    setEditingServiceId(null);
    setServiceForm(EMPTY_SERVICE());
  };
  const handleMoveService = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= services.length) return;
    const list = [...services];
    [list[index], list[target]] = [list[target], list[index]];
    reorderServices(list);
  };

  // ---- Certifications ----
  const handleEditCert = (c) => {
    setEditingCertId(c.id);
    setCertForm({ id: c.id, name: c.name || '', issuer: c.issuer || '', status: c.status || 'Earned', date: c.date || '', credentialId: c.credentialId || '', verifyUrl: c.verifyUrl || '' });
  };
  const handleSaveCert = (e) => {
    e.preventDefault();
    if (!certForm.name.trim()) { showToast('Certification name is required.', 'error'); return; }
    saveCertification(certForm);
    setEditingCertId(null);
    setCertForm(EMPTY_CERT());
  };
  const handleMoveCert = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= certifications.length) return;
    const list = [...certifications];
    [list[index], list[target]] = [list[target], list[index]];
    reorderCertifications(list);
  };

  // ---- Pillars ----
  const handleEditPillar = (p) => {
    setEditingPillarId(p.id);
    setPillarForm({ id: p.id, title: p.title || '', description: p.description || '', items: (p.items || []).join('\n') });
  };
  const handleSavePillar = (e) => {
    e.preventDefault();
    if (!pillarForm.title.trim()) { showToast('Pillar title is required.', 'error'); return; }
    savePillar({ ...pillarForm, items: splitList(pillarForm.items) });
    setEditingPillarId(null);
    setPillarForm(EMPTY_PILLAR());
  };
  const handleMovePillar = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= pillars.length) return;
    const list = [...pillars];
    [list[index], list[target]] = [list[target], list[index]];
    reorderPillars(list);
  };

  const filteredDocs = technicalDocs.filter((d) =>
    (d.title || '').toLowerCase().includes(docSearch.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <div className="admin-brand-icon"><Shield size={22} /></div>
          <div>
            <h1 className="admin-brand-title">Admin Dashboard</h1>
            <span className="admin-status-badge"><span className="status-dot"></span> Live Data Controller</span>
          </div>
        </div>
        <div className="admin-topbar-actions">
          {!isSupabaseConfigured && (
            <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }} title="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to persist publicly.">
              Local-only mode
            </span>
          )}
          <button onClick={onClose} className="btn-admin-nav" title="View Live Portfolio Site"><Eye size={16} /> View Site</button>
          <button onClick={exportData} className="btn-admin-nav" title="Export Backup JSON"><Download size={16} /> Export Backup</button>
          <button onClick={logoutAdmin} className="btn-admin-nav btn-logout" title="Exit Admin Portal"><LogOut size={16} /> Logout</button>
        </div>
      </header>

      <div className="admin-main-wrapper">
        <aside className="admin-sidebar">
          <nav className="admin-nav-list">
            <button onClick={() => setActiveTab('overview')} className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}><LayoutDashboard size={18} /> Overview</button>
            <button onClick={() => setActiveTab('profile')} className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}><User size={18} /> Profile & Job Title</button>
            <button onClick={() => setActiveTab('journey')} className={`admin-nav-item ${activeTab === 'journey' ? 'active' : ''}`}><Briefcase size={18} /> Journey & Timeline</button>
            <button onClick={() => setActiveTab('pillars')} className={`admin-nav-item ${activeTab === 'pillars' ? 'active' : ''}`}><Layers size={18} /> How I Work</button>
            <button onClick={() => setActiveTab('skills')} className={`admin-nav-item ${activeTab === 'skills' ? 'active' : ''}`}><Code size={18} /> Skills</button>
            <button onClick={() => setActiveTab('services')} className={`admin-nav-item ${activeTab === 'services' ? 'active' : ''}`}><Sparkles size={18} /> Services</button>
            <button onClick={() => setActiveTab('projects')} className={`admin-nav-item ${activeTab === 'projects' ? 'active' : ''}`}><FileCode size={18} /> Projects</button>
            <button onClick={() => setActiveTab('certs')} className={`admin-nav-item ${activeTab === 'certs' ? 'active' : ''}`}><Award size={18} /> Certifications</button>
            <button onClick={() => setActiveTab('documents')} className={`admin-nav-item ${activeTab === 'documents' ? 'active' : ''}`}><FileText size={18} /> Documents ({technicalDocs.length})</button>
            <button onClick={() => setActiveTab('system')} className={`admin-nav-item ${activeTab === 'system' ? 'active' : ''}`}><Settings size={18} /> Backup & Settings</button>
          </nav>
          <div className="sidebar-quick-info glass-panel">
            <span className="quick-info-label">Active Job Title</span>
            <p className="quick-info-value">{profile.title}</p>
          </div>
        </aside>

        <main className="admin-content-area">
          {/* ============ OVERVIEW ============ */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="tab-header"><h2>Dashboard Overview</h2><p>Manage your portfolio data in real time.</p></div>
              <div className="overview-stats-grid">
                <div className="stat-card glass-panel">
                  <div className="stat-card-header"><User size={20} className="stat-icon-gold" /><span className="stat-card-title">Job Title</span></div>
                  <h3 className="stat-card-value">{profile.title}</h3>
                  <p className="stat-card-sub">{profile.name}</p>
                  <button onClick={() => setActiveTab('profile')} className="stat-link-btn">Edit Title →</button>
                </div>
                <div className="stat-card glass-panel">
                  <div className="stat-card-header"><Briefcase size={20} className="stat-icon-gold" /><span className="stat-card-title">Journey Milestones</span></div>
                  <h3 className="stat-card-value">{journey.length}</h3>
                  <button onClick={() => setActiveTab('journey')} className="stat-link-btn">Manage →</button>
                </div>
                <div className="stat-card glass-panel">
                  <div className="stat-card-header"><FileCode size={20} className="stat-icon-gold" /><span className="stat-card-title">Projects</span></div>
                  <h3 className="stat-card-value">{projects.length}</h3>
                  <button onClick={() => setActiveTab('projects')} className="stat-link-btn">Manage →</button>
                </div>
                <div className="stat-card glass-panel">
                  <div className="stat-card-header"><FileText size={20} className="stat-icon-gold" /><span className="stat-card-title">Documents</span></div>
                  <h3 className="stat-card-value">{technicalDocs.length}</h3>
                  <button onClick={() => setActiveTab('documents')} className="stat-link-btn">Manage →</button>
                </div>
              </div>
            </div>
          )}

          {/* ============ PROFILE ============ */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="tab-header"><h2>Profile & Job Title</h2><p>Update your identity, biography, and academic credentials.</p></div>
              <form onSubmit={handleProfileSave} className="admin-form-stack">
                <div className="admin-card glass-panel">
                  <h3 className="card-section-title">Core Identity</h3>
                  <div className="form-grid-2">
                    <div className="admin-form-group"><label>Full Name</label><input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="admin-input" /></div>
                    <div className="admin-form-group"><label>Avatar Monogram</label><input type="text" value={profileForm.avatarSymbol} onChange={(e) => setProfileForm({ ...profileForm, avatarSymbol: e.target.value })} className="admin-input" maxLength={3} /></div>
                  </div>
                  <div className="admin-form-group margin-top-md"><label>Job Title</label><input type="text" value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} className="admin-input input-highlight" /></div>
                  <div className="admin-form-group margin-top-md"><label>Headline Tagline</label><input type="text" value={profileForm.headline} onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })} className="admin-input" /></div>
                  <div className="admin-form-group margin-top-md"><label>Hero Short Bio</label><textarea rows={3} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="admin-textarea" /></div>
                  <div className="admin-form-group margin-top-md"><label>About Summary</label><textarea rows={4} value={profileForm.summary} onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })} className="admin-textarea" /></div>
                  <div className="admin-form-group margin-top-md"><label>Email</label><input type="text" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="admin-input" /></div>
                </div>

                <div className="admin-card glass-panel">
                  <h3 className="card-section-title">About Highlight Bullets</h3>
                  <div className="items-list-container">
                    {(profileForm.aboutDetails || []).map((detail, idx) => (
                      <div key={idx} className="list-item-row">
                        <span className="item-number">{idx + 1}.</span>
                        <input type="text" value={detail} onChange={(e) => { const updated = [...profileForm.aboutDetails]; updated[idx] = e.target.value; setProfileForm({ ...profileForm, aboutDetails: updated }); }} className="admin-input input-flex" />
                        <button type="button" onClick={() => handleRemoveAboutDetail(idx)} className="btn-icon-delete"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="add-item-row margin-top-md">
                    <input type="text" placeholder="Add new highlight point..." value={newDetailText} onChange={(e) => setNewDetailText(e.target.value)} className="admin-input input-flex" />
                    <button type="button" onClick={handleAddAboutDetail} className="btn-admin-secondary"><Plus size={16} /> Add</button>
                  </div>
                </div>

                <div className="admin-card glass-panel">
                  <h3 className="card-section-title">Academic Credentials</h3>
                  <div className="items-list-container">
                    {(profileForm.education || []).map((edu, idx) => (
                      <div key={idx} className="education-item-card">
                        <div className="form-grid-3">
                          <input type="text" value={edu.degree} placeholder="Degree" onChange={(e) => { const updated = [...profileForm.education]; updated[idx].degree = e.target.value; setProfileForm({ ...profileForm, education: updated }); }} className="admin-input" />
                          <input type="text" value={edu.institution} placeholder="Institution" onChange={(e) => { const updated = [...profileForm.education]; updated[idx].institution = e.target.value; setProfileForm({ ...profileForm, education: updated }); }} className="admin-input" />
                          <div className="flex-row-center">
                            <input type="text" value={edu.status} placeholder="Status" onChange={(e) => { const updated = [...profileForm.education]; updated[idx].status = e.target.value; setProfileForm({ ...profileForm, education: updated }); }} className="admin-input" />
                            <button type="button" onClick={() => handleRemoveEducation(idx)} className="btn-icon-delete"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="add-education-box margin-top-md">
                    <h4>Add Academic Credential</h4>
                    <div className="form-grid-3">
                      <input type="text" placeholder="Degree" value={newEduForm.degree} onChange={(e) => setNewEduForm({ ...newEduForm, degree: e.target.value })} className="admin-input" />
                      <input type="text" placeholder="Institution" value={newEduForm.institution} onChange={(e) => setNewEduForm({ ...newEduForm, institution: e.target.value })} className="admin-input" />
                      <input type="text" placeholder="Status" value={newEduForm.status} onChange={(e) => setNewEduForm({ ...newEduForm, status: e.target.value })} className="admin-input" />
                    </div>
                    <button type="button" onClick={handleAddEducation} className="btn-admin-secondary margin-top-sm"><Plus size={16} /> Add</button>
                  </div>
                </div>

                <div className="form-save-bar"><button type="submit" className="btn-admin-primary btn-large"><Save size={18} /> Save Profile</button></div>
              </form>
            </div>
          )}

          {/* ============ JOURNEY ============ */}
          {activeTab === 'journey' && (
            <div className="tab-content">
              <div className="tab-header"><h2>Journey & Timeline</h2><p>Add, edit, reorder, or delete career milestones.</p></div>
              <div className="admin-action-bar"><button onClick={() => { setEditingJourneyId('new'); setJourneyForm({ year: '', title: '', subtitle: '', description: '' }); }} className="btn-admin-primary"><Plus size={16} /> Add Milestone</button></div>
              {editingJourneyId && (
                <div className="admin-card glass-panel edit-journey-card margin-bottom-lg">
                  <h3>{editingJourneyId === 'new' ? 'Add Milestone' : 'Edit Milestone'}</h3>
                  <form onSubmit={handleSaveJourney} className="margin-top-md">
                    <div className="form-grid-2">
                      <div className="admin-form-group"><label>Year</label><input type="text" value={journeyForm.year} onChange={(e) => setJourneyForm({ ...journeyForm, year: e.target.value })} className="admin-input" required /></div>
                      <div className="admin-form-group"><label>Title</label><input type="text" value={journeyForm.title} onChange={(e) => setJourneyForm({ ...journeyForm, title: e.target.value })} className="admin-input" required /></div>
                    </div>
                    <div className="admin-form-group margin-top-md"><label>Subtitle / Institution</label><input type="text" value={journeyForm.subtitle} onChange={(e) => setJourneyForm({ ...journeyForm, subtitle: e.target.value })} className="admin-input" /></div>
                    <div className="admin-form-group margin-top-md"><label>Description</label><textarea rows={4} value={journeyForm.description} onChange={(e) => setJourneyForm({ ...journeyForm, description: e.target.value })} className="admin-textarea" /></div>
                    <div className="card-actions-right margin-top-md"><button type="button" onClick={() => setEditingJourneyId(null)} className="btn-admin-secondary">Cancel</button><button type="submit" className="btn-admin-primary"><Save size={16} /> Save</button></div>
                  </form>
                </div>
              )}
              <div className="journey-admin-list">
                {journey.map((item, idx) => (
                  <div key={item.id} className="journey-admin-item glass-panel">
                    <div className="journey-item-header">
                      <div><span className="journey-year-tag">{item.year}</span><h3 className="journey-item-title">{item.title}</h3><h4 className="journey-item-sub">{item.subtitle}</h4></div>
                      <div className="journey-item-actions">
                        <button onClick={() => handleMoveJourney(idx, -1)} disabled={idx === 0} className="btn-icon-nav"><MoveUp size={16} /></button>
                        <button onClick={() => handleMoveJourney(idx, 1)} disabled={idx === journey.length - 1} className="btn-icon-nav"><MoveDown size={16} /></button>
                        <button onClick={() => { setEditingJourneyId(item.id); setJourneyForm({ year: item.year, title: item.title, subtitle: item.subtitle, description: item.description }); }} className="btn-icon-nav"><Edit size={16} /></button>
                        <button onClick={() => deleteJourneyItem(item.id)} className="btn-icon-delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <p className="journey-item-desc">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ HOW I WORK (PILLARS) ============ */}
          {activeTab === 'pillars' && (
            <div className="tab-content">
              <div className="tab-header"><h2>How I Work</h2><p>Manage the three pillars shown in the "How I Work" section.</p></div>
              <div className="admin-action-bar"><button onClick={() => { setEditingPillarId('new'); setPillarForm(EMPTY_PILLAR()); }} className="btn-admin-primary"><Plus size={16} /> Add Pillar</button></div>
              {editingPillarId && (
                <div className="admin-card glass-panel margin-bottom-lg">
                  <h3>{editingPillarId === 'new' ? 'Add Pillar' : 'Edit Pillar'}</h3>
                  <form onSubmit={handleSavePillar} className="margin-top-md">
                    <div className="admin-form-group"><label>Title</label><input type="text" value={pillarForm.title} onChange={(e) => setPillarForm({ ...pillarForm, title: e.target.value })} className="admin-input" required /></div>
                    <div className="admin-form-group margin-top-md"><label>Description</label><textarea rows={2} value={pillarForm.description} onChange={(e) => setPillarForm({ ...pillarForm, description: e.target.value })} className="admin-textarea" /></div>
                    <div className="admin-form-group margin-top-md"><label>Items (one per line)</label><textarea rows={5} value={pillarForm.items} onChange={(e) => setPillarForm({ ...pillarForm, items: e.target.value })} className="admin-textarea editor-code-font" /></div>
                    <div className="card-actions-right margin-top-md"><button type="button" onClick={() => setEditingPillarId(null)} className="btn-admin-secondary">Cancel</button><button type="submit" className="btn-admin-primary"><Save size={16} /> Save</button></div>
                  </form>
                </div>
              )}
              <div className="journey-admin-list">
                {pillars.map((p, idx) => (
                  <div key={p.id} className="journey-admin-item glass-panel">
                    <div className="journey-item-header">
                      <div><h3 className="journey-item-title">{p.title}</h3><p className="journey-item-desc">{p.description}</p></div>
                      <div className="journey-item-actions">
                        <button onClick={() => handleMovePillar(idx, -1)} disabled={idx === 0} className="btn-icon-nav"><MoveUp size={16} /></button>
                        <button onClick={() => handleMovePillar(idx, 1)} disabled={idx === pillars.length - 1} className="btn-icon-nav"><MoveDown size={16} /></button>
                        <button onClick={() => handleEditPillar(p)} className="btn-icon-nav"><Edit size={16} /></button>
                        <button onClick={() => deletePillar(p.id)} className="btn-icon-delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ SKILLS ============ */}
          {activeTab === 'skills' && (
            <div className="tab-content">
              <div className="tab-header"><h2>Skills</h2><p>Edit skill domains, categories, and items.</p></div>
              {Object.entries(skillsForm).map(([key, domain]) => (
                <div key={key} className="admin-card glass-panel margin-bottom-lg">
                  <h3 className="card-section-title">{domain.title || key}</h3>
                  <div className="form-grid-2">
                    <div className="admin-form-group"><label>Title</label><input type="text" value={domain.title || ''} onChange={(e) => updateDomain(key, 'title', e.target.value)} className="admin-input" /></div>
                    <div className="admin-form-group"><label>Level</label><input type="text" value={domain.level || ''} onChange={(e) => updateDomain(key, 'level', e.target.value)} className="admin-input" /></div>
                  </div>
                  <div className="margin-top-md">
                    <label className="admin-input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-gold-dark)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categories</label>
                    {(domain.categories || []).map((cat, i) => (
                      <div key={i} className="form-grid-2" style={{ marginBottom: '0.5rem' }}>
                        <input type="text" value={cat.key} onChange={(e) => updateSkillField(key, 'categories', i, 'key', e.target.value)} className="admin-input" placeholder="Category name" />
                        <div className="flex-row-center">
                          <input type="text" value={cat.description || ''} onChange={(e) => updateSkillField(key, 'categories', i, 'description', e.target.value)} className="admin-input" placeholder="Description" />
                          <button type="button" onClick={() => removeCategory(key, i)} className="btn-icon-delete"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addCategory(key)} className="btn-admin-secondary margin-top-sm"><Plus size={14} /> Add Category</button>
                  </div>
                  <div className="margin-top-md">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-gold-dark)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skills</label>
                    {(domain.items || []).map((item, i) => (
                      <div key={i} className="form-grid-2" style={{ marginBottom: '0.5rem' }}>
                        <input type="text" value={item.name} onChange={(e) => updateSkillField(key, 'items', i, 'name', e.target.value)} className="admin-input" placeholder="Skill name" />
                        <div className="flex-row-center">
                          <select value={item.category} onChange={(e) => updateSkillField(key, 'items', i, 'category', e.target.value)} className="admin-select">
                            {(domain.categories || []).map((cat) => <option key={cat.key} value={cat.key}>{cat.key}</option>)}
                          </select>
                          <button type="button" onClick={() => removeSkillItem(key, i)} className="btn-icon-delete"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addSkillItem(key)} className="btn-admin-secondary margin-top-sm"><Plus size={14} /> Add Skill</button>
                  </div>
                </div>
              ))}
              <div className="form-save-bar"><button onClick={() => saveSkills(skillsForm)} className="btn-admin-primary btn-large"><Save size={18} /> Save Skills</button></div>
            </div>
          )}

          {/* ============ SERVICES ============ */}
          {activeTab === 'services' && (
            <div className="tab-content">
              <div className="tab-header"><h2>Services</h2><p>Manage the "What I Offer" section.</p></div>
              <div className="admin-action-bar"><button onClick={() => { setEditingServiceId('new'); setServiceForm(EMPTY_SERVICE()); }} className="btn-admin-primary"><Plus size={16} /> Add Service</button></div>
              {editingServiceId && (
                <div className="admin-card glass-panel margin-bottom-lg">
                  <h3>{editingServiceId === 'new' ? 'Add Service' : 'Edit Service'}</h3>
                  <form onSubmit={handleSaveService} className="margin-top-md">
                    <div className="form-grid-2">
                      <div className="admin-form-group"><label>Title</label><input type="text" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} className="admin-input" required /></div>
                      <div className="admin-form-group"><label>Icon (lucide name)</label><input type="text" value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })} className="admin-input" placeholder="PenTool / FileText / ShieldCheck / Sparkles" /></div>
                    </div>
                    <div className="admin-form-group margin-top-md"><label>Tagline</label><input type="text" value={serviceForm.tagline} onChange={(e) => setServiceForm({ ...serviceForm, tagline: e.target.value })} className="admin-input" /></div>
                    <div className="admin-form-group margin-top-md"><label>Details (one per line)</label><textarea rows={5} value={serviceForm.details} onChange={(e) => setServiceForm({ ...serviceForm, details: e.target.value })} className="admin-textarea editor-code-font" /></div>
                    <div className="card-actions-right margin-top-md"><button type="button" onClick={() => setEditingServiceId(null)} className="btn-admin-secondary">Cancel</button><button type="submit" className="btn-admin-primary"><Save size={16} /> Save</button></div>
                  </form>
                </div>
              )}
              <div className="journey-admin-list">
                {services.map((s, idx) => (
                  <div key={s.id} className="journey-admin-item glass-panel">
                    <div className="journey-item-header">
                      <div><h3 className="journey-item-title">{s.title}</h3><p className="journey-item-desc">{s.tagline}</p></div>
                      <div className="journey-item-actions">
                        <button onClick={() => handleMoveService(idx, -1)} disabled={idx === 0} className="btn-icon-nav"><MoveUp size={16} /></button>
                        <button onClick={() => handleMoveService(idx, 1)} disabled={idx === services.length - 1} className="btn-icon-nav"><MoveDown size={16} /></button>
                        <button onClick={() => handleEditService(s)} className="btn-icon-nav"><Edit size={16} /></button>
                        <button onClick={() => deleteService(s.id)} className="btn-icon-delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ PROJECTS ============ */}
          {activeTab === 'projects' && (
            <div className="tab-content">
              <div className="tab-header"><h2>Projects</h2><p>Manage project cards, links, and details.</p></div>
              <div className="admin-action-bar"><button onClick={() => { setEditingProjectId('new'); setProjectForm(EMPTY_PROJECT()); }} className="btn-admin-primary"><Plus size={16} /> Add Project</button></div>
              {editingProjectId && (
                <div className="admin-card glass-panel margin-bottom-lg">
                  <h3>{editingProjectId === 'new' ? 'Add Project' : 'Edit Project'}</h3>
                  <form onSubmit={handleSaveProject} className="margin-top-md">
                    <div className="form-grid-2">
                      <div className="admin-form-group"><label>Title</label><input type="text" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} className="admin-input" required /></div>
                      <div className="admin-form-group"><label>Tags (comma separated)</label><input type="text" value={projectForm.tags} onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })} className="admin-input" placeholder="E-Commerce, Full-Stack" /></div>
                    </div>
                    <div className="admin-form-group margin-top-md"><label>Short Description (card)</label><textarea rows={2} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} className="admin-textarea" /></div>
                    <div className="admin-form-group margin-top-md"><label>Long Description (modal overview)</label><textarea rows={4} value={projectForm.longDescription} onChange={(e) => setProjectForm({ ...projectForm, longDescription: e.target.value })} className="admin-textarea" /></div>
                    <div className="form-grid-2 margin-top-md">
                      <div className="admin-form-group"><label>Technologies (comma separated)</label><input type="text" value={projectForm.technologies} onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })} className="admin-input" /></div>
                      <div className="admin-form-group"><label>Features (one per line)</label><textarea rows={4} value={projectForm.features} onChange={(e) => setProjectForm({ ...projectForm, features: e.target.value })} className="admin-textarea editor-code-font" /></div>
                    </div>
                    <div className="admin-form-group margin-top-md"><label>Challenges Solved</label><textarea rows={2} value={projectForm.challengesSolved} onChange={(e) => setProjectForm({ ...projectForm, challengesSolved: e.target.value })} className="admin-textarea" /></div>
                    <div className="admin-form-group margin-top-md"><label>Lessons Learned</label><textarea rows={2} value={projectForm.lessonsLearned} onChange={(e) => setProjectForm({ ...projectForm, lessonsLearned: e.target.value })} className="admin-textarea" /></div>
                    <div className="form-grid-2 margin-top-md">
                      <div className="admin-form-group"><label>GitHub Link</label><input type="text" value={projectForm.githubLink} onChange={(e) => setProjectForm({ ...projectForm, githubLink: e.target.value })} className="admin-input" placeholder="https://github.com/..." /></div>
                      <div className="admin-form-group"><label>Live Demo Link</label><input type="text" value={projectForm.demoLink} onChange={(e) => setProjectForm({ ...projectForm, demoLink: e.target.value })} className="admin-input" placeholder="https://..." /></div>
                    </div>
                    <label className="margin-top-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} /> Featured project
                    </label>
                    <div className="card-actions-right margin-top-md"><button type="button" onClick={() => setEditingProjectId(null)} className="btn-admin-secondary">Cancel</button><button type="submit" className="btn-admin-primary"><Save size={16} /> Save</button></div>
                  </form>
                </div>
              )}
              <div className="journey-admin-list">
                {projects.map((p, idx) => (
                  <div key={p.id} className="journey-admin-item glass-panel">
                    <div className="journey-item-header">
                      <div><h3 className="journey-item-title">{p.title}</h3><p className="journey-item-desc">{p.description}</p></div>
                      <div className="journey-item-actions">
                        <button onClick={() => handleMoveProject(idx, -1)} disabled={idx === 0} className="btn-icon-nav"><MoveUp size={16} /></button>
                        <button onClick={() => handleMoveProject(idx, 1)} disabled={idx === projects.length - 1} className="btn-icon-nav"><MoveDown size={16} /></button>
                        <button onClick={() => handleEditProject(p)} className="btn-icon-nav"><Edit size={16} /></button>
                        <button onClick={() => deleteProject(p.id)} className="btn-icon-delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ CERTIFICATIONS ============ */}
          {activeTab === 'certs' && (
            <div className="tab-content">
              <div className="tab-header"><h2>Certifications</h2><p>Manage your credentials and their status.</p></div>
              <div className="admin-action-bar"><button onClick={() => { setEditingCertId('new'); setCertForm(EMPTY_CERT()); }} className="btn-admin-primary"><Plus size={16} /> Add Certification</button></div>
              {editingCertId && (
                <div className="admin-card glass-panel margin-bottom-lg">
                  <h3>{editingCertId === 'new' ? 'Add Certification' : 'Edit Certification'}</h3>
                  <form onSubmit={handleSaveCert} className="margin-top-md">
                    <div className="form-grid-2">
                      <div className="admin-form-group"><label>Name</label><input type="text" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} className="admin-input" required /></div>
                      <div className="admin-form-group"><label>Issuer</label><input type="text" value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} className="admin-input" /></div>
                    </div>
                    <div className="form-grid-3 margin-top-md">
                      <div className="admin-form-group"><label>Status</label><select value={certForm.status} onChange={(e) => setCertForm({ ...certForm, status: e.target.value })} className="admin-select"><option>Earned</option><option>In Progress</option><option>Planned</option></select></div>
                      <div className="admin-form-group"><label>Date / Year</label><input type="text" value={certForm.date} onChange={(e) => setCertForm({ ...certForm, date: e.target.value })} className="admin-input" /></div>
                      <div className="admin-form-group"><label>Credential ID</label><input type="text" value={certForm.credentialId} onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })} className="admin-input" /></div>
                    </div>
                    <div className="admin-form-group margin-top-md"><label>Verify URL</label><input type="text" value={certForm.verifyUrl} onChange={(e) => setCertForm({ ...certForm, verifyUrl: e.target.value })} className="admin-input" placeholder="https://..." /></div>
                    <div className="card-actions-right margin-top-md"><button type="button" onClick={() => setEditingCertId(null)} className="btn-admin-secondary">Cancel</button><button type="submit" className="btn-admin-primary"><Save size={16} /> Save</button></div>
                  </form>
                </div>
              )}
              <div className="journey-admin-list">
                {certifications.map((c, idx) => (
                  <div key={c.id} className="journey-admin-item glass-panel">
                    <div className="journey-item-header">
                      <div><h3 className="journey-item-title">{c.name}</h3><p className="journey-item-desc">{c.issuer} · {c.status}</p></div>
                      <div className="journey-item-actions">
                        <button onClick={() => handleMoveCert(idx, -1)} disabled={idx === 0} className="btn-icon-nav"><MoveUp size={16} /></button>
                        <button onClick={() => handleMoveCert(idx, 1)} disabled={idx === certifications.length - 1} className="btn-icon-nav"><MoveDown size={16} /></button>
                        <button onClick={() => handleEditCert(c)} className="btn-icon-nav"><Edit size={16} /></button>
                        <button onClick={() => deleteCertification(c.id)} className="btn-icon-delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ DOCUMENTS (UPLOAD) ============ */}
          {activeTab === 'documents' && (
            <div className="tab-content">
              <div className="tab-header"><h2>Technical Documents</h2><p>Upload documents (PDF, DOCX, etc.) and write their description.</p></div>
              <div className="docs-studio-wrapper">
                <div className="docs-sidebar-list glass-panel">
                  <div className="docs-sidebar-header"><button onClick={handleNewDoc} className="btn-admin-primary btn-full-width"><Plus size={16} /> New Document</button></div>
                  <div className="docs-search-box" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <input type="text" placeholder="Search documents..." value={docSearch} onChange={(e) => setDocSearch(e.target.value)} className="admin-input-sm" />
                  </div>
                  <div className="docs-items-scroll">
                    {filteredDocs.map((doc) => (
                      <div key={doc.id} onClick={() => handleSelectDoc(doc)} className={`doc-list-item ${selectedDocId === doc.id ? 'active' : ''}`}>
                        <div className="doc-item-meta"><span className="doc-cat">{doc.category}</span><span className={`doc-status status-${doc.status}`}>{doc.status}</span></div>
                        <h4 className="doc-item-title">{doc.title}</h4>
                        <span className="doc-item-date">{doc.date} · {doc.readTime}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="docs-editor-pane glass-panel">
                  {selectedDocId ? (
                    <form onSubmit={handleSaveDoc} className="doc-editor-form">
                      <div className="editor-meta-grid">
                        <div className="admin-form-group"><label>Document Title</label><input type="text" value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} className="admin-input input-highlight" required /></div>
                        <div className="form-grid-3 margin-top-sm">
                          <div className="admin-form-group"><label>Category</label><select value={docForm.category} onChange={(e) => setDocForm({ ...docForm, category: e.target.value })} className="admin-select"><option>Cybersecurity</option><option>Web Development</option><option>Distributed Systems</option><option>Cloud Architecture</option><option>SecOps</option><option>Career & Personal</option></select></div>
                          <div className="admin-form-group"><label>Read Time</label><input type="text" value={docForm.readTime} onChange={(e) => setDocForm({ ...docForm, readTime: e.target.value })} className="admin-input" /></div>
                          <div className="admin-form-group"><label>Status</label><select value={docForm.status} onChange={(e) => setDocForm({ ...docForm, status: e.target.value })} className="admin-select"><option value="published">Published</option><option value="draft">Draft</option></select></div>
                        </div>
                        <div className="admin-form-group margin-top-sm"><label>Tags (comma separated)</label><input type="text" value={docForm.tags} onChange={(e) => setDocForm({ ...docForm, tags: e.target.value })} className="admin-input" placeholder="Django, Security, PostgreSQL" /></div>
                        <div className="admin-form-group margin-top-sm"><label>Summary / Description</label><textarea rows={3} value={docForm.summary} onChange={(e) => setDocForm({ ...docForm, summary: e.target.value })} className="admin-textarea" /></div>
                      </div>

                      <div className="admin-card glass-panel margin-top-md" style={{ padding: '1rem' }}>
                        <h3 className="card-section-title"><Upload size={16} /> Attach File</h3>
                        <input type="file" onChange={handleUploadFile} className="admin-input margin-top-sm" />
                        {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--color-gold-dark)' }}>Uploading…</p>}
                        {docForm.fileUrl ? (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <ExternalLink size={12} /> {docForm.fileName || 'File attached'} ({docForm.fileType || 'unknown'})
                          </p>
                        ) : (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No file attached yet.</p>
                        )}
                      </div>

                      <div className="editor-action-bar">
                        {docForm.id && <button type="button" onClick={() => deleteTechnicalDoc(docForm.id)} className="btn-admin-danger"><Trash2 size={16} /> Delete</button>}
                        <div className="spacer" />
                        <button type="submit" className="btn-admin-primary btn-large"><Save size={18} /> Save Document</button>
                      </div>
                    </form>
                  ) : (
                    <div className="empty-studio-state">
                      <FileCode size={48} className="empty-icon-gold" />
                      <h3>Document Studio</h3>
                      <p>Select a document or create a new one to upload a file and write its description.</p>
                      <button onClick={handleNewDoc} className="btn-admin-primary margin-top-md"><Plus size={16} /> New Document</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ SYSTEM ============ */}
          {activeTab === 'system' && (
            <div className="tab-content">
              <div className="tab-header"><h2>Backup & Settings</h2><p>Export, import, and reset your portfolio data.</p></div>
              <div className="admin-card glass-panel">
                <h3 className="card-section-title"><Download size={18} /> Export / Backup</h3>
                <p className="card-desc">Download your entire portfolio configuration as a JSON backup file.</p>
                <button onClick={exportData} className="btn-admin-primary margin-top-sm"><Download size={16} /> Download Backup JSON</button>
              </div>
              <div className="admin-card glass-panel margin-top-lg">
                <h3 className="card-section-title"><Upload size={18} /> Restore / Import</h3>
                <p className="card-desc">Paste your JSON backup below to restore your portfolio configuration.</p>
                <textarea rows={4} placeholder="Paste JSON backup data here..." value={jsonImportInput} onChange={(e) => setJsonImportInput(e.target.value)} className="admin-textarea editor-code-font margin-top-sm" />
                <button onClick={() => { if (jsonImportInput) { const ok = importData(jsonImportInput); if (ok) setJsonImportInput(''); } }} className="btn-admin-secondary margin-top-sm"><Upload size={16} /> Import</button>
              </div>
              <div className="admin-card glass-panel margin-top-lg card-danger-zone">
                <h3 className="card-section-title danger-title"><RefreshCw size={18} /> Reset All Portfolio Data</h3>
                <p className="card-desc">Reset all edits back to the default content.</p>
                <button onClick={() => { if (window.confirm('Reset all data back to defaults?')) resetToDefaults(); }} className="btn-admin-danger margin-top-sm"><RefreshCw size={16} /> Reset to Defaults</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
