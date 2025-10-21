import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================================================
// MIDDLEWARE
// =============================================================================

// CORS - allow all origins in production (public library)
app.use(cors());

// JSON parsing
app.use(express.json());

// PRODUCTION CACHE CONTROL - NO CACHING FOR PRODUCTION!
app.use((req, res, next) => {
  // Disable ALL caching for HTML, JS, and CSS
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Static file serving - serve the built React app
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Serve prompts index and thumbnails
app.use('/prompts_index.json', express.static(path.join(__dirname, '../public/prompts_index.json')));
app.use('/thumbnails', express.static(path.join(__dirname, '../public/thumbnails')));
app.use('/prompts', express.static(path.join(__dirname, '../public/prompts')));

// =============================================================================
// AUTHENTICATION
// =============================================================================

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const validTokens = new Set();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const token = generateToken();
      validTokens.add(token);
      console.log('✅ Admin logged in');
      res.json({ success: true, token });
    } else {
      console.log('❌ Failed login attempt');
      res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token) validTokens.delete(token);
  res.json({ success: true });
});

// =============================================================================
// BACKUP SYSTEM
// =============================================================================

const BACKUPS_DIR = path.join(__dirname, '../backups');

async function ensureBackupsDir() {
  await fs.mkdir(BACKUPS_DIR, { recursive: true });
}

async function createBackup(reason = 'manual') {
  await ensureBackupsDir();
  const indexPath = path.join(__dirname, '../public/prompts_index.json');
  const indexData = await fs.readFile(indexPath, 'utf-8');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
  const date = timestamp[0].replace(/-/g, '');
  const time = timestamp[1].split('-')[0].replace(/-/g, '');
  const filename = `prompts_backup_${date}_${time}_${reason}.json`;
  const backupPath = path.join(BACKUPS_DIR, filename);
  await fs.writeFile(backupPath, indexData);
  console.log(`💾 Backup created: ${filename}`);
  return { filename, path: backupPath };
}

async function cleanOldBackups() {
  await ensureBackupsDir();
  const files = await fs.readdir(BACKUPS_DIR);
  const backups = files.filter(f => f.startsWith('prompts_backup_')).sort().reverse();
  const maxBackups = parseInt(process.env.MAX_BACKUPS) || 100;
  if (backups.length > maxBackups) {
    const toDelete = backups.slice(maxBackups);
    for (const file of toDelete) {
      await fs.unlink(path.join(BACKUPS_DIR, file));
      console.log(`🗑️  Deleted old backup: ${file}`);
    }
  }
}

app.get('/api/admin/backups', requireAuth, async (req, res) => {
  try {
    await ensureBackupsDir();
    const files = await fs.readdir(BACKUPS_DIR);
    const backups = files.filter(f => f.startsWith('prompts_backup_')).sort().reverse()
      .map(filename => ({ filename, created: new Date() }));
    res.json({ backups });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/backup', requireAuth, async (req, res) => {
  try {
    const backup = await createBackup('manual');
    await cleanOldBackups();
    res.json({ success: true, backup });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// VALIDATION
// =============================================================================

app.get('/api/admin/validate', requireAuth, async (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../public/prompts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);

    const issues = {
      duplicateTitles: [],
      missingDescriptions: [],
      missingTags: [],
      missingContent: [],
      malformedEntries: [],
      emptyFields: []
    };

    const titles = new Map();
    index.prompts.forEach((prompt, idx) => {
      if (titles.has(prompt.title)) {
        issues.duplicateTitles.push({ title: prompt.title, ids: [titles.get(prompt.title), prompt.id] });
      } else {
        titles.set(prompt.title, prompt.id);
      }

      if (!prompt.description || prompt.description.trim() === '') {
        issues.missingDescriptions.push({ id: prompt.id, title: prompt.title });
      }
      if (!prompt.tags || prompt.tags.length === 0) {
        issues.missingTags.push({ id: prompt.id, title: prompt.title });
      }
      if (!prompt.content || prompt.content.trim() === '') {
        issues.missingContent.push({ id: prompt.id, title: prompt.title });
      }
      if (!prompt.id || !prompt.title || !prompt.department) {
        issues.malformedEntries.push({
          id: prompt.id || `index_${idx}`,
          title: prompt.title || 'Unknown',
          reason: 'Missing critical fields'
        });
      }
      if (prompt.content && prompt.content.trim().length < 20) {
        issues.emptyFields.push({
          id: prompt.id,
          title: prompt.title,
          field: 'content',
          length: prompt.content.trim().length
        });
      }
    });

    const uniqueDuplicates = new Map();
    issues.duplicateTitles.forEach(item => {
      if (!uniqueDuplicates.has(item.title)) uniqueDuplicates.set(item.title, item);
    });
    issues.duplicateTitles = Array.from(uniqueDuplicates.values());

    const summary = {
      totalPrompts: index.prompts.length,
      totalIssues: Object.values(issues).reduce((sum, arr) => sum + arr.length, 0),
      issuesByType: {
        duplicateTitles: issues.duplicateTitles.length,
        missingDescriptions: issues.missingDescriptions.length,
        missingTags: issues.missingTags.length,
        missingContent: issues.missingContent.length,
        malformedEntries: issues.malformedEntries.length,
        emptyFields: issues.emptyFields.length
      }
    };

    res.json({ summary, issues });
  } catch (error) {
    console.error('Error validating prompts:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// MULTER CONFIGURATION
// =============================================================================

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../public/thumbnails');
    await fs.mkdir(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG files are allowed'));
    }
  }
});

// =============================================================================
// DEPARTMENT ICONS
// =============================================================================

const departmentIcons = {
  'Business': '💼',
  'Marketing': '📢',
  'Sales': '💰',
  'SEO': '🔍',
  'Finance': '💵',
  'Education': '📚',
  'Writing': '✍️',
  'Productivity': '⚡',
  'Solopreneurs': '🚀'
};

// =============================================================================
// PROMPT ROUTES (Same as api.js)
// =============================================================================

app.get('/api/prompts', async (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../public/prompts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);

    const statusFilter = req.query.status || 'approved';
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const isAdmin = token && validTokens.has(token);

    let filteredPrompts = index.prompts;
    if (!isAdmin) {
      filteredPrompts = index.prompts.filter(p => p.status === 'approved' || !p.status);
    } else if (statusFilter !== 'all') {
      filteredPrompts = index.prompts.filter(p => p.status === statusFilter || (!p.status && statusFilter === 'approved'));
    }

    res.json({
      ...index,
      prompts: filteredPrompts,
      meta: { ...index.meta, total_prompts: filteredPrompts.length }
    });
  } catch (error) {
    console.error('Error loading prompts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prompts', upload.single('image'), async (req, res) => {
  try {
    const { category, title, description, prompt, tags } = req.body;
    if (!category || !title || !description || !prompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const indexPath = path.join(__dirname, '../public/prompts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);

    const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
    const icon = departmentIcons[category] || '✨';

    const newPrompt = {
      id: promptId,
      title: title.trim(),
      description: description.trim(),
      content: prompt.trim(),
      department: category,
      subcategory: 'Custom',
      icon: icon,
      complexity: 'intermediate',
      tags: tagArray,
      date: new Date().toISOString().split('T')[0],
      word_count: prompt.split(/\s+/).length,
      images: req.file ? [req.file.filename] : [],
      tips: [],
      status: 'pending',
      submitted_date: new Date().toISOString()
    };

    index.prompts.unshift(newPrompt);
    index.meta.total_prompts = index.prompts.length;
    index.meta.last_updated = new Date().toISOString();

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    console.log('✅ Prompt added:', promptId);
    res.json({ success: true, prompt: newPrompt });
  } catch (error) {
    console.error('Error saving prompt:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prompts/bulk', async (req, res) => {
  try {
    const { prompts } = req.body;
    if (!prompts || !Array.isArray(prompts)) {
      return res.status(400).json({ error: 'Invalid format' });
    }

    const indexPath = path.join(__dirname, '../public/prompts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);

    const results = { total: prompts.length, successful: [], failed: [] };

    for (let i = 0; i < prompts.length; i++) {
      const promptData = prompts[i];
      try {
        if (!promptData.title || !promptData.description || !promptData.content || !promptData.department) {
          throw new Error('Missing required fields');
        }

        const validDepartments = Object.keys(departmentIcons);
        if (!validDepartments.includes(promptData.department)) {
          throw new Error(`Invalid department: ${promptData.department}`);
        }

        const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const icon = departmentIcons[promptData.department] || '✨';

        let tags = [];
        if (Array.isArray(promptData.tags)) {
          tags = promptData.tags.map(t => String(t).trim()).filter(t => t);
        } else if (typeof promptData.tags === 'string') {
          tags = promptData.tags.split(',').map(t => t.trim()).filter(t => t);
        }

        const newPrompt = {
          id: promptId,
          title: promptData.title.trim(),
          description: promptData.description.trim(),
          content: promptData.content.trim(),
          department: promptData.department,
          subcategory: promptData.subcategory || 'Custom',
          icon: icon,
          complexity: promptData.complexity || 'intermediate',
          tags: tags,
          date: new Date().toISOString().split('T')[0],
          word_count: promptData.content.split(/\s+/).length,
          images: [],
          tips: Array.isArray(promptData.tips) ? promptData.tips : [],
          status: 'pending',
          submitted_date: new Date().toISOString()
        };

        index.prompts.unshift(newPrompt);
        results.successful.push({ index: i, title: newPrompt.title, id: newPrompt.id });
      } catch (error) {
        results.failed.push({ index: i, title: promptData.title || `Prompt ${i + 1}`, error: error.message });
      }
    }

    index.meta.total_prompts = index.prompts.length;
    index.meta.last_updated = new Date().toISOString();

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    console.log(`✅ Bulk import: ${results.successful.length} successful, ${results.failed.length} failed`);
    res.json(results);
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/prompts/:id/approve', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const indexPath = path.join(__dirname, '../public/prompts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);

    const promptIndex = index.prompts.findIndex(p => p.id === id);
    if (promptIndex === -1) return res.status(404).json({ error: 'Prompt not found' });

    index.prompts[promptIndex].status = 'approved';
    index.prompts[promptIndex].approved_date = new Date().toISOString();
    index.meta.last_updated = new Date().toISOString();

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    console.log('✅ Prompt approved:', id);
    res.json({ success: true, prompt: index.prompts[promptIndex] });
  } catch (error) {
    console.error('Error approving prompt:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/prompts/:id/reject', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const indexPath = path.join(__dirname, '../public/prompts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);

    const promptIndex = index.prompts.findIndex(p => p.id === id);
    if (promptIndex === -1) return res.status(404).json({ error: 'Prompt not found' });

    index.prompts[promptIndex].status = 'rejected';
    index.prompts[promptIndex].rejected_date = new Date().toISOString();
    if (reason) index.prompts[promptIndex].rejection_reason = reason;
    index.meta.last_updated = new Date().toISOString();

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    console.log('❌ Prompt rejected:', id);
    res.json({ success: true, prompt: index.prompts[promptIndex] });
  } catch (error) {
    console.error('Error rejecting prompt:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/prompts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, department, subcategory, tags } = req.body;

    if (!title || !description || !content || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await createBackup('edit');

    const indexPath = path.join(__dirname, '../public/prompts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);

    const promptIndex = index.prompts.findIndex(p => p.id === id);
    if (promptIndex === -1) return res.status(404).json({ error: 'Prompt not found' });

    const existingPrompt = index.prompts[promptIndex];
    index.prompts[promptIndex] = {
      ...existingPrompt,
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      department: department,
      subcategory: subcategory || existingPrompt.subcategory,
      icon: departmentIcons[department] || existingPrompt.icon,
      tags: Array.isArray(tags) ? tags : [],
      word_count: content.split(/\s+/).length
    };

    index.meta.last_updated = new Date().toISOString();
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    console.log('✅ Prompt updated:', id);
    await cleanOldBackups();
    res.json({ success: true, prompt: index.prompts[promptIndex] });
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/prompts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await createBackup('delete');

    const indexPath = path.join(__dirname, '../public/prompts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);

    const promptIndex = index.prompts.findIndex(p => p.id === id);
    if (promptIndex === -1) return res.status(404).json({ error: 'Prompt not found' });

    const deletedPrompt = index.prompts[promptIndex];
    index.prompts.splice(promptIndex, 1);

    index.meta.total_prompts = index.prompts.length;
    index.meta.last_updated = new Date().toISOString();

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    console.log('✅ Prompt deleted:', id);
    await cleanOldBackups();
    res.json({ success: true, deleted: deletedPrompt.title });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prompts/bulk-delete', requireAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty IDs array' });
    }

    await createBackup('bulk-delete');

    const indexPath = path.join(__dirname, '../public/prompts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);

    const idsSet = new Set(ids);
    const originalLength = index.prompts.length;
    index.prompts = index.prompts.filter(p => !idsSet.has(p.id));
    const deletedCount = originalLength - index.prompts.length;

    index.meta.total_prompts = index.prompts.length;
    index.meta.last_updated = new Date().toISOString();

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    console.log(`✅ Bulk delete: ${deletedCount} prompts deleted`);
    await cleanOldBackups();
    res.json({ success: true, deleted: deletedCount });
  } catch (error) {
    console.error('Error bulk deleting prompts:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// HEALTH CHECK
// =============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', auth: 'enabled', backups: 'enabled', environment: 'production' });
});

// =============================================================================
// SERVE REACT APP (catch-all route - MUST BE LAST)
// =============================================================================

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SPARK Prompt Library running on port ${PORT}`);
  console.log(`🔐 Admin password: ${ADMIN_PASSWORD === 'admin123' ? '⚠️  DEFAULT - CHANGE THIS!' : '✅ Custom'}`);
  console.log(`💾 Backups enabled`);
  console.log(`🌍 Environment: PRODUCTION`);
  console.log(`✅ Serving React app from /dist`);
});
