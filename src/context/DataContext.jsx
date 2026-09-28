import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { profile as initialProfile } from '../data/profile';
import { journey as initialJourney } from '../data/journey';
import { skills as initialSkills } from '../data/skills';
import { services as initialServices } from '../data/services';
import { projects as initialProjects } from '../data/projects';
import { parseMarkdown } from '../utils/markdown';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  PROFILE: 'portfolio_profile_v1',
  JOURNEY: 'portfolio_journey_v1',
  DOCS: 'portfolio_technical_docs_v1',
  PROJECTS: 'portfolio_projects_v1',
  SKILLS: 'portfolio_skills_v1',
  SERVICES: 'portfolio_services_v1',
  CERTIFICATIONS: 'portfolio_certifications_v1',
  PILLARS: 'portfolio_pillars_v1',
};

const DEFAULT_PILLARS = [
  {
    id: 'pillar-design',
    title: 'Design & Requirements',
    description: 'Every system starts on paper. I translate a need into precise requirements before a single line is written.',
    items: [
      'Software Requirements Specifications (SRS)',
      'Requirement traces and wireframes',
      'System architecture and data modeling',
      'QA-lead review and acceptance criteria',
    ],
  },
  {
    id: 'pillar-document',
    title: 'Document & Communicate',
    description: 'I hand off specs a developer or an AI can implement without guessing — security and decisions already resolved.',
    items: [
      'Ready-to-implement technical documentation',
      'API contracts and integration guides',
      'Demos, READMEs, and developer-facing docs',
    ],
  },
  {
    id: 'pillar-build',
    title: 'Build & Secure',
    description: 'I use AI-assisted implementation to turn the spec into a working, secured system.',
    items: [
      'AI-assisted implementation from spec to system',
      'Secure-by-design application layers',
      'Verification, testing, and hardening',
    ],
  },
];

const DEFAULT_CERTIFICATIONS = [
  {
    id: 'cert-fortinet',
    name: 'Fortinet NSE 1 & 2',
    issuer: 'Fortinet',
    status: 'Earned',
    date: '',
    credentialId: '',
    verifyUrl: '',
  },
  {
    id: 'cert-ai-ds',
    name: 'AI & Data Science',
    issuer: 'University of Tokyo',
    status: 'In Progress',
    date: '',
    credentialId: '',
    verifyUrl: '',
  },
  {
    id: 'cert-nde',
    name: 'Network Defense Essentials (NDE)',
    issuer: 'EC-Council',
    status: 'Planned',
    date: '',
    credentialId: '',
    verifyUrl: '',
  },
];

// Load initial blog posts from src/content/blog/ if available
const loadInitialDocs = () => {
  try {
    const globbed = import.meta.glob('/src/content/blog/*.md', { query: '?raw', eager: true });
    const loaded = Object.entries(globbed).map(([path, fileModule], index) => {
      const filename = path.split('/').pop().replace('.md', '');
      const rawContent = typeof fileModule === 'string' ? fileModule : (fileModule.default || '');
      const { metadata, content } = parseMarkdown(rawContent);

      return {
        id: `doc-default-${index + 1}`,
        slug: filename,
        title: metadata.title || filename.replace(/-/g, ' '),
        category: metadata.category || 'Web Development',
        tags: Array.isArray(metadata.tags) ? metadata.tags : [],
        date: metadata.date || new Date().toISOString().split('T')[0],
        readTime: metadata.readTime || '5 min read',
        summary: metadata.summary || 'Technical documentation and analysis.',
        content: content || rawContent,
        status: 'published',
        fileUrl: '',
        fileName: '',
        fileType: '',
      };
    });

    if (loaded.length > 0) return loaded;
  } catch (e) {
    console.warn('Fallback loading blog docs:', e);
  }
  return [];
};

// ---- persistence helpers ---------------------------------------------------
function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return fallback;
}

function withIds(list, prefix) {
  return list.map((item, idx) => ({ ...item, id: item.id || `${prefix}-${idx + 1}` }));
}

// ---- row mappers (DB snake_case <-> app camelCase) --------------------------
const profileToDb = (p) => ({
  id: 1,
  name: p.name,
  title: p.title,
  headline: p.headline,
  avatar_symbol: p.avatarSymbol,
  photo_path: p.photoPath,
  email: p.email,
  bio: p.bio,
  summary: p.summary,
  education: p.education || [],
  about_details: p.aboutDetails || [],
  updated_at: new Date().toISOString(),
});

const docToDb = (d) => ({
  title: d.title,
  slug: d.slug,
  category: d.category,
  tags: d.tags || [],
  date: d.date,
  read_time: d.readTime,
  summary: d.summary,
  content: d.content || '',
  status: d.status || 'published',
  file_url: d.fileUrl || '',
  file_name: d.fileName || '',
  file_type: d.fileType || '',
});

const projectToDb = (p) => ({
  title: p.title,
  description: p.description,
  long_description: p.longDescription,
  technologies: p.technologies || [],
  features: p.features || [],
  challenges_solved: p.challengesSolved,
  lessons_learned: p.lessonsLearned,
  github_link: p.githubLink,
  demo_link: p.demoLink,
  tags: p.tags || [],
  featured: p.featured || false,
});

const serviceToDb = (s) => ({
  title: s.title,
  icon: s.icon,
  tagline: s.tagline,
  details: s.details || [],
});

const certificationToDb = (c) => ({
  name: c.name,
  issuer: c.issuer,
  status: c.status || 'Earned',
  date: c.date || '',
  credential_id: c.credentialId || '',
  verify_url: c.verifyUrl || '',
});

const pillarToDb = (p) => ({
  title: p.title,
  description: p.description,
  items: p.items || [],
});

export const DataProvider = ({ children }) => {
  // ---- State ----
  const [profile, setProfile] = useState(() =>
    readStorage(STORAGE_KEYS.PROFILE, initialProfile)
  );
  const [journey, setJourney] = useState(() =>
    withIds(readStorage(STORAGE_KEYS.JOURNEY, initialJourney), 'journey')
  );
  const [technicalDocs, setTechnicalDocs] = useState(() =>
    readStorage(STORAGE_KEYS.DOCS, loadInitialDocs())
  );
  const [projects, setProjects] = useState(() =>
    readStorage(STORAGE_KEYS.PROJECTS, initialProjects)
  );
  const [skills, setSkills] = useState(() =>
    readStorage(STORAGE_KEYS.SKILLS, initialSkills)
  );
  const [services, setServices] = useState(() =>
    readStorage(STORAGE_KEYS.SERVICES, initialServices)
  );
  const [certifications, setCertifications] = useState(() =>
    withIds(readStorage(STORAGE_KEYS.CERTIFICATIONS, DEFAULT_CERTIFICATIONS), 'cert')
  );
  const [pillars, setPillars] = useState(() =>
    withIds(readStorage(STORAGE_KEYS.PILLARS, DEFAULT_PILLARS), 'pillar')
  );

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(!isSupabaseConfigured);
  const [toast, setToast] = useState(null);

  // ---- localStorage sync (fallback persistence) ----
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNEY, JSON.stringify(journey));
  }, [journey]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(technicalDocs));
  }, [technicalDocs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  }, [skills]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(certifications));
  }, [certifications]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PILLARS, JSON.stringify(pillars));
  }, [pillars]);

  // ---- Supabase auth session ----
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsAuthenticated(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- Hydrate from Supabase on mount ----
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      try {
        const [
          profileRes, journeyRes, docsRes, projectsRes,
          skillsRes, servicesRes, certsRes, pillarsRes,
        ] = await Promise.all([
          supabase.from('profile').select('*').maybeSingle(),
          supabase.from('journey').select('*').order('sort_order'),
          supabase.from('docs').select('*').order('created_at', { ascending: false }),
          supabase.from('projects').select('*').order('sort_order'),
          supabase.from('skills').select('*').maybeSingle(),
          supabase.from('services').select('*').order('sort_order'),
          supabase.from('certifications').select('*').order('sort_order'),
          supabase.from('pillars').select('*').order('sort_order'),
        ]);

        if (profileRes.data) {
          const p = profileRes.data;
          setProfile({
            name: p.name, title: p.title, headline: p.headline,
            avatarSymbol: p.avatar_symbol, photoPath: p.photo_path, email: p.email,
            bio: p.bio, summary: p.summary,
            education: p.education || [], aboutDetails: p.about_details || [],
          });
        }
        if (journeyRes.data?.length) {
          setJourney(journeyRes.data.map((r) => ({
            id: r.id, year: r.year, title: r.title, subtitle: r.subtitle, description: r.description,
          })));
        }
        if (docsRes.data?.length) {
          setTechnicalDocs(docsRes.data.map((r) => ({
            id: r.id, title: r.title, slug: r.slug, category: r.category, tags: r.tags || [],
            date: r.date, readTime: r.read_time, summary: r.summary, content: r.content || '',
            status: r.status, fileUrl: r.file_url || '', fileName: r.file_name || '', fileType: r.file_type || '',
          })));
        }
        if (projectsRes.data?.length) {
          setProjects(projectsRes.data.map((r) => ({
            id: r.id, title: r.title, description: r.description, longDescription: r.long_description,
            technologies: r.technologies || [], features: r.features || [], challengesSolved: r.challenges_solved,
            lessonsLearned: r.lessons_learned, githubLink: r.github_link || '', demoLink: r.demo_link || '',
            tags: r.tags || [], featured: r.featured || false,
          })));
        }
        if (skillsRes.data?.data) setSkills(skillsRes.data.data);
        if (servicesRes.data?.length) {
          setServices(servicesRes.data.map((r) => ({
            id: r.id, title: r.title, icon: r.icon, tagline: r.tagline, details: r.details || [],
          })));
        }
        if (certsRes.data?.length) {
          setCertifications(certsRes.data.map((r) => ({
            id: r.id, name: r.name, issuer: r.issuer, status: r.status, date: r.date || '',
            credentialId: r.credential_id || '', verifyUrl: r.verify_url || '',
          })));
        }
        if (pillarsRes.data?.length) {
          setPillars(pillarsRes.data.map((r) => ({
            id: r.id, title: r.title, description: r.description, items: r.items || [],
          })));
        }
      } catch (e) {
        console.warn('Supabase hydration failed:', e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // ---- toast ----
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ---- Profile ----
  const updateProfile = (updatedFields) => {
    setProfile((prev) => {
      const next = { ...prev, ...updatedFields };
      if (supabase) supabase.from('profile').upsert(profileToDb(next)).then(({ error }) => {
        if (error) console.error('updateProfile', error);
      });
      return next;
    });
    showToast('Profile updated successfully!');
  };

  // ---- Journey ----
  const persistJourney = (list) => {
    if (!supabase) return;
    list.forEach((item, i) => {
      const payload = { year: item.year, title: item.title, subtitle: item.subtitle, description: item.description, sort_order: i };
      supabase.from('journey').upsert({ id: item.id, ...payload }).then(({ error }) => {
        if (error) console.error('journey', error);
      });
    });
  };
  const addJourneyItem = (item) => {
    const newItem = { ...item, id: `journey-${Date.now()}` };
    setJourney((prev) => [...prev, newItem]);
    if (supabase) {
      supabase.from('journey').insert({ year: item.year, title: item.title, subtitle: item.subtitle, description: item.description, sort_order: journey.length }).then(({ error }) => {
        if (error) console.error('addJourneyItem', error);
      });
    }
    showToast('New journey milestone added!');
  };
  const updateJourneyItem = (id, updatedFields) => {
    setJourney((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item)));
    if (supabase) {
      supabase.from('journey').update({
        year: updatedFields.year, title: updatedFields.title,
        subtitle: updatedFields.subtitle, description: updatedFields.description,
      }).eq('id', id).then(({ error }) => { if (error) console.error(error); });
    }
    showToast('Journey milestone updated!');
  };
  const deleteJourneyItem = (id) => {
    setJourney((prev) => prev.filter((item) => item.id !== id));
    if (supabase) supabase.from('journey').delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
    showToast('Milestone removed.', 'info');
  };
  const reorderJourney = (newList) => {
    setJourney(newList);
    persistJourney(newList);
  };

  // ---- Technical Docs ----
  const saveTechnicalDoc = (doc) => {
    setTechnicalDocs((prev) => {
      const slug = (doc.slug || doc.title || 'doc')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const formattedDoc = {
        ...doc,
        id: doc.id || `doc-${Date.now()}`,
        slug: slug || `doc-${Date.now()}`,
        tags: Array.isArray(doc.tags) ? doc.tags
          : typeof doc.tags === 'string' ? doc.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        date: doc.date || new Date().toISOString().split('T')[0],
        status: doc.status || 'published',
      };
      const existingIndex = prev.findIndex((d) => d.id === formattedDoc.id || (formattedDoc.slug && d.slug === formattedDoc.slug));
      const next = existingIndex >= 0
        ? prev.map((d, i) => (i === existingIndex ? formattedDoc : d))
        : [formattedDoc, ...prev];

      if (supabase) {
        const dbPayload = docToDb(formattedDoc);
        if (existingIndex >= 0) {
          supabase.from('docs').update(dbPayload).eq('id', formattedDoc.id).then(({ error }) => { if (error) console.error(error); });
        } else {
          supabase.from('docs').insert(dbPayload).then(({ error }) => { if (error) console.error(error); });
        }
      }
      return next;
    });
    showToast(doc.id ? 'Document updated!' : 'Document created & saved!');
  };
  const deleteTechnicalDoc = (idOrSlug) => {
    setTechnicalDocs((prev) => prev.filter((d) => d.id !== idOrSlug && d.slug !== idOrSlug));
    if (supabase) supabase.from('docs').delete().eq('id', idOrSlug).then(({ error }) => { if (error) console.error(error); });
    showToast('Document deleted.', 'info');
  };

  // ---- Projects ----
  const persistProjects = (list) => {
    if (!supabase) return;
    list.forEach((p, i) => {
      supabase.from('projects').upsert({ id: p.id, ...projectToDb(p), sort_order: i }).then(({ error }) => {
        if (error) console.error('project', error);
      });
    });
  };
  const saveProject = (project) => {
    setProjects((prev) => {
      const existing = prev.findIndex((p) => p.id === project.id);
      const next = existing >= 0
        ? prev.map((p, i) => (i === existing ? project : p))
        : [...prev, project];
      if (supabase) {
        const payload = { ...projectToDb(project), sort_order: existing >= 0 ? existing : prev.length };
        if (existing >= 0) {
          supabase.from('projects').update(payload).eq('id', project.id).then(({ error }) => { if (error) console.error(error); });
        } else {
          supabase.from('projects').insert(payload).then(({ error }) => { if (error) console.error(error); });
        }
      }
      return next;
    });
    showToast(project.id ? 'Project updated!' : 'Project added!');
  };
  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (supabase) supabase.from('projects').delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
    showToast('Project removed.', 'info');
  };
  const reorderProjects = (newList) => {
    setProjects(newList);
    persistProjects(newList);
  };

  // ---- Skills ----
  const saveSkills = (skillsObject) => {
    setSkills(skillsObject);
    if (supabase) supabase.from('skills').upsert({ id: 1, data: skillsObject, updated_at: new Date().toISOString() }).then(({ error }) => { if (error) console.error(error); });
    showToast('Skills updated!');
  };

  // ---- Services ----
  const persistServices = (list) => {
    if (!supabase) return;
    list.forEach((s, i) => {
      supabase.from('services').upsert({ id: s.id, ...serviceToDb(s), sort_order: i }).then(({ error }) => { if (error) console.error(error); });
    });
  };
  const saveService = (service) => {
    setServices((prev) => {
      const existing = prev.findIndex((s) => s.id === service.id);
      const next = existing >= 0 ? prev.map((s, i) => (i === existing ? service : s)) : [...prev, service];
      if (supabase) {
        const payload = { ...serviceToDb(service), sort_order: existing >= 0 ? existing : prev.length };
        if (existing >= 0) supabase.from('services').update(payload).eq('id', service.id).then(({ error }) => { if (error) console.error(error); });
        else supabase.from('services').insert(payload).then(({ error }) => { if (error) console.error(error); });
      }
      return next;
    });
    showToast(service.id ? 'Service updated!' : 'Service added!');
  };
  const deleteService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (supabase) supabase.from('services').delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
    showToast('Service removed.', 'info');
  };
  const reorderServices = (newList) => {
    setServices(newList);
    persistServices(newList);
  };

  // ---- Certifications ----
  const persistCertifications = (list) => {
    if (!supabase) return;
    list.forEach((c, i) => {
      supabase.from('certifications').upsert({ id: c.id, ...certificationToDb(c), sort_order: i }).then(({ error }) => { if (error) console.error(error); });
    });
  };
  const saveCertification = (cert) => {
    setCertifications((prev) => {
      const existing = prev.findIndex((c) => c.id === cert.id);
      const next = existing >= 0 ? prev.map((c, i) => (i === existing ? cert : c)) : [...prev, cert];
      if (supabase) {
        const payload = { ...certificationToDb(cert), sort_order: existing >= 0 ? existing : prev.length };
        if (existing >= 0) supabase.from('certifications').update(payload).eq('id', cert.id).then(({ error }) => { if (error) console.error(error); });
        else supabase.from('certifications').insert(payload).then(({ error }) => { if (error) console.error(error); });
      }
      return next;
    });
    showToast(cert.id ? 'Certification updated!' : 'Certification added!');
  };
  const deleteCertification = (id) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
    if (supabase) supabase.from('certifications').delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
    showToast('Certification removed.', 'info');
  };
  const reorderCertifications = (newList) => {
    setCertifications(newList);
    persistCertifications(newList);
  };

  // ---- Pillars (How I Work) ----
  const persistPillars = (list) => {
    if (!supabase) return;
    list.forEach((p, i) => {
      supabase.from('pillars').upsert({ id: p.id, ...pillarToDb(p), sort_order: i }).then(({ error }) => { if (error) console.error(error); });
    });
  };
  const savePillar = (pillar) => {
    setPillars((prev) => {
      const existing = prev.findIndex((p) => p.id === pillar.id);
      const next = existing >= 0 ? prev.map((p, i) => (i === existing ? pillar : p)) : [...prev, pillar];
      if (supabase) {
        const payload = { ...pillarToDb(pillar), sort_order: existing >= 0 ? existing : prev.length };
        if (existing >= 0) supabase.from('pillars').update(payload).eq('id', pillar.id).then(({ error }) => { if (error) console.error(error); });
        else supabase.from('pillars').insert(payload).then(({ error }) => { if (error) console.error(error); });
      }
      return next;
    });
    showToast(pillar.id ? 'Pillar updated!' : 'Pillar added!');
  };
  const deletePillar = (id) => {
    setPillars((prev) => prev.filter((p) => p.id !== id));
    if (supabase) supabase.from('pillars').delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
    showToast('Pillar removed.', 'info');
  };
  const reorderPillars = (newList) => {
    setPillars(newList);
    persistPillars(newList);
  };

  // ---- Backup & Reset ----
  const resetToDefaults = () => {
    setProfile(initialProfile);
    setJourney(withIds(initialJourney, 'journey'));
    setTechnicalDocs(loadInitialDocs());
    setProjects(initialProjects);
    setSkills(initialSkills);
    setServices(initialServices);
    setCertifications(withIds(DEFAULT_CERTIFICATIONS, 'cert'));
    setPillars(withIds(DEFAULT_PILLARS, 'pillar'));
    showToast('All portfolio data reset to defaults.', 'info');
  };

  const exportData = () => {
    const data = {
      profile, journey, technicalDocs, projects, skills, services, certifications, pillars,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported successfully!');
  };

  const importData = (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.profile) { setProfile(parsed.profile); if (supabase) supabase.from('profile').upsert(profileToDb(parsed.profile)).then(() => {}); }
      if (parsed.journey) { setJourney(parsed.journey); persistJourney(parsed.journey); }
      if (parsed.technicalDocs) setTechnicalDocs(parsed.technicalDocs);
      if (parsed.projects) { setProjects(parsed.projects); persistProjects(parsed.projects); }
      if (parsed.skills) { setSkills(parsed.skills); if (supabase) supabase.from('skills').upsert({ id: 1, data: parsed.skills }).then(() => {}); }
      if (parsed.services) { setServices(parsed.services); persistServices(parsed.services); }
      if (parsed.certifications) { setCertifications(parsed.certifications); persistCertifications(parsed.certifications); }
      if (parsed.pillars) { setPillars(parsed.pillars); persistPillars(parsed.pillars); }
      showToast('Portfolio data restored successfully!');
      return true;
    } catch (e) {
      showToast('Failed to parse backup JSON: ' + e.message, 'error');
      return false;
    }
  };

  // ---- Auth ----
  const loginAdmin = async (email, password) => {
    if (!supabase) {
      showToast('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return false;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast(error.message || 'Invalid credentials.', 'error');
      return false;
    }
    if (data.user) {
      setIsAuthenticated(true);
      setIsAdminOpen(true);
      showToast('Welcome back, Admin!');
      return true;
    }
    return false;
  };

  const logoutAdmin = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdminOpen(false);
    showToast('Logged out.', 'info');
  };

  const openAdminModal = () => setIsAdminOpen(true);
  const closeAdminModal = () => setIsAdminOpen(false);

  return (
    <DataContext.Provider
      value={{
        profile, updateProfile,
        journey, addJourneyItem, updateJourneyItem, deleteJourneyItem, reorderJourney,
        technicalDocs, saveTechnicalDoc, deleteTechnicalDoc,
        projects, saveProject, deleteProject, reorderProjects,
        skills, saveSkills,
        services, saveService, deleteService, reorderServices,
        certifications, saveCertification, deleteCertification, reorderCertifications,
        pillars, savePillar, deletePillar, reorderPillars,
        resetToDefaults, exportData, importData,
        isAdminOpen, isAuthenticated, loginAdmin, logoutAdmin, openAdminModal, closeAdminModal,
        isSupabaseConfigured, hydrated,
        toast, showToast,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
