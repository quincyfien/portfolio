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

// Valid UUID checker for PostgreSQL UUID column compatibility
function isUuid(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Generate a client-side UUID v4
function newUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Ensure every item in a list has a valid UUID, preserving existing ones or assigning new ones
function withUuids(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => ({
    ...item,
    id: isUuid(item?.id) ? item.id : newUuid(),
  }));
}

const DEFAULT_PILLARS = [
  {
    id: '88b9c0d1-f2a3-4b4c-9d6e-7f8a9b0c1d2e',
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
    id: '79c0d1e2-a3b4-4c5d-9e7f-8a9b0c1d2e3f',
    title: 'Document & Communicate',
    description: 'I hand off specs a developer or an AI can implement without guessing — security and decisions already resolved.',
    items: [
      'Ready-to-implement technical documentation',
      'API contracts and integration guides',
      'Demos, READMEs, and developer-facing docs',
    ],
  },
  {
    id: '6ad1e2f3-b4c5-4d6e-9f8a-9b0c1d2e3f4a',
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
    id: 'b5e6f7a8-c9d0-4e1f-a23b-4c5d6e7f8a9b',
    name: 'Fortinet NSE 1 & 2',
    issuer: 'Fortinet',
    status: 'Earned',
    date: '',
    credentialId: '',
    verifyUrl: '',
  },
  {
    id: 'a6f7a8b9-d0e1-4f2a-b34c-5d6e7f8a9b0c',
    name: 'AI & Data Science',
    issuer: 'University of Tokyo',
    status: 'In Progress',
    date: '',
    credentialId: '',
    verifyUrl: '',
  },
  {
    id: '97a8b9c0-e1f2-4a3b-8c5d-6e7f8a9b0c1d',
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
    const loaded = Object.entries(globbed).map(([path, fileModule]) => {
      const filename = path.split('/').pop().replace('.md', '');
      const rawContent = typeof fileModule === 'string' ? fileModule : (fileModule.default || '');
      const { metadata, content } = parseMarkdown(rawContent);

      return {
        id: newUuid(),
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

// ---- row mappers (DB snake_case <-> app camelCase) --------------------------
const profileToDb = (p) => ({
  id: 1,
  name: p.name || '',
  title: p.title || '',
  headline: p.headline || '',
  avatar_symbol: p.avatarSymbol || '',
  photo_path: p.photoPath || '',
  email: p.email || '',
  bio: p.bio || '',
  summary: p.summary || '',
  education: p.education || [],
  about_details: p.aboutDetails || [],
  updated_at: new Date().toISOString(),
});

const docToDb = (d) => ({
  title: d.title || '',
  slug: d.slug || '',
  category: d.category || '',
  tags: d.tags || [],
  date: d.date || '',
  read_time: d.readTime || '',
  summary: d.summary || '',
  content: d.content || '',
  status: d.status || 'published',
  file_url: d.fileUrl || '',
  file_name: d.fileName || '',
  file_type: d.fileType || '',
});

const projectToDb = (p) => ({
  title: p.title || '',
  description: p.description || '',
  long_description: p.longDescription || '',
  technologies: p.technologies || [],
  features: p.features || [],
  challenges_solved: p.challengesSolved || '',
  lessons_learned: p.lessonsLearned || '',
  github_link: p.githubLink || '',
  demo_link: p.demoLink || '',
  tags: p.tags || [],
  featured: p.featured || false,
});

const serviceToDb = (s) => ({
  title: s.title || '',
  icon: s.icon || 'FileText',
  tagline: s.tagline || '',
  details: s.details || [],
});

const certificationToDb = (c) => ({
  name: c.name || '',
  issuer: c.issuer || '',
  status: c.status || 'Earned',
  date: c.date || '',
  credential_id: c.credentialId || '',
  verify_url: c.verifyUrl || '',
});

const pillarToDb = (p) => ({
  title: p.title || '',
  description: p.description || '',
  items: p.items || [],
});

export const DataProvider = ({ children }) => {
  // ---- State (all items with valid UUIDs) ----
  const [profile, setProfile] = useState(() =>
    readStorage(STORAGE_KEYS.PROFILE, initialProfile)
  );
  const [journey, setJourney] = useState(() =>
    withUuids(readStorage(STORAGE_KEYS.JOURNEY, initialJourney))
  );
  const [technicalDocs, setTechnicalDocs] = useState(() =>
    withUuids(readStorage(STORAGE_KEYS.DOCS, loadInitialDocs()))
  );
  const [projects, setProjects] = useState(() =>
    withUuids(readStorage(STORAGE_KEYS.PROJECTS, initialProjects))
  );
  const [skills, setSkills] = useState(() =>
    readStorage(STORAGE_KEYS.SKILLS, initialSkills)
  );
  const [services, setServices] = useState(() =>
    withUuids(readStorage(STORAGE_KEYS.SERVICES, initialServices))
  );
  const [certifications, setCertifications] = useState(() =>
    withUuids(readStorage(STORAGE_KEYS.CERTIFICATIONS, DEFAULT_CERTIFICATIONS))
  );
  const [pillars, setPillars] = useState(() =>
    withUuids(readStorage(STORAGE_KEYS.PILLARS, DEFAULT_PILLARS))
  );

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(!isSupabaseConfigured);
  const [toast, setToast] = useState(null);

  // ---- localStorage sync (client-side backup persistence) ----
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
    let isMounted = true;
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

        if (!isMounted) return;

        if (profileRes.data) {
          const p = profileRes.data;
          setProfile({
            name: p.name || '', title: p.title || '', headline: p.headline || '',
            avatarSymbol: p.avatar_symbol || '', photoPath: p.photo_path || '', email: p.email || '',
            bio: p.bio || '', summary: p.summary || '',
            education: p.education || [], aboutDetails: p.about_details || [],
          });
        }
        if (journeyRes.data && journeyRes.data.length > 0) {
          setJourney(journeyRes.data.map((r) => ({
            id: r.id, year: r.year, title: r.title, subtitle: r.subtitle, description: r.description,
          })));
        }
        if (docsRes.data && docsRes.data.length > 0) {
          setTechnicalDocs(docsRes.data.map((r) => ({
            id: r.id, title: r.title, slug: r.slug, category: r.category, tags: r.tags || [],
            date: r.date, readTime: r.read_time, summary: r.summary, content: r.content || '',
            status: r.status, fileUrl: r.file_url || '', fileName: r.file_name || '', fileType: r.file_type || '',
          })));
        }
        if (projectsRes.data && projectsRes.data.length > 0) {
          setProjects(projectsRes.data.map((r) => ({
            id: r.id, title: r.title, description: r.description, longDescription: r.long_description,
            technologies: r.technologies || [], features: r.features || [], challengesSolved: r.challenges_solved,
            lessonsLearned: r.lessons_learned, githubLink: r.github_link || '', demoLink: r.demo_link || '',
            tags: r.tags || [], featured: r.featured || false,
          })));
        }
        if (skillsRes.data?.data) {
          setSkills(skillsRes.data.data);
        }
        if (servicesRes.data && servicesRes.data.length > 0) {
          setServices(servicesRes.data.map((r) => ({
            id: r.id, title: r.title, icon: r.icon, tagline: r.tagline, details: r.details || [],
          })));
        }
        if (certsRes.data && certsRes.data.length > 0) {
          setCertifications(certsRes.data.map((r) => ({
            id: r.id, name: r.name, issuer: r.issuer, status: r.status, date: r.date || '',
            credentialId: r.credential_id || '', verifyUrl: r.verify_url || '',
          })));
        }
        if (pillarsRes.data && pillarsRes.data.length > 0) {
          setPillars(pillarsRes.data.map((r) => ({
            id: r.id, title: r.title, description: r.description, items: r.items || [],
          })));
        }
      } catch (e) {
        console.warn('Supabase hydration failed:', e);
      } finally {
        if (isMounted) setHydrated(true);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // ---- Toast notification helper ----
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ---- Profile ----
  const updateProfile = async (updatedFields) => {
    const next = { ...profile, ...updatedFields };
    if (supabase) {
      const { error } = await supabase.from('profile').upsert(profileToDb(next));
      if (error) {
        console.error('updateProfile error:', error);
        showToast('Failed to save profile to server: ' + error.message, 'error');
        return false;
      }
    }
    setProfile(next);
    showToast('Profile updated successfully!');
    return true;
  };

  // ---- Journey ----
  const addJourneyItem = async (item) => {
    const id = newUuid();
    const newItem = { ...item, id };
    if (supabase) {
      const { error } = await supabase.from('journey').insert({
        id,
        year: item.year,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        sort_order: journey.length,
      });
      if (error) {
        console.error('addJourneyItem error:', error);
        showToast('Failed to add milestone to server: ' + error.message, 'error');
        return false;
      }
    }
    setJourney((prev) => [...prev, newItem]);
    showToast('New journey milestone added!');
    return true;
  };

  const updateJourneyItem = async (id, updatedFields) => {
    const targetId = isUuid(id) ? id : newUuid();
    if (supabase) {
      let error;
      if (isUuid(id)) {
        const res = await supabase.from('journey').update({
          year: updatedFields.year,
          title: updatedFields.title,
          subtitle: updatedFields.subtitle,
          description: updatedFields.description,
        }).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('journey').insert({
          id: targetId,
          year: updatedFields.year,
          title: updatedFields.title,
          subtitle: updatedFields.subtitle,
          description: updatedFields.description,
          sort_order: journey.findIndex((j) => j.id === id),
        });
        error = res.error;
      }
      if (error) {
        console.error('updateJourneyItem error:', error);
        showToast('Failed to update milestone on server: ' + error.message, 'error');
        return false;
      }
    }
    setJourney((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedFields, id: targetId } : item)));
    showToast('Journey milestone updated!');
    return true;
  };

  const deleteJourneyItem = async (id) => {
    if (supabase && isUuid(id)) {
      const { error } = await supabase.from('journey').delete().eq('id', id);
      if (error) {
        console.error('deleteJourneyItem error:', error);
        showToast('Failed to delete milestone on server: ' + error.message, 'error');
        return false;
      }
    }
    setJourney((prev) => prev.filter((item) => item.id !== id));
    showToast('Milestone removed.', 'info');
    return true;
  };

  const reorderJourney = async (newList) => {
    const listWithUuids = withUuids(newList);
    setJourney(listWithUuids);
    if (supabase) {
      for (let i = 0; i < listWithUuids.length; i++) {
        const item = listWithUuids[i];
        await supabase.from('journey').upsert({
          id: item.id,
          year: item.year,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          sort_order: i,
        });
      }
    }
  };

  // ---- Technical Docs ----
  const saveTechnicalDoc = async (doc) => {
    const slug = (doc.slug || doc.title || 'doc')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const isNew = !doc.id || !isUuid(doc.id);
    const id = isNew ? (isUuid(doc.id) ? doc.id : newUuid()) : doc.id;
    const formattedDoc = {
      ...doc,
      id,
      slug: slug || `doc-${Date.now()}`,
      tags: Array.isArray(doc.tags) ? doc.tags
        : typeof doc.tags === 'string' ? doc.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      date: doc.date || new Date().toISOString().split('T')[0],
      status: doc.status || 'published',
    };

    if (supabase) {
      const existing = technicalDocs.findIndex((d) => d.id === doc.id || d.id === id || (formattedDoc.slug && d.slug === formattedDoc.slug));
      const dbPayload = docToDb(formattedDoc);
      let error;
      if (existing >= 0 && isUuid(doc.id)) {
        const res = await supabase.from('docs').update(dbPayload).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('docs').insert({ id, ...dbPayload });
        error = res.error;
      }
      if (error) {
        console.error('saveTechnicalDoc error:', error);
        showToast('Failed to save document on server: ' + error.message, 'error');
        return false;
      }
    }

    setTechnicalDocs((prev) => {
      const existing = prev.findIndex((d) => d.id === doc.id || d.id === id || (formattedDoc.slug && d.slug === formattedDoc.slug));
      if (existing >= 0) {
        return prev.map((d, i) => (i === existing ? formattedDoc : d));
      }
      return [formattedDoc, ...prev];
    });
    showToast(doc.id ? 'Document updated!' : 'Document created & saved!');
    return true;
  };

  const deleteTechnicalDoc = async (idOrSlug) => {
    if (supabase) {
      let query = supabase.from('docs').delete();
      if (isUuid(idOrSlug)) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }
      const { error } = await query;
      if (error) {
        console.error('deleteTechnicalDoc error:', error);
        showToast('Failed to delete document on server: ' + error.message, 'error');
        return false;
      }
    }
    setTechnicalDocs((prev) => prev.filter((d) => d.id !== idOrSlug && d.slug !== idOrSlug));
    showToast('Document deleted.', 'info');
    return true;
  };

  // ---- Projects ----
  const saveProject = async (project) => {
    const isNew = !project.id || !isUuid(project.id);
    const id = isNew ? (isUuid(project.id) ? project.id : newUuid()) : project.id;
    const withId = { ...project, id };

    if (supabase) {
      const existing = projects.findIndex((p) => p.id === project.id || p.id === id);
      const payload = { ...projectToDb(withId), sort_order: existing >= 0 ? existing : projects.length };
      let error;
      if (existing >= 0 && isUuid(project.id)) {
        const res = await supabase.from('projects').update(payload).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('projects').insert({ id, ...payload });
        error = res.error;
      }
      if (error) {
        console.error('saveProject error:', error);
        showToast('Failed to save project on server: ' + error.message, 'error');
        return false;
      }
    }

    setProjects((prev) => {
      const existing = prev.findIndex((p) => p.id === project.id || p.id === id);
      if (existing >= 0) {
        return prev.map((p, i) => (i === existing ? withId : p));
      }
      return [...prev, withId];
    });
    showToast(project.id ? 'Project updated!' : 'Project added!');
    return true;
  };

  const deleteProject = async (id) => {
    if (supabase && isUuid(id)) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('deleteProject error:', error);
        showToast('Failed to delete project on server: ' + error.message, 'error');
        return false;
      }
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast('Project removed.', 'info');
    return true;
  };

  const reorderProjects = async (newList) => {
    const listWithUuids = withUuids(newList);
    setProjects(listWithUuids);
    if (supabase) {
      for (let i = 0; i < listWithUuids.length; i++) {
        const p = listWithUuids[i];
        await supabase.from('projects').upsert({ id: p.id, ...projectToDb(p), sort_order: i });
      }
    }
  };

  // ---- Skills ----
  const saveSkills = async (skillsObject) => {
    if (supabase) {
      const { error } = await supabase.from('skills').upsert({
        id: 1,
        data: skillsObject,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('saveSkills error:', error);
        showToast('Failed to save skills on server: ' + error.message, 'error');
        return false;
      }
    }
    setSkills(skillsObject);
    showToast('Skills updated successfully!');
    return true;
  };

  // ---- Services ----
  const saveService = async (service) => {
    const isNew = !service.id || !isUuid(service.id);
    const id = isNew ? (isUuid(service.id) ? service.id : newUuid()) : service.id;
    const withId = { ...service, id };

    if (supabase) {
      const existing = services.findIndex((s) => s.id === service.id || s.id === id);
      const payload = { ...serviceToDb(withId), sort_order: existing >= 0 ? existing : services.length };
      let error;
      if (existing >= 0 && isUuid(service.id)) {
        const res = await supabase.from('services').update(payload).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('services').insert({ id, ...payload });
        error = res.error;
      }
      if (error) {
        console.error('saveService error:', error);
        showToast('Failed to save service on server: ' + error.message, 'error');
        return false;
      }
    }

    setServices((prev) => {
      const existing = prev.findIndex((s) => s.id === service.id || s.id === id);
      if (existing >= 0) return prev.map((s, i) => (i === existing ? withId : s));
      return [...prev, withId];
    });
    showToast(service.id ? 'Service updated!' : 'Service added!');
    return true;
  };

  const deleteService = async (id) => {
    if (supabase && isUuid(id)) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) {
        console.error('deleteService error:', error);
        showToast('Failed to delete service on server: ' + error.message, 'error');
        return false;
      }
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Service removed.', 'info');
    return true;
  };

  const reorderServices = async (newList) => {
    const listWithUuids = withUuids(newList);
    setServices(listWithUuids);
    if (supabase) {
      for (let i = 0; i < listWithUuids.length; i++) {
        const s = listWithUuids[i];
        await supabase.from('services').upsert({ id: s.id, ...serviceToDb(s), sort_order: i });
      }
    }
  };

  // ---- Certifications ----
  const saveCertification = async (cert) => {
    const isNew = !cert.id || !isUuid(cert.id);
    const id = isNew ? (isUuid(cert.id) ? cert.id : newUuid()) : cert.id;
    const withId = { ...cert, id };

    if (supabase) {
      const existing = certifications.findIndex((c) => c.id === cert.id || c.id === id);
      const payload = { ...certificationToDb(withId), sort_order: existing >= 0 ? existing : certifications.length };
      let error;
      if (existing >= 0 && isUuid(cert.id)) {
        const res = await supabase.from('certifications').update(payload).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('certifications').insert({ id, ...payload });
        error = res.error;
      }
      if (error) {
        console.error('saveCertification error:', error);
        showToast('Failed to save certification on server: ' + error.message, 'error');
        return false;
      }
    }

    setCertifications((prev) => {
      const existing = prev.findIndex((c) => c.id === cert.id || c.id === id);
      if (existing >= 0) return prev.map((c, i) => (i === existing ? withId : c));
      return [...prev, withId];
    });
    showToast(cert.id ? 'Certification updated!' : 'Certification added!');
    return true;
  };

  const deleteCertification = async (id) => {
    if (supabase && isUuid(id)) {
      const { error } = await supabase.from('certifications').delete().eq('id', id);
      if (error) {
        console.error('deleteCertification error:', error);
        showToast('Failed to delete certification on server: ' + error.message, 'error');
        return false;
      }
    }
    setCertifications((prev) => prev.filter((c) => c.id !== id));
    showToast('Certification removed.', 'info');
    return true;
  };

  const reorderCertifications = async (newList) => {
    const listWithUuids = withUuids(newList);
    setCertifications(listWithUuids);
    if (supabase) {
      for (let i = 0; i < listWithUuids.length; i++) {
        const c = listWithUuids[i];
        await supabase.from('certifications').upsert({ id: c.id, ...certificationToDb(c), sort_order: i });
      }
    }
  };

  // ---- Pillars (How I Work) ----
  const savePillar = async (pillar) => {
    const isNew = !pillar.id || !isUuid(pillar.id);
    const id = isNew ? (isUuid(pillar.id) ? pillar.id : newUuid()) : pillar.id;
    const withId = { ...pillar, id };

    if (supabase) {
      const existing = pillars.findIndex((p) => p.id === pillar.id || p.id === id);
      const payload = { ...pillarToDb(withId), sort_order: existing >= 0 ? existing : pillars.length };
      let error;
      if (existing >= 0 && isUuid(pillar.id)) {
        const res = await supabase.from('pillars').update(payload).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('pillars').insert({ id, ...payload });
        error = res.error;
      }
      if (error) {
        console.error('savePillar error:', error);
        showToast('Failed to save pillar on server: ' + error.message, 'error');
        return false;
      }
    }

    setPillars((prev) => {
      const existing = prev.findIndex((p) => p.id === pillar.id || p.id === id);
      if (existing >= 0) return prev.map((p, i) => (i === existing ? withId : p));
      return [...prev, withId];
    });
    showToast(pillar.id ? 'Pillar updated!' : 'Pillar added!');
    return true;
  };

  const deletePillar = async (id) => {
    if (supabase && isUuid(id)) {
      const { error } = await supabase.from('pillars').delete().eq('id', id);
      if (error) {
        console.error('deletePillar error:', error);
        showToast('Failed to delete pillar on server: ' + error.message, 'error');
        return false;
      }
    }
    setPillars((prev) => prev.filter((p) => p.id !== id));
    showToast('Pillar removed.', 'info');
    return true;
  };

  const reorderPillars = async (newList) => {
    const listWithUuids = withUuids(newList);
    setPillars(listWithUuids);
    if (supabase) {
      for (let i = 0; i < listWithUuids.length; i++) {
        const p = listWithUuids[i];
        await supabase.from('pillars').upsert({ id: p.id, ...pillarToDb(p), sort_order: i });
      }
    }
  };

  // ---- Push all current local state directly to Supabase ----
  const pushLocalToSupabase = async () => {
    if (!supabase) {
      showToast('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      showToast('Pushing local data to production server...', 'info');

      // 1. Reconcile UUIDs for any legacy string IDs
      const validJourney = withUuids(journey);
      const validDocs = withUuids(technicalDocs);
      const validProjects = withUuids(projects);
      const validServices = withUuids(services);
      const validCerts = withUuids(certifications);
      const validPillars = withUuids(pillars);

      setJourney(validJourney);
      setTechnicalDocs(validDocs);
      setProjects(validProjects);
      setServices(validServices);
      setCertifications(validCerts);
      setPillars(validPillars);

      // 2. Profile
      const { error: profileErr } = await supabase.from('profile').upsert(profileToDb(profile));
      if (profileErr) throw new Error(`Profile sync error: ${profileErr.message}`);

      // 3. Skills
      const { error: skillsErr } = await supabase.from('skills').upsert({
        id: 1,
        data: skills,
        updated_at: new Date().toISOString(),
      });
      if (skillsErr) throw new Error(`Skills sync error: ${skillsErr.message}`);

      // 4. Journey
      await supabase.from('journey').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const jRows = validJourney.map((item, i) => ({
        id: item.id,
        year: item.year,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        sort_order: i,
      }));
      if (jRows.length > 0) {
        const { error: jErr } = await supabase.from('journey').insert(jRows);
        if (jErr) throw new Error(`Journey sync error: ${jErr.message}`);
      }

      // 5. Projects
      await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const pRows = validProjects.map((p, i) => ({
        id: p.id,
        ...projectToDb(p),
        sort_order: i,
      }));
      if (pRows.length > 0) {
        const { error: pErr } = await supabase.from('projects').insert(pRows);
        if (pErr) throw new Error(`Projects sync error: ${pErr.message}`);
      }

      // 6. Services
      await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const sRows = validServices.map((s, i) => ({
        id: s.id,
        ...serviceToDb(s),
        sort_order: i,
      }));
      if (sRows.length > 0) {
        const { error: sErr } = await supabase.from('services').insert(sRows);
        if (sErr) throw new Error(`Services sync error: ${sErr.message}`);
      }

      // 7. Certifications
      await supabase.from('certifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const cRows = validCerts.map((c, i) => ({
        id: c.id,
        ...certificationToDb(c),
        sort_order: i,
      }));
      if (cRows.length > 0) {
        const { error: cErr } = await supabase.from('certifications').insert(cRows);
        if (cErr) throw new Error(`Certifications sync error: ${cErr.message}`);
      }

      // 8. Pillars
      await supabase.from('pillars').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const pilRows = validPillars.map((p, i) => ({
        id: p.id,
        ...pillarToDb(p),
        sort_order: i,
      }));
      if (pilRows.length > 0) {
        const { error: pilErr } = await supabase.from('pillars').insert(pilRows);
        if (pilErr) throw new Error(`Pillars sync error: ${pilErr.message}`);
      }

      // 9. Docs
      await supabase.from('docs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const dRows = validDocs.map((d) => ({
        id: d.id,
        ...docToDb(d),
      }));
      if (dRows.length > 0) {
        const { error: dErr } = await supabase.from('docs').insert(dRows);
        if (dErr) throw new Error(`Documents sync error: ${dErr.message}`);
      }

      showToast('All data successfully synchronized to production server!', 'success');
      return { success: true };
    } catch (err) {
      console.error('pushLocalToSupabase error:', err);
      showToast(err.message || 'Server sync failed', 'error');
      return { success: false, error: err.message };
    }
  };

  // ---- Seed empty Supabase tables from defaults if database is blank ----
  const syncLocalToSupabase = async () => {
    if (!supabase) return;
    try {
      const [profileRes, journeyRes, docsRes, projectsRes, skillsRes, servicesRes, certsRes, pillarsRes] =
        await Promise.all([
          supabase.from('profile').select('id').maybeSingle(),
          supabase.from('journey').select('id').limit(1),
          supabase.from('docs').select('id').limit(1),
          supabase.from('projects').select('id').limit(1),
          supabase.from('skills').select('id').maybeSingle(),
          supabase.from('services').select('id').limit(1),
          supabase.from('certifications').select('id').limit(1),
          supabase.from('pillars').select('id').limit(1),
        ]);

      if (!profileRes.data) await supabase.from('profile').upsert(profileToDb(profile));
      if (!journeyRes.data?.length) {
        const rows = withUuids(journey).map((item, i) => ({
          id: item.id,
          year: item.year,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          sort_order: i,
        }));
        if (rows.length) await supabase.from('journey').insert(rows);
      }
      if (!docsRes.data?.length) {
        const rows = withUuids(technicalDocs).map((d) => ({ id: d.id, ...docToDb(d) }));
        if (rows.length) await supabase.from('docs').insert(rows);
      }
      if (!projectsRes.data?.length) {
        const rows = withUuids(projects).map((p, i) => ({ id: p.id, ...projectToDb(p), sort_order: i }));
        if (rows.length) await supabase.from('projects').insert(rows);
      }
      if (!skillsRes.data) {
        await supabase.from('skills').upsert({ id: 1, data: skills, updated_at: new Date().toISOString() });
      }
      if (!servicesRes.data?.length) {
        const rows = withUuids(services).map((s, i) => ({ id: s.id, ...serviceToDb(s), sort_order: i }));
        if (rows.length) await supabase.from('services').insert(rows);
      }
      if (!certsRes.data?.length) {
        const rows = withUuids(certifications).map((c, i) => ({ id: c.id, ...certificationToDb(c), sort_order: i }));
        if (rows.length) await supabase.from('certifications').insert(rows);
      }
      if (!pillarsRes.data?.length) {
        const rows = withUuids(pillars).map((p, i) => ({ id: p.id, ...pillarToDb(p), sort_order: i }));
        if (rows.length) await supabase.from('pillars').insert(rows);
      }
    } catch (e) {
      console.warn('syncLocalToSupabase failed:', e);
    }
  };

  // ---- Backup & Reset ----
  const resetToDefaults = () => {
    setProfile(initialProfile);
    setJourney(withUuids(initialJourney));
    setTechnicalDocs(withUuids(loadInitialDocs()));
    setProjects(withUuids(initialProjects));
    setSkills(initialSkills);
    setServices(withUuids(initialServices));
    setCertifications(withUuids(DEFAULT_CERTIFICATIONS));
    setPillars(withUuids(DEFAULT_PILLARS));
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

  const importData = async (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.journey) setJourney(withUuids(parsed.journey));
      if (parsed.technicalDocs) setTechnicalDocs(withUuids(parsed.technicalDocs));
      if (parsed.projects) setProjects(withUuids(parsed.projects));
      if (parsed.skills) setSkills(parsed.skills);
      if (parsed.services) setServices(withUuids(parsed.services));
      if (parsed.certifications) setCertifications(withUuids(parsed.certifications));
      if (parsed.pillars) setPillars(withUuids(parsed.pillars));
      showToast('Portfolio data restored locally. Use "Push to Server" to sync with Supabase.', 'info');
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
      await syncLocalToSupabase();
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
        resetToDefaults, exportData, importData, pushLocalToSupabase, syncLocalToSupabase,
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
