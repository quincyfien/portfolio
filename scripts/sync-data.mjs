// ============================================================================
// Sync Data: Pull live Supabase production content directly into local source files
//
// Usage:
//   npm run sync-data
//
// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local or process.env
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Helper to parse key-value pairs from .env or .env.local
function loadEnvFile(filename) {
  const filePath = join(rootDir, filename);
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
  return env;
}

const localEnv = {
  ...loadEnvFile('.env'),
  ...loadEnvFile('.env.local'),
  ...process.env,
};

const SUPABASE_URL = localEnv.VITE_SUPABASE_URL || localEnv.SUPABASE_URL;
const SUPABASE_KEY = localEnv.VITE_SUPABASE_ANON_KEY || localEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('YOUR-PROJECT')) {
  console.error('Error: Missing valid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local or environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncAll() {
  console.log('Fetching live portfolio data from Supabase...');

  const [profileRes, journeyRes, projectsRes, skillsRes, servicesRes] = await Promise.all([
    supabase.from('profile').select('*').maybeSingle(),
    supabase.from('journey').select('*').order('sort_order'),
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('skills').select('*').maybeSingle(),
    supabase.from('services').select('*').order('sort_order'),
  ]);

  // 1. Profile
  if (profileRes.data) {
    const p = profileRes.data;
    const profileObj = {
      name: p.name || '',
      title: p.title || '',
      headline: p.headline || '',
      avatarSymbol: p.avatar_symbol || '',
      photoPath: p.photo_path || '',
      email: p.email || '',
      bio: p.bio || '',
      summary: p.summary || '',
      education: p.education || [],
      aboutDetails: p.about_details || [],
    };
    const content = `export const profile = ${JSON.stringify(profileObj, null, 2)};\n`;
    writeFileSync(join(rootDir, 'src/data/profile.js'), content, 'utf8');
    console.log('✓ Updated src/data/profile.js');
  }

  // 2. Journey
  if (journeyRes.data && journeyRes.data.length > 0) {
    const journeyList = journeyRes.data.map((r) => ({
      id: r.id,
      year: r.year,
      title: r.title,
      subtitle: r.subtitle,
      description: r.description,
    }));
    const content = `export const journey = ${JSON.stringify(journeyList, null, 2)};\n`;
    writeFileSync(join(rootDir, 'src/data/journey.js'), content, 'utf8');
    console.log(`✓ Updated src/data/journey.js (${journeyList.length} milestones)`);
  }

  // 3. Projects
  if (projectsRes.data && projectsRes.data.length > 0) {
    const projectList = projectsRes.data.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      longDescription: r.long_description,
      technologies: r.technologies || [],
      features: r.features || [],
      challengesSolved: r.challenges_solved || '',
      lessonsLearned: r.lessons_learned || '',
      githubLink: r.github_link || '',
      demoLink: r.demo_link || '',
      tags: r.tags || [],
      featured: r.featured || false,
    }));
    const content = `export const projects = ${JSON.stringify(projectList, null, 2)};\n`;
    writeFileSync(join(rootDir, 'src/data/projects.js'), content, 'utf8');
    console.log(`✓ Updated src/data/projects.js (${projectList.length} projects)`);
  }

  // 4. Skills
  if (skillsRes.data?.data) {
    const content = `export const skills = ${JSON.stringify(skillsRes.data.data, null, 2)};\n`;
    writeFileSync(join(rootDir, 'src/data/skills.js'), content, 'utf8');
    console.log('✓ Updated src/data/skills.js');
  }

  // 5. Services
  if (servicesRes.data && servicesRes.data.length > 0) {
    const serviceList = servicesRes.data.map((r) => ({
      id: r.id,
      title: r.title,
      icon: r.icon,
      tagline: r.tagline,
      details: r.details || [],
    }));
    const content = `export const services = ${JSON.stringify(serviceList, null, 2)};\n`;
    writeFileSync(join(rootDir, 'src/data/services.js'), content, 'utf8');
    console.log(`✓ Updated src/data/services.js (${serviceList.length} services)`);
  }

  console.log('\nSuccess! Local repository source files in src/data/ are now synchronized with Supabase production.');
}

syncAll().catch((err) => {
  console.error('Sync failed:', err.message);
  process.exit(1);
});

