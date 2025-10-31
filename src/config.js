/**
 * Application Configuration
 * Centralizes API endpoint configuration for different deployment environments
 *
 * ALL DATA NOW COMES FROM SQL DATABASE VIA REST API
 * Old blob storage system has been removed - everything is real-time from SQL
 */

// API Base URL - determines where API requests are sent
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://promptlib-api.delightfulsmoke-83247bbb.eastus2.azurecontainerapps.io';

// Full API endpoints
export const API_ENDPOINTS = {
  // Public endpoints
  PROMPTS: `${API_BASE_URL}/api/prompts`,
  DEPARTMENTS: `${API_BASE_URL}/api/departments`,

  // Dynamic endpoints (need ID parameter)
  PROMPT_BY_ID: (id) => `${API_BASE_URL}/api/prompts/${id}`,

  // Admin endpoints - CRUD operations
  ADMIN_CREATE_PROMPT: `${API_BASE_URL}/api/admin/prompts`,
  ADMIN_UPDATE_PROMPT: (id) => `${API_BASE_URL}/api/admin/prompts/${id}`,
  ADMIN_DELETE_PROMPT: (id) => `${API_BASE_URL}/api/admin/prompts/${id}`,
  ADMIN_BULK_CREATE: `${API_BASE_URL}/api/admin/prompts/bulk`,
  ADMIN_SUBCATEGORIES: `${API_BASE_URL}/api/admin/subcategories`,

  // Legacy admin endpoints (not implemented in simplified API yet)
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_LOGOUT: `${API_BASE_URL}/api/admin/logout`,
  ADMIN_BACKUP: `${API_BASE_URL}/api/admin/backup`,
  ADMIN_BACKUPS: `${API_BASE_URL}/api/admin/backups`,
  ADMIN_VALIDATE: `${API_BASE_URL}/api/admin/validate`,
  PROMPTS_BULK_DELETE: `${API_BASE_URL}/api/prompts/bulk-delete`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
