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
  // Lean CI build - skip ci-prep since we now use SQL API (no prompts_index.json needed)
  console.log('CI detected → running vite build only (SQL API migration)');
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
