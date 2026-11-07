// ============================================================================
// Portfolio — Supabase seed script
//
// Usage (one-time, from the repo root):
//   SUPABASE_URL="https://xxxx.supabase.co" \
//   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
//   node supabase/seed.mjs
//
// The service role key bypasses RLS, so this can insert seed data.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { profile } from '../src/data/profile.js';
import { journey } from '../src/data/journey.js';
import { skills } from '../src/data/skills.js';
import { services } from '../src/data/services.js';
import { projects } from '../src/data/projects.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// --- Minimal YAML frontmatter parser for the blog markdown files ------------
function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) {
    return { metadata: {}, content: raw };
  }
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { metadata: {}, content: raw };
  const fm = raw.slice(3, end);
  const content = raw.slice(end + 4).trim();
  const metadata = {};
  for (const line of fm.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (key === 'tags') {
      try {
        metadata.tags = JSON.parse(value);
      } catch {
        metadata.tags = value.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else {
      metadata[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  return { metadata, content };
}

function loadDocs() {
  const dir = join(__dirname, '../src/content/blog');
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const raw = readFileSync(join(dir, file), 'utf8');
    const { metadata, content } = parseFrontmatter(raw);
    const slug = file.replace(/\.md$/, '');
    return {
      id: undefined,
      title: metadata.title || slug.replace(/-/g, ' '),
      slug,
      category: metadata.category || 'Web Development',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      date: metadata.date || new Date().toISOString().split('T')[0],
      read_time: metadata.readTime || '5 min read',
      summary: metadata.summary || '',
      content,
      status: 'published',
    };
  });
}

async function upsertProfile() {
  const { error } = await supabase.from('profile').upsert({
    id: 1,
    name: profile.name,
    title: profile.title,
    headline: profile.headline,
    avatar_symbol: profile.avatarSymbol,
    photo_path: profile.photoPath,
    email: profile.email,
    bio: profile.bio,
    summary: profile.summary,
    education: profile.education || [],
    about_details: profile.aboutDetails || [],
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  console.log('✓ profile');
}

async function upsertJourney() {
  const rows = journey.map((item, i) => ({
    id: item.id,
    year: item.year,
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    sort_order: i,
  }));
  const { error } = await supabase.from('journey').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
  const { error: insErr } = await supabase.from('journey').insert(rows);
  if (insErr) throw insErr;
  console.log('✓ journey');
}

async function upsertDocs() {
  const docs = loadDocs();
  const { error } = await supabase.from('docs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
  const { error: insErr } = await supabase.from('docs').insert(docs);
  if (insErr) throw insErr;
  console.log(`✓ docs (${docs.length})`);
}

async function upsertProjects() {
  const rows = projects.map((p, i) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    long_description: p.longDescription,
    technologies: p.technologies,
    features: p.features,
    challenges_solved: p.challengesSolved,
    lessons_learned: p.lessonsLearned,
    github_link: p.githubLink,
    demo_link: p.demoLink,
    tags: p.tags,
    featured: p.featured || false,
    sort_order: i,
  }));
  const { error } = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
  const { error: insErr } = await supabase.from('projects').insert(rows);
  if (insErr) throw insErr;
  console.log(`✓ projects (${rows.length})`);
}

async function upsertSkills() {
  const { error } = await supabase.from('skills').upsert({
    id: 1,
    data: skills,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  console.log('✓ skills');
}

async function upsertServices() {
  const rows = services.map((s, i) => ({
    id: s.id,
    title: s.title,
    icon: s.icon,
    tagline: s.tagline,
    details: s.details,
    sort_order: i,
  }));
  const { error } = await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
  const { error: insErr } = await supabase.from('services').insert(rows);
  if (insErr) throw insErr;
  console.log(`✓ services (${rows.length})`);
}

async function upsertCertifications() {
  const defaultCertifications = [
    {
      id: 'b5e6f7a8-c9d0-4e1f-a23b-4c5d6e7f8a9b',
      name: 'Fortinet NSE 1 & 2',
      issuer: 'Fortinet',
      status: 'Earned',
      date: '',
      credential_id: '',
      verify_url: '',
      sort_order: 0,
    },
    {
      id: 'a6f7a8b9-d0e1-4f2a-b34c-5d6e7f8a9b0c',
      name: 'AI & Data Science',
      issuer: 'University of Tokyo',
      status: 'In Progress',
      date: '',
      credential_id: '',
      verify_url: '',
      sort_order: 1,
    },
    {
      id: '97a8b9c0-e1f2-4a3b-8c5d-6e7f8a9b0c1d',
      name: 'Network Defense Essentials (NDE)',
      issuer: 'EC-Council',
      status: 'Planned',
      date: '',
      credential_id: '',
      verify_url: '',
      sort_order: 2,
    },
  ];
  const { error } = await supabase.from('certifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
  const { error: insErr } = await supabase.from('certifications').insert(defaultCertifications);
  if (insErr) throw insErr;
  console.log(`✓ certifications (${defaultCertifications.length})`);
}

async function upsertPillars() {
  const defaultPillars = [
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
      sort_order: 0,
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
      sort_order: 1,
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
      sort_order: 2,
    },
  ];
  const { error } = await supabase.from('pillars').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
  const { error: insErr } = await supabase.from('pillars').insert(defaultPillars);
  if (insErr) throw insErr;
  console.log(`✓ pillars (${defaultPillars.length})`);
}

async function main() {
  await upsertProfile();
  await upsertJourney();
  await upsertDocs();
  await upsertProjects();
  await upsertSkills();
  await upsertServices();
  await upsertCertifications();
  await upsertPillars();
  console.log('\nSeed complete. All portfolio tables populated with valid UUIDs.');
}

main().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
