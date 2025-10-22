// Fail the build if dist exceeds ~450 MB to stay under SWA 500 MB limit
import fs from 'fs';
import path from 'path';

function folderSize(p) {
  let s = 0;
  for (const e of fs.readdirSync(p)) {
    const fp = path.join(p, e);
    const st = fs.statSync(fp);
    s += st.isDirectory() ? folderSize(fp) : st.size;
  }
  return s;
}

const dir = 'dist';
if (!fs.existsSync(dir)) {
  console.log('No dist folder found.');
  process.exit(0);
}

const bytes = folderSize(dir);
const mb = (bytes / 1024 / 1024).toFixed(1);
console.log(`dist size: ${mb} MB`);

if (bytes > 450 * 1024 * 1024) {
  console.error('Build too large for SWA (limit ~500MB).');
  process.exit(1);
}
