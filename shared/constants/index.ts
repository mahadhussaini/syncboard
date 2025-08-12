// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/profile',
    AVATAR: '/api/users/avatar',
    SEARCH: '/api/users/search'
  },
  TEAMS: {
    LIST: '/api/teams',
    CREATE: '/api/teams',
    DETAILS: (id: string) => `/api/teams/${id}`,
    UPDATE: (id: string) => `/api/teams/${id}`,
    DELETE: (id: string) => `/api/teams/${id}`,
    MEMBERS: (id: string) => `/api/teams/${id}/members`,
    INVITE: (id: string) => `/api/teams/${id}/invite`
  },
  WORKSPACES: {
    LIST: '/api/workspaces',
    CREATE: '/api/workspaces',
    DETAILS: (id: string) => `/api/workspaces/${id}`,
    UPDATE: (id: string) => `/api/workspaces/${id}`,
    DELETE: (id: string) => `/api/workspaces/${id}`,
    MEMBERS: (id: string) => `/api/workspaces/${id}/members`,
    BOARDS: (id: string) => `/api/workspaces/${id}/boards`
  },
  BOARDS: {
    LIST: '/api/boards',
    CREATE: '/api/boards',
    DETAILS: (id: string) => `/api/boards/${id}`,
    UPDATE: (id: string) => `/api/boards/${id}`,
    DELETE: (id: string) => `/api/boards/${id}`,
    COLUMNS: (id: string) => `/api/boards/${id}/columns`,
    ITEMS: (id: string) => `/api/boards/${id}/items`
  },
  COLUMNS: {
    CREATE: '/api/columns',
    UPDATE: (id: string) => `/api/columns/${id}`,
    DELETE: (id: string) => `/api/columns/${id}`,
    REORDER: (id: string) => `/api/columns/${id}/reorder`
  },
  ITEMS: {
    CREATE: '/api/items',
    UPDATE: (id: string) => `/api/items/${id}`,
    DELETE: (id: string) => `/api/items/${id}`,
    MOVE: (id: string) => `/api/items/${id}/move`,
    ASSIGN: (id: string) => `/api/items/${id}/assign`
  },
  COLLABORATION: {
    JOIN: (boardId: string) => `/api/collaboration/${boardId}/join`,
    LEAVE: (boardId: string) => `/api/collaboration/${boardId}/leave`,
    CURSOR: (boardId: string) => `/api/collaboration/${boardId}/cursor`
  },
  AI: {
    SUGGEST: '/api/ai/suggest',
    SUMMARIZE: '/api/ai/summarize',
    GENERATE_TIMELINE: '/api/ai/timeline',
    REVIEW_CODE: '/api/ai/code-review'
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
    SETTINGS: '/api/notifications/settings'
  },
  ANALYTICS: {
    WORKSPACE: (id: string) => `/api/analytics/workspace/${id}`,
    TEAM: (id: string) => `/api/analytics/team/${id}`,
    USER: (id: string) => `/api/analytics/user/${id}`
  },
  FILES: {
    UPLOAD: '/api/files/upload',
    DELETE: (id: string) => `/api/files/${id}`,
    DOWNLOAD: (id: string) => `/api/files/${id}/download`
  }
} as const;

// WebSocket Events
export const WS_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  
  // Collaboration events
  JOIN_BOARD: 'join_board',
  LEAVE_BOARD: 'leave_board',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  
  // Board events
  BOARD_UPDATED: 'board_updated',
  COLUMN_CREATED: 'column_created',
  COLUMN_UPDATED: 'column_updated',
  COLUMN_DELETED: 'column_deleted',
  COLUMN_REORDERED: 'column_reordered',
  
  // Item events
  ITEM_CREATED: 'item_created',
  ITEM_UPDATED: 'item_updated',
  ITEM_DELETED: 'item_deleted',
  ITEM_MOVED: 'item_moved',
  ITEM_ASSIGNED: 'item_assigned',
  
  // Cursor events
  CURSOR_MOVED: 'cursor_moved',
  CURSOR_UPDATE: 'cursor_update',
  
  // Notification events
  NOTIFICATION_RECEIVED: 'notification_received',
  
  // AI events
  AI_SUGGESTION: 'ai_suggestion',
  AI_RESPONSE: 'ai_response',
  
  // Error events
  ERROR: 'error',
  AUTH_ERROR: 'auth_error'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH: {
    ACCESS_TOKEN: 'syncboard_access_token',
    REFRESH_TOKEN: 'syncboard_refresh_token',
    USER: 'syncboard_user'
  },
  SETTINGS: {
    THEME: 'syncboard_theme',
    LANGUAGE: 'syncboard_language',
    NOTIFICATIONS: 'syncboard_notifications'
  },
  OFFLINE: {
    CHANGES: 'syncboard_offline_changes',
    LAST_SYNC: 'syncboard_last_sync'
  },
  COLLABORATION: {
    CURSORS: 'syncboard_cursors',
    PARTICIPANTS: 'syncboard_participants'
  }
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: false
  },
  EMAIL: {
    MAX_LENGTH: 254
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50
  },
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200
  },
  DESCRIPTION: {
    MAX_LENGTH: 1000
  },
  FILE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  }
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

// Time Constants
export const TIME = {
  TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  DEBOUNCE_DELAY: 300, // 300ms
  THROTTLE_DELAY: 100, // 100ms
  RETRY_DELAY: 1000, // 1 second
  MAX_RETRIES: 3
} as const;

// Role Hierarchy
export const ROLE_HIERARCHY = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  URGENT: { value: 'URGENT', label: 'Urgent', color: '#ef4444' },
  HIGH: { value: 'HIGH', label: 'High', color: '#f97316' },
  MEDIUM: { value: 'MEDIUM', label: 'Medium', color: '#eab308' },
  LOW: { value: 'LOW', label: 'Low', color: '#22c55e' }
} as const;

// Item Types
export const ITEM_TYPES = {
  TASK: { value: 'TASK', label: 'Task', icon: '📋' },
  NOTE: { value: 'NOTE', label: 'Note', icon: '📝' },
  IDEA: { value: 'IDEA', label: 'Idea', icon: '💡' },
  BUG: { value: 'BUG', label: 'Bug', icon: '🐛' },
  FEATURE: { value: 'FEATURE', label: 'Feature', icon: '✨' }
} as const;

// Workspace Types
export const WORKSPACE_TYPES = {
  KANBAN: { value: 'KANBAN', label: 'Kanban Board', icon: '📊' },
  WHITEBOARD: { value: 'WHITEBOARD', label: 'Whiteboard', icon: '🖼️' },
  NOTES: { value: 'NOTES', label: 'Notes', icon: '📝' },
  TIMELINE: { value: 'TIMELINE', label: 'Timeline', icon: '📅' },
  CUSTOM: { value: 'CUSTOM', label: 'Custom', icon: '⚙️' }
} as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4'
} as const;

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

// AI Models
export const AI_MODELS = {
  GPT_4: 'gpt-4',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  CLAUDE_3: 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU: 'claude-3-haiku-20240307'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You don\'t have permission for this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
  OFFLINE_ERROR: 'You are currently offline. Changes will be synced when you reconnect.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
  QUOTA_EXCEEDED: 'Storage quota exceeded. Please upgrade your plan.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  TEAM_CREATED: 'Team created successfully!',
  WORKSPACE_CREATED: 'Workspace created successfully!',
  BOARD_CREATED: 'Board created successfully!',
  ITEM_CREATED: 'Item created successfully!',
  ITEM_UPDATED: 'Item updated successfully!',
  ITEM_DELETED: 'Item deleted successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: { value: 'TASK_ASSIGNED', label: 'Task Assigned', icon: '📋' },
  TASK_DUE_SOON: { value: 'TASK_DUE_SOON', label: 'Task Due Soon', icon: '⏰' },
  TASK_OVERDUE: { value: 'TASK_OVERDUE', label: 'Task Overdue', icon: '🚨' },
  TEAM_INVITE: { value: 'TEAM_INVITE', label: 'Team Invitation', icon: '👥' },
  WORKSPACE_INVITE: { value: 'WORKSPACE_INVITE', label: 'Workspace Invitation', icon: '🏢' },
  MENTION: { value: 'MENTION', label: 'Mention', icon: '💬' },
  SYSTEM: { value: 'SYSTEM', label: 'System', icon: '⚙️' }
} as const; 