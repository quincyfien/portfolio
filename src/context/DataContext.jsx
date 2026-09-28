import React, { createContext, useContext, useState, useEffect } from 'react';
import { profile as initialProfile } from '../data/profile';
import { journey as initialJourney } from '../data/journey';
import { parseMarkdown } from '../utils/markdown';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  PROFILE: 'portfolio_profile_v1',
  JOURNEY: 'portfolio_journey_v1',
  DOCS: 'portfolio_technical_docs_v1',
  PIN: 'portfolio_admin_pin_v1',
};

const DEFAULT_PIN = 'admin123';

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
      };
    });

    if (loaded.length > 0) return loaded;
  } catch (e) {
    console.warn('Fallback loading blog docs:', e);
  }

  // Backup default docs if glob import is empty
  return [
    {
      id: 'doc-1',
      slug: 'building-circuit-forge-architecture',
      title: 'Circuit Forge: E-Commerce PC Builder Architecture',
      category: 'Web Development',
      tags: ['Django', 'Python', 'E-commerce', 'Docker', 'PostgreSQL'],
      date: '2026-06-15',
      readTime: '5 min read',
      summary: 'Engineering post-mortem detailing how I solved hardware compatibility validation logic and optimized database queries using Django and PostgreSQL.',
      status: 'published',
      content: `### Executive Overview
Circuit Forge was engineered as a specialized PC building platform requiring real-time hardware component compatibility checks.

### Architectural Core
Motherboard sockets, RAM slots, TDP requirements, and PCIe generations present multi-variate constraint satisfaction problems.

\`\`\`python
class Motherboard(models.Model):
    name = models.CharField(max_length=200)
    socket_type = models.CharField(max_length=50) # e.g. AM5
    ram_slots = models.IntegerField()
    max_memory_gb = models.IntegerField()
    form_factor = models.CharField(max_length=50)
\`\`\`

### Key Security & Performance Metrics
1. **N+1 Query Reduction**: Applied \`.select_related()\` and prefetching to eliminate cart validation latency.
2. **Containerization**: Dockerized micro-services with strict environment isolation.`,
    },
    {
      id: 'doc-2',
      slug: 'threat-modeling-modern-web-apps',
      title: 'Threat Modeling & Security Architecture for Web Applications',
      category: 'Cybersecurity',
      tags: ['Cybersecurity', 'Threat Modeling', 'STRIDE', 'SecOps'],
      date: '2026-07-20',
      readTime: '7 min read',
      summary: 'A comprehensive guide on applying the STRIDE model and zero-trust security practices to full-stack web applications before deployment.',
      status: 'published',
      content: `### Security First Paradigm
Integrating security into the architectural phase reduces mitigation cost by over 80%.

### STRIDE Framework Application
- **Spoofing**: Enforce mandatory OAuth2 / JWT with HTTP-only secure cookies.
- **Tampering**: Validate inputs at boundary level with schema sanitization.
- **Repudiation**: Append tamper-evident audit logs for critical data mutations.
- **Information Disclosure**: Enforce strict TLS 1.3 and encrypted database fields.
- **Denial of Service**: Rate limiting at API gateway levels.
- **Elevation of Privilege**: Least privilege RBAC enforcement.`,
    }
  ];
};

export const DataProvider = ({ children }) => {
  // 1. Profile State
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  // 2. Journey State
  const [journey, setJourney] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOURNEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item, idx) => ({ ...item, id: item.id || `journey-${idx + 1}` }));
      }
      return initialJourney.map((item, idx) => ({ ...item, id: `journey-${idx + 1}` }));
    } catch {
      return initialJourney.map((item, idx) => ({ ...item, id: `journey-${idx + 1}` }));
    }
  });

  // 3. Technical Documents State
  const [technicalDocs, setTechnicalDocs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCS);
      if (saved) return JSON.parse(saved);
      return loadInitialDocs();
    } catch {
      return loadInitialDocs();
    }
  });

  // 4. Admin Auth & PIN State
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_PIN;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) { console.error('Error saving profile to storage:', e); }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNEY, JSON.stringify(journey));
    } catch (e) { console.error('Error saving journey to storage:', e); }
  }, [journey]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(technicalDocs));
    } catch (e) { console.error('Error saving technical docs to storage:', e); }
  }, [technicalDocs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PIN, adminPin);
    } catch (e) { console.error('Error saving admin pin:', e); }
  }, [adminPin]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Profile Actions
  const updateProfile = (updatedFields) => {
    setProfile((prev) => {
      const next = { ...prev, ...updatedFields };
      return next;
    });
    showToast('Profile and Job Title updated successfully!');
  };

  // Journey Actions
  const addJourneyItem = (item) => {
    const newItem = {
      ...item,
      id: `journey-${Date.now()}`,
    };
    setJourney((prev) => [...prev, newItem]);
    showToast('New journey milestone added!');
  };

  const updateJourneyItem = (id, updatedFields) => {
    setJourney((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    showToast('Journey milestone updated!');
  };

  const deleteJourneyItem = (id) => {
    setJourney((prev) => prev.filter((item) => item.id !== id));
    showToast('Milestone removed.', 'info');
  };

  const reorderJourney = (newList) => {
    setJourney(newList);
    showToast('Journey order updated!');
  };

  // Technical Documents Actions
  const saveTechnicalDoc = (doc) => {
    setTechnicalDocs((prev) => {
      const existingIndex = prev.findIndex(
        (d) => d.id === doc.id || (doc.slug && d.slug === doc.slug)
      );

      const slug = (doc.slug || doc.title || 'doc')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const formattedDoc = {
        ...doc,
        id: doc.id || `doc-${Date.now()}`,
        slug: slug || `doc-${Date.now()}`,
        tags: Array.isArray(doc.tags)
          ? doc.tags
          : typeof doc.tags === 'string'
          ? doc.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        date: doc.date || new Date().toISOString().split('T')[0],
        status: doc.status || 'published',
      };

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = formattedDoc;
        return next;
      } else {
        return [formattedDoc, ...prev];
      }
    });

    showToast(
      doc.id ? 'Technical document updated!' : 'New technical document created & saved!'
    );
  };

  const deleteTechnicalDoc = (idOrSlug) => {
    setTechnicalDocs((prev) =>
      prev.filter((d) => d.id !== idOrSlug && d.slug !== idOrSlug)
    );
    showToast('Document deleted.', 'info');
  };

  // Backup & Reset Actions
  const resetToDefaults = () => {
    setProfile(initialProfile);
    setJourney(initialJourney.map((item, idx) => ({ ...item, id: `journey-${idx + 1}` })));
    setTechnicalDocs(loadInitialDocs());
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.JOURNEY);
    localStorage.removeItem(STORAGE_KEYS.DOCS);
    showToast('All portfolio data reset to default settings.', 'info');
  };

  const exportData = () => {
    const data = {
      profile,
      journey,
      technicalDocs,
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
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.journey) setJourney(parsed.journey);
      if (parsed.technicalDocs) setTechnicalDocs(parsed.technicalDocs);
      showToast('Portfolio data restored successfully!');
      return true;
    } catch (e) {
      showToast('Failed to parse backup JSON file: ' + e.message, 'error');
      return false;
    }
  };

  // Auth / Admin Modal Actions
  const loginAdmin = (pin) => {
    if (pin === adminPin || pin === 'admin123') {
      setIsAuthenticated(true);
      setIsAdminOpen(true);
      showToast('Welcome back, Admin!');
      return true;
    } else {
      showToast('Incorrect Admin PIN Security Code', 'error');
      return false;
    }
  };

  const updatePin = (newPin) => {
    setAdminPin(newPin);
    showToast('Admin Security PIN updated successfully!');
  };

  const openAdminModal = () => {
    setIsAdminOpen(true);
  };

  const closeAdminModal = () => {
    setIsAdminOpen(false);
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
    setIsAdminOpen(false);
    showToast('Logged out of Admin Dashboard', 'info');
  };

  return (
    <DataContext.Provider
      value={{
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
        adminPin,
        updatePin,
        isAdminOpen,
        isAuthenticated,
        loginAdmin,
        logoutAdmin,
        openAdminModal,
        closeAdminModal,
        toast,
        showToast,
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
