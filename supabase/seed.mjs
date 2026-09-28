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

async function main() {
  await upsertProfile();
  await upsertJourney();
  await upsertDocs();
  await upsertProjects();
  await upsertSkills();
  await upsertServices();
  console.log('\nSeed complete. Certifications and How-I-Work pillars start empty (add via admin).');
}

main().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
