/**
 * Application Configuration
 * Centralizes API endpoint configuration for different deployment environments
 */

// API Base URL - determines where API requests are sent
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://20.75.218.182:3001';

// Azure Blob Storage Base URL - for prompt HTML files and thumbnails
export const BLOB_STORAGE_BASE_URL = 'https://sparkpromptstorage.blob.core.windows.net';

// Full API endpoints
export const API_ENDPOINTS = {
  // Public endpoints
  PROMPTS: `${API_BASE_URL}/api/prompts`,
  PROMPTS_BULK: `${API_BASE_URL}/api/prompts/bulk`,

  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_LOGOUT: `${API_BASE_URL}/api/admin/logout`,
  ADMIN_BACKUP: `${API_BASE_URL}/api/admin/backup`,
  ADMIN_BACKUPS: `${API_BASE_URL}/api/admin/backups`,
  ADMIN_VALIDATE: `${API_BASE_URL}/api/admin/validate`,

  // Dynamic endpoints (need ID parameter)
  PROMPT_BY_ID: (id) => `${API_BASE_URL}/api/prompts/${id}`,
  PROMPTS_BULK_DELETE: `${API_BASE_URL}/api/prompts/bulk-delete`,
};

// Azure Blob Storage paths
export const BLOB_ENDPOINTS = {
  // Prompts index JSON (moved from Static Web App to avoid truncation)
  PROMPTS_INDEX: `${BLOB_STORAGE_BASE_URL}/data/prompts_index.json`,

  // Prompt HTML files
  PROMPT_HTML: (id) => `${BLOB_STORAGE_BASE_URL}/prompts/${id}.html`,

  // Thumbnail images
  THUMBNAIL_IMAGE: (filename) => `${BLOB_STORAGE_BASE_URL}/thumbnails/${filename}`,
};

export default {
  API_BASE_URL,
  BLOB_STORAGE_BASE_URL,
  API_ENDPOINTS,
  BLOB_ENDPOINTS,
};
