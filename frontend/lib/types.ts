export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; name: string }) => void;
  signup: (data: { name: string; email: string; password: string }) => void;
  logout: () => void;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'running' | 'testing' | 'completed' | 'failed';
  progress: number;
  lastUpdated: string;
  models: string[];
  tasks: Task[];
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'waiting' | 'running' | 'completed' | 'failed' | 'retrying';
  assignedAgent?: string;
  assignedModel?: string;
  input?: string;
  output?: string;
  executionTime?: number;
  tokens?: number;
  logs?: string[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'not_connected';
  capabilities: string[];
  contextWindow: string;
  usage: number;
  costPer1kTokens?: number;
}

export interface Activity {
  id: string;
  timestamp: string;
  message: string;
  model?: string;
  projectId?: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
