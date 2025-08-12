// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  teams: Team[];
  workspaces: Workspace[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Team and Workspace Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  ownerId: string;
  members: TeamMember[];
  workspaces: Workspace[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
  user: User;
}

export enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  type: WorkspaceType;
  teamId: string;
  ownerId: string;
  members: WorkspaceMember[];
  boards: Board[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  joinedAt: Date;
  user: User;
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum WorkspaceType {
  KANBAN = 'KANBAN',
  WHITEBOARD = 'WHITEBOARD',
  NOTES = 'NOTES',
  TIMELINE = 'TIMELINE',
  CUSTOM = 'CUSTOM'
}

// Board and Content Types
export interface Board {
  id: string;
  name: string;
  description?: string;
  type: BoardType;
  workspaceId: string;
  ownerId: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}

export enum BoardType {
  KANBAN = 'KANBAN',
  WHITEBOARD = 'WHITEBOARD',
  NOTES = 'NOTES',
  TIMELINE = 'TIMELINE'
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  items: BoardItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardItem {
  id: string;
  title: string;
  description?: string;
  type: ItemType;
  columnId: string;
  assigneeId?: string;
  priority: Priority;
  dueDate?: Date;
  tags: string[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ItemType {
  TASK = 'TASK',
  NOTE = 'NOTE',
  IDEA = 'IDEA',
  BUG = 'BUG',
  FEATURE = 'FEATURE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Real-time Collaboration Types
export interface CollaborationSession {
  id: string;
  boardId: string;
  participants: CollaborationParticipant[];
  startedAt: Date;
  lastActivity: Date;
}

export interface CollaborationParticipant {
  userId: string;
  sessionId: string;
  joinedAt: Date;
  lastSeen: Date;
  user: User;
}

export interface CollaborationEvent {
  type: CollaborationEventType;
  boardId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

export enum CollaborationEventType {
  ITEM_CREATED = 'ITEM_CREATED',
  ITEM_UPDATED = 'ITEM_UPDATED',
  ITEM_DELETED = 'ITEM_DELETED',
  ITEM_MOVED = 'ITEM_MOVED',
  COLUMN_CREATED = 'COLUMN_CREATED',
  COLUMN_UPDATED = 'COLUMN_UPDATED',
  COLUMN_DELETED = 'COLUMN_DELETED',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  CURSOR_MOVED = 'CURSOR_MOVED'
}

// AI Assistant Types
export interface AIAssistant {
  id: string;
  workspaceId: string;
  type: AIAssistantType;
  config: AIAssistantConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum AIAssistantType {
  TASK_SUGGESTER = 'TASK_SUGGESTER',
  MEETING_SUMMARIZER = 'MEETING_SUMMARIZER',
  TIMELINE_GENERATOR = 'TIMELINE_GENERATOR',
  CODE_REVIEWER = 'CODE_REVIEWER'
}

export interface AIAssistantConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  customPrompts?: Record<string, string>;
}

export interface AIRequest {
  type: AIAssistantType;
  workspaceId: string;
  userId: string;
  input: string;
  context?: any;
}

export interface AIResponse {
  id: string;
  requestId: string;
  content: string;
  suggestions?: string[];
  metadata?: any;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  TASK_OVERDUE = 'TASK_OVERDUE',
  TEAM_INVITE = 'TEAM_INVITE',
  WORKSPACE_INVITE = 'WORKSPACE_INVITE',
  MENTION = 'MENTION',
  SYSTEM = 'SYSTEM'
}

// Analytics Types
export interface AnalyticsData {
  workspaceId: string;
  period: AnalyticsPeriod;
  metrics: AnalyticsMetrics;
  generatedAt: Date;
}

export enum AnalyticsPeriod {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR'
}

export interface AnalyticsMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageTaskDuration: number;
  teamProductivity: number;
  userActivity: UserActivityMetric[];
}

export interface UserActivityMetric {
  userId: string;
  tasksCompleted: number;
  tasksCreated: number;
  timeSpent: number;
  lastActivity: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

// Offline Sync Types
export interface OfflineChange {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  data: any;
  timestamp: Date;
  synced: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  OFFLINE_ERROR = 'OFFLINE_ERROR'
} 