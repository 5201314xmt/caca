
export interface VPS {
  id: string;
  name: string;
  ip: string;
  isThrottled: boolean;
  lastChecked: Date;
  linkedDownloaderId?: string; // Auto-detected from Vertex
  linkedDownloaderAlias?: string; // Auto-detected from Vertex
  qbPort: number; // Effective port
  statusMessage?: string;
}

export interface VPSOverride {
  ip: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface NetcupAccount {
  id: string;
  loginName: string;
  password: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface AppConfig {
  netcupAccounts: NetcupAccount[];
  vertex: {
    apiUrl: string;
    apiKey: string;
  };
  qbittorrent: {
    defaultPort: number;
    username: string;
    password: string;
  };
  monitoring: {
    intervalSeconds: number;
    actionOnThrottle: 'pause' | 'delete'; // 暂停 or 删种
    logRetentionDays: number;
  };
  telegram: TelegramConfig;
  overrides: VPSOverride[]; // List of VPS with non-standard config
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  source: 'System' | 'Netcup' | 'Vertex' | 'qBittorrent' | 'Telegram';
  message: string;
}

export enum Tab {
  DASHBOARD = 'dashboard',
  SETTINGS = 'settings',
  LOGS = 'logs'
}
