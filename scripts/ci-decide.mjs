// Wrapper build script:
// - In GitHub Actions: do a lean build (skip local backups, sample prompts).
// - Locally: run the original build flow if available; fall back to vite build.
import { spawnSync } from 'child_process';
import fs from 'fs';

const isCI = !!process.env.GITHUB_ACTIONS;

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env }
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (isCI) {
  // Lean CI build
  console.log('CI detected → running lean build: ci-prep.mjs → vite build');
  run('node', ['scripts/ci-prep.mjs'], {
    PROMPTS_INDEX_URL: process.env.PROMPTS_INDEX_URL || 'https://gray-ocean-059c8510f.3.azurestaticapps.net/prompts_index.json',
    PROMPT_SAMPLE_LIMIT: process.env.PROMPT_SAMPLE_LIMIT || '300',
  });
  run('npm', ['run', 'build:vite']);
} else {
  // Local dev build: try original, fall back to vite
  const hasOriginal = fs.existsSync('scripts/build-index.mjs');
  if (hasOriginal) {
    console.log('Local build → running scripts/build-index.mjs then vite build');
    run('node', ['scripts/build-index.mjs']);
  } else {
    console.log('scripts/build-index.mjs not found, running vite build only');
  }
  run('npm', ['run', 'build:vite']);
}
